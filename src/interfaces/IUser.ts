import { RoleEnum } from "../enums/role.enum";

export interface IUser {
  _id?: string;
  // id: number;
  name: string;
  age: number;
  status: boolean;
  email?: string;
  password?: string;
  phone?: string;
  role: RoleEnum;
  isVerified: boolean;
  isDeleted: boolean;
}
