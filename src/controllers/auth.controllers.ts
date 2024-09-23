import { NextFunction, Request, Response } from "express";

import { ITokenPayload } from "../interfaces/IToken";
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

  public async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.res.locals.refreshToken as string;
      // замість req.body, оскільки тут ми не вносимо ніякої інфо в body,
      // і наша ціль дістати лише refresh токен, видалити старий refresh і згенерувати нову пару токенів
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;

      const result = await authService.refresh(token, jwtPayload);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }
}

export const authControllers = new AuthControllers();
