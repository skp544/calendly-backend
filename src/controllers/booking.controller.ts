import { Request, Response } from "express";
import {
  cancelBookingService,
  createBookingService,
  listHostBooking,
} from "../services/booking.service.js";
import { ListBookingsQueryDto } from "../dtos/booking.dto.js";
import { sendSuccess } from "../utils/api-response.js";
import { badRequest } from "../utils/api-error.js";

export async function createBooking(req: Request, res: Response) {
  const hostId = req.hostId as number;

  const booking = await createBookingService(String(hostId), req.body);

  sendSuccess(res, booking, 201, "Booking created successfully");
}

export async function cancelBooking(req: Request, res: Response) {
  const hostId = req.hostId as number;
  const bookingId = Number(req.params.id);

  if (isNaN(bookingId)) {
    throw badRequest("Booking id must be a valid number");
  }

  const booking = await cancelBookingService(hostId, bookingId);

  sendSuccess(res, booking, 200, "Booking cancelled successfully");
}

export async function listBookings(req: Request, res: Response) {
  const hostId = req.hostId as number;
  const { status, from, to } = req.validatedQuery as ListBookingsQueryDto;

  const bookings = await listHostBooking(hostId, { status, from, to });

  sendSuccess(res, bookings);
}
