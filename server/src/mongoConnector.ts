import { MongoClient, Db } from "mongodb";

const DB_NAME: string = "ovm-bridge";

console.log("NODE ENV", process.env.NODE_ENV);
const MONGO_URI: any =
  process.env.NODE_ENV === "development"
    ? "mongodb://localhost:27017"
    : `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.ml1j3.mongodb.net/test?retryWrites=true&w=majority`;

let db: Db;

const mongoConfig = {
  numberOfRetries: 5,
  useNewUrlParser: true,
  auto_reconnect: true,
  poolSize: 200,
};

const initializeDB = async () => {
  try {
    const client = await MongoClient.connect(MONGO_URI, mongoConfig);
    db = client.db(DB_NAME);
    console.log("DB connected");
  } catch (e) {
    console.log(e);
  }
};

export default initializeDB;

export const getDB = () => db;
