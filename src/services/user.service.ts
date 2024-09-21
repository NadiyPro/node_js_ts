import { IUser } from "../interfaces/IUser";
import { User } from "../models/user.model";
import { passwordService } from "./password.service";

class UserService {
  public getUsers() {
    return User.find({}).select("+password");
  }

  // public async postUser(
  //   name: string,
  //   age: number,
  //   email: string,
  //   password: string,
  // ): Promise<IUser> {
  //   const hashedPassword = await passwordService.hashPassword(password); // хешуємо пароль
  //   return await User.create({ name, age, email, password: hashedPassword }); // замінюємо password який нам надійшов на хешований hashedPassword
  // }

  public async updateUser(
    userId: string,
    name: string,
    age: number,
    email: string,
    password: string,
  ): Promise<IUser | null> {
    const hashedPassword = await passwordService.hashPassword(password); // хешуємо пароль
    return await User.findByIdAndUpdate(
      userId,
      { name, age, email, password: hashedPassword },
      { new: true }, // повертаємо вже оновленого користувача (new: true - повернути вже оновлену версію документа)
    ); // перезатираємо юзера під зазначеним userId та замінюємо password який нам надійшов на хешований hashedPassword
  }

  public async deleteUser(userId: string): Promise<void> {
    await User.deleteOne({ _id: userId });
  }
}

export const userService = new UserService();
