import { ApiError } from "../errors/api.error";
import { ITokenPair } from "../interfaces/IToken";
import { ISignIn, IUser } from "../interfaces/IUser";
import { User } from "../models/user.model";
import { tokenRepository } from "../repositories/token.repository";
import { passwordService } from "./password.service";
import { tokenService } from "./token.service";
import { userService } from "./user.service";

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
    return { user, tokens };
  } // в singUp ми створюємо нового юзера (логінація) та видаємо йому токени, записуємо в БД

  public async signIn(
    dto: ISignIn,
  ): Promise<{ user: IUser; tokens: ITokenPair }> {
    const users = await userService.getUsers(); // Це повертає масив користувачів
    const user = users.find((user) => user.email === dto.email);
    // Знаходимо юзера за email в БД (хоча це все можна було винести в окремий репозиторій і назвати його наприклад user.repositories
    // якщо email що введено юзером ==== email з БД, то витягаємо дані по цьому юзеру
    if (!user) {
      throw new ApiError("User not found", 404);
    }
    const isPasswordCorrect = await passwordService.comparePassword(
      dto.password,
      user.password, // або відповідне поле у вашій моделі
    );
    // const isPasswordCorrect = await passwordService.comparePassword(
    //     dto.password, // пароль який прийшов
    //     user.password, // пароль захешований з БД
    // );
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
}

export const authService = new AuthService();
// singUp - тут логінація вконується (перший вхід з хешуванням паролю)
// signIn - тут проходить аутентифікація, перевірка чи існує в нас такий юзер з таким то паролем
