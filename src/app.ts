import express, { Application } from "express";
import cors from "cors";
import router from "./app/routes";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send({
    message: "PH Health Care server is running!",
  });
});

app.use("/api/v1", router);

export default app;
