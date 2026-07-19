import { prisma } from "../config/database.js";
import { CreateBookingDto } from "../dtos/booking.dto.js";
import { badRequest, notFound } from "../utils/api-error.js";
import {
  createBookingRecord,
  findSlotById,
  findSlotByIdForUpdate,
  markSlotAsBooked,
  markSlotAsBookedIfAvailable,
} from "../repositories/booking.repository.js";

export async function createBookingService(
  userId: string,
  dto: CreateBookingDto,
) {
  const booking = await prisma.$transaction(async (tx) => {
    const slot = await findSlotById(tx, dto.slotId);

    if (!slot) {
      throw notFound("Slot not found!");
    }

    if (slot.status !== "AVAILABLE") {
      throw badRequest("Slot is not available");
    }

    if (slot.startAt <= new Date()) {
      throw badRequest("Slot has already started");
    }

    const updated = await markSlotAsBookedIfAvailable(tx, dto.slotId);

    if (updated.count !== 1) {
      throw badRequest("Slot is not available");
    }

    return createBookingRecord(tx, {
      slotId: dto.slotId,
      inviteeEmail: dto.inviteeEmail,
      inviteeName: dto.inviteeName,
      inviteeNote: dto.inviteeNotes,
      hostId: Number(userId),
      eventTypeId: slot.eventTypeId,
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
    const slot = await findSlotByIdForUpdate(tx, dto.slotId);

    if (!slot) {
      throw notFound("Slot not found!");
    }

    if (slot.status !== "AVAILABLE") {
      throw badRequest("Slot is not available");
    }

    if (slot.startAt <= new Date()) {
      throw badRequest("Slot has already started");
    }

    await markSlotAsBooked(tx, dto.slotId);

    return createBookingRecord(tx, {
      slotId: dto.slotId,
      inviteeEmail: dto.inviteeEmail,
      inviteeName: dto.inviteeName,
      inviteeNote: dto.inviteeNotes,
      hostId: Number(userId),
      eventTypeId: slot.eventTypeId,
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
