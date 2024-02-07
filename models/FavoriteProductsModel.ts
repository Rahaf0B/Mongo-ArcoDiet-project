import mongoose from "mongoose";
import validator from "validator";
import { ObjectId } from "mongodb";
let FavoriteProductsSchema = new mongoose.Schema({
  user_id: {
    type: ObjectId,
    ref: "User",
    required: true,
  },

  product_id: {
    type: ObjectId,
    ref: "Product",
    required: true,
  },
});

export default mongoose.model("FavoriteProducts", FavoriteProductsSchema);
