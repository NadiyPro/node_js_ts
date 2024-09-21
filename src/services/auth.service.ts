import { ITokenPair } from "../interfaces/IToken";
import { IUser } from "../interfaces/IUser";
import { User } from "../models/user.model";
import { tokenRepository } from "../repositories/token.repository";
import { passwordService } from "./password.service";
import { tokenService } from "./token.service";

class AuthService {
  public async singUp(
    dto: Partial<IUser>,
  ): Promise<{ user: IUser; tokens: ITokenPair }> {
    const hashedPassword = await passwordService.hashPassword(dto.password); // хешуємо пароль
    const user = await User.create({ ...dto, hashedPassword }); // записуємо юзера з тими даними що нам прийшли, але вже з новим захешованим паролем hashedPassword
    const tokens = tokenService.generateTokens({
      userId: user._id,
      role: user.role,
    });
    // передаємо в токен сервіс _id юзера /(доступаємочсьдо нього через user._id), яке тепер буде записане як userId,
    // та role, де role в моделі по дефолту = RoleEnum.USER, а в файлі role.enum.ts ми прописали, що USER = "user1",
    // таким чином ми дістанемо дані і передамо в tokenService для створення пари токенів, для юзера який знаходиться під переданим нами userId
    await tokenRepository.create({ ...tokens, _userId: user._id });
    // відправимо отриману пару токенів на збереження в наш БД через обгортку для спілкування з БД
    // (щоб те що ми хочемо пропускалось через модель (в якій є схема) і записувалось у відповідні поля БД)
    return { user, tokens };
  } // в singUp ми створюємо нового юзера (логінація) та видаємо йому токени, записуємо в БД

  public async singIn(dto: any): Promise<any> {} // в singIn ми будемо генерувати для аутентифікованого юзера пару токенів access та refresh
}

export const authService = new AuthService();
