import express, { Request, Response } from "express";

import { ApiError } from "./errors/api.error";
import { userRouter } from "./router/router";
import {config} from "./config/configs";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRouter);

//обробка помилок які ми витягнули сюди (на верхній рівень) через next()
app.use("*", (error: ApiError, req: Request, res: Response) => {
  res.status(error.status || 500).send(error.message);
});
// на якому порті відкриваємо (номер хосту)
app.listen(config.APP_PORT, () => {
  console.log(`Server is running on https://${config.APP_HOST}:${config.APP_PORT}`);
});
