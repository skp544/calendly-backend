import { Router } from "express";
import {
  createBooking,
  listBookings,
} from "../controllers/booking.controller.js";
import { validate, validateQuery } from "../middlewares/validate.js";
import { requireUserId } from "../middlewares/require-user-id.js";
import {
  createBookSchema,
  listBookingsQuerySchema,
} from "../dtos/booking.dto.js";

const bookingRouter: Router = Router();

bookingRouter.use(requireUserId);

bookingRouter.get("/", validateQuery(listBookingsQuerySchema), listBookings);

bookingRouter.post("/", validate(createBookSchema), createBooking);

export default bookingRouter;
