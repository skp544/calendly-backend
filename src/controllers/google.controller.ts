import { Request, Response } from "express";
import { badRequest } from "../utils/api-error.js";
import { exchangeSetupCode } from "../services/google-calender.service.js";
import { sendSuccess } from "../utils/api-response.js";

export const setupGoogleCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;

  if (!code) throw badRequest("No Code provided");

  const { refreshToken, email } = await exchangeSetupCode(code);
  // todo: save refresh token and email in the redis

  sendSuccess(res, { refreshToken, email });
};
