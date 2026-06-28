import { Request, Response, NextFunction } from "express";
import { badRequest, unauthorized } from "../utils/api-error.js";

export function requireUserId(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers["x-host-id"];
  const hostId = Array.isArray(header) ? header[0] : header;

  if (!hostId) {
    throw unauthorized("x-host-id header is required");
  }

  const hostIdCheck = Number(hostId);

  if (isNaN(hostIdCheck)) {
    throw badRequest("x-host-id header  must be valid number");
  }

  req.hostId = hostIdCheck;
  next();
}
