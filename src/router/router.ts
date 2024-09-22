import { Router } from "express";

import { userController } from "../controllers/user.controllers";
import { authMiddleware } from "../middleware/auth.middleware";
import { userMiddleware } from "../middleware/user.middleware";
import { UserValidator } from "../validators/user.validator";

const router = Router();

router.get("/", userController.getUsers);
// router.post(
//   "/",
//   userMiddleware.validateUser(UserValidator.create),
//   userController.postUser,
// );

router.get("/:userId", userMiddleware.isUserExist, userController.getUserId);
router.put(
  "/:userId",
  userMiddleware.validateUser(UserValidator.update),
  userMiddleware.isUserExist,
  userController.updateUser,
);
router.delete(
  "/:userId",
  authMiddleware.checkAccessToken,
  userMiddleware.isUserExist,
  userController.deleteUser,
);

export const userRouter = router;
