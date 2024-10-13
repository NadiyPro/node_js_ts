import { model, Schema } from "mongoose";

import { IToken } from "../interfaces/IToken";
import { User } from "./user.model";

const tokenSchema = new Schema(
  {
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    _userId: { type: Schema.Types.ObjectId, required: true, ref: User },
    // ми прив'язуємо токени accessToken та refreshToken до юзера по його _userId і кажемо,
    // що він _userId має бути обов'язково і мати референс (трансфер) на модель User з ./user.model
    // Schema.Types.ObjectId: Це спеціальний тип даних у Mongoose, який відповідає ідентифікатору документа в MongoDB (так званий ObjectId).
    // Кожен документ у MongoDB має унікальний ідентифікатор _id типу ObjectId.
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Token = model<IToken>("tokens", tokenSchema);
