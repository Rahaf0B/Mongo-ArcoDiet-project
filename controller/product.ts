import { ObjectId } from "mongodb";
import mongoConnection from "../config/mongo.config";
import { IProduct } from "../utlis/interfaces";

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
      const db = await mongoConnection.getDB();
      const data = await db
        .collection("products")
        .findOne({ _id: new ObjectId(productId) });
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
}
