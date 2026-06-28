import { Router } from "express";
import { getEventTypeByPublic } from "../controllers/event-type.controller.js";

const publicEventTypeRouter: Router = Router();

publicEventTypeRouter.get("/:hostId/:slug", getEventTypeByPublic);

export default publicEventTypeRouter;
