import { Router } from "express";
import {
  listRules,
  createRule,
  updateRule,
  removeRule,
  listExceptions,
  createException,
  updateException,
  removeException,
} from "../controllers/availability.controller.js";
import { validate } from "../middlewares/validate.js";
import { requireUserId } from "../middlewares/require-user-id.js";
import {
  createAvailabilityRuleSchema,
  updateAvailabilityRuleSchema,
  createAvailabilityExceptionSchema,
  updateAvailabilityExceptionSchema,
} from "../dtos/availability.dto.js";

const availabilityRouter: Router = Router();

availabilityRouter.use(requireUserId);

availabilityRouter.get("/rules", listRules);
availabilityRouter.post("/rules", validate(createAvailabilityRuleSchema), createRule);
availabilityRouter.patch("/rules/:id", validate(updateAvailabilityRuleSchema), updateRule);
availabilityRouter.delete("/rules/:id", removeRule);

availabilityRouter.get("/exceptions", listExceptions);
availabilityRouter.post("/exceptions", validate(createAvailabilityExceptionSchema), createException);
availabilityRouter.patch("/exceptions/:id", validate(updateAvailabilityExceptionSchema), updateException);
availabilityRouter.delete("/exceptions/:id", removeException);

export default availabilityRouter;
