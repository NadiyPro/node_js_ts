import { RoleEnum } from "../enums/role.enum";

export interface IUser {
  id: number;
  name: string;
  age: number;
  status: boolean;
  role: RoleEnum;
  isVerified: boolean;
  isDeleted: boolean;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // _id?: string;
}
