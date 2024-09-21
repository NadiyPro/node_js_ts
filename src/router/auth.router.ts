import { Router } from "express";

import { authControllers } from "../controllers/auth.controllers";
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

export const authRouter = router;
