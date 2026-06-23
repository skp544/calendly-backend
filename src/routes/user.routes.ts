import { Router } from "express";
import {
  createUser,
  findAllUsers,
  findUserById,
} from "../controllers/user.controller.js";

const userRouter: Router = Router();

userRouter.get("/", findAllUsers);

userRouter.get("/:id", findUserById);

userRouter.post("/", createUser);

export default userRouter;
