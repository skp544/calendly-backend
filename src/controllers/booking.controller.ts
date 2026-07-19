import { Request, Response } from "express";
import {
  createBookingService,
  listHostBooking,
} from "../services/booking.service.js";
import { ListBookingsQueryDto } from "../dtos/booking.dto.js";
import { sendSuccess } from "../utils/api-response.js";

export async function createBooking(req: Request, res: Response) {
  const hostId = req.hostId as number;

  const booking = await createBookingService(String(hostId), req.body);

  sendSuccess(res, booking, 201, "Booking created successfully");
}

export async function listBookings(req: Request, res: Response) {
  const hostId = req.hostId as number;
  const { status, from, to } = req.validatedQuery as ListBookingsQueryDto;

  const bookings = await listHostBooking(hostId, { status, from, to });

  sendSuccess(res, bookings);
}
