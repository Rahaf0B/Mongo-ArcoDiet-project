import { Request, Response, NextFunction } from "express";
import CUser from "../controller/user";
import { Socket } from "socket.io";

async function checkExistSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies["session_token"] as string;

  if (!token) {
    req.uid = "";
    next();
  } else {
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
  const token = req.cookies["session_token"] as string;

  if (!token) {
    return res.status(401).send("The session token is required");
  } else {

    const instance = CUser.getInstance();

    try {
      const sessionData = await instance.checkSession(token);
      const dateNow = new Date();
      if (!sessionData || dateNow > new Date(sessionData.expiration_date as string)) {
        return res.status(401).send("The session token is invalid");
      } else {
        req.uid = sessionData.user_id.toString();
        next();
      }
    } catch (e: any) {
      return res.status(500).end();
    }
  }
}


async function authenticateUserWS(
  ws: Socket,
 
) {

  let token = ws.handshake.headers.cookie as string;
  if (!token && !token?.match("session_token")
  ) {
     ws.emit("missing","The session token is required");
     ws.disconnect();
  } else {

    token = token.split("session_token=")[1];
    const instance = CUser.getInstance();

    try {
      const sessionData = await instance.checkSession(token);
      const dateNow = new Date();
      if (!sessionData || dateNow > new Date(sessionData.expiration_date as string)) {
         ws.emit("invalid","The session token is invalid");
         ws.disconnect();
      } else {
        ws.data.uid = sessionData.user_id.toString();
      }
    } catch (e: any) {
ws.disconnect();    }
  }
}

export default { authenticateUser, checkExistSession ,authenticateUserWS};
