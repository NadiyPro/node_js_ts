import { IUser } from "../interfaces/IUser";
import { User } from "../models/user.model";

class UserService {
  public getUsers() {
    return User.find({});
  }

  public async postUser(
    name: string,
    age: number,
    email: string,
    password: string,
  ): Promise<IUser> {
    const [newUser] = await Promise.all([
      User.create({ name, age, email, password }),
    ]);
    return newUser;
  }

  public async updateUser(
    userId: string,
    name: string,
    age: number,
    email: string,
    password: string,
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { name, age, email, password },
      { new: true }, // повертаємо вже оновленого користувача (new: true - повернути вже оновлену версію документа)
    ); // перезатираємо юзера під зазначеним userId
  }

  public async deleteUser(userId: string): Promise<void> {
    await User.deleteOne({ _id: userId });
  }
}

export const userService = new UserService();
