import { NextFunction, Request, Response } from "express";

import { IUser } from "../interfaces/IUser";
import { users } from "../users_array";

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
      res
        .status(400)
        .send("Invalid user.Please check the correctness of the input data");
    }
  }

  public getUserId(req: Request, res: Response, next: NextFunction) {
    const userId = Number(req.params.userId);
    const user: IUser = users.find((user) => user.id === userId);

    if (!user) {
      return res.status(404).send("User not found");
    }
    (req as any).user = user;
    next();
  }

  public updateUser(userId: number, res: Response): number | undefined {
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      res.status(404).send("User not found");
      return undefined;
    }
    return userIndex;
  }

  public deleteUser(userId: number, res: Response): number | undefined {
    const userIndex = users.findIndex((user) => user.id === userId);
    if (userIndex === -1) {
      res.status(404).send("User not found");
      return undefined;
    }
    return userIndex;
  }
}

export const userMiddleware = new UserMiddleware();
