import { Router } from "express";
import {
  createEventType,
  getEventTypeById,
  listEventTypes,
  removeEventType,
  updateEventType,
} from "../controllers/event-type.controller.js";
import { validate } from "../middlewares/validate.js";
import { requireUserId } from "../middlewares/require-user-id.js";
import {
  createEventTypeSchema,
  updateEventTypeSchema,
} from "../dtos/event-type.dto.js";

const eventTypeRouter: Router = Router();

eventTypeRouter.use(requireUserId);

eventTypeRouter.get("/", listEventTypes);

eventTypeRouter.get("/:id", getEventTypeById);

eventTypeRouter.post("/", validate(createEventTypeSchema), createEventType);

eventTypeRouter.patch("/:id", validate(updateEventTypeSchema), updateEventType);

eventTypeRouter.delete("/:id", removeEventType);

export default eventTypeRouter;
