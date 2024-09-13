import fs from "node:fs/promises";

import express, { NextFunction, Request, Response } from "express";
import path from "path";

import { IUser } from "./interfaces/IUser";
import { users } from "./users_array";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Валідація полів
const validateUser = (name: string, age: number, status: boolean): boolean => {
  const isValidName = typeof name === "string" && name.length <= 20;
  const isValidAge = typeof age === "number" && age <= 100;
  const isValidStatus = typeof status === "boolean";
  return isValidName && isValidAge && isValidStatus;
};

// // Отримуємо список users
app.get(
  "/users",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json(users); // Повертаємо користувачів у відповідь
      await fs.writeFile(
        path.join(process.cwd(), "users.json"),
        JSON.stringify(users, null, 2),
      );
      await fs.readFile(path.join(process.cwd(), "users.json"), "utf-8");
    } catch (e) {
      next(e);
      // res.status(500).send(e.message);
    }
  },
);

// Відображення конкретного юзера
app.get(
  "/users/:userId",
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const userId = Number(req.params.userId);
      if (!userId) {
        res.status(404).send("User not found");
        return;
      }
      const user = users.find((user) => user.id === userId);
      res.json(user); // Повертаємо користувача у відповідь
    } catch (e) {
      res.status(500).send(e.message);
    }
  },
);

// Створення одного user
app.post(
  "/users",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, age, status } = req.body;
      if (!validateUser(name, age, status)) {
        res.status(400).send("Invalid user data");
        return;
      }
      const id = users[users.length - 1].id + 1;
      const newUser: IUser = { id, name, age, status };
      users.push(newUser);
      await fs.writeFile(
        path.join(process.cwd(), "users.json"),
        JSON.stringify(users, null, 2),
      );
      res.status(201).json(newUser); // Повертаємо новоствореного користувача у відповідь
    } catch (e) {
      res.status(500).send(e.message);
    }
  },
);

// Оновлення конкретного юзера
app.put(
  "/users/:userId",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = Number(req.params.userId);
      const userIndex = users.findIndex((user) => user.id === userId);
      if (userIndex === -1) {
        res.status(404).send("User not found");
        return;
      }
      const { name, age, status } = req.body;
      if (!validateUser(name, age, status)) {
        res.status(400).send("Invalid user data");
        return;
      }
      users[userIndex] = { ...users[userIndex], name, age, status };
      await fs.writeFile(
        path.join(process.cwd(), "users.json"),
        JSON.stringify(users, null, 2),
      );
      res.status(201).json(users[userIndex]); // Повертаємо оновленого користувача у відповідь
    } catch (e) {
      res.status(500).send(e.message);
    }
  },
);

// Видалення конкретного юзера
app.delete(
  "/users/:userId",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      res.sendStatus(204); // Відправляємо успішну відповідь без тіла
    } catch (e) {
      res.status(500).send(e.message);
    }
  },
);

// на якому порті відкриваємо (номер хосту)
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running ${PORT}`);
});
