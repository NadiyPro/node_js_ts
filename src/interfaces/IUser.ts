import { OrderEnum } from "../enums/order.enum";
import { RoleEnum } from "../enums/role.enum";
import { UserListOrderByEnum } from "../enums/user-list-order-by.enum";

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
  limit?: number;
  page?: number;
  search?: string; // пошуковий об'єкт
  order?: OrderEnum; // поля для сортування name / age
  orderBy?: UserListOrderByEnum; // сортування ask / desk
} // описуємо все що може приймати наша query (адресна строка)

export type IUserResponse = Pick<
  IUser,
  | "_id"
  | "name"
  | "email"
  | "age"
  | "role"
  | "avatar"
  | "isDeleted"
  | "isVerified"
>; // типізація для відповіді фронт енду по одному юзеру
// тут ми кажемо, що ми йдемо в T — тип, з якого вибираються властивості (IUser)
// що ми беремо тільки ті властивості з інтерфейсу IUser, що ми перерахували.

export interface IUserListResponse {
  data: IUserResponse[];
  total: number;
} // типізація для відповіді фронт енду по масиву юзерів,
// які задавольняють умовам запиту
