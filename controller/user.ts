import { appCache } from "../appCache";
import mongoConnection from "../mongo.config";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "bson";
import { Db, Double } from "mongodb";
import { ISession, IUser } from "../utlis/interfaces";

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
      const db = await mongoConnection.getDB();

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

  async checkSession(token: string): Promise<ISession> {
    const db = await mongoConnection.getDB();
    const data = await db.collection("session").findOne({
      token: token,
    });

    return data as unknown as ISession;
  }

  async checkUserExistsByEmail(email: string): Promise<IUser> {
    try {
      const db = await mongoConnection.getDB();
      const userData = await db.collection("user").findOne({ email: email });

      if (!userData) {
        throw new Error("Invalid Data Try Again", {
          cause: "Validation Error",
        });
      }
      return userData as IUser;
    } catch (e: any) {
      throw new Error(e.message, { cause: e?.cause });
    }
  }
  async CreateUser(data: IUser, userType: number): Promise<string> {
    try {
      switch (userType) {
        case 0:
          data.is_reqUser = true;
          break;
        case 1:
          data.is_nutritionist = true;
          break;
        default:
          throw new Error("userType must be 0 or 1", {
            cause: "userType error",
          });
      }
      data.password = this.hashPassword(data.password);
      const db = await mongoConnection.getDB();
      const session = await mongoConnection.createSessionMongo();
      try {
        const token = await session.withTransaction(async () => {
          data.date_of_birth = new Date(data.date_of_birth);
          const user = await db.collection("user").insertOne(data);
          const token = await this.generateOrUpdateSession(
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

  async LoginUser(data: IUser): Promise<string> {
    try {
      const db = await mongoConnection.getDB();
      const user = await this.checkUserExistsByEmail(data.email);
      const validate = user
        ? await bcrypt.compare(data.password, user.password)
        : false;
      if (!validate) {
        throw new Error("Invalid data", { cause: "Validation Error" });
      } else {
        const token = await this.generateOrUpdateSession(
          user._id as unknown as string
        );
        return token;
      }
    } catch (e: any) {
      throw new Error(e.message, { cause: e.cause });
    }
  }

  async addHealthInfo(data: Partial<IUser>, user_id: ObjectId) {
    try {
      const db = await mongoConnection.getDB();
      console.log(user_id);
      data.weight = data.weight ? new Double(data.weight as number) : undefined;
      data.height = data.height ? new Double(data.height as number) : undefined;
      //ANCHOR - Put the name or the ID of the allergies and diseases

      const updatedData = await db.collection("user").findOneAndUpdate(
        { _id: new ObjectId(user_id) },
        [
          {
            $addFields: data,
          },
        ],
        {
          returnDocument: "after",
          ignoreUndefined: true,
          projection: {
            weight: 1,
            height: 1,
            _id: 0,
            allergies: 1,
            diseases: 1,
          },
        }
      );
      return updatedData;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}
