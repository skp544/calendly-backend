import { prisma } from "../config/database.js";
import { CreateBookingDto } from "../dtos/booking.dto.js";
import { badRequest, notFound } from "../utils/api-error.js";
import {
  cancelBookingRecord,
  createBookingRecord,
  findBookingById,
  findBookingsByHost,
  findSlotById,
  findSlotByIdForUpdate,
  markSlotAsBooked,
  markSlotAsBookedIfAvailable,
} from "../repositories/booking.repository.js";
import {
  startCancelBookingWorkflow,
  startConfirmBookingWorkflow,
  startRegenerateHostSlotWorkflow,
} from "../temporal/client.js";

interface BookingWithSlot {
  id: number;
  status: string;
  slot: {
    startAt: Date;
    endAt: Date;
  };
}

function formatBookingResponse(booking: BookingWithSlot) {
  return {
    booking: {
      id: booking.id,
      status: booking.status,
      startAt: booking.slot.startAt.toISOString(),
      endAt: booking.slot.endAt.toISOString(),
    },
  };
}

async function triggerSlotRegeneration(hostId: number, slotStartAt: Date) {
  const date = slotStartAt.toISOString().split("T")[0];

  await startRegenerateHostSlotWorkflow({
    hostId,
    from: date,
    to: date,
  });

  console.log(
    "[booking] Triggered slot regeneration workflow for hostId:",
    hostId,
    "on date:",
    date,
  );
}

async function postBookingActions(hostId: number, booking: BookingWithSlot) {
  await triggerSlotRegeneration(hostId, booking.slot.startAt);

  await startConfirmBookingWorkflow(booking.id);
}

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

  await postBookingActions(Number(userId), booking);

  return formatBookingResponse(booking);
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

  await postBookingActions(Number(userId), booking);

  return formatBookingResponse(booking);
}

export async function cancelBookingService(hostId: number, bookingId: number) {
  const booking = await findBookingById(bookingId);

  if (!booking || booking.hostId !== hostId) {
    throw notFound("Booking not found!");
  }

  if (booking.status === "CANCELLED") {
    throw badRequest("Booking is already cancelled");
  }

  const cancelled = await cancelBookingRecord(bookingId, booking.slotId);

  // Neighboring slots may have been BLOCKED by this booking's buffer window —
  // regenerate so they become bookable again now that it's cancelled.
  await triggerSlotRegeneration(hostId, cancelled.slot.startAt);

  await startCancelBookingWorkflow(bookingId);

  return formatBookingResponse(cancelled);
}

export interface ListHostBookingFilters {
  status?: string;
  from?: string; // yyyy-mm-dd
  to?: string; // yyyy-mm-dd
}

export async function listHostBooking(
  hostId: number,
  filters: ListHostBookingFilters = {},
) {
  const bookings = await findBookingsByHost(hostId, {
    status: filters.status,
    from: filters.from ? new Date(`${filters.from}T00:00:00.000Z`) : undefined,
    // A "yyyy-mm-dd" `to` means "through the end of that day" — parsing it
    // bare would land on UTC midnight and exclude every slot on that date.
    to: filters.to ? new Date(`${filters.to}T23:59:59.999Z`) : undefined,
  });

  return bookings.map((booking) => ({
    id: booking.id,
    status: booking.status,
    inviteeName: booking.inviteeName,
    inviteeEmail: booking.inviteeEmail,
    inviteeNote: booking.inviteeNote,
    cancelledAt: booking.cancelledAt,
    startAt: booking.slot.startAt.toISOString(),
    endAt: booking.slot.endAt.toISOString(),
    eventType: booking.eventType,
  }));
}
