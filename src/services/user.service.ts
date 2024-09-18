import { IUser } from "../interfaces/IUser";
import { User } from "../models/user.model";
// import { users } from "../users_array";
// import { read, write } from "./fs.service";

class UserService {
  public getUsers() {
    return User.find({});
  }
  // public async getUsers() {
  //   await write(users); // Записуємо користувачів у файл
  //   await read(); // зчитуємо одразу в норм форматі utf-8
  //   return users;
  // }

  public async postUser(
    name: string,
    age: number,
    status: boolean,
  ): Promise<IUser> {
    const [newUser] = await Promise.all([User.create({ name, age, status })]);
    return newUser;
  }

  // public async postUser(
  //   name: string,
  //   age: number,
  //   status: boolean,
  // ): Promise<IUser> {
  //   const _id = users[users.length - 1]._id + 1; // Генеруємо новий id для користувача
  //   const newUser: IUser = {
  //     isDeleted: false,
  //     isVerified: false,
  //     role: undefined,
  //     _id,
  //     name,
  //     age,
  //     status,
  //   };
  //   users.push(newUser);
  //   await write(users);
  //   return newUser;
  // }
  //////////////////////////////////////////////////////////
  // public async updateUser(
  //   userIndex: string,
  //   name: string,
  //   age: number,
  //   status: boolean,
  // ): Promise<IUser> {
  //   await User.findByIdAndUpdate(...userIndex, name, age, status);
  //   return;
  // }

  public async updateUser(
    userId: string,
    name: string,
    age: number,
    status: boolean,
  ): Promise<IUser | null> {
    const [updatedUser] = await Promise.all([
      User.findByIdAndUpdate(
        userId,
        { name, age, status },
        { new: true }, // Це дозволяє повернути вже оновленого користувача
      ),
    ]);
    return updatedUser;
  }

  // public async updateUser(
  //   userIndex: number,
  //   name: string,
  //   age: number,
  //   status: boolean,
  // ): Promise<IUser> {
  //   users[userIndex] = { ...users[userIndex], name, age, status }; // через спред перезатираємо користувача, тобто створюємо нове посилання на користувача з оновленими данними
  //   await write(users);
  //   return users[userIndex];
  // }
  //
  // public async deleteUser(userIndex: number): Promise<IUser[]> {
  //   users.splice(userIndex, 1);
  //   await write(users);
  //   return users;
  // }
}

export const userService = new UserService();
