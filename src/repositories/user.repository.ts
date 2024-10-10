import { FilterQuery } from "mongoose";

import { IUser, IUserListQuery } from "../interfaces/IUser";
import { Token } from "../models/token.model";
import { User } from "../models/user.model";

class UserRepository {
  public async getUsers(query: IUserListQuery): Promise<[IUser[], number]> {
    const filterObj: FilterQuery<IUser> = { isVerified: true };
    if (query.search) {
      filterObj.name = { $regex: query.search, $options: "i" };
      // filterObj.$or = [
      //   { name: { $regex: query.search, $options: "i" } },
      //   { email: { $regex: query.search, $options: "i" } },
      // ];
    }

    // TODO - Add sorting

    const skip = query.limit * (query.page - 1);
    return await Promise.all([
      User.find(filterObj).limit(query.limit).skip(skip),
      User.countDocuments(filterObj),
    ]);
    // формуємо вибірку на базі аргументів які ми прокидаємо ззовні
    // повертати будемо (IUser[]) масив юзерів User.find() (entities - масив елементів у нас це юзерів)
    // повертаємо кількість (number) знайдених юзерів User.countDocuments()
    // (total - кількість елементів, у нас це кількість юзерів)
  }

  public async create(dto: Partial<IUser>): Promise<IUser> {
    return await User.create(dto);
  }

  public async getById(userId: string): Promise<IUser | null> {
    return await User.findById(userId).select("+password");
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

  public async findWithOutActivity(date: Date): Promise<IUser[]> {
    return await User.aggregate([
      {
        $lookup: {
          from: Token.collection.name,
          // from: Token.collection.name: Це визначає, з якою колекцією виконується об'єднання.
          // У цьому випадку — з колекцією Token.
          let: { userId: "$_id" },
          // let: Оголошує змінну userId, яка бере значення з поля _id колекції User.
          // Ця змінна використовується далі у pipeline.
          // pipeline:Це етапи обробки, які виконуються над колекцією Token після об'єднання.
          pipeline: [
            { $match: { $expr: { $eq: ["$_userId", "$$userId"] } } },
            // шукамо токени в колекції Token, де значення поля _userId (у колекції Token)
            // співпадає зі значенням змінної userId, оголошеної раніше (з колекції User).
            // $$userId — це доступ до змінної, оголошеної у let.
            { $match: { createdAt: { $gt: date } } },
            // шукаємо токени, де поле createdAt (у колекції Token) більше дати date.
          ],
          as: "tokens",
          // Визначає ім'я для результату об'єднання.
          // У цьому випадку результати об'єднання будуть збережені в полі tokens для кожного користувача.
        },
        // $lookup - Це операція, яка дозволяє об'єднувати (join) колекції.
        // У цьому випадку User об'єднується з колекцією Token.
      },
      { $match: { tokens: { $size: 0 } } },
      // Після виконання об'єднання, цей етап фільтрує лише тих користувачів,
      // у яких немає жодного токена (массив tokens порожній).
    ]);
  }
  // шукаємо в БД моделі User з "user.model" користувачів,
  // які не були активними протягом визначеного періоду часу
  // визначаємо користувачів, у яких немає жодного токена за 7 днів в моделі Token
  // для цього обєднуємо модель User та Token
}

export const userRepository = new UserRepository();
// репозиторій - обгортка для спілкування з БД
// (щоб те що ми вказуємо в запитах пропускалось через модель (в якій є схема) і записувалось у відповідні поля БД)
