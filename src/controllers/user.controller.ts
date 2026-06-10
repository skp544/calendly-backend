import { Request, Response } from "express";
import { findAllUsersService } from "../services/user.service.js";

export async function findAllUsers(req: Request, res: Response) {
  const response = await findAllUsersService();

  return res.status(200).json(response);
}
