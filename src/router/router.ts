import { Router } from "express";

import { userController } from "../controllers/user.controllers";
import { userMiddleware } from "../middleware/user.middleware";

const router = Router();

router.get("/", userController.getUsers);
router.post("/", userMiddleware.validateUser, userController.postUser);

router.get("/:userId", userMiddleware.getUserId, userController.getUserId);
router.put("/:userId", userMiddleware.validateUser, userController.updateUser);
router.delete("/:userId", userController.deleteUser);

export const userRouter = router;
