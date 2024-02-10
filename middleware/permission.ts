import { Request, Response, NextFunction } from "express";
import CUser from "../controller/user";

async function nutritionistPermission(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const instance = CUser.getInstance();

  try {
    const userInfo = await instance.getUserInfo(req.uid);
    if (!userInfo.is_nutritionist) {
      return res.status(401).send("This User have not permissions");
    } else {
      next();
    }
  } catch (e: any) {
    return res.status(500).end();
  }
}

export default { nutritionistPermission };
