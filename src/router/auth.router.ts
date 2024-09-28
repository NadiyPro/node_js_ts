import { Router } from "express";

import { authControllers } from "../controllers/auth.controllers";
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
router.post("/forgot-password", authControllers.forgotPasswordSendEmail); // підтверджує
// router.put(
//   "/forgot-password",
//   authMiddleware.checkActionToken,
//   authControllers.forgotPasswordSet,
// ); // відправляє

export const authRouter = router;
