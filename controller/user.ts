import { appCache } from "../config/appCache";
import mongoConnection from "../config/mongo.config";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "bson";
import { Db, Double } from "mongodb";
import {
  IMessage,
  INCPForm,
  IProduct,
  ISession,
  IUser,
} from "../utlis/interfaces";
import emailSender from "../utlis/emailSender";
import dateHandler from "../utlis/dateHandler";
import CProduct from "./product";
import { cloudinaryImageDestroyMethod } from "../middleware/imageuploader";
import { AsyncResource } from "async_hooks";
import { match } from "assert";

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

  async clearSession(user_id: string) {
    try {
      const db = await mongoConnection.getDB();
      const data = await db
        .collection("session")
        .deleteMany({ user_id: new ObjectId(user_id) });
    } catch (e: any) {
      throw new Error(e.message);
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
        throw new Error(e, { cause: e.code ? e?.code : e?.cause });
      }
    } catch (e: any) {
      throw new Error(e, { cause: e.code ? e?.code : e?.cause });
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
  async editUserInfo(
    data: Partial<IUser>,
    user_id: ObjectId,
    projectionFields: any
  ) {
    try {
      const db = await mongoConnection.getDB();
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
          projection: projectionFields,
        }
      );
      return updatedData;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
  async addOrEditHealthInfo(data: Partial<IUser>, user_id: ObjectId) {
    try {
      data.weight = data.weight ? new Double(data.weight as number) : undefined;
      data.height = data.height ? new Double(data.height as number) : undefined;
      //ANCHOR - Put the name or the ID of the allergies and diseases
      const updatedData = await this.editUserInfo(data, user_id, {
        weight: 1,
        height: 1,
        _id: 0,
        allergies: 1,
        diseases: 1,
      });
      return updatedData;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
  async editUserGeneralInfo(data: Partial<IUser>, user_id: ObjectId) {
    try {
      const updatedData = await this.editUserInfo(data, user_id, {
        first_name: 1,
        last_name: 1,
        _id: 0,
        date_of_birth: 1,
        gender: 1,
        phone_number: 1,
        description: 1,
        specialization: 1,
        collage: 1,
        experience_years: 1,
        price: 1,
      });
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

  async getUserHealthInfo(userId: string): Promise<IUser> {
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

  async saveMessage(uid: string, user_id: string, message: string) {
    try {
      const db = await mongoConnection.getDB();
      const messageUpdated = await db.collection("messages").findOneAndUpdate(
        {
          $and: [
            { participants: { $exists: true } },
            {
              participants: {
                $all: [
                  { $elemMatch: { $eq: new ObjectId(uid) } },
                  { $elemMatch: { $eq: new ObjectId(user_id) } },
                ],
              },
            },
          ],
        },
        {
          $setOnInsert: {
            participants: [new ObjectId(uid), new ObjectId(user_id)],
          },
          $addToSet: {
            message: {
              sender_id: new ObjectId(uid),
              message: message,
              date: new Date().toISOString(),
            },
          },
        },

        { upsert: true, returnDocument: "after" }
      );

      return messageUpdated.message[messageUpdated.message.length - 1];
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async getMessages(uid: string, user_id: string) {
    try {
      const db = await mongoConnection.getDB();
      const message = await db.collection("messages").aggregate([
        {
          $match: {
            $and: [
              { participants: { $exists: true } },
              {
                participants: {
                  $all: [
                    { $elemMatch: { $eq: new ObjectId(uid) } },
                    { $elemMatch: { $eq: new ObjectId(user_id) } },
                  ],
                },
              },
            ],
          },
        },

        {
          $project: {
            message: {
              $map: {
                input: "$message",
                as: "m",

                in: {
                  $mergeObjects: [
                    {
                      is_sender: {
                        $cond: {
                          if: { $eq: ["$$m.sender_id", new ObjectId(uid)] },
                          then: true,
                          else: false,
                        },
                      },
                    },
                    "$$m",
                  ],
                },
              },
            },
          },
        },
        {
          $project: {
            message: { $sortArray: { input: "$message", sortBy: { date: 1 } } },
          },
        },
        { $unset: "_id" },
        { $unset: "message.sender_id" },
      ]);
      const dataToReturn = await message.toArray();
      return dataToReturn[0]["message"];
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async checkProductSuitability(uid: string, productId: string) {
    try {
      const instance = CProduct.getInstance();
      const userData = await this.getUserHealthInfo(uid);
      const allergies: { [key: string]: string } = {
        soy: "soybeans_existing",
        "wheat derivatives": "wheat_derivatives_existing",
        pistachio: "pistachio_existing",
        peanut: "peanut_existing",
        nuts: "nuts_existing",
        seafood: "sea_components_existing",
        fish: "fish_existing",
        egg: "egg_existing",
        milk: "milk_existing",
      };

      const userAllergies = userData.allergies
        ? userData?.allergies.map((value, index) => {
            return allergies[value["name" as any]];
          })
        : [];

      const userDiseases = userData.diseases
        ? userData?.diseases.map((value, index) => value["name" as any])
        : [];

      const productData = await instance.getProductById(productId);
      for (let disease of userDiseases) {
        if (
          (disease == "liver" ||
            disease == "hypertension" ||
            disease == "kidney") &&
          productData?.sodium_value > 140
        ) {
          return false;
        }
        if (disease == "diabetes" && productData?.sugar_value > 5) {
          return false;
        }
      }

      for (let allergy of userAllergies) {
        if (allergy in productData) {
          return false;
        }
      }

      return true;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async updateUserImage(imageFile: any, userId: string): Promise<string> {
    const { path } = imageFile[0];

    try {
      const db = await mongoConnection.getDB();
      const message = await db.collection("user").updateOne(
        {
          _id: new ObjectId(userId),
        },
        { $set: { profile_pic_url: path } }
      );

      return path;
    } catch (error: any) {
      await cloudinaryImageDestroyMethod(path);

      throw new Error(error.message);
    }
  }

  async deleteUserImage(userId: string): Promise<boolean> {
    try {
      const db = await mongoConnection.getDB();
      const userImage = await db.collection("user").findOne(
        { _id: new ObjectId(userId) },
        {
          projection: {
            profile_pic_url: 1,
          },
        }
      );
      if (userImage) {
        await cloudinaryImageDestroyMethod(userImage.profile_pic_url);
        const imageDeleted = await db
          .collection("user")
          .updateOne(
            { _id: new ObjectId(userId) },
            { $unset: { profile_pic_url: "" } }
          );
        return true;
      } else
        throw new Error("No Image Found For This User", { cause: "not-found" });
    } catch (error: any) {
      throw new Error(error.message, { cause: error?.cause });
    }
  }

  async getUserImage(userId: string) {
    try {
      const db = await mongoConnection.getDB();
      const userImage = await db.collection("user").findOne(
        { _id: new ObjectId(userId) },
        {
          projection: {
            profile_pic_url: 1,
            _id: 0,
          },
        }
      );

      return userImage;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async updateNCPForm(userId: string, ncpData: INCPForm[]): Promise<boolean> {
    try {
      const db = await mongoConnection.getDB();

      const bulkOps = [];

      bulkOps.push({
        updateOne: {
          filter: { _id: new ObjectId(userId) },
          update: {
            $pull: {
              ncp: {
                question: { $in: ncpData.map((obj) => obj.question) },
              },
            },
          },
        },
      });

      bulkOps.push({
        updateOne: {
          filter: { _id: new ObjectId(userId) },
          update: {
            $addToSet: {
              ncp: {
                $each: ncpData,
              },
            },
          },
        },
      });

     const data= await db.collection("user").bulkWrite(bulkOps as any);

      return true;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getNCPForm(userId: string): Promise<INCPForm[]> {
    try {
      const db = await mongoConnection.getDB();
      const ncp = await db.collection("user").findOne(
        {
          _id: new ObjectId(userId),
        },

        {
          projection: {
            _id: 0,
            ncp: 1,
          },
        }
      );
      return ncp?.ncp ? (ncp?.ncp as unknown as INCPForm[]) : [];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
