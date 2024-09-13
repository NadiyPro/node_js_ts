import fs from "node:fs/promises";

import { NextFunction, Request, Response } from "express";
import path from "path";

import { IUser } from "../interfaces/IUser";
// import { userMiddleware } from "../middleware/user.middleware";
import { users } from "../users_array";

class UserController {
  public async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(users); // Повертаємо користувачів у відповідь
      await fs.writeFile(
        path.join(process.cwd(), "users.json"),
        JSON.stringify(users, null, 2),
      );
      await fs.readFile(path.join(process.cwd(), "users.json"), "utf-8");
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
      const id = users[users.length - 1].id + 1;
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
}

// // Відображення конкретного юзера
// app.get(
//   "/users/:userId",
//   (req: Request, res: Response, next: NextFunction): void => {
//     try {
//       const userId = Number(req.params.userId);
//       if (!userId) {
//         res.status(404).send("User not found");
//         return;
//       }
//       const user = users.find((user) => user.id === userId);
//       res.json(user); // Повертаємо користувача у відповідь
//     } catch (e) {
//       next(e);
//     }
//   },
// );
//
////////////////////////////////////////
// Створення одного user
// app.post(
//   "/users",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const { name, age, status } = req.body;
//       if (!validateUser(name, age, status)) {
//         res.status(400).send("Invalid user data");
//         return;
//       }
//       const id = users[users.length - 1].id + 1;
//       const newUser: IUser = { id, name, age, status };
//       users.push(newUser);
//       await fs.writeFile(
//         path.join(process.cwd(), "users.json"),
//         JSON.stringify(users, null, 2),
//       );
//       res.status(201).json(newUser); // Повертаємо новоствореного користувача у відповідь
//     } catch (e) {
//       next(e);
//     }
//   },
// );
//
// // Оновлення конкретного юзера
// app.put(
//   "/users/:userId",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const userId = Number(req.params.userId);
//       const userIndex = users.findIndex((user) => user.id === userId);
//       if (userIndex === -1) {
//         res.status(404).send("User not found");
//         return;
//       }
//       const { name, age, status } = req.body;
//       if (!validateUser(name, age, status)) {
//         res.status(400).send("Invalid user data");
//         return;
//       }
//       users[userIndex] = { ...users[userIndex], name, age, status };
//       await fs.writeFile(
//         path.join(process.cwd(), "users.json"),
//         JSON.stringify(users, null, 2),
//       );
//       res.status(201).json(users[userIndex]); // Повертаємо оновленого користувача у відповідь
//     } catch (e) {
//       next(e);
//     }
//   },
// );
//
// // Видалення конкретного юзера
// app.delete(
//   "/users/:userId",
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const userId = Number(req.params.userId);
//       const userIndex = users.findIndex((user) => user.id === userId);
//       if (userIndex === -1) {
//         res.status(404).send("User not found");
//         return;
//       }
//       users.splice(userIndex, 1);
//       await fs.writeFile(
//         path.join(process.cwd(), "users.json"),
//         JSON.stringify(users, null, 2),
//       );
//       res.sendStatus(204); // Відправляємо успішну відповідь без тіла
//     } catch (e) {
//       next(e);
//     }
//   },
// );

export const userController = new UserController();
