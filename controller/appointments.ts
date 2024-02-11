import { appCache } from "../config/appCache";
import mongoConnection from "../config/mongo.config";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "bson";
import { Db, Double } from "mongodb";
import {
  IAppointment,
  IAppointmentInfo,
  ISession,
  IUser,
} from "../utlis/interfaces";
import emailSender from "../utlis/emailSender";
import moment from "moment";

export default class CAppointment {
  private static instance: CAppointment;

  private constructor() {}

  public static getInstance(): CAppointment {
    if (CAppointment.instance) {
      return CAppointment.instance;
    }

    CAppointment.instance = new CAppointment();
    return CAppointment.instance;
  }

  async addAppointment(uid: string, appointmentInfo: IAppointmentInfo) {
    try {
      const startTime = appointmentInfo.starting_time;
      appointmentInfo.starting_time = moment(
        appointmentInfo.starting_time,
        "HH:mmA"
      )
        .utc()
        .format("HH:mmA");
      appointmentInfo.ending_time = moment(startTime, "HH:mmA")
        .add({
          hours: 1,
        })
        .utc()
        .format("HH:mmA");

      appointmentInfo.date = new Date(appointmentInfo.date);
      appointmentInfo.available = true;
      const db = await mongoConnection.getDB();
      const data = await db
        .collection("appointment")
        .updateOne(
          { nutritionist_id: new ObjectId(uid) },
          { $addToSet: { appointments: appointmentInfo } },
          { upsert: true }
        );

      return true;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async getNutritionistAppointments(uid: string) {
    try {
      const db = await mongoConnection.getDB();
      const data = await db
        .collection("appointment")
        .find({ nutritionist_id: new ObjectId(uid) });
      return data.toArray();
    } catch (e: any) {
      throw new Error(e);
    }
  }

  async deleteAppointment(uid: string, appointmentInfo: IAppointmentInfo) {
    try {
      appointmentInfo.starting_time = moment(
        appointmentInfo.starting_time,
        "HH:mmA"
      )
        .utc()
        .format("HH:mmA");
      const db = await mongoConnection.getDB();
      const data = await db
        .collection("appointment")
        .updateOne(
          { nutritionist_id: new ObjectId(uid) },
          {
            $pull: {
              appointments: {
                $and: [
                  { date: new Date(appointmentInfo.date) },
                  { starting_time: appointmentInfo.starting_time },
                ],
              },
            },
          }
        );
      return true;
    } catch (e: any) {
      throw new Error(e);
    }
  }
}
