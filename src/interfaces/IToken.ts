import { RoleEnum } from "../enums/role.enum";

export interface IToken {
  _id?: string;
  _userId: string;
  accessToken: string;
  refreshToken: string;
}

export interface ITokenPayload {
  userId: string;
  role: RoleEnum;
}

export interface ITokenPair {
  accessToken: string;
  refreshToken: string;
}
