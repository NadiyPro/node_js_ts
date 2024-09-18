import { NextFunction, Request, Response } from "express";

import { ApiError } from "../errors/api.error";
import { User } from "../models/user.model";
// import { users } from "../users_array";

class UserMiddleware {
  // Валідація даних користувача
  public async validateUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { name, age, status } = req.body;

    const isValidName = typeof name === "string" && name.length <= 20;
    const isValidAge = typeof age === "number" && age > 0 && age <= 100;
    const isValidStatus = typeof status === "boolean";

    if (isValidName && isValidAge && isValidStatus) {
      next(); // Якщо дані валідні, переходимо далі в контролер
    } else {
      throw new ApiError(
        "Invalid user. Please check the correctness of the input data",
        400,
      );
    }
  }

  public async isUserExist(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const userId = req.params.userId;
    const user = await User.findById(userId); //перевіряємо через пошук (метод findById) чи є в нас в БД користувач з вказаним userId

    if (!user) {
      throw new ApiError("User not found", 400);
    }

    (req as any).user = user; // Зберігаємо знайденого користувача
    next();
  }
}

export const userMiddleware = new UserMiddleware();
