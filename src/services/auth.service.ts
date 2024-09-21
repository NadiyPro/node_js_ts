import { IUser } from "../interfaces/IUser";
import { User } from "../models/user.model";
import { passwordService } from "./password.service";

class AuthService {
  public async singUp(dto: Partial<IUser>): Promise<IUser> {
    const hashedPassword = await passwordService.hashPassword(dto.password); // хешуємо пароль
    const user = await User.create({
      ...dto,
      hashedPassword,
    }); // записуємо юзера з тими даними що нам прийшли, але вже з новим захешованим паролем hashedPassword
    return user;
  } // в singUp ми створюємо нового юзера (логінація - реєстарція/створення юзера)

  public async singIn(dto: any): Promise<any> {} // в singIn ми будемо генерувати для аутентифікованого юзера пару токенів access та refresh
}

export const authService = new AuthService();
