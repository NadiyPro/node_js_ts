import { NextFunction, Request, Response } from "express";

import { IUser } from "../interfaces/IUser";
import { users } from "../users_array";

class UserMiddleware {
  // Валідація даних користувача
  public validateUser(req: Request, res: Response, next: NextFunction) {
    const {name, age, status} = req.body;

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

  public getUserId(userId: number, res: Response): IUser | undefined {
    const user = users.find((user) => user.id === userId);

    if (!user) {
      res.status(404).send("User not found"); // якщо користувача з відхопленим userId немає, то видаємо у відповідь ось такий результат
      return undefined; // віддаємо в контролер undefined, щоб наша функція в контролері не йшла далі, а залишила res.status(404).send("User not found")
    }
    return user;
  }

  public updateUser(userId: number, res: Response): number | undefined {
    const userIndex = users.findIndex((user) => user.id === userId);
    if (userIndex === -1) {
      res.status(404).send("User not found");
      return undefined;
    }
    return userIndex;
  }
}

export const userMiddleware = new UserMiddleware();
