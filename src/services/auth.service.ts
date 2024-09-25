import { EmailTypeEnum } from "../enums/email.enum";
import { ApiError } from "../errors/api.error";
import { ITokenPair, ITokenPayload } from "../interfaces/IToken";
import { ISignIn, IUser } from "../interfaces/IUser";
import { User } from "../models/user.model";
import { tokenRepository } from "../repositories/token.repository";
import { userRepository } from "../repositories/user.repository";
import { emailService } from "./email.service";
import { passwordService } from "./password.service";
import { tokenService } from "./token.service";

class AuthService {
  public async signUp(
    dto: Partial<IUser>,
  ): Promise<{ user: IUser; tokens: ITokenPair }> {
    const hashedPassword = await passwordService.hashPassword(dto.password); // хешуємо пароль
    const user = await User.create({ ...dto, password: hashedPassword });
    // записуємо в БД юзера з тими даними що нам прийшли, але вже з новим захешованим паролем,
    // тобто в поле password записуємо hashedPassword
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

    await emailService.sendMail(EmailTypeEnum.WELCOME, "siroviyn13@gmail.com", {
      name: user.name,
    });

    return { user, tokens };
  } // в singUp ми створюємо нового юзера (логінація) та видаємо йому токени, записуємо в БД

  public async signIn(
    dto: ISignIn,
  ): Promise<{ user: IUser; tokens: ITokenPair }> {
    const user = await userRepository.getByEmail(dto.email);
    // Знаходимо юзера за email в БД
    // все те саме можна було б зробити і ось так, але це було б не коректно, бо захламляло б код,
    // подібні запити мають бути в окремому файлі у обгортці типу userRepository
    // const users = await userService.getUsers(); // Це повертає масив користувачів
    // const user = users.find((user) => user.email === dto.email);
    // якщо email що введено юзером ==== email з БД, то витягаємо дані по цьому юзеру
    if (!user) {
      throw new ApiError("User not found", 404);
    }
    const isPasswordCorrect = await passwordService.comparePassword(
      dto.password,
      user.password, // або відповідне поле у вашій моделі
    );
    // перевіряємо той пароль який ввів юзер з тим паролем, що захешований в нас в БД, через виділення солі та перехешування
    if (!isPasswordCorrect) {
      throw new ApiError("Invalid credentials", 401);
    }

    const tokens = tokenService.generateTokens({
      userId: user._id,
      role: user.role,
    });
    await tokenRepository.create({ ...tokens, _userId: user._id });
    return { user, tokens };
  } // якщо все добре, в нас є такий юзер і він ввіві вірний пароль, тобто пройшов аутентифікацію,
  // то ми генеруємо нову пару токенів access та refresh

  public async refresh(
    refreshToken: string,
    payload: ITokenPayload,
  ): Promise<ITokenPair> {
    await tokenRepository.deleteByParams({ refreshToken });
    // видаляємо стару пару токенів, які містив у собі старий refreshToken
    const tokens = tokenService.generateTokens({
      userId: payload.userId,
      role: payload.role,
    }); // генеруємо нову пару токенів
    await tokenRepository.create({ ...tokens, _userId: payload.userId });
    // нову пару токенів записуємо в БД і повертаємо респонсом юзеру
    return tokens;
  }

  // private async isEmailExistOrThrow(email: string): Promise<void> {
  //   const user = await userRepository.getByEmail(email);
  //   if (user) {
  //     throw new ApiError("Email already exists", 409);
  //   }
  // }
}

export const authService = new AuthService();
// singUp - тут логінація вконується (перший вхід з хешуванням паролю)
// signIn - тут проходить аутентифікація, перевірка чи існує в нас такий юзер з таким то паролем,
// якщо існує то генеруємо нову пару токенів (повторний вхід, перевірка паролю, ат видача нової пари токенів)
//
//тестуємо auth/refresh:
// змінюємо термін життя токенів (на менший 15s та 40s)
//заходимо в sign-in (повторний вхід для аутентифікації,
// перевірка чи існує в нас такий юзер з таким то паролем,
// якщо існує то генеруємо нову пару токенів,
// в нашому випадку все норм ми аутентифікацію успішно проходимо бо токен валідний),
// чекаємо поки в нас вийде термін дії access токену (15s),
// а потім ми заходимо на auth/refresh, тут ми забираємо refreshToken токен згенерований в sign-in,
// видаляємо стару пару токенів і видаємо нову пару токенів
