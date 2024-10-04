import { IToken } from "../interfaces/IToken";
import { Token } from "../models/token.model";

class TokenRepository {
  public async create(dto: Partial<IToken>): Promise<IToken> {
    return await Token.create(dto);
    // робимо звязку між моделью зі схемою та тим що нам надходить в інтелідж
    // де Token - це модель "token.model.ts" в якій ми створюмо інфо
  }

  public async findByParams(params: Partial<IToken>): Promise<IToken | null> {
    return await Token.findOne(params);
  } // шукаємо / дістаємо один запис у колекції Token в БД відповідно до переданих параметрів,
  // тобто шукаємо по значанню, що містяться в access / refresh токенах юзера
  // і дістаєму інфо по ньому з БД
  // де Token - це модель "token.model.ts" в якій ми шукаємо конкретну інфо

  public async deleteOneByParams(params: Partial<IToken>): Promise<void> {
    await Token.deleteOne(params);
  }

  public async deleteManyByParams(params: Partial<IToken>): Promise<void> {
    await Token.deleteMany(params);
  }

  public async deleteBeforeDate(date: Date): Promise<number> {
    const { deletedCount } = await Token.deleteMany({
      createdAt: { $lt: date },
    });
    return deletedCount;
  }
  // видаляємо токени: звертаємось до нашої моделі з токенами - Token з "token.model",
  // кажемо що хочемо видалити токени - deleteMany,
  // пишемо, що хочемо видалити токени, які в нас створені - createAt,
  // менше - $lte (детальніше mongoDB lesson1), ніж минулий місяць - date (10 днів)
  // повертаємо deletedCount - кількість видалених токенів
  // перевіряємо, що приймає та повертає модель Token,
  // там в методі deleteMany обираємо DeleteResult, через Ctrl+Shift+клік,
  // бачимо, що він повертає, кількість видалених токенів
  // (бо метод deleteMany ми використовуємо в моделі Token)- deletedCount,
  // отже диструктуруємо наш запит, щоб одразу його дістати кількість видалених токенів
}

export const tokenRepository = new TokenRepository();
// tokenRepository створений в якості оболонки,
// для звязки між моделью в яку включена схема та даними які нам в інтелідж надходять
// але можна було б зробити все це в сервісах по аналогії, як з юзерами,
// я там одразу приймаю дані і звязуюсь з БД
