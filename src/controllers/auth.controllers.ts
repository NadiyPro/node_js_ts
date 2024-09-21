import { NextFunction, Request, Response } from "express";

import { userService } from "../services/user.service";

class AuthControllers {
  public async singUp(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getUsers();
      res.status(201).json(users);
    } catch (e) {
      next(e); // передаємо помилки на обробку на верхній рівень, тобто в index.ts
    }
  }

  public async singIn(
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
}

export const authControllers = new AuthControllers();
