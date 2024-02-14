import express, { Request, Response, NextFunction } from "express";
var cors = require("cors");
import "./config/mongo.config";
import userRoutes from "./routes/user";
import adminRoutes from "./routes/admin";
import productRoutes from "./routes/product";
import appointmentRoutes from "./routes/appointment";
import nutritionistRoutes from "./routes/nutritionist";
import messageRoutes from "./routes/message";
import handleWsRoutes from "./consumer";
import { Server } from "socket.io";
import authorization from "./middleware/authorization";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const server = require("http").createServer(app);
export const io = new Server(server, {});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    "Access-Control-Allow-Origin": "*",
    credentials: true,
    "Access-Control-Allow-Credentials": true,
  })
);

io.on("connection", handleWsRoutes.handleConnection);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/auth", userRoutes);
app.use("/admin", adminRoutes);
app.use("/product", productRoutes);
app.use("/appointment", appointmentRoutes);
app.use("/nutritionist", nutritionistRoutes);
app.use("/message", messageRoutes);


app.use(async (req: any, res: any, next: any) => {
  res.status(404).send({ message: "Not Found" });
});

server.listen(process.env.PORT, () => {
  console.log("Express app is listening on the port 3000!");
});
