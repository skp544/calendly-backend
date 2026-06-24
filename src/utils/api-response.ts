import { Response } from "express";

interface SuccessPayload<T> {
  sucess: true;
  data: T;
  message?: string;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string,
): void {
  const body: SuccessPayload<T> = { sucess: true, data };

  if (message) body.message = message;
  res.status(statusCode).json(body);
}
