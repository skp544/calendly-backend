import { prisma } from "../config/database.js";
import { CreateBookingDto } from "../dtos/booking.dto.js";
import { Slot } from "../../generated/prisma/client.js";
import { badRequest, notFound } from "../utils/api-error.js";

export async function createBookingService(
  userId: string,
  dto: CreateBookingDto,
) {
  const booking = await prisma.$transaction(async (tx) => {
    const slot = await tx.slot.findUnique({
      where: {
        id: dto.slotId,
      },
    });

    if (!slot) {
      throw notFound("Slot not found!");
    }

    if (slot.status !== "AVAILABLE") {
      throw badRequest("Slot is not available");
    }

    if (slot.startAt <= new Date()) {
      throw badRequest("Slot has already started");
    }

    const updated = await tx.slot.updateMany({
      where: {
        id: dto.slotId,
        status: "AVAILABLE",
      },
      data: {
        status: "BOOKED",
      },
    });

    if (updated.count !== 1) {
      throw badRequest("Slot is not available");
    }

    return tx.booking.create({
      data: {
        slotId: dto.slotId,
        inviteeEmail: dto.inviteeEmail,
        inviteeName: dto.inviteeName,
        inviteeNote: dto.inviteeNotes,
        status: "CONFIRMED",
        hostId: Number(userId),
        eventTypeId: slot.eventTypeId,
      },
      include: {
        slot: true,
      },
    });
  });

  return {
    booking: {
      id: booking.id,
      status: booking.status,
      startAt: booking.slot.startAt.toISOString(),
      endAt: booking.slot.endAt.toISOString(),
    },
  };
}

export async function createBookingServiceWithPessimisticLock(
  userId: string,
  dto: CreateBookingDto,
) {
  const booking = await prisma.$transaction(async (tx) => {
    // Locks the row for the duration of the transaction so no other
    // transaction can read/update it until this one commits or rolls back —
    // the concurrent-booking check below is safe without a conditional update.
    const [slot] = await tx.$queryRaw<Slot[]>`
      SELECT * FROM "slots" WHERE "id" = ${dto.slotId} FOR UPDATE
    `;

    if (!slot) {
      throw notFound("Slot not found!");
    }

    if (slot.status !== "AVAILABLE") {
      throw badRequest("Slot is not available");
    }

    if (slot.startAt <= new Date()) {
      throw badRequest("Slot has already started");
    }

    await tx.slot.update({
      where: {
        id: dto.slotId,
      },
      data: {
        status: "BOOKED",
      },
    });

    return tx.booking.create({
      data: {
        slotId: dto.slotId,
        inviteeEmail: dto.inviteeEmail,
        inviteeName: dto.inviteeName,
        inviteeNote: dto.inviteeNotes,
        status: "CONFIRMED",
        hostId: Number(userId),
        eventTypeId: slot.eventTypeId,
      },
      include: {
        slot: true,
      },
    });
  });

  return {
    booking: {
      id: booking.id,
      status: booking.status,
      startAt: booking.slot.startAt.toISOString(),
      endAt: booking.slot.endAt.toISOString(),
    },
  };
}
