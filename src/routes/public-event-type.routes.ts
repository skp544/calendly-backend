import { Router } from "express";
import {
  getEventTypeByPublic,
  getPublicEventTypeSlots,
} from "../controllers/event-type.controller.js";
import { validateQuery } from "../middlewares/validate.js";
import { listPublicSlotsQuerySchema } from "../dtos/public-slot.dto.js";

const publicEventTypeRouter: Router = Router();

publicEventTypeRouter.get("/:hostId/:slug", getEventTypeByPublic);
publicEventTypeRouter.get(
  "/:hostId/:slug/slots",
  validateQuery(listPublicSlotsQuerySchema),
  getPublicEventTypeSlots,
);

export default publicEventTypeRouter;
