import { prisma } from "../config/database.js";

export async function findBookSlotsByHostInRange(
  hostId: number,
  startDate: Date,
  endDate: Date,
) {
  return prisma.slot.findMany({
    where: {
      hostId,
      startAt: {
        gte: startDate,
        lte: endDate,
      },
      status: "BOOKED",
    },
  });
}

export async function upsertAvailableSlot(
  hostId: number,
  eventTypeId: number,
  startAt: Date,
  endAt: Date,
) {
  return prisma.slot.upsert({
    where: {
      eventTypeId_startAt_endAt: {
        eventTypeId,
        startAt,
        endAt,
      },
    },
    create: {
      hostId,
      eventTypeId,
      startAt,
      endAt,
      status: "AVAILABLE",
    },
    update: {
      status: "AVAILABLE",
    },
  });
}

export async function findSlotsByEventTypeInRangeAndStatus(
  eventTypeId: number,
  from: Date,
  to: Date,
  statuses: string[],
) {
  return prisma.slot.findMany({
    where: {
      eventTypeId,
      startAt: {
        gte: from,
        lte: to,
      },
      status: { in: statuses },
    },
  });
}

export async function updateSlotStatus(id: string, status: string) {
  return prisma.slot.update({
    where: { id },
    data: { status },
  });
}
