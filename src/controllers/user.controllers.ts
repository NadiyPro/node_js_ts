import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";

import { MeasureExecutionTime } from "../decorators/measure-time.decorator";
import { ITokenPayload } from "../interfaces/IToken";
import { IUser, IUserListQuery } from "../interfaces/IUser";
import { userPresenter } from "../presenters/user.presenter";
import { userService } from "../services/user.service";

class UserController {
  @MeasureExecutionTime
  public async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as IUserListQuery;
      // параметри на які фронт давав запит в адресній стрічці: limit/page/search(пошуковий об'єкт)/order/orderBy
      const result = await userService.getUsers(query);
      res.json(result);
    } catch (e) {
      next(e); // передаємо помилки на обробку на верхній рівень, тобто в index.ts
    }
  }

  public async getUserId(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.params.userId;
      const result = await userService.getById(userId); // Доступ до користувача через req
      res.json(result); // Відправляємо знайденого користувача у відповідь
    } catch (e) {
      next(e);
    }
  }

  public async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;

      const result = await userService.getMe(jwtPayload);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  public async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;
      const dto = req.body as IUser;

      const result = await userService.updateMe(jwtPayload, dto);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }

  public async deleteMe(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;
      await userService.deleteMe(jwtPayload);
      // ми хочемо видалити тепер НЕ по userId, а конкретно хочемо видалити себе
      // const userId = req.params.userId;
      // await userService.deleteUser(userId);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  }

  public async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;
      // дістаємо з локалс інфо по юзеру (айді юзера та роль)

      const avatar = req.files.avatar as UploadedFile;
      // UploadedFile - це вбудований в бібліотеку "express-fileupload") тип для файлів,
      // який містить в собі name, mimetype, data та інше
      // дістаємо із запиту файл завантажений під ключем avatar

      const user = await userService.uploadAvatar(jwtPayload, avatar);
      const result = userPresenter.toPublicResDto(user);
      // toPublicResDto - цей метод приймає як аргумент об'єкт entity, який є користувачем (user).
      // Він повертає новий об'єкт, лише ті поля,
      // які повинні бути доступними для публічного використання.
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }

  public async deleteAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      const jwtPayload = req.res.locals.jwtPayload as ITokenPayload;

      const user = await userService.deleteAvatar(jwtPayload);
      //  видаляємо аватар юзера
      const result = userPresenter.toPublicResDto(user);
      // toPublicResDto - цей метод приймає як аргумент об'єкт entity, який є користувачем (user).
      // Він повертає новий об'єкт, лише ті поля,
      // які повинні бути доступними для публічного використання.
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }
}

export const userController = new UserController();
