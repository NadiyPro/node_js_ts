import fs from "node:fs/promises";

import { NextFunction, Request, Response } from "express";
import path from "path";

import { IUser } from "../interfaces/IUser";
import { users } from "../users_array";

class UserController {
  public async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(users); // Відправляємо масив користувачів у відповідь
      await fs.writeFile(
        path.join(process.cwd(), "users.json"),
        JSON.stringify(users, null, 2),
      ); // Записуємо користувачів у файл
      await fs.readFile(path.join(process.cwd(), "users.json"), "utf-8"); // зчитуємо одразу в норм форматі utf-8
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
      await fs.writeFile(
        path.join(process.cwd(), "users.json"),
        JSON.stringify(users, null, 2),
      );
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
      const userId = Number(req.params.userId);
      if (!userId) {
        res.status(404).send("User not found");
        return;
      }
      const user = users.find((user) => user.id === userId);
      res.json(user); // Повертаємо користувача у відповідь
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
      const userId = Number(req.params.userId);
      const userIndex = users.findIndex((user) => user.id === userId);
      if (userIndex === -1) {
        res.status(404).send("User not found");
        return;
      }
      const { name, age, status } = req.body;
      users[userIndex] = { ...users[userIndex], name, age, status }; // через спред перезатираємо користувача, тобто створюємо нове посилання на користувача з оновленими данними
      await fs.writeFile(
        path.join(process.cwd(), "users.json"),
        JSON.stringify(users, null, 2),
      );
      res.status(201).json(users[userIndex]); // Повертаємо оновленого користувача у відповідь
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
      const userIndex = users.findIndex((user) => user.id === userId);
      if (userIndex === -1) {
        res.status(404).send("User not found");
        return;
      }
      users.splice(userIndex, 1);
      await fs.writeFile(
        path.join(process.cwd(), "users.json"),
        JSON.stringify(users, null, 2),
      );
      res.sendStatus(204); // Відправляємо успішну відповідь
    } catch (e) {
      next(e);
    }
  }
}

export const userController = new UserController();
