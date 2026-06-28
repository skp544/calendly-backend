import { Router } from "express";
import {
  createEventType,
  getEventTypeById,
  listEventTypes,
  removeEventType,
  updateEventType,
} from "../controllers/event-type.controller.js";
import { validate } from "../middlewares/validate.js";
import {
  createEventTypeSchema,
  updateEventTypeSchema,
} from "../dtos/event-type.dto.js";

const eventTypeRouter: Router = Router();

eventTypeRouter.get("/host/:hostId", listEventTypes);

eventTypeRouter.get("/host/:hostId/:id", getEventTypeById);

eventTypeRouter.post(
  "/host/:hostId",
  validate(createEventTypeSchema),
  createEventType,
);

eventTypeRouter.patch(
  "/host/:hostId/:id",
  validate(updateEventTypeSchema),
  updateEventType,
);

eventTypeRouter.delete("/host/:hostId/:id", removeEventType);

export default eventTypeRouter;
