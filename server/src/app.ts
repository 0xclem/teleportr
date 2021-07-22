import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

import initializeDB from "./mongoConnector";
import {
  getLayerOneTransfers,
  checkLayerOneConfirmations,
  processLayerOneTransactionsToL2,
} from "./ethSwapper";
// import router from "./routes";

const TIMEOUT = 60 * 1000;

const app: Application = express();

initializeDB()
  .then(() => {
    setInterval(() => {
      getLayerOneTransfers();
      checkLayerOneConfirmations();
      processLayerOneTransactionsToL2();
    }, TIMEOUT);
    // app.use(bodyParser.urlencoded({ extended: true }));
    // app.use('/api/address-data', bodyParser.json());
    // app.use(cors({ origin: true, credentials: true }));
    // app.use(router);
    // app.listen(process.env.PORT || 8081, () => console.log("Server running"));
  })
  .catch((e) => {
    console.error("Failed to connect to DB");
    console.error(e);
    process.exit(1);
  });
