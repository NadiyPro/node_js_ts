import { Router } from "express";

import { userController } from "../controllers/user.controllers";
import { userMiddleware } from "../middleware/user.middleware";

// import { userController } from "../controllers/user.controller";

const router = Router();

router.get("/", userController.getUsers);
router.post("/", userMiddleware.validateUser, userController.postUser);
// router.post("/", userController.postUser);
//
// router.get("/:userId", userController.getUserId);
// router.put("/:userId", userController.updateUser);
// router.delete("/:userId", userController.deleteUser);

export const userRouter = router;
