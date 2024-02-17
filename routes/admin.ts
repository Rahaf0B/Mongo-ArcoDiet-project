import express, { Router, Request, Response } from "express";
import CUser from "../controller/user";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import validation from "../middleware/validation";
import CAdmin from "../controller/admin";

const router = Router();
router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.post(
  "/register-admin",
  validation.CreateAccountForUserValidation,
  async (req: Request, res: Response) => {
    try {
      const instance = CAdmin.getInstance();
      const token = await instance.CreateAdminUser(req.body);
      res.status(200).cookie("session_token", token).send({ msg: "ok" });
    } catch (err: any) {
      if (err?.cause == 11000) {
        res.status(400).send("Email is already registered");
      }
      res.status(500).end();
    }
  }
);

router.post(
  "/add-allergies",
  validation.addAllergiesDiseasesValidation,
  async (req: Request, res: Response) => {
    try {
      const instance = CAdmin.getInstance();
      const data = await instance.addAllergiesData(req.body);
      res.status(200).send(data);
    } catch (err: any) {
      if (err.cause == 11000) {
        res.status(500).send("The allergy name is exist");
      } else res.status(500).end();
    }
  }
);

router.post(
  "/add-diseases",
  validation.addAllergiesDiseasesValidation,
  async (req: Request, res: Response) => {
    try {
      const instance = CAdmin.getInstance();
      const data = await instance.addDiseasesData(req.body);
      res.status(200).send(data);
    } catch (err: any) {
      if (err.cause == 11000) {
        res.status(500).send("The disease name is exist");
      } else res.status(500).end();
    }
  }
);

router.post(
  "/add-product",
  validation.addProductValidation,
  async (req: Request, res: Response) => {
    try {
      const instance = CAdmin.getInstance();
      const data = await instance.addProductData(req.body);
      res.status(200).send(data);
    } catch (err: any) {
      if (err.cause == 11000) {
        res.status(500).send("The product barcode_number is exist");
      } else res.status(500).end();
    }
  }
);

export default router;
