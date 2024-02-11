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
  async (req, res) => {
    try {
      const instance = CAppointment.getInstance();
      const data = await instance.getNutritionistAppointments(req.uid);
      res.send(data);
    } catch (err) {
      res.status(500).end();
    }
  }
);

router.get(
  "/nutritionist-appointment/:nutritionist_id",
  authorization.authenticateUser,
  async (req, res) => {
    try {
      const instance = CAppointment.getInstance();
      const data = await instance.getNutritionistAppointments(
        req.params.nutritionist_id.toString()
      );
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
  async (req, res) => {
    try {
      const instance = CAppointment.getInstance();
      const data = await instance.deleteAppointment(req.uid, req.body);
      res.send(data);
    } catch (err) {
      res.status(500).end();
    }
  }
);




router.post(
    "/delete-appointment",
    authorization.authenticateUser,
    permission.nutritionistPermission,
    async (req, res) => {
      try {
        const instance = CAppointment.getInstance();
        const data = await instance.deleteAppointment(req.uid, req.body);
        res.send(data);
      } catch (err) {
        res.status(500).end();
      }
    }
  );
export default router;
