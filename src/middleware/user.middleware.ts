import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";

import { ApiError } from "../errors/api.error";
import { userRepository } from "../repositories/user.repository";

class UserMiddleware {
  // Валідація даних користувача

  public validateUser(validator: ObjectSchema) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        req.body = await validator.validateAsync(req.body);
        // перевіряємо body з запиту на відповідність схемі прописаної в models
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
    const user = await userRepository.getById(req.params.userId);
    // перевіряємо через пошук (метод findById в userRepository.getById)
    // чи є в нас в БД користувач з вказаним userId

    if (!user) {
      throw new ApiError("User not found", 400);
    }

    (req as any).user = user; // Зберігаємо знайденого користувача
    next();
  }

  public isQueryValid(validator: ObjectSchema) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        req.query = await validator.validateAsync(req.query);
        // перевіряємо query (адресна строка) із запиту на відповідність схемі прописаної в models
        next();
      } catch (e) {
        next(new ApiError(e.details[0].message, 400));
      }
    };
  }
}

export const userMiddleware = new UserMiddleware();
