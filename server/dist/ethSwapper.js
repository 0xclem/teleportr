"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processLayerOneTransactionsToL2 = exports.checkLayerOneConfirmations = exports.getLayerOneTransfers = void 0;
const ethers_1 = require("ethers");
const BridgeDeposit_1 = require("./contracts/BridgeDeposit");
const mongoConnector_1 = require("./mongoConnector");
const NETWORK = process.env.NETWORK || "kovan";
const OVM_JSON_RPC_URL = process.env.OVM_JSON_RPC_URL || "https://kovan.optimism.io";
const OVM_NETWORK_ID = process.env.OVM_NETWORK_ID || 69;
const START_BLOCK = process.env.START_BLOCK || 26140558;
const DB_COLLECTION = "transfers";
const CONFIRMATIONS = 21;
const OVM_GAS_PRICE = 0.015;
let providerL1 = null;
const getProviderL1 = () => {
    if (!providerL1) {
        return (providerL1 = new ethers_1.ethers.providers.InfuraProvider(NETWORK, process.env.INFURA_PROJECT_ID));
    }
    return providerL1;
};
exports.getLayerOneTransfers = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (!process.env.LAYER_2_WALLET_PK)
            return;
        const providerL1 = getProviderL1();
        const bridgeDepositContract = new ethers_1.ethers.Contract(BridgeDeposit_1.bridgeDeposit.address, BridgeDeposit_1.bridgeDeposit.abi, providerL1);
        const wallet = new ethers_1.ethers.Wallet(process.env.LAYER_2_WALLET_PK, providerL1);
        const filters = bridgeDepositContract.filters.EtherReceived();
        const latestTransfer = yield mongoConnector_1.getDB()
            .collection(DB_COLLECTION)
            .find({})
            .sort({ blockNumber: -1 })
            .limit(1)
            .toArray();
        const startBlock = (_b = (_a = latestTransfer[0]) === null || _a === void 0 ? void 0 : _a.blockNumber) !== null && _b !== void 0 ? _b : START_BLOCK;
        const logs = yield providerL1.getLogs(Object.assign(Object.assign({ address: BridgeDeposit_1.bridgeDeposit.address }, filters), { fromBlock: startBlock + 1 }));
        const events = logs
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
            .filter((tx) => ethers_1.ethers.utils.getAddress(tx.wallet) !==
            ethers_1.ethers.utils.getAddress(wallet.address));
        if (events.length > 0) {
            yield mongoConnector_1.getDB().collection(DB_COLLECTION).insertMany(events);
            console.log(`${events.length} transaction(s) added`);
        }
        else {
            console.log("No new transaction added");
        }
    }
    catch (e) {
        console.log("getLayerOneTransfers failed", e);
    }
});
exports.checkLayerOneConfirmations = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentBlock = yield getProviderL1().getBlockNumber();
        const transactionsToConfirm = yield mongoConnector_1.getDB()
            .collection(DB_COLLECTION)
            .find({ isConfirmed: false })
            .toArray();
        const transactionsConfirmed = transactionsToConfirm
            .filter(({ blockNumber }) => currentBlock - blockNumber >= CONFIRMATIONS)
            .map(({ _id }) => _id);
        if (transactionsConfirmed.length > 0) {
            yield mongoConnector_1.getDB()
                .collection(DB_COLLECTION)
                .updateMany({ _id: { $in: transactionsConfirmed } }, { $set: { isConfirmed: true } });
            console.log(`${transactionsConfirmed.length} transactions confirmed`);
        }
        else {
            console.log("No new transaction confirmed");
        }
    }
    catch (e) {
        console.log("checkLayerOneConfirmations failed", e);
    }
});
exports.processLayerOneTransactionsToL2 = () => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _c;
    if (!process.env.LAYER_2_WALLET_PK)
        return;
    try {
        const transactionsToProcess = yield mongoConnector_1.getDB()
            .collection(DB_COLLECTION)
            .find({ isConfirmed: true, isProcessed: false })
            .sort({ blockNumber: 1 })
            .limit(20)
            .toArray();
        if (transactionsToProcess.length === 0) {
            console.log("No transaction to process");
            return;
        }
        const providerL2 = new ethers_1.ethers.providers.JsonRpcProvider(OVM_JSON_RPC_URL, OVM_NETWORK_ID);
        const wallet = new ethers_1.ethers.Wallet(process.env.LAYER_2_WALLET_PK, providerL2);
        const currentNonce = yield providerL2.getTransactionCount(wallet.address);
        let index = 0;
        try {
            for (var transactionsToProcess_1 = __asyncValues(transactionsToProcess), transactionsToProcess_1_1; transactionsToProcess_1_1 = yield transactionsToProcess_1.next(), !transactionsToProcess_1_1.done;) {
                const transaction = transactionsToProcess_1_1.value;
                const transactionParams = {
                    to: transaction.wallet,
                    value: ethers_1.ethers.utils.parseEther(transaction.amount.toString()),
                    gasPrice: ethers_1.ethers.utils.parseUnits(OVM_GAS_PRICE.toString(), "gwei"),
                    nonce: currentNonce + index,
                };
                const gasEstimate = yield wallet.estimateGas(transactionParams);
                const txFee = (Number(gasEstimate) * OVM_GAS_PRICE) / 1e9;
                const tx = yield wallet.sendTransaction(Object.assign(Object.assign({}, transactionParams), { value: ethers_1.ethers.utils.parseEther((transaction.amount - txFee).toFixed(18)), gasLimit: Number(gasEstimate) }));
                console.log(`Transaction ${tx.hash} for ${transaction.wallet} broadcasted`);
                yield tx.wait();
                yield mongoConnector_1.getDB()
                    .collection(DB_COLLECTION)
                    .updateOne({ _id: transaction._id }, { $set: { isProcessed: true } });
                console.log(`Transaction processed for wallet ${transaction.wallet} for a ${txFee} ether fee`);
                index += 1;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (transactionsToProcess_1_1 && !transactionsToProcess_1_1.done && (_c = transactionsToProcess_1.return)) yield _c.call(transactionsToProcess_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    catch (e) {
        console.log("processLayerOneTransactionsToL2 failed", e);
    }
});
