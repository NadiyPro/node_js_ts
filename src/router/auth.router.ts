import { Router } from "express";

import { authControllers } from "../controllers/auth.controllers";
import { ActionTokenTypeEnum } from "../enums/action-token-type.enum";
import { authMiddleware } from "../middleware/auth.middleware";
import { userMiddleware } from "../middleware/user.middleware";
import { UserValidator } from "../validators/user.validator";

const router = Router();

router.post(
  "/sign-up",
  userMiddleware.validateUser(UserValidator.create),
  authControllers.signUp,
);
router.post(
  "/sign-in",
  userMiddleware.validateUser(UserValidator.signIn),
  authControllers.signIn,
);
router.post(
  "/refresh",
  authMiddleware.checkRefreshToken,
  authControllers.refresh,
); // цей роут призначений для того, щоб видати нову пару токенів

router.post("/logout", authMiddleware.checkAccessToken, authControllers.logout);
// видалити одну пару токенів юзера

router.post(
  "/logout/all",
  authMiddleware.checkAccessToken,
  authControllers.logoutAll,
);
// видалити всі токени видані юзеру,
// напркилад коли юзер заходив з різних дивайсів, відповідно в нього буде декілька пар токенів
// кожна пара токенів на свій дивайс
router.post("/forgot-password", authControllers.forgotPasswordSendEmail);
// выдправляэмо на email лінку з actionToken, щоб юзер міг ввести новий пароль
router.put(
  "/forgot-password",
  authMiddleware.checkActionToken(ActionTokenTypeEnum.FORGOT_PASSWORD),
  authControllers.forgotPasswordSet,
); // забираємо новий пароль що ввів юзер таоновлюємо інфо про пароль в БД
router.post(
  "/change-password",
  authMiddleware.checkAccessToken,
  userMiddleware.validateUser(UserValidator.changePassword),
  authControllers.changePassword,
); // зміна паролю (знаємо старий пароль, але хочемо його змінити на новий)

router.post(
  "/verify",
  authMiddleware.checkActionToken(ActionTokenTypeEnum.VERIFY_EMAIL),
  authControllers.verify,
);
// в sign-up ми перейшли по лінкі VERIFY в яку зашит наш actionToken,
// а тут "/verify" вже ми верифікуємо email
export const authRouter = router;
