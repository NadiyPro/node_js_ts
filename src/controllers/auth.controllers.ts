import { NextFunction, Request, Response } from "express";

import { IUser } from "../interfaces/IUser";
import { authService } from "../services/auth.service";

class AuthControllers {
  public async singUp(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as IUser;
      const users = await authService.singUp(dto);
      res.status(201).json(users);
    } catch (e) {
      next(e);
    }
  }

  public async singIn(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto = req.body as IUser;
      const newUser = await authService.singIn(dto);
      res.status(201).json(newUser);
    } catch (e) {
      next(e);
    }
  }
}

export const authControllers = new AuthControllers();
