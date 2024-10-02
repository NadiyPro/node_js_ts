import { RoleEnum } from "../enums/role.enum";

export interface IToken {
  _id?: string;
  _userId: string;
  accessToken: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITokenPayload {
  userId: string;
  role: RoleEnum;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}
