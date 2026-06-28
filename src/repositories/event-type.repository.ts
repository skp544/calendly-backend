import { prisma } from "../config/database.js";
import {
  createEventTypeDto,
  updateEventTypeDto,
} from "../dtos/event-type.dto.js";

export async function getByHostId(hostId: number) {
  const eventTypes = await prisma.eventType.findMany({
    where: {
      hostId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return eventTypes;
}

export async function getById(id: number) {
  const eventType = await prisma.eventType.findUnique({ where: { id } });

  return eventType;
}

export async function create(
  hostId: number,
  data: createEventTypeDto & { slug: string },
) {
  const eventType = await prisma.eventType.create({
    data: {
      hostId,
      ...data,
    },
  });

  return eventType;
}

export async function update(id: number, data: updateEventTypeDto) {
  const eventType = await prisma.eventType.update({
    where: { id },
    data,
  });

  return eventType;
}

export async function remove(id: number) {
  const eventType = await prisma.eventType.delete({
    where: {
      id,
    },
  });

  return eventType;
}

export async function findByHostAndSlug(hostId: number, slug: string) {
  const eventType = await prisma.eventType.findFirst({
    where: {
      hostId,
      slug,
    },
  });

  return eventType;
}

export async function slugExistsForHost(hostId: number, slug: string) {
  const eventType = await prisma.eventType.findFirst({
    where: {
      hostId,
      slug,
    },
  });

  return eventType !== null;
}

export async function findActiveByHostIdAndEventSlug(
  hostId: number,
  slug: string,
) {
  const eventType = await prisma.eventType.findFirst({
    where: {
      hostId,
      slug,
      isActive: true,
    },
  });

  return eventType;
}
