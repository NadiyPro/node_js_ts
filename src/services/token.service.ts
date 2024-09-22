import * as jsonwebtoken from "jsonwebtoken";

import { config } from "../config/configs";
import { TokenTypeEnum } from "../enums/token.enum";
import { ApiError } from "../errors/api.error";
import { ITokenPair, ITokenPayload } from "../interfaces/IToken";

class TokenService {
  public generateTokens(payload: ITokenPayload): ITokenPair {
    const accessToken = jsonwebtoken.sign(payload, config.JWT_ACCESS_SECRET, {
      expiresIn: config.JWT_ACCESS_EXPIRATION,
    });
    const refreshToken = jsonwebtoken.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRATION,
    });
    return { accessToken, refreshToken };
  } // створюємо токени

  public verifyToken(token: string, type: TokenTypeEnum): ITokenPayload {
    try {
      let secret: string;
      switch (type) {
        case TokenTypeEnum.ACCESS:
          secret = config.JWT_ACCESS_SECRET;
          break;

        case TokenTypeEnum.REFRESH:
          secret = config.JWT_REFRESH_SECRET;
          break;
      }
      // if (type === TokenTypeEnum.ACCESS) {
      //   secret = config.JWT_ACCESS_SECRET;
      // } else if (type === TokenTypeEnum.REFRESH) {
      //   secret = config.JWT_REFRESH_SECRET;
      // }
      return jsonwebtoken.verify(token, secret) as ITokenPayload;
    } catch (e) {
      console.error(e.message);
      throw new ApiError("Invalid token", 401);
    }
  } // jsonwebtoken.verify перевіряємо токен,
  // чи був він створений з використанням конкретного секретного ключа і чи не закінчився термін його дії
  // використовуємо в auth.middleware.ts для перевірки валідності токенів, щоб виконати запит який нас цікавить
}

export const tokenService = new TokenService();
