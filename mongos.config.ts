import { MongoClient } from "mongodb";
import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config();
const uri = process.env.MONGOURL;

const main = async () => {
  try {
    mongoose.connect(uri, { dbName: "store" });
  } catch (err) {
    console.error("error connecting to mongodb", err);
  }
};

main();
