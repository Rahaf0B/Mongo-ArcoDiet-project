import express, { Router, Request, Response } from "express";
import CUser from "../controller/user";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import validation from "../middleware/validation";

const router = Router();
router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.post(
  "/register",
  validation.CreateAccountForUserValidation, async(req: Request, res: Response) => {
    try {
      const instance = CUser.getInstance();

      const data = await instance.CreateUser(req.body);

      res.status(200).send(data);
    } catch (err: any) {
        if(err?.cause==11000){
            res.status(400).send("Email is already registered");

        }
      res.status(500).end();
    }
  }
);




router.post(
    "/login",
     async(req: Request, res: Response) => {
      try {
        const instance = CUser.getInstance();
  
        const data = await instance.LoginUser(req.body);
  
        res.status(200).send(data);
      } catch (err: any) {
          if(err?.cause=="Validation Error"){
              res.status(400).send(err.message);
  
          }
        res.status(500).end();
      }
    }
  );
export default router;
