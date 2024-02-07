import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
const uri = process.env.MONGOURL;
const client = new MongoClient(uri, {});
const dbname = "store";

const connectToDatabases = async () => {
  try {
    await client.connect();
    console.log("Connect to database mongodb");
  } catch (err) {
    console.error("error connecting to mongodb", err);
  }
};

const main = async () => {
  try {
    await connectToDatabases();
  } catch (err) {
    console.error("error connecting to mongodb", err);
  } finally {
    await client.close();
  }
};

main();
export default client;
