import { Request, Response } from "express";
import { badRequest } from "../utils/api-error.js";
import {
  exchangeSetupCode,
  getSetupAuthUrl,
} from "../services/google-calender.service.js";
import { sendSuccess } from "../utils/api-response.js";

export const getGoogleSetupUrl = async (_req: Request, res: Response) => {
  sendSuccess(res, { url: getSetupAuthUrl() });
};

export const setupGoogleCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;

  if (!code) throw badRequest("No Code provided");

  // refreshToken is persisted in Redis inside exchangeSetupCode — never echo
  // it back over HTTP.
  const { email } = await exchangeSetupCode(code);

  sendSuccess(res, { email });
};
