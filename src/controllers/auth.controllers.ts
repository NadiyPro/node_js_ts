import { NextFunction, Request, Response } from "express";

import { IUser } from "../interfaces/IUser";
import { authService } from "../services/auth.service";

class AuthControllers {
  public async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = req.body as IUser;
      const users = await authService.signUp(dto);
      res.status(201).json(users);
    } catch (e) {
      next(e);
    }
  }

  public async signIn(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto = req.body as IUser;
      const newUser = await authService.signIn(dto);
      res.status(201).json(newUser);
    } catch (e) {
      next(e);
    }
  }
}

export const authControllers = new AuthControllers();
