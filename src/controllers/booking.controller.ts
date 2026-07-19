import { Request, Response } from "express";
import { createBookingService } from "../services/booking.service.js";
import { sendSuccess } from "../utils/api-response.js";

export async function createBooking(req: Request, res: Response) {
  const hostId = req.hostId as number;

  const booking = await createBookingService(String(hostId), req.body);

  sendSuccess(res, booking, 201, "Booking created successfully");
}
