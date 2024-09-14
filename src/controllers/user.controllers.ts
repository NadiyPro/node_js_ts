import { NextFunction, Request, Response } from "express";

import { IUser } from "../interfaces/IUser";
import { userMiddleware } from "../middleware/user.middleware";
import { read, write } from "../services/fs.service";
import { users } from "../users_array";

class UserController {
  public async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(users); // Відправляємо масив користувачів у відповідь
      await write(users); // Записуємо користувачів у файл
      await read(); // зчитуємо одразу в норм форматі utf-8
      res.status(201);
    } catch (e) {
      next(e);
    }
  }

  public async postUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { name, age, status } = req.body;
      const id = users[users.length - 1].id + 1; // Генеруємо новий id для користувача
      const newUser: IUser = { id, name, age, status };
      users.push(newUser);
      await write(users);
      res.status(201).json(newUser); // Повертаємо новоствореного користувача у відповідь
    } catch (e) {
      next(e);
    }
  }

  public async getUserId(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = (req as any).user; // Доступ до користувача через req
      res.json(user); // Відправляємо знайденого користувача у відповідь
    } catch (e) {
      next(e);
    }
  }
  public async updateUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userIndex = (req as any).userIndex;
      const { name, age, status } = req.body;
      users[userIndex] = { ...users[userIndex], name, age, status }; // через спред перезатираємо користувача, тобто створюємо нове посилання на користувача з оновленими данними
      await write(users);
      res.status(201).json(users[userIndex]); // повертаємо оновленого користувача у відповідь
    } catch (e) {
      next(e);
    }
  }


  public async deleteUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = Number(req.params.userId);
      const userIndex = userMiddleware.deleteUser(userId, res);
      if (!userIndex) {
        return;
      }
      users.splice(userIndex, 1);
      await write(users);
      res.sendStatus(204); // Відправляємо успішну відповідь
    } catch (e) {
      next(e);
    }
  }
}

export const userController = new UserController();
