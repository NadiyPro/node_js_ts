import { NextFunction, Request, Response } from "express";

import { userService } from "../services/user.service";

class UserController {
  public async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getUsers();
      res.status(201).json(users);
    } catch (e) {
      next(e); // передаємо помилки на обробку на верхній рівень, тобто в index.ts
    }
  }

  public async postUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { name, age, email, password } = req.body;
      const newUser = await userService.postUser(name, age, email, password);
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
      const userId = req.params.userId;
      const { name, age, email, password } = req.body;
      const newUser = await userService.updateUser(
        userId,
        name,
        age,
        email,
        password,
      );
      res.status(201).json(newUser); // повертаємо оновленого користувача у відповідь
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
      const userId = req.params.userId;
      await userService.deleteUser(userId);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }
}

export const userController = new UserController();
