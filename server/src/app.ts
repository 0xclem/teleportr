import dotenv from "dotenv";
dotenv.config();

import initializeDB from "./mongoConnector";
import {
  getLayerOneTransfers,
  checkLayerOneConfirmations,
  processLayerOneTransactionsToL2,
} from "./ethSwapper";

const TIMEOUT = Number(process.env.SCHEDULE || 60 * 1000);

const startBridge = () => {
  getLayerOneTransfers();
  checkLayerOneConfirmations();
  processLayerOneTransactionsToL2();
};

initializeDB()
  .then(() => {
    setInterval(startBridge, TIMEOUT);
    startBridge();
  })
  .catch((e) => {
    console.error("Failed to connect to DB");
    console.error(e);
    process.exit(1);
  });
