import { ObjectId } from "mongodb";
import mongoConnection from "../config/mongo.config";
import { IProduct } from "../utlis/interfaces";
import { appCache, getCacheValue } from "../utlis/appCache";

export default class CProduct {
  private static instance: CProduct;

  private constructor() {}

  public static getInstance(): CProduct {
    if (CProduct.instance) {
      return CProduct.instance;
    }

    CProduct.instance = new CProduct();
    return CProduct.instance;
  }

  async getAllProducts(
    ItemNumber: number,
    productId?: string | undefined
  ): Promise<IProduct[]> {
    try {
      const db = await mongoConnection.getDB();
      const data = await db
        .collection("products")
        .find(productId ? { _id: { $gt: new ObjectId(productId) } } : {}, {
          limit: ItemNumber,
          sort: { _id: 1 },
        });
      return data.toArray() as unknown as IProduct[];
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async getProductById(productId: string): Promise<IProduct> {
    try {
      let productCache = getCacheValue("pro") as any;
      if (productCache) {
        if (productCache[productId]) {
          return productCache[productId];
        }
      }
      const db = await mongoConnection.getDB();
      const data = await db
        .collection("products")
        .findOne({ _id: new ObjectId(productId) });
        productCache=productCache ? productCache : {};
      productCache[data["_id"].toString()] = data;
      appCache.set("pro", productCache);
      return data as unknown as IProduct;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async getProductByBarCode(barcode_number: number): Promise<IProduct> {
    try {
      const db = await mongoConnection.getDB();
      const data = await db
        .collection("products")
        .findOne({ barcode_number: barcode_number });
      return data as unknown as IProduct;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async addProductToFavorite(uid: string, product_id: string) {
    try {
      const db = await mongoConnection.getDB();
      const productInfo = await this.getProductById(product_id);
      if (productInfo) {
        const data = await db.collection("product_favorite").updateOne(
          { user_id: new ObjectId(uid) },
          {
            $addToSet: {
              products: {
                product_id: new ObjectId(product_id),
              },
            },
          },
          { upsert: true }
        );
        return true;
      } else {
        throw new Error("There is no Product with this ID", {
          cause: "not-found",
        });
      }
    } catch (error: any) {
      throw new Error(error.message, { cause: error?.cause });
    }
  }

  async removeProductFromFavorite(uid: string, product_id: string) {
    try {
      const db = await mongoConnection.getDB();
      const data = await db.collection("product_favorite").updateOne(
        { user_id: new ObjectId(uid) },
        {
          $pull: {
            products: {
              product_id: new ObjectId(product_id),
            },
          },
        }
      );
    } catch (error: any) {
      throw new Error(error.message, { cause: error?.cause });
    }
  }

  async getProductsFromFavorite(uid: string): Promise<any> {
    try {
      const db = await mongoConnection.getDB();
      const data = await db.collection("product_favorite").aggregate([
        { $match: { user_id: new ObjectId(uid) } },
        {
          $unwind: "$products",
        },
        {
          $lookup: {
            from: "products",
            localField: "products.product_id",
            foreignField: "_id",
            as: "productsInfo",
          },
        },
        {
          $unwind: "$productsInfo",
        },
        {
          $addFields: {
            product_id: "$productsInfo._id",
            name_arabic: "$productsInfo.name_arabic",
            name_english: "$productsInfo.name_english",
          },
        },
        {
          $project: {
            _id: 0,
            user_id: 0,
            products: 0,
            productsInfo: 0,
          },
        },
      ]);

      return data ? data?.toArray() : [];
    } catch (error: any) {
      throw new Error(error.message, { cause: error?.cause });
    }
  }
}
