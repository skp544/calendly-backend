import { Router } from "express";
import { createBooking } from "../controllers/booking.controller.js";
import { validate } from "../middlewares/validate.js";
import { requireUserId } from "../middlewares/require-user-id.js";
import { createBookSchema } from "../dtos/booking.dto.js";

const bookingRouter: Router = Router();

bookingRouter.use(requireUserId);

bookingRouter.post("/", validate(createBookSchema), createBooking);

export default bookingRouter;
