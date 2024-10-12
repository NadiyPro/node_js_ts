import { OrderEnum } from "../enums/order.enum";
import { RoleEnum } from "../enums/role.enum";
import { UserListOrderByEnum } from "../enums/user-list-order-by.enum";
import { PickRequired } from "../types/pick-required.type";

export interface IUser {
  _id?: string;
  name: string;
  age: number;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  role: RoleEnum;
  isVerified: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ISignIn = Pick<IUser, "email" | "password">;
// Pick<T, K> — це утилітний тип TypeScript, який дозволяє створити новий тип,
// вибравши тільки певні властивості з існуючого типу.
// T — це об'єктний тип, з якого вибираються властивості (IUser)
// K — це список (ключі) властивостей, які ми хочемо вибрати ("email" | "password")
//Pick<IUser, "email" | "password"> — означає,
// що ми беремо тільки властивості "email" і "password" з інтерфейсу IUser.
// Новий тип ISignIn буде містити лише ці дві властивості.

export type IResetPasswordSend = Pick<IUser, "email">;

export type IResetPasswordSet = Pick<IUser, "password"> & { token: string };

export type IChangePassword = Pick<IUser, "password"> & { oldPassword: string };
// завдяки Pick<T, K> ми кажемо, що з IUser забираємо тільки тип для "password"
// і додаємо ще новий тип, а саме oldPassword: string

export interface IUserListQuery {
  limit?: number; // це ліміт значень які ми хочемо відображати на сторінці
  page?: number; // номер сторінки
  search?: string; // пошуковий об'єкт
  order?: OrderEnum; // сортування ask / desk
  orderBy?: UserListOrderByEnum; // поля для сортування name / age / createdAt
} // описуємо все що може приймати наша query (адресна строка)

export type IUserResponse = Pick<
  IUser,
  "name" | "email" | "age" | "role" | "avatar" | "isDeleted" | "isVerified"
> &
  PickRequired<IUser, "_id" | "createdAt">;
// типізація для відповіді фронт енду по одному юзеру
// в Pick ми кажемо, що ми йдемо в T — тип, з якого вибираються властивості (IUser)
// що ми беремо тільки ті властивості з інтерфейсу IUser, що ми перерахували і
// за допомогою PickRequired з "../types/pick-required.type"
// робимо властивості  "_id" | "createdAt" обов'язковими
// навіть якщо вони були необов'язковими в початковому типі.

export interface IUserListResponse {
  data: IUserResponse[]; // масив юзерів,які задавольняють умовам запиту
  total: number; // кількість юзерів які підходять під наші умови
} // типізація для відповіді фронт енду
