import { Prisma, Slot } from "../../generated/prisma/client.js";

type Tx = Prisma.TransactionClient;

export async function findSlotById(tx: Tx, slotId: string) {
  return tx.slot.findUnique({
    where: {
      id: slotId,
    },
  });
}

export async function findSlotByIdForUpdate(tx: Tx, slotId: string) {
  const [slot] = await tx.$queryRaw<Slot[]>`
    SELECT * FROM "slots" WHERE "id" = ${slotId} FOR UPDATE
  `;

  return slot ?? null;
}

export async function markSlotAsBookedIfAvailable(tx: Tx, slotId: string) {
  return tx.slot.updateMany({
    where: {
      id: slotId,
      status: "AVAILABLE",
    },
    data: {
      status: "BOOKED",
    },
  });
}

export async function markSlotAsBooked(tx: Tx, slotId: string) {
  return tx.slot.update({
    where: {
      id: slotId,
    },
    data: {
      status: "BOOKED",
    },
  });
}

export interface CreateBookingRecordInput {
  slotId: string;
  inviteeEmail: string;
  inviteeName: string;
  inviteeNote?: string;
  hostId: number;
  eventTypeId: number;
}

export async function createBookingRecord(
  tx: Tx,
  data: CreateBookingRecordInput,
) {
  return tx.booking.create({
    data: {
      ...data,
      status: "CONFIRMED",
    },
    include: {
      slot: true,
    },
  });
}
