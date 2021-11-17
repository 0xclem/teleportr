import { ethers } from "ethers";
import { bridgeDeposit } from "./contracts/BridgeDeposit";
import { getDB } from "./mongoConnector";
import { ObjectID } from "mongodb";
import gasPriceOracleContract from "./contracts/GasPriceOracle";

const NETWORK = process.env.NETWORK || "mainnet";
const OVM_JSON_RPC_URL =
  process.env.OVM_JSON_RPC_URL || "https://mainnet.optimism.io";

const START_BLOCK = Number(process.env.START_BLOCK || 13634050);
const DB_COLLECTION = "transfers";

const CONFIRMATIONS = 21;

type TransactionRecord = {
  transactionHash: string;
  blockNumber: number;
  wallet: string;
  amount: string;
  isConfirmed: boolean;
  isProcessed: boolean;
  _id?: ObjectID;
};

let providerL1: ethers.providers.InfuraProvider | null = null;
const getProviderL1 = (): ethers.providers.InfuraProvider => {
  if (!providerL1) {
    return (providerL1 = new ethers.providers.InfuraProvider(
      NETWORK,
      process.env.INFURA_PROJECT_ID
    ));
  }
  return providerL1;
};

export const getLayerOneTransfers = async () => {
  try {
    if (!process.env.LAYER_2_WALLET_PK) return;
    const providerL1 = getProviderL1();
    const bridgeDepositContract = new ethers.Contract(
      process.env.TELEPORTER_CONTRACT_ADDRESS || bridgeDeposit.address,
      bridgeDeposit.abi,
      providerL1
    );
    const wallet = new ethers.Wallet(process.env.LAYER_2_WALLET_PK, providerL1);

    const filters = bridgeDepositContract.filters.EtherReceived();

    const latestTransfer: TransactionRecord[] = await getDB()
      .collection(DB_COLLECTION)
      .find({})
      .sort({ blockNumber: -1 })
      .limit(1)
      .toArray();

    const startBlock = latestTransfer[0]?.blockNumber ?? START_BLOCK;
    console.log(`Fetching logs from block: ${startBlock}`);

    const logs = await providerL1.getLogs({
      address: bridgeDeposit.address,
      ...filters,
      fromBlock: startBlock + 1,
    });

    const events: TransactionRecord[] = logs
      .map((l) => {
        const { args } = bridgeDepositContract.interface.parseLog(l);
        return {
          transactionHash: l.transactionHash,
          blockNumber: l.blockNumber,
          wallet: args.emitter,
          amount: args.amount.toString(),
          isConfirmed: false,
          isProcessed: false,
        };
      })
      .filter(
        (tx) =>
          ethers.utils.getAddress(tx.wallet) !==
          ethers.utils.getAddress(wallet.address)
      );

    if (events.length > 0) {
      await getDB().collection(DB_COLLECTION).insertMany(events);
      console.log(`${events.length} transaction(s) added`);
    } else {
      console.log("No new transaction added");
    }
  } catch (e) {
    console.log("getLayerOneTransfers failed", e);
  }
};

export const checkLayerOneConfirmations = async () => {
  try {
    const currentBlock = await getProviderL1().getBlockNumber();
    const transactionsToConfirm: TransactionRecord[] = await getDB()
      .collection(DB_COLLECTION)
      .find({ isConfirmed: false })
      .toArray();

    const transactionsConfirmed: (ObjectID | undefined)[] =
      transactionsToConfirm
        .filter(
          ({ blockNumber }) => currentBlock - blockNumber >= CONFIRMATIONS
        )
        .map(({ _id }) => _id);

    if (transactionsConfirmed.length > 0) {
      await getDB()
        .collection(DB_COLLECTION)
        .updateMany(
          { _id: { $in: transactionsConfirmed } },
          { $set: { isConfirmed: true } }
        );
      console.log(`${transactionsConfirmed.length} transactions confirmed`);
    } else {
      console.log("No new transaction confirmed");
    }
  } catch (e) {
    console.log("checkLayerOneConfirmations failed", e);
  }
};

export const processLayerOneTransactionsToL2 = async () => {
  if (!process.env.LAYER_2_WALLET_PK) return;
  try {
    const transactionsToProcess: TransactionRecord[] = await getDB()
      .collection(DB_COLLECTION)
      .find({ isConfirmed: true, isProcessed: false })
      .sort({ blockNumber: 1 })
      .limit(20)
      .toArray();

    if (transactionsToProcess.length === 0) {
      console.log("No transaction to process");
      return;
    }

    const providerL2 = new ethers.providers.JsonRpcProvider(OVM_JSON_RPC_URL);
    const wallet = new ethers.Wallet(process.env.LAYER_2_WALLET_PK, providerL2);
    const GasPriceOracleContract = new ethers.Contract(
      gasPriceOracleContract.address,
      gasPriceOracleContract.abi,
      providerL2
    );

    const currentNonce = await providerL2.getTransactionCount(wallet.address);
    let index = 0;
    for await (const transaction of transactionsToProcess) {
      const transactionAmount = ethers.BigNumber.from(transaction.amount);
      const transactionParams = {
        to: transaction.wallet,
        value: transactionAmount,
        nonce: currentNonce + index,
      };

      const [gasEstimate, gasPrice] = await Promise.all([
        wallet.estimateGas(transactionParams),
        providerL2.getGasPrice(),
      ]);

      const l1Fee = await GasPriceOracleContract.getL1Fee(
        ethers.utils.serializeTransaction({
          ...transactionParams,
          gasLimit: gasEstimate,
          gasPrice,
        })
      );

      const transactionFee = gasPrice.mul(gasEstimate).add(l1Fee);
      let amountToTransfer = null;

      if (transactionAmount.gt(transactionFee)) {
        amountToTransfer = ethers.BigNumber.from(transaction.amount).sub(
          transactionFee
        );
        const tx = await wallet.sendTransaction({
          ...transactionParams,
          value: amountToTransfer,
          gasLimit: gasEstimate,
          gasPrice,
        });
        console.log(
          `Transaction ${tx.hash} for ${transaction.wallet} broadcasted`
        );
        await tx.wait();
      } else {
        console.log("Amount is too low. Transaction cannot be processed");
      }

      await getDB()
        .collection(DB_COLLECTION)
        .updateOne({ _id: transaction._id }, { $set: { isProcessed: true } });

      console.log(
        !!amountToTransfer
          ? `Transaction processed for wallet ${transaction.wallet}. Amount: ${
              Number(transactionAmount) / 1e18
            } ether minus a fee of ${Number(transactionFee) / 1e18} ether`
          : `Transaction cancelled for wallet ${transaction.wallet} because of low amount`
      );
      index += 1;
    }
  } catch (e) {
    console.log("processLayerOneTransactionsToL2 failed", e);
  }
};
