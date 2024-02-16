import express, { Router, Request, Response } from "express";
import CAppointment from "../controller/appointments";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import validation from "../middleware/validation";
import authorization from "../middleware/authorization";
import permission from "../middleware/permission";

const router = Router();
router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.post(
  "/",
  authorization.authenticateUser,
  permission.nutritionistPermission,
  validation.addOrDeleteAppointmentValidation,
  async (req, res) => {
    try {
      const instance = CAppointment.getInstance();
      const data = await instance.addAppointment(req.uid, req.body);
      res.send(data);
    } catch (err) {
      res.status(500).end();
    }
  }
);

router.get(
  "/",
  authorization.authenticateUser,
  permission.nutritionistPermission,
  validation.dateValidation,
  async (req, res) => {
    try {
      const instance = CAppointment.getInstance();
      const data = await instance.getNutritionistAppointments(req.uid,req.query.date as string);
      res.send(data);
    } catch (err) {
      res.status(500).end();
    }
  }
);

router.get(
  "/nutritionist-appointment/:id",
  authorization.authenticateUser,
  validation.dateValidation,
  validation.IdValidation,
  async (req, res) => {
    try {
      const instance = CAppointment.getInstance();
      const data = await instance.getNutritionistAppointments(
        req.params.id as string,
        req.query.date as string
      );
      res.send(data);
    } catch (err) {
      res.status(500).end();
    }
  }
);

router.get(
  "/nutritionist-appointment-date",
  authorization.authenticateUser,
  permission.nutritionistPermission,
  validation.dateValidation,
  async (req, res) => {
    try {
      const instance = CAppointment.getInstance();
      const data = await instance.getNutritionistReservedAppointmentsByDate(
        req.uid,
        req.query.date.toString()
      );
      res.send(data);
    } catch (err) {
      res.status(500).end();
    }
  }
);

router.get(
  "/nutritionist-appointment-user-info",
  authorization.authenticateUser,
  permission.nutritionistPermission,
  async (req, res) => {
    try {
      const instance = CAppointment.getInstance();
      const data =
        await instance.getNutritionistReservedAppointmentsWithUserInfo(req.uid);
      res.send(data);
    } catch (err) {
      res.status(500).end();
    }
  }
);

router.get(
  "/user-appointment-date",
  authorization.authenticateUser,
  validation.dateValidation,
  async (req, res) => {
    try {
      const instance = CAppointment.getInstance();
      const data = await instance.getUserReservedAppointmentsByDate(
        req.uid,
        req.query.date.toString()
      );
      res.send(data);
    } catch (err) {
      res.status(500).end();
    }
  }
);

router.get(
  "/user-appointment-nutritionist-info",
  authorization.authenticateUser,
  async (req, res) => {
    try {
      const instance = CAppointment.getInstance();
      const data =
        await instance.getUserReservedAppointmentsWithNutritionistInfo(req.uid);
      res.send(data);
    } catch (err) {
      res.status(500).end();
    }
  }
);

router.patch(
  "/delete-appointment",
  authorization.authenticateUser,
  permission.nutritionistPermission,
  validation.addOrDeleteAppointmentValidation,
  async (req, res) => {
    try {
      const instance = CAppointment.getInstance();
      const data = await instance.deleteAppointment(req.uid, req.body);
      res.status(200).send(data);
    } catch (err) {
      res.status(500).end();
    }
  }
);

router.post(
  "/reserve-appointment",
  authorization.authenticateUser,
  validation.reserveAppointmentValidation,
  async (req, res) => {
    try {
      const instance = CAppointment.getInstance();
      const data = await instance.reserveAppointment(req.uid, req.body);
      res.status(200).send(data);
    } catch (err: any) {
      if (err?.cause == "not-found" || err?.cause == "conflict") {
        res.status(400).send(err.message);
      }
      res.status(500).end();
    }
  }
);

router.delete(
  "/delete-appointment",
  authorization.authenticateUser,
  permission.nutritionistPermission,
  async (req, res) => {
    try {
      const instance = CAppointment.getInstance();
      const data = await instance.deleteAppointment(req.uid, req.body);
      res.status(200).send(data);
    } catch (err) {
      res.status(500).end();
    }
  }
);

export default router;
