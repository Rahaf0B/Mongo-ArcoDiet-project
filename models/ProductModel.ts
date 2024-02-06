import mongoose from "mongoose";
import validator from "validator";
let productSchema = new mongoose.Schema({
  barcode_number: { type: Number, required: true },
  name_english: { type: String, required: true },
  name_arabic: { type: String, required: true },
  weight: { type: Number, required: true },
  sugar_value: { type: Number, required: true },
  sodium_value: { type: Number, required: true },
  calories_value: { type: Number, required: true },
  fats_value: { type: Number, required: true },
  protein_value: { type: Number, required: true },
  cholesterol_value: { type: Number, required: true },
  carbohydrate_value: { type: Number, required: true },
  milk_existing: { type: Boolean, required: true },
  egg_existing: { type: Boolean, required: true },
  fish_existing: { type: Boolean, required: true },
  sea_components_existing: { type: Boolean, required: true },
  nuts_existing: { type: Boolean, required: true },
  peanut_existing: { type: Boolean, required: true },
  pistachio_existing: { type: Boolean, required: true },
  wheat_derivatives_existing: { type: Boolean, required: true },
  soybeans_existing: { type: Boolean, required: true },
});

export default mongoose.model("Product", productSchema);
