import { Router } from "express";

import { userController } from "../controllers/user.controllers";
import { authMiddleware } from "../middleware/auth.middleware";
import { userMiddleware } from "../middleware/user.middleware";
import { UserValidator } from "../validators/user.validator";

const router = Router();

router.get("/", userController.getUsers);

router.get("/me", authMiddleware.checkAccessToken, userController.getMe);
router.put(
  "/me",
  authMiddleware.checkAccessToken,
  userMiddleware.validateUser(UserValidator.update),
  userController.updateMe,
);
router.delete("/me", authMiddleware.checkAccessToken, userController.deleteMe);
router.get("/:userId", userMiddleware.isUserExist, userController.getUserId);

export const userRouter = router;
