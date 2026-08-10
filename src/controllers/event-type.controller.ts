import { Request, Response } from "express";
import {
  createEventTypeService,
  getEventTypeByIdService,
  getEventTypeByPublicService,
  getPublicSlotsService,
  listEventTypeService,
  removeEventTypeService,
  updateEventTypeService,
} from "../services/event-type.service.js";
import { ListPublicSlotsQueryDto } from "../dtos/public-slot.dto.js";
import { sendSuccess } from "../utils/api-response.js";

export async function listEventTypes(req: Request, res: Response) {
  const hostId = req.hostId as number;

  const eventTypes = await listEventTypeService(hostId);

  sendSuccess(res, eventTypes);
}

export async function createEventType(req: Request, res: Response) {
  const hostId = req.hostId as number;

  const eventType = await createEventTypeService(hostId, req.body);

  sendSuccess(res, eventType, 201, "Event type created successfully");
}

export async function getEventTypeById(req: Request, res: Response) {
  const hostId = req.hostId as number;
  const { id } = req.params;

  const eventType = await getEventTypeByIdService(hostId, Number(id));

  sendSuccess(res, eventType);
}

export async function updateEventType(req: Request, res: Response) {
  const hostId = req.hostId as number;
  const { id } = req.params;

  const eventType = await updateEventTypeService(
    hostId,
    Number(id),
    req.body,
  );

  sendSuccess(res, eventType, 200, "Event type updated successfully");
}

export async function removeEventType(req: Request, res: Response) {
  const hostId = req.hostId as number;
  const { id } = req.params;

  const eventType = await removeEventTypeService(hostId, Number(id));

  sendSuccess(res, eventType, 200, "Event type removed successfully");
}

export async function getEventTypeByPublic(req: Request, res: Response) {
  const { hostId, slug } = req.params;

  const result = await getEventTypeByPublicService(Number(hostId), String(slug));

  sendSuccess(res, result);
}

export async function getPublicEventTypeSlots(req: Request, res: Response) {
  const { hostId, slug } = req.params;
  const { from, to } = req.validatedQuery as ListPublicSlotsQueryDto;

  const slots = await getPublicSlotsService(
    Number(hostId),
    String(slug),
    from,
    to,
  );

  sendSuccess(res, slots);
}
