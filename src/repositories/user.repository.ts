import { IUser } from "../interfaces/IUser";
import { User } from "../models/user.model";

class UserRepository {
  public async getUsers(): Promise<IUser[]> {
    return await User.find({});
  }

  public async create(dto: Partial<IUser>): Promise<IUser> {
    return await User.create(dto);
  }

  public async getById(userId: string): Promise<IUser | null> {
    return await User.findById(userId);
  }

  public async getByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email }).select("+password");
  }

  public async updateById(userId: string, dto: Partial<IUser>): Promise<IUser> {
    return await User.findByIdAndUpdate(userId, dto, { new: true });
    //Partial<T> у TypeScript — це утилітний тип,
    // який перетворює всі властивості типу T на НЕобов'язкові.
    // коли вам не потрібно надавати всі дані об'єкта,
    // а тільки ту частину, яку хочете змінити або оновити.
  }

  public async deleteById(userId: string): Promise<void> {
    await User.deleteOne({ _id: userId });
  }
}

export const userRepository = new UserRepository();
// репозиторій - обгортка для спілкування з БД
// (щоб те що ми вказуємо в запитах пропускалось через модель (в якій є схема) і записувалось у відповідні поля БД)
