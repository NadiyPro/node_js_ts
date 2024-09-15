// import { NextFunction, Request, Response } from "express";

// import { IUser } from "../interfaces/IUser";
import { IUser } from "../interfaces/IUser";
import { read, write } from "../services/fs.service";
import { users } from "../users_array";

class UserService {
  public async getUsers() {
    await write(users); // Записуємо користувачів у файл
    await read(); // зчитуємо одразу в норм форматі utf-8
    return users;
  }

  public async postUser(name, age, status): Promise<IUser> {
    const id = users[users.length - 1].id + 1; // Генеруємо новий id для користувача
    const newUser: IUser = { id, name, age, status };
    users.push(newUser);
    await write(users);
    return newUser;
  }
  //
  // public async getUserId(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction,
  // ): Promise<void> {
  //   try {
  //     const user = (req as any).user; // Доступ до користувача через req
  //     res.json(user); // Відправляємо знайденого користувача у відповідь
  //   } catch (e) {
  //     next(e);
  //   }
  // }
  // public async updateUser(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction,
  // ): Promise<void> {
  //   try {
  //     const userIndex = (req as any).userIndex;
  //     const { name, age, status } = req.body;
  //     users[userIndex] = { ...users[userIndex], name, age, status }; // через спред перезатираємо користувача, тобто створюємо нове посилання на користувача з оновленими данними
  //     await write(users);
  //     res.status(201).json(users[userIndex]); // повертаємо оновленого користувача у відповідь
  //   } catch (e) {
  //     next(e);
  //   }
  // }
  //
  // public async deleteUser(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction,
  // ): Promise<void> {
  //   try {
  //     const userIndex = (req as any).userIndex;
  //     users.splice(userIndex, 1);
  //     await write(users);
  //     res.sendStatus(204);
  //   } catch (e) {
  //     next(e);
  //   }
  // }
}

export const userService = new UserService();
