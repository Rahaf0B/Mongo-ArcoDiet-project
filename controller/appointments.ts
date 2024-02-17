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

  async getNutritionistAppointments(nutritionist_id: string, date: string) {
    try {
      const data = await this.getNutritionistAppointmentsByDate(
        nutritionist_id,
        date
      );
      return data;
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
      const data = await db.collection("appointment").updateOne(
        { nutritionist_id: new ObjectId(uid), available: true },
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

  async reserveAppointment(uid: string, appointmentInfo: any): Promise<any> {
    try {
      const db = await mongoConnection.getDB();
      const session = await mongoConnection.createSessionMongo();
      try {
        const starting_time = moment(appointmentInfo.starting_time, "HH:mmA")
          .utc()
          .format("HH:mmA");
        const appointmentReserved = await session.withTransaction(async () => {
          const appointment = db.collection("appointment").aggregate([
            {
              $match: {
                $and: [
                  {
                    nutritionist_id: new ObjectId(
                      appointmentInfo.nutritionist_id as string
                    ),
                  },
                  { nutritionist_id:{$ne:new ObjectId(uid)} },
                ],
              },
            },
            {
              $unwind: "$appointments",
            },
            {
              $match: {
                $and: [
                  { "appointments.date": new Date(appointmentInfo.date) },
                  {
                    "appointments.starting_time": starting_time,
                  },
                  { "appointments.available": true },
                ],
              },
            },
          ]);
          var appointmentFound = (await appointment.toArray()).at(0);
          if (appointmentFound) {
            const userReservation = await db
              .collection("appointment")
              .aggregate([
                {
                  $unwind: "$appointments",
                },
                {
                  $match: {
                    $and: [
                      { "appointments.user_id": new ObjectId(uid) },
                      { "appointments.date": new Date(appointmentInfo.date) },
                      {
                        "appointments.starting_time": starting_time,
                      },
                    ],
                  },
                },
              ])
              .toArray();
            if (userReservation.length > 0) {
              throw new Error("You Have Reservation At This Date And Time", {
                cause: "conflict",
              });
            } else {
              const updateAppointment = await db
                .collection("appointment")
                .updateOne(
                  {
                    nutritionist_id: new ObjectId(
                      appointmentInfo.nutritionist_id as string
                    ),
                  },
                  {
                    $set: {
                      "appointments.$[elem1].available": false,
                      "appointments.$[elem1].user_id": new ObjectId(uid),
                    },
                  },
                  {
                    arrayFilters: [
                      {
                        $and: [
                          {
                            "elem1.date": {
                              $eq: new Date(appointmentInfo.date),
                            },
                          },
                          {
                            "elem1.starting_time": {
                              $eq: starting_time,
                            },
                          },
                          { "elem1.available": { $eq: true } },
                        ],
                      },
                    ],
                  }
                );
              delete appointmentFound.appointments.available;

              return appointmentFound;
            }
          } else {
            throw new Error(
              "There is no appointment with date: " +
                appointmentInfo.date +
                " and time: " +
                appointmentInfo.starting_time +
                " for this nutritionist",
              { cause: "not-found" }
            );
          }
        });
        return appointmentReserved;
      } catch (e: any) {
        throw new Error(e.message, { cause: e?.cause });
      }
    } catch (e: any) {
      throw new Error(e.message, { cause: e?.cause });
    }
  }

  async getNutritionistAppointmentsByDate(
    nutritionist_id: string,
    date: string,
    available?: boolean
  ) {
    try {
      const db = await mongoConnection.getDB();

      const appointment = await db.collection("appointment").aggregate([
        {
          $match: {
            nutritionist_id: new ObjectId(nutritionist_id),
          },
        },
        {
          $unwind: "$appointments",
        },
        {
          $match: {
            $and: [
              available ? { "appointments.available": false } : {},
              { "appointments.date": new Date(date) },
            ],
          },
        },
        {
          $group: {
            _id: "$_id",
            nutritionist_id: { $first: "$nutritionist_id" },
            appointments: {
              $push: {
                date: "$appointments.date",
                starting_time: "$appointments.starting_time",
                ending_time: "$appointments.ending_time",
                available: "$appointments.available",
                user_id: "$appointments.user_id",
              },
            },
          },
        },
        {
          $project: {
            "appointments.user_id": 0,
            nutritionist_id: 0,
            _id: 0,
          },
        },
      ]);
      return appointment.toArray();
    } catch (e: any) {
      throw new Error(e.message, { cause: e?.cause });
    }
  }

  async getNutritionistReservedAppointmentsByDate(
    nutritionist_id: string,
    date: string
  ) {
    try {
      const data = await this.getNutritionistAppointmentsByDate(
        nutritionist_id,
        date,
        false
      );
      return data;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }

  async getNutritionistReservedAppointmentsWithUserInfo(
    nutritionist_id: string
  ) {
    try {
      const db = await mongoConnection.getDB();

      const appointment = await db.collection("appointment").aggregate([
        {
          $match: {
            nutritionist_id: new ObjectId(nutritionist_id),
          },
        },
        {
          $unwind: "$appointments",
        },
        {
          $match: { "appointments.available": false },
        },
        {
          $lookup: {
            from: "user",
            localField: "appointments.user_id",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        { $unwind: "$userInfo" },
        {
          $project: {
            "appointments.date": 1,
            "appointments.starting_time": 1,
            "appointments.ending_time": 1,
            "userInfo._id": 1,
            "userInfo.first_name": 1,
            "userInfo.last_name": 1,
            "userInfo.profile_pic_url": 1,
          },
        },
      ]);

      return appointment.toArray();
    } catch (e: any) {
      throw new Error(e.message, { cause: e?.cause });
    }
  }

  async getUserReservedAppointmentsByDate(uid: string, date: string) {
    try {
      const db = await mongoConnection.getDB();

      const appointment = await db.collection("appointment").aggregate([
        {
          $unwind: "$appointments",
        },
        {
          $match: {
            $and: [
              { "appointments.available": false },
              { "appointments.date": new Date(date) },
              { "appointments.user_id": new ObjectId(uid) },
            ],
          },
        },
        { $addFields: { user_id: "$appointments.user_id" } },
        {
          $project: {
            nutritionist_id: 0,
            "appointments.available": 0,
            "appointments.user_id": 0,
          },
        },
      ]);
      return appointment.toArray();
    } catch (e: any) {
      throw new Error(e.message, { cause: e?.cause });
    }
  }

  async getUserReservedAppointmentsWithNutritionistInfo(uid: string) {
    try {
      const db = await mongoConnection.getDB();

      const appointment = await db.collection("appointment").aggregate([
        {
          $unwind: "$appointments",
        },
        {
          $match: {
            $and: [
              { "appointments.available": false },
              { "appointments.user_id": new ObjectId(uid) },
            ],
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "nutritionist_id",
            foreignField: "_id",
            as: "nutritionistInfo",
          },
        },
        { $unwind: "$nutritionistInfo" },
        {
          $project: {
            "appointments.date": 1,
            "appointments.starting_time": 1,
            "appointments.ending_time": 1,
            "nutritionistInfo._id": 1,
            "nutritionistInfo.first_name": 1,
            "nutritionistInfo.last_name": 1,
            "nutritionistInfo.profile_pic_url": 1,
          },
        },
      ]);

      return appointment.toArray();
    } catch (e: any) {
      throw new Error(e.message, { cause: e?.cause });
    }
  }
}
