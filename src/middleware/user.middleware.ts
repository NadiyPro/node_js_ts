import { NextFunction, Request, Response } from "express";

import { ApiError } from "../errors/api.error";
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
  ///////////////////////////////////////////////////////////////////////////////
  // public async isUserExist(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction,
  // ): Promise<void> {
  //   const userId = req.params.userId;
  //   const userIndex = users.findIndex((user) => user._id === userId);
  //
  //   if (userIndex === -1) {
  //     throw new ApiError("User not found", 400);
  //   }
  //
  //   (req as any).user = users[userIndex]; // Зберігаємо користувача
  //   (req as any).userIndex = userIndex; // Зберігаємо індекс користувача
  //   next(); // в разі успіху крокуємо далі, тобто йдемо в контролер
  // }
}

export const userMiddleware = new UserMiddleware();
