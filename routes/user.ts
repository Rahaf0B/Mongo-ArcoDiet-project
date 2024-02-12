import express, { Router, Request, Response } from "express";
import CUser from "../controller/user";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import validation from "../middleware/validation";
import authorization from "../middleware/authorization";

const router = Router();
router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get(
  "/general-info",
  authorization.authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const instance = CUser.getInstance();
      const data = await instance.getUserGeneralInfo(req.uid);
      res.status(200).send(data);
    } catch (err: any) {
      res.status(500).end();
    }
  }
);

router.get(
  "/health-info",
  authorization.authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const instance = CUser.getInstance();
      const data = await instance.getUserHealthInfo(req.uid);
      res.status(200).send(data);
    } catch (err: any) {
      res.status(500).end();
    }
  }
);

router.get(
  "/email",
  authorization.authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const instance = CUser.getInstance();
      const data = await instance.getUserEmail(req.uid);
      res.status(200).send(data);
    } catch (err: any) {
      res.status(500).end();
    }
  }
);

router.post(
  "/register",
  validation.CreateAccountForUserValidation,
  async (req: Request, res: Response) => {
    try {
      const instance = CUser.getInstance();
      const token = await instance.CreateUser(req.body, 0);
      res.status(200).setHeader("Authorization", token).send({ msg: "ok" });
    } catch (err: any) {
      if (err?.cause == 11000) {
        res.status(400).send("Email is already registered");
      } else res.status(500).end();
    }
  }
);

router.post(
  "/register-nutritionist",
  validation.CreateAccountForUserValidation,
  async (req: Request, res: Response) => {
    try {
      const instance = CUser.getInstance();
      const token = await instance.CreateUser(req.body, 1);
      res.status(200).setHeader("Authorization", token).send({ msg: "ok" });
    } catch (err: any) {
      if (err?.cause == 11000) {
        res.status(400).send("Email is already registered");
      }
      res.status(500).end();
    }
  }
);

router.post(
  "/login",
  validation.UserLoginValidation,
  async (req: Request, res: Response) => {
    try {
      const instance = CUser.getInstance();
      const token = await instance.LoginUser(req.body);
      res.status(200).setHeader("Authorization", token).send({ msg: "ok" });
    } catch (err: any) {
      if (err?.cause == "Validation Error") {
        res.status(400).send(err.message);
      }
      res.status(500).end();
    }
  }
);

router.post(
  "/send-optCode",
  validation.emailValidation,
  async (req: Request, res: Response) => {
    try {
      const instance = CUser.getInstance();
      await instance.sendOPTCode(req.body);
      res.status(200).end();
    } catch (e: any) {
      if (e?.cause == "NOT FOUND") {
        res.status(400).send(e.message);
      } else {
        res.status(500).send();
      }
    }
  }
);

router.post(
  "/validate-optCode",
  validation.OPTCodeValidation,
  async (req: Request, res: Response) => {
    try {
      const instance = CUser.getInstance();
      const dataInfo = await instance.validateOPTCode(req.body);
      res.status(200).send(dataInfo);
    } catch (e: any) {
      if (e?.cause == "invalid") {
        res.status(400).send(e.message);
      } else {
        res.status(500).send();
      }
    }
  }
);

router.patch(
  "/add-health-info",
  authorization.authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const instance = CUser.getInstance();
      const data = await instance.addHealthInfo(req.body, req.uid);
      res.status(200).send(data);
    } catch (err: any) {
      res.status(500).end();
    }
  }
);

router.patch(
  "/edit-email",
  validation.emailValidation,
  authorization.authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const instance = CUser.getInstance();
      const data = await instance.editUserEmail(
        req.uid,
        req.body.email as string
      );
      res.status(200).send(data);
    } catch (err: any) {
      if (err?.cause == 11000) {
        res.status(400).send("Email is already registered");
      } else res.status(500).end();
    }
  }
);

router.patch(
  "/change-password",
  validation.forgetPassValidation,
  authorization.authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const instance = CUser.getInstance();
      const data = await instance.editUserPassword(req.uid, req.body);
      res.status(200).send(data);
    } catch (err: any) {
      if (err?.cause == "Validation Error") {
        res.status(400).send(err.message);
      } else res.status(500).end();
    }
  }
);

router.patch(
  "/forget-password",
  validation.forgetPassValidation,
  async (req: Request, res: Response) => {
    try {
      const instance = CUser.getInstance();
      await instance.forgetPassword(req.body);
      res.status(200).end();
    } catch (e: any) {
      if (e?.cause == "Validation Error") {
        res.status(400).send(e.message);
      } else {
        res.status(500).send();
      }
    }
  }
);

export default router;
