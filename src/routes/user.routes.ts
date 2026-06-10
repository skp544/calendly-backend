import { Router } from "express";
import { findAllUsers } from "../controllers/user.controller.js";

const userRouter: Router = Router();

userRouter.get("/", findAllUsers);

export default userRouter;
