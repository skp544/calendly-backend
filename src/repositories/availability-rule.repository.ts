import { prisma } from "../config/database.js";
import {
  createAvailabilityRuleDto,
  updateAvailabilityRuleDto,
} from "../dtos/availability-rule.dto.js";

export async function create(userId: number, data: createAvailabilityRuleDto) {
  const availabilityRule = await prisma.availabilityRule.create({
    data: {
      ...data,
      userId: userId,
    },
  });

  return availabilityRule;
}

export async function update(id: number, data: updateAvailabilityRuleDto) {
  const availabilityRule = await prisma.availabilityRule.update({
    where: { id },
    data,
  });

  return availabilityRule;
}

export async function remove(id: number) {
  const updatedAvailabilityRule = await prisma.availabilityRule.delete({
    where: { id },
  });

  return updatedAvailabilityRule;
}

export async function getByUser(userId: number) {
  const availabilityRules = await prisma.availabilityRule.findMany({
    where: {
      userId: userId,
    },
  });

  return availabilityRules;
}

export async function getByUserIdAndDate(userId: number, date: Date) {
  const availabilityRule = await prisma.availabilityRule.findFirst({
    where: {
      userId: userId,
      date: date,
    },
  });

  return availabilityRule;
}

export async function getByUserIdAndId(userId: number, id: number) {
  const availabilityRule = await prisma.availabilityRule.findFirst({
    where: {
      userId: userId,
      id: id,
    },
  });

  return availabilityRule;
}
