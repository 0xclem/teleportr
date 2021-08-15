"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoConnector_1 = __importDefault(require("./mongoConnector"));
const ethSwapper_1 = require("./ethSwapper");
const TIMEOUT = Number(process.env.SCHEDULE || 60 * 1000);
const startBridge = () => {
    ethSwapper_1.getLayerOneTransfers();
    ethSwapper_1.checkLayerOneConfirmations();
    ethSwapper_1.processLayerOneTransactionsToL2();
};
mongoConnector_1.default()
    .then(() => {
    setInterval(startBridge, TIMEOUT);
    startBridge();
})
    .catch((e) => {
    console.error("Failed to connect to DB");
    console.error(e);
    process.exit(1);
});
