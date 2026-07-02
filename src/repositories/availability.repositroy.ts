import { prisma } from "../config/database.js";
import {
  createAvailabilityRuleDto,
  updateAvailabilityRuleDto,
  createAvailabilityExceptionDto,
  updateAvailabilityExceptionDto,
} from "../dtos/availability.dto.js";

// --- Availability Rules ---

export async function findRulesByUser(
  userId: number,
  isActive?: boolean,
) {
  return prisma.availabilityRule.findMany({
    where: { userId, ...(isActive !== undefined && { isActive }) },
    orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
  });
}

export async function findRulesById(id: number) {
  return prisma.availabilityRule.findUnique({ where: { id } });
}

export async function createRule(
  userId: number,
  data: createAvailabilityRuleDto,
) {
  return prisma.availabilityRule.create({ data: { userId, ...data } });
}

export async function updateRule(id: number, data: updateAvailabilityRuleDto) {
  return prisma.availabilityRule.update({ where: { id }, data });
}

export async function removeRule(id: number) {
  return prisma.availabilityRule.delete({ where: { id } });
}

// --- Availability Exceptions ---

export async function findExceptionByUser(userId: number) {
  return prisma.availabilityException.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  });
}

export async function findExceptionById(id: number) {
  return prisma.availabilityException.findUnique({ where: { id } });
}

export async function createException(
  userId: number,
  data: createAvailabilityExceptionDto,
) {
  return prisma.availabilityException.create({
    data: { userId, ...data, date: new Date(data.date) },
  });
}

export async function updateException(
  id: number,
  data: updateAvailabilityExceptionDto,
) {
  return prisma.availabilityException.update({
    where: { id },
    data: { ...data, ...(data.date && { date: new Date(data.date) }) },
  });
}

export async function removeException(id: number) {
  return prisma.availabilityException.delete({ where: { id } });
}

export async function findExceptionsByUserInRange(
  userId: number,
  from: Date,
  to: Date,
) {
  return prisma.availabilityException.findMany({
    where: {
      userId,
      date: { gte: from, lte: to },
    },
    orderBy: { date: "asc" },
  });
}
