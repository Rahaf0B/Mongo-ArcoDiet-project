import { appCache } from "../config/appCache";
import mongoConnection from "../config/mongo.config";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "bson";
import { Db, Double } from "mongodb";
import { ISession, IUser } from "../utlis/interfaces";
import emailSender from "../utlis/emailSender";

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
        throw new Error(e, { cause: e?.code });
      }
    } catch (e: any) {
      throw new Error(e, { cause: e?.code });
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

  async getUserInfo(userId: string, attributes?: any): Promise<IUser> {
    try {
      const db = await mongoConnection.getDB();
      const data = await db
        .collection("user")
        .findOne({ _id: new ObjectId(userId) }, { projection: attributes });
      return data as unknown as IUser;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async getUserEmail(userId: string) {
    try {
      const data = await this.getUserInfo(userId, { email: 1, _id: 0 });
      return data;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async getUserGeneralInfo(userId: string) {
    try {
      const data = await this.getUserInfo(userId, {
        first_name: 1,
        last_name: 1,
        _id: 0,
        date_of_birth: 1,
        gender: 1,
      });
      return data;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async getUserHealthInfo(userId: string) {
    try {
      const data = await this.getUserInfo(userId, {
        weight: 1,
        height: 1,
        _id: 0,
        allergies: 1,
        diseases: 1,
      });
      return data;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async editUserEmail(userId: string, email: string) {
    try {
      const db = await mongoConnection.getDB();
      const data = await db
        .collection("user")
        .updateOne({ _id: new ObjectId(userId) }, { $set: { email: email } });
      return true;
    } catch (e: any) {
      throw new Error(e, { cause: e?.code });
    }
  }

  async editUserPassword(userId: string, passwords: any) {
    try {
      const userData = await this.getUserInfo(userId, {
        password: 1,
        _id: 0,
      });
      const validate = await bcrypt.compare(
        passwords.old_password,
        userData.password
      );

      if (validate && passwords.new_password === passwords.confirm_password) {
        const salt = bcrypt.genSaltSync(10);
        const updatedPassword = bcrypt.hashSync(passwords.new_password, salt);

        const db = await mongoConnection.getDB();
        const data = await db
          .collection("user")
          .updateOne(
            { _id: new ObjectId(userId) },
            { $set: { password: updatedPassword } }
          );
        return true;
      } else {
        throw new Error(
          validate
            ? "new-password and the confirm-password are not the same"
            : "Invalid password",
          {
            cause: "Validation Error",
          }
        );
      }
    } catch (e: any) {
      throw new Error(e, { cause: e?.cause });
    }
  }

  async sendOPTCode(email: any) {
    try {
      const db = await mongoConnection.getDB();
      const user = await db.collection("user").findOne({ email: email.email });
      if (user) {
        const randomOPT = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
        const updatedData = await await db.collection("user").updateOne(
          {
            _id: user._id,
          },
          { $set: { optCode: randomOPT } }
        );
        emailSender.sendEmail(
          user.email,
          "OPT CODE",
          "Your OPT CODE is " + randomOPT.toString()
        );
      } else {
        throw new Error("The Email not found", {
          cause: "NOT FOUND",
        });
      }
    } catch (error: any) {
      throw new Error(error.message, { cause: error?.cause });
    }
  }

  async validateOPTCode(data: Partial<IUser>): Promise<boolean> {
    try {
      const db = await mongoConnection.getDB();
      const user = await db
        .collection("user")
        .findOneAndUpdate(
          { $and: [{ email: data.email }, { optCode: data.optCode }] },
          [{ $unset: "optCode" }]
        );
      if (user) {
        return true;
      } else
        throw new Error(
          "The user with email is not exist or the optCode is invalid",
          { cause: "invalid" }
        );
    } catch (error: any) {
      throw new Error(error.message, { cause: error?.cause });
    }
  }

  async forgetPassword(data: any) {
    if (data.new_password === data.confirm_password) {
      const salt = bcrypt.genSaltSync(10);
      const updatedPassword = bcrypt.hashSync(data.new_password, salt);
      try {
        const db = await mongoConnection.getDB();
        const user = await db
          .collection("user")
          .updateOne(
            { email: data.email },
            { $set: { password: updatedPassword } }
          );
      } catch (e: any) {
        throw new Error(e.message);
      }
    } else {
      throw new Error(
        "new-password and the confirm-password are not the same",

        {
          cause: "Validation Error",
        }
      );
    }
  }

  async getNutritionists(
    ItemNumber: number,
    nutritionist_id: string | undefined
  ): Promise<IUser[]> {
    try {
      const db = await mongoConnection.getDB();
      const data = await db.collection("user").find(
        {
          $and: [
            nutritionist_id
              ? { _id: { $gt: new ObjectId(nutritionist_id) } }
              : {},
            { is_nutritionist: true },
          ],
        },
        {
          limit: ItemNumber,
          sort: { _id: 1 },
          projection: {
            first_name: 1,
            last_name: 1,
            profile_pic_url: 1,
            price: 1,
            _id: 1,
          },
        }
      );
      return data.toArray() as unknown as IUser[];
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async getOneNutritionist(nutritionist_id: string): Promise<IUser> {
    try {
      const db = await mongoConnection.getDB();
      const data = await db.collection("user").findOne(
        {
          $and: [
            { _id: new ObjectId(nutritionist_id) },
            { is_nutritionist: true },
          ],
        },
        {
          projection: {
            first_name: 1,
            last_name: 1,
            profile_pic_url: 1,
            price: 1,
            _id: 1,
          },
        }
      );
      return data as unknown as IUser;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
  async addNutritionistToFavorite(uid: string, nutritionist_id: string) {
    try {
      const db = await mongoConnection.getDB();
      const nutritionistInfo = await this.getOneNutritionist(nutritionist_id);
      if (nutritionistInfo) {
        const data = await db.collection("nutritionist-favorite").updateOne(
          { user_id: new ObjectId(uid) },
          {
            $addToSet: {
              nutritionists: {
                nutritionist_id: new ObjectId(nutritionist_id),
              },
            },
          },
          { upsert: true }
        );
        return true;
      } else {
        throw new Error("There is no Nutritionist with this ID", {
          cause: "not-found",
        });
      }
    } catch (error: any) {
      throw new Error(error.message, { cause: error?.cause });
    }
  }

  async removeNutritionistFromFavorite(uid: string, nutritionist_id: string) {
    try {
      const db = await mongoConnection.getDB();
      const data = await db.collection("nutritionist-favorite").updateOne(
        { user_id: new ObjectId(uid) },
        {
          $pull: {
            nutritionists: {
              nutritionist_id: new ObjectId(nutritionist_id),
            },
          },
        }
      );
    } catch (error: any) {
      throw new Error(error.message, { cause: error?.cause });
    }
  }

  async getNutritionistFromFavorite(uid: string): Promise<any> {
    try {
      const db = await mongoConnection.getDB();
      const data = await db.collection("nutritionist-favorite").aggregate([
        { $match: { user_id: new ObjectId(uid) } },
        {
          $unwind: "$nutritionists",
        },
        {
          $lookup: {
            from: "user",
            localField: "nutritionists.nutritionist_id",
            foreignField: "_id",
            as: "nutritionistInfo",
          },
        },
        {
          $unwind: "$nutritionistInfo",
        },
        {
          $addFields: {
            nutritionist_id: "$nutritionistInfo._id",
            nutritionist_first_name: "$nutritionistInfo.first_name",
            nutritionist_last_name: "$nutritionistInfo.last_name",
          },
        },
        {
          $project: {
            _id: 0,
            user_id: 0,
            nutritionists: 0,
            nutritionistInfo: 0,
          },
        },
      ]);
      return data ? data?.toArray() : [];
    } catch (error: any) {
      throw new Error(error.message, { cause: error?.cause });
    }
  }
}
