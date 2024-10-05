import bcrypt from "bcrypt";

class PasswordService {
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
    // хешуємо введений першочерговий password, ставимо на 10 раундів
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    // console.log(password);
    // console.log(hashedPassword);
    return await bcrypt.compare(password, hashedPassword);
    // порівнюємо новий введений пароль з раніше введеним паролем
  }
}
// bcrypt.compare (процес порівнння хешів), для цього:
// - витягається сіль з збереженого хешу.
// - введений користувачем пароль хешується з цією сіллю.
// - порівнюються результуючі хеші.

export const passwordService = new PasswordService();
