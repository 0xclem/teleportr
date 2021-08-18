import { ethers } from "ethers";
import { bridgeDeposit } from "./contracts/BridgeDeposit";
import { getDB } from "./mongoConnector";
import { ObjectID } from "mongodb";

const NETWORK = process.env.NETWORK || "mainnet";
const OVM_JSON_RPC_URL =
  process.env.OVM_JSON_RPC_URL || "https://mainnet.optimism.io";

const START_BLOCK = Number(process.env.START_BLOCK || 26140558);
const DB_COLLECTION = "transfers";

const CONFIRMATIONS = 21;
const OVM_GAS_PRICE = 0.015;

type TransactionRecord = {
  transactionHash: string;
  blockNumber: number;
  wallet: string;
  amount: number;
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
          amount: args.amount / 1e18,
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

    const currentNonce = await providerL2.getTransactionCount(wallet.address);
    let index = 0;
    for await (const transaction of transactionsToProcess) {
      const transactionParams = {
        to: transaction.wallet,
        value: ethers.utils.parseEther(transaction.amount.toString()),
        gasPrice: ethers.utils.parseUnits(OVM_GAS_PRICE.toString(), "gwei"),
        nonce: currentNonce + index,
      };
      const gasEstimate = await wallet.estimateGas(transactionParams);
      const txFee = (Number(gasEstimate) * OVM_GAS_PRICE) / 1e9;
      const tx = await wallet.sendTransaction({
        ...transactionParams,
        value: ethers.utils.parseEther(
          (transaction.amount - txFee).toFixed(18)
        ),
        gasLimit: Number(gasEstimate),
      });
      console.log(
        `Transaction ${tx.hash} for ${transaction.wallet} broadcasted`
      );
      await tx.wait();
      await getDB()
        .collection(DB_COLLECTION)
        .updateOne({ _id: transaction._id }, { $set: { isProcessed: true } });
      console.log(
        `Transaction processed for wallet ${transaction.wallet} for a ${txFee} ether fee`
      );
      index += 1;
    }
  } catch (e) {
    console.log("processLayerOneTransactionsToL2 failed", e);
  }
};
