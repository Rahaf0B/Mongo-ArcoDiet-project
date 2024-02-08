import { MongoClient } from "mongodb";

async function createIndex(client: MongoClient) {
  try {
    await client
      .db()
      .collection("user")
      .createIndex({ email: 1 }, { unique: true });
    await client
      .db()
      .collection("session")
      .createIndex({ token: 1 }, { unique: true });
    await client
      .db()
      .collection("allergies")
      .createIndex({ name: 1 }, { unique: true });
    await client
      .db()
      .collection("diseases")
      .createIndex({ name: 1 }, { unique: true });
    await client
      .db()
      .collection("products")
      .createIndex({ barcode_number: 1 }, { unique: true });
  } catch (e: any) {
    throw new Error(e.message);
  }
}

export default {
  createIndex,
};
