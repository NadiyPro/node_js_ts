import { NextFunction, Request, Response } from "express";

import { ApiError } from "../errors/api.error";
import { User } from "../models/user.model";

class UserMiddleware {
  // Валідація даних користувача
  public async validateUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { name, age, status, email, password } = req.body;

    const isValidName = typeof name === "string" && name.length <= 20;
    const isValidAge = typeof age === "number" && age > 0 && age <= 100;
    const isValidStatus = typeof status === "boolean";
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
    const emailValid = typeof email === "string" && emailRegex.test(email);
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/; // від 8-20 символів, має бути велика та мала літери, цифри та літери і хоч один спец символ
    const passwordValid =
      typeof password === "string" &&
      password.length <= 20 &&
      passwordRegex.test(password);

    if (
      isValidName &&
      isValidAge &&
      isValidStatus &&
      emailValid &&
      passwordValid
    ) {
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
