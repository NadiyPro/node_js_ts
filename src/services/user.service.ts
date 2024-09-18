import { IUser } from "../interfaces/IUser";
import { User } from "../models/user.model";
import mongoose from "mongoose";

class UserService {
  public getUsers() {
    return User.find({});
  }

  public async postUser(
    name: string,
    age: number,
    status: boolean,
  ): Promise<IUser> {
    const [newUser] = await Promise.all([User.create({ name, age, status })]);
    return newUser;
  }

  public async updateUser(
    userId: string,
    name: string,
    age: number,
    status: boolean,
  ): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`Invalid ObjectId: ${userId}`);
      return null;
    }
    return await User.findByIdAndUpdate(
      userId,
      { name, age, status },
      { new: true }, // повертаємо вже оновленого користувача (new: true - повернути вже оновлену версію документа)
    ); // перезатираємо юзера під зазначеним userId
  }

  public async deleteUser(userId: string): Promise<void> {
    await User.deleteOne({ _id: userId });
  }
}

export const userService = new UserService();
