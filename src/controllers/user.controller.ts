import { Request, Response } from "express";
import {
  findAllUsersService,
  findUserByIdService,
} from "../services/user.service.js";

export async function findAllUsers(req: Request, res: Response) {
  const response = await findAllUsersService();

  return res.status(200).json(response);
}

export async function findUserById(req: Request, res: Response) {
  const { id } = req.params;

  const response = await findUserByIdService(Number(id));

  return res.status(200).json(response);
}

export async function createUser(req: Request, res: Response) {
  console.log("req.body", req.body);
  res.json({});
}
