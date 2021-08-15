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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDB = void 0;
const mongodb_1 = require("mongodb");
const DB_NAME = "ovm-bridge";
const MONGO_URI = process.env.NODE_ENV === "development"
    ? "mongodb://localhost:27017"
    : `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.pmj23.mongodb.net/test?retryWrites=true&w=majority`;
let db;
const mongoConfig = {
    numberOfRetries: 5,
    useNewUrlParser: true,
    auto_reconnect: true,
    poolSize: 200,
};
const initializeDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield mongodb_1.MongoClient.connect(MONGO_URI, mongoConfig);
        db = client.db(DB_NAME);
        console.log("DB connected");
    }
    catch (e) {
        console.log(e);
    }
});
exports.default = initializeDB;
exports.getDB = () => db;
