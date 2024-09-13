import { NextFunction, Request, Response } from "express";

class UserMiddleware {
  // Валідація даних користувача
  public validateUser(req: Request, res: Response, next: NextFunction) {
    const { name, age, status } = req.body;

    const isValidName = typeof name === "string" && name.length <= 20;
    const isValidAge = typeof age === "number" && age <= 100;
    const isValidStatus = typeof status === "boolean";

    if (isValidName && isValidAge && isValidStatus) {
      next(); // Якщо дані валідні, переходимо далі
    } else {
      res.status(400).send("Invalid user");
    }
  }
}

export const userMiddleware = new UserMiddleware();
