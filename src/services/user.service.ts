import { IUser } from "../interfaces/IUser";
import { users } from "../users_array";
import { read, write } from "./fs.service";

class UserService {
  public async getUsers() {
    await write(users); // Записуємо користувачів у файл
    await read(); // зчитуємо одразу в норм форматі utf-8
    return users;
  }

  public async postUser(
    name: string,
    age: number,
    status: boolean,
  ): Promise<IUser> {
    const id = users[users.length - 1].id + 1; // Генеруємо новий id для користувача
    const newUser: IUser = { id, name, age, status };
    users.push(newUser);
    await write(users);
    return newUser;
  }

  public async updateUser(
    userIndex: number,
    name: string,
    age: number,
    status: boolean,
  ): Promise<IUser> {
    users[userIndex] = { ...users[userIndex], name, age, status }; // через спред перезатираємо користувача, тобто створюємо нове посилання на користувача з оновленими данними
    await write(users);
    return users[userIndex];
  }

  public async deleteUser(userIndex: number): Promise<IUser[]> {
    users.splice(userIndex, 1);
    await write(users);
    return users;
  }
}

export const userService = new UserService();
