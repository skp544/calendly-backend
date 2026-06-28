import { Request, Response } from "express";
import {
  createEventTypeService,
  getEventTypeByIdService,
  getEventTypeByPublicService,
  listEventTypeService,
  removeEventTypeService,
  updateEventTypeService,
} from "../services/event-type.service.js";
import { sendSuccess } from "../utils/api-response.js";

export async function listEventTypes(req: Request, res: Response) {
  const { hostId } = req.params;

  const eventTypes = await listEventTypeService(Number(hostId));

  sendSuccess(res, eventTypes);
}

export async function createEventType(req: Request, res: Response) {
  const { hostId } = req.params;

  const eventType = await createEventTypeService(Number(hostId), req.body);

  sendSuccess(res, eventType, 201, "Event type created successfully");
}

export async function getEventTypeById(req: Request, res: Response) {
  const { hostId, id } = req.params;

  const eventType = await getEventTypeByIdService(Number(hostId), Number(id));

  sendSuccess(res, eventType);
}

export async function updateEventType(req: Request, res: Response) {
  const { hostId, id } = req.params;

  const eventType = await updateEventTypeService(
    Number(hostId),
    Number(id),
    req.body,
  );

  sendSuccess(res, eventType, 200, "Event type updated successfully");
}

export async function removeEventType(req: Request, res: Response) {
  const { hostId, id } = req.params;

  const eventType = await removeEventTypeService(Number(hostId), Number(id));

  sendSuccess(res, eventType, 200, "Event type removed successfully");
}

export async function getEventTypeByPublic(req: Request, res: Response) {
  const { hostId, slug } = req.params;

  const result = await getEventTypeByPublicService(Number(hostId), String(slug));

  sendSuccess(res, result);
}
