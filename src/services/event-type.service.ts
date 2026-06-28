import slug from "slug";
import { createEventTypeDto } from "../dtos/event-type.dto.js";
import {
  create,
  findActiveByHostIdAndEventSlug,
  getByHostId,
  getById,
  remove,
  slugExistsForHost,
} from "../repositories/event-type.repository.js";
import { conflict, forbidden, notFound } from "../utils/api-error.js";
import { getUserById } from "../repositories/user.repository.js";

export async function listEventTypeService(hostId: number) {
  const eventType = await getByHostId(hostId);

  return eventType;
}

export async function createEventTypeService(
  hostId: number,
  data: createEventTypeDto,
) {
  const slugPast = data.slug || slug(data.title, { lower: true });

  if (!slugPast) {
    throw conflict("Could not generate slug for the event type");
  }

  const isSlugTaken = await slugExistsForHost(hostId, slugPast);

  if (isSlugTaken) {
    throw conflict(
      "A event type with this slug already exists, please use differenct slug",
    );
  }

  const eventType = await create(hostId, { ...data, slug: slugPast });

  return eventType;
}

export async function removeEventType(hostId: number, id: number) {
  const eventType = await getById(hostId);

  if (!eventType) {
    throw notFound("Event type not found");
  }

  if (eventType.hostId !== hostId) {
    throw forbidden("You're not authorized to delete this event type");
  }

  return remove(id);
}

export async function getEventTypeByIdService(hostId: number, id: number) {
  const eventType = await getById(id);

  if (!eventType) {
    throw notFound("Event type not found");
  }

  if (eventType.hostId !== hostId) {
    throw forbidden("You're not authorized to view this event type");
  }

  return eventType;
}

export async function getEventTypeByPublicService(
  hostId: number,
  slug: string,
) {
  const eventType = await findActiveByHostIdAndEventSlug(hostId, slug);

  if (!eventType) {
    throw notFound("Event type not found");
  }

  const host = await getUserById(hostId);

  if (!host) {
    throw notFound("Host not found");
  }

  return {
    eventType: {
      id: eventType.id,
      title: eventType.title,
      description: eventType.description,
      durationMinutes: eventType.durationMinutes,
      locationType: eventType.locationType,
    },
    host: {
      name: host.name,
      email: host.email,
    },
  };
}
