import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import {appCache} from "./appCache";

dotenv.config();

export default class mongoConnection{
  static uri = process.env.MONGOURL;

  private static client:any;

  static connectToDatabases = async () => {
    try {
      if(mongoConnection.client){
        return this.client
      }else{
        this.client  = new MongoClient(this.uri)
       await this.client.connect();

      console.log("Connect to database mongodb");
      this.client.db().collection("user").createIndex({ "email": 1 }, { unique: true })
      this.client.db().collection("session").createIndex({ "token": 1 }, { unique: true })

      return this.client;}
      // appCache.set("client", client);
    } catch (err) {
      console.error("error connecting to mongodb", err);
    }
  };

  static async closeConnection(){
    await this.client.close();
    delete this.client;

  }
  


}

const main = async () => {
  try {
   var client= await mongoConnection.connectToDatabases();
  } catch (err) {
    console.error("error connecting to mongodb", err);
  }
  
  // finally {
  //   await client.close();
  // }
};

main();
