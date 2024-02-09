import express from "express";
// import productRoutes from './routes/products';
var cors = require("cors");
// import "./mongos.config";
import "./mongo.config";
import userRoutes from "./routes/user";
import adminRoutes from "./routes/admin";
import productRoutes from "./routes/product";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    "Access-Control-Allow-Origin": "*",
    credentials: true,
    "Access-Control-Allow-Credentials": true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 3000;

app.use('/auth',userRoutes);
app.use('/admin',adminRoutes);
app.use('/product',productRoutes);


app.use(async (req: any, res: any, next: any) => {
  res.status(404).send({ message: "Not Found" });
});

app.listen(port, () => {
  console.log("Express app is listening on the port 3000!");
});
