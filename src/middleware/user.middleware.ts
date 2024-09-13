import { NextFunction, Request, Response } from "express";

class UserMiddleware {
  // Валідація даних користувача
  public validateUser(req: Request, res: Response, next: NextFunction) {
    const { name, age, status } = req.body;

    const isValidName = typeof name === "string" && name.length <= 20;
    const isValidAge = typeof age === "number" && age > 0 && age <= 100;
    const isValidStatus = typeof status === "boolean";

    if (isValidName && isValidAge && isValidStatus) {
      next(); // Якщо дані валідні, переходимо далі в контролер
    } else {
      res.status(400).send("Invalid user.Please check the correctness of the input data");
    }
  }
}

export const userMiddleware = new UserMiddleware();
