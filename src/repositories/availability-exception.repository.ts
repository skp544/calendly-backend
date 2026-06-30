import { prisma } from "../config/database.js";
import {
  createAvailabilityExceptionDto,
  updateAvailabilityExceptionDto,
} from "../dtos/availability-exception.dto.js";

export async function create(
  userId: number,
  data: createAvailabilityExceptionDto,
) {
  const availabilityException = await prisma.availabilityException.create({
    data: {
      ...data,
      userId: userId,
    },
  });

  return availabilityException;
}

export async function update(id: number, data: updateAvailabilityExceptionDto) {
  const availabilityException = await prisma.availabilityException.update({
    where: { id },
    data,
  });

  return availabilityException;
}

export async function remove(id: number) {
  const availabilityException = await prisma.availabilityException.delete({
    where: {
      id,
    },
  });

  return availabilityException;
}

export async function getByUserIdAndId(userId: number, id: number) {
  const availabilityException = await prisma.availabilityException.findFirst({
    where: {
      userId: userId,
      id: id,
    },
  });

  return availabilityException;
}

export async function getByUserIdAndDate(userId: number, date: Date) {
  const availabilityException = await prisma.availabilityException.findFirst({
    where: {
      userId: userId,
      date: date,
    },
  });

  return availabilityException;
}

export async function getByUser(userId: number) {
  const availabilityExceptions = await prisma.availabilityException.findMany({
    where: {
      userId: userId,
    },
  });

  return availabilityExceptions;
}

export async function getByUserIdAndDateAndId(
  userId: number,
  date: Date,
  id: number,
) {
  const availabilityException = await prisma.availabilityException.findFirst({
    where: {
      userId: userId,
      date: date,
      id: id,
    },
  });

  return availabilityException;
}
