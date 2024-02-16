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

router.get(
  "/check-product-suitability/:id",
  authorization.authenticateUser,
  validation.IdValidation,

  async (req, res) => {
    try {
      const instance = CUser.getInstance();
      const data = await instance.checkProductSuitability(
        req.uid,
        req.params.id
      );
      res.status(200).send(data);
    } catch (err) {
      res.status(500).end();
    }
  }
);

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

router.get("/:id", validation.IdValidation, async (req, res) => {
  try {
    const instance = CProduct.getInstance();
    const data = await instance.getProductById(req.params.id.toString());
    res.status(200).send(data);
  } catch (err) {
    res.status(500).end();
  }
});

router.get(
  "/",
  validation.IdQueryValidation,
  validation.NumberOfItemsValidation,
  async (req, res) => {
    try {
      const instance = CProduct.getInstance();
      const data = await instance.getAllProducts(
        Number(req.query.number_of_items),
        req.query.id ? req.query.id.toString() : undefined
      );
      res.status(200).send(data);
    } catch (err) {
      res.status(500).end();
    }
  }
);

router.post(
  "/favorite/:id",
  authorization.authenticateUser,
  validation.IdValidation,
  async (req, res) => {
    try {
      const instance = CProduct.getInstance();
      const data = await instance.addProductToFavorite(req.uid, req.params.id);
      res.status(200).send({ msg: "OK" });
    } catch (err: any) {
      if (err?.cause == "not-found") {
        res.status(404).send(err.message);
      } else res.status(500).end();
    }
  }
);

router.delete(
  "/favorite/:id",
  validation.IdValidation,
  authorization.authenticateUser,

  async (req, res) => {
    try {
      const instance = CProduct.getInstance();
      const data = await instance.removeProductFromFavorite(
        req.uid,
        req.params.id
      );
      res.status(200).send({ msg: "OK" });
    } catch (err) {
      res.status(500).end();
    }
  }
);
export default router;
