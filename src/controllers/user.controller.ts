import { Request, Response } from "express";
import {
  findAllUsersService,
  findUserByIdService,
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
  console.log("req.body", req.body);
  res.json({});
}
