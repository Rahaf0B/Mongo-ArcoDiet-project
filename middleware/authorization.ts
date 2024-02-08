import { Request, Response, NextFunction } from "express";
import CUser from "../controller/user";

async function checkExistSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let token = req.headers.authorization as string;

  if (!token) {
    req.uid = "";
    next();
  } else {
    token = token?.split(" ")[1];
    try {
      const returnreq = await authenticateUser(req, res, next);
      return returnreq;
    } catch (e: any) {
      return res.status(500);
    }
  }
}

async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let token = req.headers.authorization as string;

  if (!token) {
    return res.status(401).send("The session token is required");
  } else {
    token = token?.split(" ")[1];

    const instance = CUser.getInstance();

    try {
      const sessionData = await instance.checkSession(token);
      const dateNow = new Date();
      if (!sessionData || dateNow > new Date(sessionData.expiration_date)) {
        return res.status(401).send("The session token is invalid");
      } else {
        req.uid = sessionData.user_id as unknown as string;
        next();
      }
    } catch (e: any) {
      return res.status(500).end();
    }
  }
}

export default { authenticateUser, checkExistSession };
