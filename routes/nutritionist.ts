import express, { Router, Request, Response } from "express";
import CUser from "../controller/user";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import validation from "../middleware/validation";
import authorization from "../middleware/authorization";
import CNutritionist from "../controller/nutritionist";

const router = Router();
router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get(
  "/nutritionist-favorites",
  authorization.authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const instance = CNutritionist.getInstance();
      const data = await instance.getNutritionistFromFavorite(req.uid);
      res.status(200).send(data);
    } catch (err: any) {
      res.status(500).end();
    }
  }
);

router.get(
  "/high-rating-nutritionists",
  authorization.authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const instance = CNutritionist.getInstance();
      const data = await instance.getHighRatingNutritionists(
        Number(req.query.number_of_items)
      );
      res.status(200).send(data);
    } catch (err: any) {
      res.status(500).end();
    }
  }
);

router.get(
  "/:nutritionist_id",
  authorization.authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const instance = CNutritionist.getInstance();
      const data = await instance.getOneNutritionist(
        req.params.nutritionist_id.toString()
      );
      res.status(200).send(data);
    } catch (err: any) {
      res.status(500).end();
    }
  }
);

router.get(
  "/",
  authorization.authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const instance = CNutritionist.getInstance();
      const data = await instance.getNutritionists(
        Number(req.query.number_of_items),
        req.query.nutritionist_id
          ? req.query.nutritionist_id.toString()
          : undefined
      );
      res.status(200).send(data);
    } catch (err: any) {
      res.status(500).end();
    }
  }
);

router.post(
  "/add-to-favorite/:nutritionist_id",
  authorization.authenticateUser,
  async (req, res) => {
    try {
      const instance = CNutritionist.getInstance();
      const data = await instance.addNutritionistToFavorite(
        req.uid,
        req.params.nutritionist_id
      );
      res.status(200).send({ msg: "OK" });
    } catch (err: any) {
      if (err?.cause == "not-found") {
        res.status(404).send(err.message);
      } else res.status(500).end();
    }
  }
);

router.post(
  "/add-rating/:nutritionist_id",
  authorization.authenticateUser,
  async (req, res) => {
    try {
      const instance = CNutritionist.getInstance();
      const data = await instance.addRatingToNutritionist(
        req.uid,
        req.params.nutritionist_id,
        req.body.rating
      );
      res.status(200).send({ msg: data });
    } catch (err: any) {
      if (err?.cause == "not-found") {
        res.status(404).send(err.message);
      } else res.status(500).end();
    }
  }
);


router.patch(
  "/edit-nutritionist-general-info",
  authorization.authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const instance = CUser.getInstance();
      const data = await instance.editUserGeneralInfo(req.body, req.uid);
      res.status(200).send(data);
    } catch (err: any) {
      res.status(500).end();
    }
  }
);

router.delete(
  "/remove-from-favorite/:nutritionist_id",
  authorization.authenticateUser,
  async (req, res) => {
    try {
      const instance = CNutritionist.getInstance();
      const data = await instance.removeNutritionistFromFavorite(
        req.uid,
        req.params.nutritionist_id
      );
      res.status(200).send({ msg: "OK" });
    } catch (err) {
      res.status(500).end();
    }
  }
);

export default router;
