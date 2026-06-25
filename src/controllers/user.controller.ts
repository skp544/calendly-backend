import { Request, Response } from "express";
import {
  createUserService,
  findAllUsersService,
  findUserByIdService,
  removeUserService,
  updateUserService,
} from "../services/user.service.js";
import { sendSuccess } from "../utils/api-response.js";

export async function findAllUsers(_req: Request, res: Response) {
  const response = await findAllUsersService();

  sendSuccess(res, response);
}

export async function findUserById(req: Request, res: Response) {
  const { id } = req.params;

  const response = await findUserByIdService(Number(id));

  sendSuccess(res, response);
}

export async function createUser(req: Request, res: Response) {
  const newUser = await createUserService(req.body);

  sendSuccess(res, newUser, 201, "User created successfully");
}

export async function updateUser(req: Request, res: Response) {
  const { id } = req.params;

  const user = await updateUserService(Number(id), req.body);

  sendSuccess(res, user, 200, "User updated successfully");
}

export async function removeUser(req: Request, res: Response) {
  const { id } = req.params;

  const user = await removeUserService(Number(id));

  sendSuccess(res, user, 200, "User removed successfully");
}
