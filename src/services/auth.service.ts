import { ActionTokenTypeEnum } from "../enums/action-token-type.enum";
import { EmailTypeEnum } from "../enums/email.enum";
import { ApiError } from "../errors/api.error";
import { ITokenPair, ITokenPayload } from "../interfaces/IToken";
import {
  IChangePassword,
  IResetPasswordSend,
  IResetPasswordSet,
  ISignIn,
  IUser,
} from "../interfaces/IUser";
import { User } from "../models/user.model";
import { actionTokenRepository } from "../repositories/action-token.repository";
import { oldPasswordRepository } from "../repositories/old-password.repository";
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
    const token = tokenService.generateActionTokens(
      { userId: user._id, role: user.role },
      ActionTokenTypeEnum.VERIFY_EMAIL,
    ); // генеруємо actionToken для конкретного юзера
    await actionTokenRepository.create({
      type: ActionTokenTypeEnum.VERIFY_EMAIL,
      _userId: user._id,
      token,
    }); // записуємо згенерований actionToken токен в БД

    await emailService.sendMail(EmailTypeEnum.WELCOME, user.email, {
      name: user.name,
      actionToken: token,
    }); // відправляємо лист "welcome" у якому в лінку VERIFY зашит наш actionToken
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
    return { user, tokens }; // виводимо в постман обэкт юзер та обэкт токен
  } // якщо все добре, в нас є такий юзер і він ввіві вірний пароль, тобто пройшов аутентифікацію,
  // то ми генеруємо нову пару токенів access та refresh

  public async refresh(
    refreshToken: string,
    payload: ITokenPayload,
  ): Promise<ITokenPair> {
    await tokenRepository.deleteOneByParams({ refreshToken });
    // видаляємо стару пару токенів, які містив у собі старий refreshToken
    const tokens = tokenService.generateTokens({
      userId: payload.userId,
      role: payload.role,
    }); // генеруємо нову пару токенів
    await tokenRepository.create({ ...tokens, _userId: payload.userId });
    // нову пару токенів записуємо в БД і повертаємо респонсом юзеру
    return tokens;
  }

  public async logout(
    jwtPayload: ITokenPayload,
    tokenId: string,
  ): Promise<void> {
    const user = await userRepository.getById(jwtPayload.userId); // знаходимо юзера в БД по його userId
    await tokenRepository.deleteOneByParams({ _id: tokenId }); // видаляємо лише одну пару токенів юзера
    await emailService.sendMail(EmailTypeEnum.LOGOUT, user.email, {
      name: user.name,
    }); // відправляємо листа юзеру
  }

  public async logoutAll(jwtPayload: ITokenPayload): Promise<void> {
    const user = await userRepository.getById(jwtPayload.userId); // знаходимо юзера в БД по його userId
    await tokenRepository.deleteManyByParams({ _userId: jwtPayload.userId }); // видаляємо всього юзера
    await emailService.sendMail(EmailTypeEnum.LOGOUT, user.email, {
      name: user.name,
    }); // відправляємо листа юзеру
  }

  public async forgotPasswordSendEmail(dto: IResetPasswordSend): Promise<void> {
    const user = await userRepository.getByEmail(dto.email);
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const token = tokenService.generateActionTokens(
      { userId: user._id, role: user.role },
      ActionTokenTypeEnum.FORGOT_PASSWORD,
    );
    await actionTokenRepository.create({
      type: ActionTokenTypeEnum.FORGOT_PASSWORD,
      _userId: user._id,
      token,
    }); // в _userId записуємо user._id,
    // щоб можна було зробити звязку двох табл по id юзера
    // ( в одній табл ідентифікатор юзера знаходиться в _id, в другій в userId)

    await emailService.sendMail(EmailTypeEnum.FORGOT_PASSWORD, user.email, {
      name: user.name,
      email: user.email,
      actionToken: token,
    });
    // відправляємо юзерові на пошту листа з лінкою в яку вшитий токен для відновлення паролю
    // для тесту, замість user.email можемо вказати свою пошту,
    // щоб перевірити чи все вірно зробили, чи приходять листи
  }

  public async forgotPasswordSet(
    dto: IResetPasswordSet,
    jwtPayload: ITokenPayload,
  ): Promise<void> {
    const password = await passwordService.hashPassword(dto.password); // хешуємо пароль
    await userRepository.updateById(jwtPayload.userId, { password }); //  оновлюємо в БД пароль на новий

    await actionTokenRepository.deleteManyByParams({
      _userId: jwtPayload.userId,
      type: ActionTokenTypeEnum.FORGOT_PASSWORD,
    });
    // потенційно, випадково ми могли випадково видати декілька токенів,
    // тому видаляємо всі токени по вказаному юзеру видані саме по FORGOT_PASSWORD екшену
    await tokenRepository.deleteManyByParams({ _userId: jwtPayload.userId });
    // видаляємо всі токени видані даному юзеру,
    // таким чином коли буде змінено пароль,
    // всі сессії будуть розірвані бо ми повидаляємо всі токени
  }
  public async verify(jwtPayload: ITokenPayload): Promise<void> {
    await userRepository.updateById(jwtPayload.userId, { isVerified: true });
    // змінюємо статус в БД (за замовчуванням по дефолту в user.model в нас вказано false),
    // тобто вказуємо що email підтверджений і змінюємо статус з дефолтного false на true
    await actionTokenRepository.deleteManyByParams({
      _userId: jwtPayload.userId,
      type: ActionTokenTypeEnum.VERIFY_EMAIL,
    });
  }
  public async changePassword(
    jwtPayload: ITokenPayload,
    dto: IChangePassword,
  ): Promise<void> {
    const [user, oldPasswords] = await Promise.all([
      userRepository.getById(jwtPayload.userId),
      // дістаємо з БД інфо по конкретному юзеру user,
      // згідно моделі User в "user.model.ts"
      oldPasswordRepository.findByParams(jwtPayload.userId),
      // дістаємо з БД всі старі паролі oldPasswords по конкретному юзеру (айді)
      // згідно моделі User в "old-password.model.ts"
    ]);
    const isPasswordCorrect = await passwordService.comparePassword(
      dto.oldPassword,
      user.password,
    );
    // звіряємо пароль який ми витягли з БД user.password,
    // з тим паролем, що ввів юзер як старий пароль dto.oldPassword,
    // якщо вони співпали, то все ок, йдемо далі, якщо ні то кидаємо помилку
    if (!isPasswordCorrect) {
      throw new ApiError("Invalid previous password", 401);
    }

    const passwords = [...oldPasswords, { password: user.password }];
    //  в passwords записуємо новий масив,
    //  який містить всі старі паролі зі збереженням поточного паролю користувача.
    await Promise.all(
      passwords.map(async (oldPassword) => {
        const isPrevious = await passwordService.comparePassword(
          dto.password, // поточний пароль який ввів юзер
          oldPassword.password,
          // дістаємо по одному кожен старий пароль через map для того,
          // щоб порывняти його з новим паролем який ввыв юзер
        );
        if (isPrevious) {
          throw new ApiError("Password already used", 409);
        }
      }),
    );
    // Promise.all(), яка перевіряє кожен пароль з масиву чи він не дорівнює новому паролю,
    // який ввів користувач. Якщо знайдеться хоча б один пароль,
    // який дорівнює новому, то викидаємо помилку "Password already used"

    const password = await passwordService.hashPassword(dto.password);
    // хешуємо пароль, який ввів юзер як новий
    await userRepository.updateById(jwtPayload.userId, { password });
    // оновлюємо в БД старий пароль, який там був на новий
    await oldPasswordRepository.create({
      _userId: jwtPayload.userId,
      password: user.password,
    });
    await tokenRepository.deleteManyByParams({ _userId: jwtPayload.userId });
    // видаляємо всі токени видані даному юзеру,
    // таким чином коли буде змінено пароль,
    // всі сессії будуть розірвані, бо ми повидаляємо всі токени
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
