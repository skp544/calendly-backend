import { Router } from "express";
import {
  createUser,
  findAllUsers,
  findUserById,
  removeUser,
  updateUser,
} from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.js";
import { createUserSchema, updateUserSchema } from "../dtos/user.dto.js";

const userRouter: Router = Router();

userRouter.get("/", findAllUsers);

userRouter.get("/:id", findUserById);

userRouter.post("/", validate(createUserSchema), createUser);

userRouter.patch("/:id", validate(updateUserSchema), updateUser);

userRouter.delete("/:id", removeUser);

export default userRouter;
