import express, { Router, Request, Response } from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import CAdmin from "../controller/admin";

const router = Router();
router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get("/allergies", async (req, res) => {
  try {
    const instance = CAdmin.getInstance();
    const data = await instance.getAllergiesData();
    res.status(200).send(data);
  } catch (err: any) {
    res.status(500).end();
  }
});

router.get("/diseases", async (req, res) => {
  try {
    const instance = CAdmin.getInstance();
    const data = await instance.getDiseasesData();
    res.status(200).send(data);
  } catch (err: any) {
    res.status(500).end();
  }
});


export default router;