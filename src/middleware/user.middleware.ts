import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";

import { ApiError } from "../errors/api.error";
import { User } from "../models/user.model";

class UserMiddleware {
  // Валідація даних користувача

  public validateUser(validator: ObjectSchema) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        req.body = await validator.validateAsync(req.body);
        next();
      } catch (e) {
        next(new ApiError(e.details[0].message, 400));
      }
    };
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
