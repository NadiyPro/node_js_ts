import { Router } from "express";

import { userController } from "../controllers/user.controllers";
import { userMiddleware } from "../middleware/user.middleware";

const router = Router();

router.get("/", userController.getUsers);
router.post("/", userMiddleware.validateUser, userController.postUser);

router.get("/:userId", userMiddleware.isUserExist, userController.getUserId);
router.put(
  "/:userId",
  userMiddleware.validateUser,
  userMiddleware.isUserExist,
  userController.updateUser,
);
router.delete(
  "/:userId",
  userMiddleware.isUserExist,
  userController.deleteUser,
);

export const userRouter = router;
