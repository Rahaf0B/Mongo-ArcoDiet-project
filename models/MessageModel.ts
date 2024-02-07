import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import validator from "validator";
let messageSchema = new mongoose.Schema({
  sender: {
    type: ObjectId,
    ref: "User",
    required: true,
  },

  receiver: {
    type: ObjectId,
    ref: "User",
    required: true,
  },

  message: {
    type: String,
  },
  image_url: {
    type: String,
  },
  message_type: {
    type: String,
    required: true,
    enum: ["text", "image"],
  },
});

export default mongoose.model("Message", messageSchema);
