import express, { NextFunction, Request, Response } from "express";
import * as mongoose from "mongoose";

import { config } from "./config/configs";
import { ApiError } from "./errors/api.error";
import { authRouter } from "./router/auth.router";
import { userRouter } from "./router/router";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);
app.use("/users1", userRouter);

//обробка помилок які ми витягнули сюди (на верхній рівень) через next()
app.use("*", (error: any, req: Request, res: Response, next: NextFunction) => {
  // Перевіряємо, чи це інстанція ApiError
  if (error instanceof ApiError) {
    return res.status(error.status).json({ message: error.message });
  }
  return res.status(500).json({ message: "Internal Server Error" });
});

// на якому порті відкриваємо (номер хосту)
app.listen(config.APP_PORT, async () => {
  await mongoose.connect(config.MONGO_URI);
  console.log(
    `Server is running on https://${config.APP_HOST}:${config.APP_PORT}`,
  );
});
