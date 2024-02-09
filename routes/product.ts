import express, { Router, Request, Response } from "express";
import CProduct from "../controller/product";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import validation from "../middleware/validation";
import authorization from "../middleware/authorization";

const router = Router();
router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get("/:product_id", async (req, res) => {
  try {
    const instance = CProduct.getInstance();
    const data = await instance.getProductById(
      req.params.product_id.toString()
    );
    res.status(200).send(data);
  } catch (err) {
    res.status(500).end();
  }
});

router.get("/search_barcode/:barcode_number", async (req, res) => {
  try {
    const instance = CProduct.getInstance();
    const data = await instance.getProductByBarCode(
      Number(req.params.barcode_number)
    );
    res.status(200).send(data);
  } catch (err) {
    res.status(500).end();
  }
});

router.get("/", async (req, res) => {
  try {
    const instance = CProduct.getInstance();
    const data = await instance.getAllProducts(
      Number(req.query.number_of_items),
      req.query.product_id ? req.query.product_id.toString() : undefined
    );
    res.status(200).send(data);
  } catch (err) {
    res.status(500).end();
  }
});

export default router;
