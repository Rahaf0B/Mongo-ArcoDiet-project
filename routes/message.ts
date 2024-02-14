
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
    "/:nutritionist_id",
    authorization.authenticateUser,
    async (req: Request, res: Response) => {
      try {
        const instance = CUser.getInstance();
        const data = await instance.getMessages(req.uid,req.params.nutritionist_id);
        res.status(200).send(data);
      } catch (err: any) {
        res.status(500).end();
      }
    }
  );
  


  export default router;