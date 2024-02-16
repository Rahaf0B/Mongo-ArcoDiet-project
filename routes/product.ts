import express, { Router, Request, Response } from "express";
import CProduct from "../controller/product";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import validation from "../middleware/validation";
import authorization from "../middleware/authorization";
import CUser from "../controller/user";

const router = Router();
router.use(cookieParser());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));


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


router.get("/check-product-suitability/:product_id",  authorization.authenticateUser,
async (req, res) => {
  try {
    const instance = CUser.getInstance();
    const data = await instance.checkProductSuitability(
      req.uid,
      req.params.product_id
    );
    res.status(200).send(data);
  } catch (err) {
    res.status(500).end();
  }
});


router.get(
  "/favorite",
  authorization.authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const instance = CProduct.getInstance();
      const data = await instance.getProductsFromFavorite(req.uid);
      res.status(200).send(data);
    } catch (err: any) {
      res.status(500).end();
    }
  }
);

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


router.post(
  "/favorite/:product_id",
  authorization.authenticateUser,
  async (req, res) => {
    try {
      const instance = CProduct.getInstance();
      const data = await instance.addProductToFavorite(
        req.uid,
        req.params.product_id
      );
      res.status(200).send({ msg: "OK" });
    } catch (err: any) {
      if (err?.cause == "not-found") {
        res.status(404).send(err.message);
      } else res.status(500).end();
    }
  }
);

router.delete(
  "/favorite/:product_id",
  authorization.authenticateUser,
  async (req, res) => {
    try {
      const instance = CProduct.getInstance();
      const data = await instance.removeProductFromFavorite(
        req.uid,
        req.params.product_id
      );
      res.status(200).send({ msg: "OK" });
    } catch (err) {
      res.status(500).end();
    }
  }
);
export default router;
