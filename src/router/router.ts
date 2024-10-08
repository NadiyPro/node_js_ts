import { Router } from "express";

import { avatarConfig } from "../constants/image.constants";
import { userController } from "../controllers/user.controllers";
import { authMiddleware } from "../middleware/auth.middleware";
import { fileMiddleware } from "../middleware/file.middleware";
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
router.post(
  "/me/avatar",
  authMiddleware.checkAccessToken, // перевіряємо права доступу (access токен на валідність)
  fileMiddleware.isFileValid("avatar", avatarConfig),
  // прокидаємо ключ по контрому будемо діставати файл (avatar) з нашого обєкту,
  // другим аргументом будемо прокидати набір валідаційних даних (розмір (mimetype) та розширення (size)),
  // яку пропишемо в папці constans
  // (перевіряємо файл який ми хочемо звантажити на aws
  userController.uploadAvatar, // завантажуємо файл
);
router.delete(
  "/me/avatar",
  authMiddleware.checkAccessToken,
  userController.deleteAvatar, // видаляємо аватар юзера
);
router.get("/:userId", userMiddleware.isUserExist, userController.getUserId);

export const userRouter = router;
