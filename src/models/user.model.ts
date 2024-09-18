import { model, Schema } from "mongoose";

import { RoleEnum } from "../enums/role.enum";
import { IUser } from "../interfaces/IUser";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    status: { type: Boolean, required: true },
    email: { type: String, required: false, unique: true },
    password: { type: String, required: false, select: false },
    phone: { type: String, required: false },
    role: { type: String, enum: RoleEnum, default: RoleEnum.USER },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const User = model<IUser>("users", userSchema);
