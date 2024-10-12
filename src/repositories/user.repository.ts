import { FilterQuery, SortOrder } from "mongoose";

import { UserListOrderByEnum } from "../enums/user-list-order-by.enum";
import { ApiError } from "../errors/api.error";
import { IUser, IUserListQuery } from "../interfaces/IUser";
import { Token } from "../models/token.model";
import { User } from "../models/user.model";

class UserRepository {
  public async getUsers(query: IUserListQuery): Promise<[IUser[], number]> {
    const filterObj: FilterQuery<IUser> = { isVerified: true };
    // Цей рядок створює початковий об'єкт фільтрації,
    // який буде використовуватись для запиту в базу даних.
    // Він фільтрує лише тих користувачів, у яких поле isVerified має значення true.
    // Це означає, що фільтр спочатку знайде лише верифікованих користувачів.
    // Після цього цей фільтр доповнюється додатковими умовами, як, наприклад,
    // пошук за ім'ям за допомогою регулярного виразу, якщо таке є в запиті.
    if (query.search) {
      filterObj.name = { $regex: query.search, $options: "i" };
      // Цей рядок створює фільтр для поля name у базі даних.
      // Він використовує регулярний вираз ($regex) для пошуку за частковим збігом.
      // Якщо у запиті (query.search) є пошукове слово, наприклад, "John",
      // то фільтр знайде всіх користувачів, чиї імена містять це слово,
      // незалежно від регістру букв (опція "i" означає нечутливість до регістру).
      //
      // filterObj.$or = [
      //   { name: { $regex: query.search, $options: "i" } },
      //   { email: { $regex: query.search, $options: "i" } },
      // ];
    }
    const sortObj: { [key: string]: SortOrder } = {};
    // [key: string] означає, що ключами можуть бути будь-які рядкові значення (назви полів для сортування),
    // а значеннями будуть значення типу SortOrder (це або "asc" — за зростанням, або "desc" — за спаданням).
    //SortOrder - це тип, який походить з бібліотеки Mongoose, яка використовується для роботи з MongoDB у Node.js.
    // У контексті Mongoose, SortOrder визначає порядок сортування в запитах до MongoDB.
    // Він може приймати значення "asc" або "desc", що означає сортування за зростанням або спаданням відповідн
    switch (query.orderBy) {
      case UserListOrderByEnum.NAME:
        sortObj.name = query.order;
        break;
      // query.orderBy по якому полі ми хочемо сортувати
      // (ми в запиті query доступаємося до поля, яке заначив фронт енд name/age/createdAt)
      // Якщо query.orderBy дорівнює типу UserListOrderByEnum.NAME (тобто з query дістали "name"),
      // то в об'єкті sortObj замість [key] буде name зі значенням query.order,
      // яке визначає напрямок сортування ("asc" або "desc").
      case UserListOrderByEnum.AGE:
        sortObj.age = query.order;
        break;
      case UserListOrderByEnum.CREATED:
        sortObj.createdAt = query.order;
        break;
      default:
        throw new ApiError("Invalid orderBy", 500);
    }
    //UserListOrderByEnum.CREATED, тобто createdAt сортуємо по даті створення юзера
    const skip = query.limit * (query.page - 1);
    // limit - це ліміт значень які ми хочемо відображати на сторінці, page - 1 - це кількість сторінок
    // ми кажемо, що: хочемо пропускати вказану кількість значень (limit) з попередньої сторінки +page - 1,
    // щоб таким чином щоразу виконуючи skip ми крокували вперед
    // наприклад, ми хочемо перейти на другу сторінку, тобто page = 2, limit = 5, отже skip = 5 * (2-1),
    // тобто ми пропускаємо таким чином перші 5 елементів і відображаємо елементи з 6 по 10 на наступній сторінці (другій),
    // якщо ж ми хочемо відобразити першу сторінку, тобто в нас page = 1, limit = 5, отже skip = 5 * (1-1),
    // таким чином в нас буде skip =0, а отже ми просто відобразимо на першій сторінці елементи з 1 по 5
    return await Promise.all([
      User.find(filterObj).sort(sortObj).limit(query.limit).skip(skip),
      // повертаємо з БД зазначену кількість елементів виконуючи skip та sort
      User.countDocuments(filterObj), // повертаємо кількість знайдених елементів
    ]);
    // формуємо вибірку на базі аргументів які ми прокидаємо ззовні (параметри на які фронт давав запит в адресній стрічці)
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
