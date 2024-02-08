// import client from  "../mongo.config";
import { json } from "body-parser";
import { appCache } from "../appCache";
import mongoConnection from "../mongo.config";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "bson";

export default class CUser {
  private static instance: CUser;

  private constructor() {}

  public static getInstance(): CUser {
    if (CUser.instance) {
      return CUser.instance;
    }
    CUser.instance = new CUser();
    return CUser.instance;
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

  hashPassword(password: string): string {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    return hashedPassword;
  }

  async generateOrUpdateSession(userId: string): Promise<string> {
    try {
      const token = uuidv4();

      const expiration_date = new Date();
      expiration_date.setDate(new Date().getDate() + 7);
      const db = await this.connectToMongo();

      let data = await db.collection("session").insertOne({
        token: token,
        expiration_date: expiration_date,
        user_id: new ObjectId(userId),
      });
      return token;
    } catch (e: any) {
      if (e?.code == 11000) {
        const token = await this.generateOrUpdateSession(userId);
        return token;
      } else throw new Error(e.message);
    }
  }

  async checkUserExistsByEmail(email: string): Promise<IUser> {
    try {
      const db = await this.connectToMongo();
      const userData = await db.collection("user").findOne({ email: email });

      if (!userData) {
        throw new Error("Invalid Data Try Again", {
          cause: "Validation Error",
        });
      }
      return userData;
    } catch (e: any) {
      throw new Error(e.message, { cause: e?.cause });
    }
  }
  async CreateUser(data: IUser): Promise<string> {
    try {
      data.password = this.hashPassword(data.password);
      const db = await this.connectToMongo();
      const session = await this.createSessionMongo();
      const token = await session.withTransaction(async () => {
        data.is_reqUser = true;
        data.date_of_birth = new Date(data.date_of_birth);
        const user = await db.collection("user").insertOne(data);
        const token = await this.generateOrUpdateSession(user.insertedId);
        return token;
      });
      return token;
    } catch (e: any) {
      throw new Error(e, { cause: e.code });
    }
  }

  async LoginUser(data: IUser): Promise<string> {
    try {
      const db = await this.connectToMongo();
      const user = await this.checkUserExistsByEmail(data.email);
      const validate = user
        ? await bcrypt.compare(data.password, user.password)
        : false;
      if (!validate) {
        throw new Error("Invalid data", { cause: "Validation Error" });
      } else {
        const token = await this.generateOrUpdateSession(user._id);
        return token;
      }
    } catch (e: any) {
      throw new Error(e.message, { cause: e.cause });
    }
  }
}
