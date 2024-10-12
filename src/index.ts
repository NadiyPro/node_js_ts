import express, { NextFunction, Request, Response } from "express";
import fileupload from "express-fileupload";
import * as mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";

import swaggerDocument from "../docs/swagger.json";
import { config } from "./config/configs";
import { cronRunner } from "./crons";
import { ApiError } from "./errors/api.error";
import { authRouter } from "./router/auth.router";
import { userRouter } from "./router/router";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileupload());
// перевіряє на наявність файлів, якщо файли є,
// то в нашому req зявляється спеціальне поле files
// і потім по ключу ми зможемо втягувати ці файли
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// підключаємо swagger
app.use("/auth", authRouter);
app.use("/users1", userRouter);

//обробка помилок, які ми витягнули сюди (на верхній рівень) через next()
app.use("*", (error: any, req: Request, res: Response, next: NextFunction) => {
  // Перевіряємо, чи це інстанція ApiError
  if (error instanceof ApiError) {
    return res.status(error.status).json({ message: error.message });
  }
  return res.status(500).json({ message: "Internal Server Error" });
});

// на якому порті відкриваємо (номер хосту)
app.listen(config.APP_PORT, async () => {
  cronRunner();
  // запускаємо файл index.ts з cron
  // cron - це тула, яка дає нам змогу запустити якийсь функціонал / метод,
  // через якийсь певний період часу
  await mongoose.connect(config.MONGO_URI);
  console.log(
    `Server is running on http://${config.APP_HOST}:${config.APP_PORT}`,
  );
});
