import { IToken } from "../interfaces/IToken";
import { Token } from "../models/token.model";

class TokenRepository {
  public async create(dto: Partial<IToken>): Promise<IToken> {
    return await Token.create(dto); // робимо звязку між моделью зі схемою та тим що нам надходить в інтелідж
  }

  public async findByParams(params: Partial<IToken>): Promise<IToken | null> {
    return await Token.findOne(params);
  } // шукаємо / дістаємо один запис у колекції Token в БД відповідно до переданих параметрів,
  // тобто шукаємо по значанню, що містяться в access / refresh токенах юзера і дістаєму інфо по ньому з БД

  public async deleteByParams(params: Partial<IToken>): Promise<void> {
    await Token.deleteOne(params);
  }
}

export const tokenRepository = new TokenRepository();
// tokenRepository створений в якості оболонки, для звязки між моделью в яку включена схема та даними які нам в інтелідж надходять
// але можна було б зробити все це в сервісах по аналогії, як з юзерами, я там одразу приймаю дані і звязуюсь з БД
