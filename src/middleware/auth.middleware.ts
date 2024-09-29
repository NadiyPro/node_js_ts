import { NextFunction, Request, Response } from "express";

import { ActionTokenTypeEnum } from "../enums/action-token-type.enum";
import { TokenTypeEnum } from "../enums/token.enum";
import { ApiError } from "../errors/api.error";
import { actionTokenRepository } from "../repositories/action-token.repository";
import { tokenRepository } from "../repositories/token.repository";
import { tokenService } from "../services/token.service";

class AuthMiddleware {
  public async checkAccessToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const header = req.headers.authorization;
      // доступаємось в HTTP-запиту до конкретний заголовка authorization, який знаходиться в headers,
      // сюди ми будемо класти токени для закритих endpoint (наприклда, для того щоб видалити самого себе та інші запити)
      if (!header) {
        throw new ApiError("Token is not provided", 401);
      }
      const accessToken = header.split("Bearer ")[1];
      // дістанемо токен доступу з Authorization, беремо другий елемент масиву, тобто все, що йде після слова "Bearer "
      const payload = tokenService.verifyToken(
        accessToken,
        TokenTypeEnum.ACCESS,
      ); //  перевіряємо токен, чи був він створений з використанням конкретного секретного ключа і чи не закінчився термін його дії
      // тут використовуємо саме verify, тому що він перевіряє secret (ключі, які сховані в .env та термін дії),
      // а decode ми тут НЕ використовуємо, бо він лише декодує БЕЗ перевірки підпису або дійсності токена

      const pair = await tokenRepository.findByParams({ accessToken });
      if (!pair) {
        throw new ApiError("Token is not valid", 401);
      }
      // шукаємо по значенню, що містяться в access / refresh токенах юзера і дістаємо інфо по ньому з БД

      req.res.locals.tokenId = pair._id;
      // додамо / запишемо до нашої пари токенів _id, щоб потім по цьому _id ми могли видалити пару токенів
      // де tokenId — це нове поле, яке додається в locals, в яке ми і записуватимемо _id
      req.res.locals.jwtPayload = payload; // обєкт який був закодований, в нашому випадку це userId та role
      next();
    } catch (e) {
      next(e);
    }
  }

  public async checkRefreshToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const header = req.headers.authorization;
      if (!header) {
        throw new ApiError("Token is not provided", 401);
      }
      const refreshToken = header.split("Bearer ")[1];
      const payload = tokenService.verifyToken(
        refreshToken,
        TokenTypeEnum.REFRESH,
      );

      const pair = await tokenRepository.findByParams({ refreshToken });
      if (!pair) {
        throw new ApiError("Token is not valid", 401);
      }
      req.res.locals.jwtPayload = payload; // обєкт який був закодований, в нашому випадку це userId та role
      req.res.locals.refreshToken = refreshToken; // перекинемо наш refresh токен в контролер
      next();
    } catch (e) {
      next(e);
    }
  }

  public checkActionToken(type: ActionTokenTypeEnum) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const token = req.body.token as string; // дістаємо токен з body
        if (!token) {
          throw new ApiError("Token is not provided", 401);
        }
        const payload = tokenService.verifyToken(token, type);
        // відправляємо на верифікацію токен і вказуємо його тип

        const tokenEntity = await actionTokenRepository.getByToken(token);
        // шукаємо інфо по token та дістаємо з БД
        if (!tokenEntity) {
          throw new ApiError("Token is not valid", 401);
        }
        req.res.locals.jwtPayload = payload;
        // зберігаємо в locals перевірений токен для прокилання його далі в контролер
        next();
      } catch (e) {
        next(e);
      }
    };
  }
}

export const authMiddleware = new AuthMiddleware();
// створюємо auth.middleware.ts в якій:
// public async checkAccessToken
// доступаємось в HTTP-запиту до конкретний заголовка authorization, який знаходиться в headers
//
// дістанемо токен доступу з Authorization, беремо другий елемент масиву, тобто все, що йде після слова "Bearer " ( значення access / refresh токенів, які нам прийшли )
//
// шукаємо tokenRepository.findByParams по значенню, що містяться в access / refresh токенах юзера і дістаємо інфо по ньому з БД
// ( бо цей токен наприклад могли видавати ми на 10 днів наприклад, але юзер захотів обірвати сесесію раніше і заходить заново,
// тобто ми перевіряємо чи формували ми по цьому юзеру раніше токен, чи є він в нас в БД)
// якщо є в нашій БД такий токен то йдемо далі на перевірку  tokenService.verifyToken
// якщо ні то викидуємо помилку,  юзеру треба буде йти на sign-in, щоб ми перевірили хеші паролю та видали нову пару токенів
//
// перевіряємо токен tokenService.verifyToken, чи був він створений з використанням нашого секретного ключа (secret) і чи не закінчився термін його дії
// якщо все добре то зберігаємо дані в об'єкті  в req.res.locals.jwtPayload
// якщо токен видвали не ми, або токен протермінований, відсутній - ми видамо помилку і юзеру треба буде пройти процес аутентифікації,
// тобто sign-in, щоб ми перевірили хеші паролю та видали нову пару токенів і вже з новою парою токенів юзер зможе виконати delete
//
// req.res.locals.jwtPayload - це місце, де ми зберігаємо розшифровану інформацію (об'єкт)  з JWT (JSON Web Token) після того, як токен був перевірений.
// Тобто в jwtPayload ми зберігаємо всі дані, які були закодовані в JWT-токені, в нашому прикладі це - userId та role
// Потім ці дані можна використовувати для визначення прав доступу або для роботи з поточним користувачем у будь-якій частині програми.
// Тобто таким чином ми можемо перекидати вже перевірений об'єкт між middleware мідлварками та передавати в контролер
//
// якщо токен видавали ми і він валідний,то щоб не генерувати новий токен, ми цей розшифрований об'єкт з (userId та role)
// який отримали дістаємо в наступній мідлварці чи контролері
// наприклад, дістаємо в запиті на delete - це ми робимо для того, щоб мати можливість видалити самого себе,
// тобто видаляти не по userId як ми це робили раніше, а видалити повінстю обєкт з усіми даними який зайшов на даний запит, тобто видалити самого себе
//  (та для інших запитів з шляхом “users1/me”)
// *tokenService.verifyToken використовуємо в auth.middleware.ts для перевірки валідності токенів, щоб виконати запити які нас цікавлять
//
// public async checkRefreshToken:
// для refresh окрім req.body, нам в мідлварці / контролері наступних треба дістати ще значення refreshToken токену яке нам надійшло,
// оскільки наша, видалити стару пару токенів, які містив у собі старий refreshToken
// і згенерувати нову пару токенів, тому
// окрім req.res.locals.jwtPayload = payload; ще req.res.locals.refreshToken = refreshToken;
// все інше те ж саме що і в public async checkAccessToken
