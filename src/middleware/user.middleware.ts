import { NextFunction, Request, Response } from "express";

import { ApiError } from "../errors/api.error";
import { IUser } from "../interfaces/IUser";
import { users } from "../users_array";

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

  public async getUserId(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const userId = Number(req.params.userId);
    const user: IUser = users.find((user) => user.id === userId);

    if (!user) {
      throw new ApiError("User not found", 400);
    }
    (req as any).user = user;
    next(); // в разі успіху крокуємо далі, тобто йдемо в контролер
  }

  public async updateUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const userId = Number(req.params.userId);
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      throw new ApiError("User not found", 400);
    }
    (req as any).userIndex = userIndex;
    next();
  }

  public async deleteUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const userId = Number(req.params.userId);
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      throw new ApiError("User not found", 400);
    }
    (req as any).userIndex = userIndex;
    next();
  }
}

export const userMiddleware = new UserMiddleware();
