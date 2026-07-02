import {
  createAvailabilityRuleDto,
  updateAvailabilityRuleDto,
  createAvailabilityExceptionDto,
  updateAvailabilityExceptionDto,
} from "../dtos/availability.dto.js";
import {
  createRule,
  findRulesByUser,
  findRulesById,
  removeRule,
  updateRule,
  findExceptionByUser,
  findExceptionById,
  createException,
  updateException,
  removeException,
} from "../repositories/availability.repositroy.js";
import { forbidden, notFound } from "../utils/api-error.js";

export async function listRulesService(userId: number) {
  const rules = await findRulesByUser(userId);

  return rules;
}

export async function createRuleService(
  userId: number,
  data: createAvailabilityRuleDto,
) {
  const rule = await createRule(userId, data);

  return rule;
}

export async function removeRuleService(userId: number, ruleId: number) {
  const rule = await findRulesById(ruleId);

  if (!rule) {
    throw notFound("Availability rule not found");
  }

  if (rule.userId !== userId) {
    throw forbidden("You're not authorized to delete this availability rule");
  }

  return removeRule(ruleId);
}

export async function updateRuleService(
  ruleId: number,
  userId: number,
  data: updateAvailabilityRuleDto,
) {
  const rule = await findRulesById(ruleId);

  if (!rule) {
    throw notFound("Availability rule not found");
  }

  if (rule.userId !== userId) {
    throw forbidden("You're not authorized to update this availability rule");
  }

  return updateRule(ruleId, data);
}

export async function listExceptionsService(userId: number) {
  const exceptions = await findExceptionByUser(userId);

  return exceptions;
}

export async function createExceptionService(
  userId: number,
  data: createAvailabilityExceptionDto,
) {
  const exception = await createException(userId, data);

  return exception;
}

export async function removeExceptionService(
  userId: number,
  exceptionId: number,
) {
  const exception = await findExceptionById(exceptionId);

  if (!exception) {
    throw notFound("Availability exception not found");
  }

  if (exception.userId !== userId) {
    throw forbidden(
      "You're not authorized to delete this availability exception",
    );
  }

  return removeException(exceptionId);
}

export async function updateExceptionService(
  exceptionId: number,
  userId: number,
  data: updateAvailabilityExceptionDto,
) {
  const exception = await findExceptionById(exceptionId);

  if (!exception) {
    throw notFound("Availability exception not found");
  }

  if (exception.userId !== userId) {
    throw forbidden(
      "You're not authorized to update this availability exception",
    );
  }

  return updateException(exceptionId, data);
}
