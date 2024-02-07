import mongoose from "mongoose";
import validator from "validator";
import { ObjectId } from "mongodb";
let FavoriteNutritionistsSchema = new mongoose.Schema({
  user_id: {
    type: ObjectId,
    ref: "User",
    required: true,
  },

  nutritionist_id: [{ type: ObjectId, ref: "User", required: true }],
});

export default mongoose.model(
  "FavoriteNutritionists",
  FavoriteNutritionistsSchema
);
