import { appCache } from "../appCache";
import mongoConnection from "../mongo.config";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "bson";
import CUser from "./user";
import { IAllergies, IDiseases, IProduct, IUser } from "../utlis/interfaces";

export default class CAdmin {
  private static instance: CAdmin;

  private constructor() {}

  public static getInstance(): CAdmin {
    if (CAdmin.instance) {
      return CAdmin.instance;
    }
    CAdmin.instance = new CAdmin();
    return CAdmin.instance;
  }

  private async connectToMongo(): Promise<any> {
    const client = await mongoConnection.connectToDatabases();
    const db = client.db();

    return db;
  }

  private async createSessionMongo(): Promise<any> {
    const client = await mongoConnection.connectToDatabases();
    const session = client.startSession();

    return session;
  }

  async CreateAdminUser(data: IUser): Promise<string> {
    try {
      data.is_admin = true;
      const instance = CUser.getInstance();
      data.password = instance.hashPassword(data.password);
      const db = await mongoConnection.getDB();
      const session = await mongoConnection.createSessionMongo();
      try {
        const token = await session.withTransaction(async () => {
          const user = await db.collection("admin").insertOne(data);
          const token = await instance.generateOrUpdateSession(
            user.insertedId as unknown as string
          );
          return token;
        });
        session.endSession();

        return token;
      } catch (e: any) {
        session.endSession();
        throw new Error(e, { cause: e.code });
      }
    } catch (e: any) {
      throw new Error(e, { cause: e.code });
    }
  }

  async addAllergiesData(allergies: IAllergies): Promise<boolean> {
    try {
      const db = await mongoConnection.getDB();

      const data = await db.collection("allergies").insertOne(allergies);
      return true;
    } catch (e: any) {
      throw new Error(e.message, { cause: e.code });
    }
  }

  async addDiseasesData(diseases: IDiseases): Promise<boolean> {
    try {
      const db = await mongoConnection.getDB();

      const data = await db.collection("diseases").insertOne(diseases);
      return true;
    } catch (e: any) {
      throw new Error(e.message, { cause: e.code });
    }
  }

  async addProductData(product: IProduct): Promise<boolean> {
    try {
      const db = await mongoConnection.getDB();

      const data = await db.collection("products").insertOne(product);
      return true;
    } catch (e: any) {
      throw new Error(e.message, { cause: e.code });
    }
  }
}
