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
  // userMiddleware.validateUser(UserValidator.create),
  authControllers.signIn,
);
router.post(
  "/refresh",
  authMiddleware.checkRefreshToken,
  authControllers.refresh,
); // цей роут призначений для того, щоб видати нову пару токенів
export const authRouter = router;
