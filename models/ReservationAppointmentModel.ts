import { ObjectId, Timestamp } from "mongodb";
import mongoose from "mongoose";
import validator from "validator";
let ReservationAppointmentSchema = new mongoose.Schema({
  nutritionist_id: { type: ObjectId, ref: "User", required: true },
  user_id: { type: ObjectId, ref: "User", required: true },

  appointment_Date_Time: [
    {
      date: { type: Date, require: true },
      time: { type: Date, require: true },
      available: { type: Boolean, default: true },
      require: true,
    },
  ],
});

export default mongoose.model("ReservationAppointment", ReservationAppointmentSchema);
