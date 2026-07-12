import { prisma } from "../config/database.js";
import { SLOT_GENERATION_DAYS } from "../config/env.js";
import {
  findActiveRulesByUser,
  findExceptionsByUserInRange,
} from "../repositories/availability.repositroy.js";
import { findActiveEventTypesByHost } from "../repositories/event-type.repository.js";
import { findBookSlotsByHostInRange } from "../repositories/slot.repository.js";
import { getUserById } from "../repositories/user.repository.js";
import { DateTime } from "luxon";
import {
  applyExceptionsForDate,
  overlapsBooked,
  splitIntoSlots,
  TimeWindow,
  windowsForWeekdayRule,
} from "./slot-generation.service.js";
import e from "express";

export interface RegenerateHostsSlotInput {
  hostId: number;
  from?: string; // yyyy-mm-dd
  to?: string; // yyyy-mm-dd
}

export async function regenerateHostsSlot(input: RegenerateHostsSlotInput) {
  // TODO
  const host = await prisma.user.findUnique({ where: { id: input.hostId } });

  if (!host) return;

  const from = input.from
    ? DateTime.fromISO(input.from, { zone: "utc" }).startOf("day") //2026-01-05 -> 2026-01-05T00:00:00.000Z
    : DateTime.now().startOf("day");

  const to = input.to
    ? DateTime.fromISO(input.to, { zone: "utc" }).endOf("day") //2026-01-05 -> 2026-01-05T23:59:59.999Z
    : from.plus({ days: SLOT_GENERATION_DAYS }).endOf("day");

  const [rules, exceptions, eventTypes, bookedSlots] = await Promise.all([
    findActiveRulesByUser(input.hostId),
    findExceptionsByUserInRange(input.hostId, from.toJSDate(), to.toJSDate()),
    findActiveEventTypesByHost(input.hostId),
    findBookSlotsByHostInRange(input.hostId, from.toJSDate(), to.toJSDate()),
  ]);

  // convert booked slots into time windows => compatiible with luxon
  const bookedWindows: TimeWindow[] = bookedSlots.map((slot) => {
    return {
      start: DateTime.fromJSDate(slot.startAt, { zone: "utc" }),
      end: DateTime.fromJSDate(slot.endAt, { zone: "utc" }),
    };
  });

  for (const eventType of eventTypes) {
    const generatedValidSlotKeys = new Set<string>();

    for (let cursor = from; cursor <= to; cursor = cursor.plus({ days: 1 })) {
      const dateKey = cursor.toISODate(); // 2026-01-05

      const dayException = exceptions.filter(
        (ex) => DateTime.fromJSDate(ex.date).toISODate() === dateKey,
      );

      const dayExceptionsWithTimeZone = dayException.map((ex) => ({
        type: ex.type as
          | "ADD_AVAILABLE_WINDOW"
          | "BLOCK_FULL_DAY"
          | "BLOCK_PARTIAL",
        startTime: ex.startTime,
        endTime: ex.endTime,
        timezone: ex.timezone,
      }));

      let windows: TimeWindow[] = [];

      // convert rules in timewindow which is compatible of luxon
      for (const rule of rules) {
        windows.push(
          ...windowsForWeekdayRule(
            cursor,
            rule.weekday,
            rule.startTime,
            rule.endTime,
            rule.timezone,
          ),
        );
      }

      // apply exceptions to the windows
      windows = applyExceptionsForDate(
        cursor,
        windows,
        dayExceptionsWithTimeZone,
      );

      const slots = splitIntoSlots(
        windows,
        eventType.durationMinutes,
        eventType.bufferBeforeMinutes,
        eventType.bufferAfterMinutes,
      ).filter(
        (slot) =>
          slot.start > DateTime.utc() &&
          !overlapsBooked(
            slot,
            bookedWindows,
            eventType.bufferBeforeMinutes,
            eventType.bufferAfterMinutes,
          ),
      ); // slots filtered to exclude pasts slots and booked slots

      for (const slot of slots) {
        const startAt = slot.start.toUTC().toJSDate();
        const endAt = slot.end.toUTC().toJSDate();

        const key = `${eventType.id}|${startAt.toISOString()}|${endAt.toISOString()}`;
        await prisma.slot.upsert({
          where: {
            eventTypeId_startAt_endAt: {
              eventTypeId: eventType.id,
              startAt,
              endAt,
            },
          },
          create: {
            hostId: input.hostId,
            eventTypeId: eventType.id,
            startAt,
            endAt,
            status: "AVAILABLE",
          },
          update: {
            status: "AVAILABLE",
          },
        });
      }
    }

    const futureSlots = await prisma.slot.findMany({
      where: {
        eventTypeId: eventType.id,
        startAt: {
          gte: from.toJSDate(),
          lte: to.toJSDate(),
        },
        status: { in: ["AVAILABLE", "BLOCKED"] },
      },
    });

    for (const slot of futureSlots) {
      const key = `${eventType.id}|${slot.startAt.toISOString()}|${slot.endAt.toISOString()}`;
      if (!generatedValidSlotKeys.has(key)) {
        // slot is no longer valid
        await prisma.slot.update({
          where: { id: slot.id },
          data: { status: "BLOCKED" },
        });
      }
    }
  }
}

// invalid slots = all slots in db - new slots
