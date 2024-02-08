import { Db, MongoClient } from "mongodb";
import dotenv from "dotenv";
import { appCache } from "./appCache";
import indexing from "./utlis/indexing";

dotenv.config();

export default class mongoConnection {
  static uri = process.env.MONGOURL;

  private static client: MongoClient;

  static connectToDatabases = async () => {
    try {
      if (mongoConnection.client) {
        return this.client;
      } else {
        this.client = new MongoClient(this.uri);
        await this.client.connect();
        console.log("Connect to database mongodb");

        await indexing.createIndex(this.client);
        return this.client;
      }
    } catch (err) {
      console.error("error connecting to mongodb", err);
    }
  };

  static async closeConnection() {
    await this.client.close();
    delete this.client;
  }

  static async createSessionMongo(): Promise<any> {
    const session = this.client.startSession();

    return session;
  }

  static async getDB(): Promise<Db> {
    const client = await mongoConnection.connectToDatabases();
    const db = client.db();

    return db;
  }
}

const main = async () => {
  try {
    var client = await mongoConnection.connectToDatabases();
  } catch (err) {
    console.error("error connecting to mongodb", err);
  }

  // finally {
  //   await client.close();
  // }
};

main();
