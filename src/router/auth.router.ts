import { Router } from "express";

import { authControllers } from "../controllers/auth.controllers";
import { userMiddleware } from "../middleware/user.middleware";
import { UserValidator } from "../validators/user.validator";

const router = Router();

router.post(
  "/sing-up",
  userMiddleware.validateUser(UserValidator.create),
  authControllers.singUp,
);
router.post(
  "/sing-in",
  // userMiddleware.validateUser(UserValidator.create),
  authControllers.singIn,
);

export const authRouter = router;
