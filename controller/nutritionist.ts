import { Double, ObjectId } from "mongodb";
import mongoConnection from "../config/mongo.config";
import { IProduct, IUser } from "../utlis/interfaces";

export default class CNutritionist {
  private static instance: CNutritionist;

  private constructor() {}

  public static getInstance(): CNutritionist {
    if (CNutritionist.instance) {
      return CNutritionist.instance;
    }

    CNutritionist.instance = new CNutritionist();
    return CNutritionist.instance;
  }

  async getNutritionists(
    ItemNumber: number,
    nutritionist_id: string | undefined
  ): Promise<IUser[]> {
    try {
      const db = await mongoConnection.getDB();
      const data = await db.collection("user").aggregate([
        {
          $match: {
            $and: [
              nutritionist_id
                ? { _id: { $gt: new ObjectId(nutritionist_id) } }
                : {},
              { is_nutritionist: true },
            ],
          },
        },
        { $sort: { _id: 1 } },
        { $limit: ItemNumber },
        {
          $project: {
            first_name: 1,
            last_name: 1,
            profile_pic_url: 1,
            price: 1,
            _id: 1,
            average_rating: { $avg: "$rating.value" },
          },
        },
      ]);
      return data.toArray() as unknown as IUser[];
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async getHighRatingNutritionists(ItemNumber: number): Promise<IUser[]> {
    try {
      const db = await mongoConnection.getDB();
      const data = await db.collection("user").aggregate([
        {
          $match: {
            $and: [{ is_nutritionist: true }, { rating: { $exists: true } }],
          },
        },
        { $unwind: "$rating" },
        // {$addFields:{
        //   "average_rating":{$avg:"$rating.value" }
        // }},
        {
          $group: {
            _id: "$_id",
            average_rating: { $avg: "$rating.value" },
            data: { $first: "$$ROOT" },
          },
        },
        { $sort: { average_rating: -1 } },
        { $limit: ItemNumber },
        {
          $project: {
            _id: { $toString: "$data._id" },
            first_name: "$data.first_name",
            last_name: "$data.last_name",
            profile_pic_url: "$data.profile_pic_url",
            price: "$data.price",
            average_rating: "$average_rating",
          },
        },
      ]);
      return data.toArray() as unknown as IUser[];
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async getOneNutritionist(nutritionist_id: string): Promise<IUser> {
    try {
      const db = await mongoConnection.getDB();
      const data = await db.collection("user").aggregate([
        {
          $match: {
            $and: [
              { _id: new ObjectId(nutritionist_id) },
              { is_nutritionist: true },
            ],
          },
        },

        {
          $project: {
            first_name: 1,
            last_name: 1,
            profile_pic_url: 1,
            price: 1,
            _id: 1,
            specialization:1,
            collage:1,
            experience_years:1,
            description:1,
            phone_number:1,
            average_rating: { $avg: "$rating.value" },
          },
        },
      ]);
      return data.toArray() as unknown as IUser;
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

  async addRatingToNutritionist(
    uid: string,
    nutritionist_id: string,
    rating: Double
  ) {
    try {
      const db = await mongoConnection.getDB();

      const updatedData = await db.collection("user").aggregate(
        [
          {
            $match: {
              $and: [
                { _id: new ObjectId(nutritionist_id) },
                {
                  is_nutritionist: true,
                },
              ],
            },
          },
          {
            $addFields: {
              rating: {
                $cond: {
                  if: { $eq: [{ $type: "$rating" }, "missing"] },
                  then: [{ user_id: new ObjectId(uid), value: rating }],
                  else: {
                    $cond: {
                      if: { $in: [new ObjectId(uid), "$rating.user_id"] },
                      then: {
                        $map: {
                          input: "$rating",
                          as: "r",
                          in: {
                            $cond: {
                              if: { $eq: ["$$r.user_id", new ObjectId(uid)] },
                              then: { user_id: "$$r.user_id", value: rating },
                              else: "$$r",
                            },
                          },
                        },
                      },
                      else: {
                        $concatArrays: [
                          "$rating",
                          [{ user_id: new ObjectId(uid), value: rating }],
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        ],
        {}
      );

      const dataToUpdate = await updatedData.toArray();
      await db
        .collection("user")
        .updateOne(
          { _id: new ObjectId(nutritionist_id), is_nutritionist: true },
          { $set: { rating: dataToUpdate[0].rating } }
        );
      return true;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }
}
