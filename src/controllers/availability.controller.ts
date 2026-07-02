import { Request, Response } from "express";
import {
  listRulesService,
  createRuleService,
  updateRuleService,
  removeRuleService,
  listExceptionsService,
  createExceptionService,
  updateExceptionService,
  removeExceptionService,
} from "../services/availability.service.js";
import { sendSuccess } from "../utils/api-response.js";

export async function listRules(req: Request, res: Response) {
  const hostId = req.hostId as number;

  const rules = await listRulesService(hostId);

  sendSuccess(res, rules);
}

export async function createRule(req: Request, res: Response) {
  const hostId = req.hostId as number;

  const rule = await createRuleService(hostId, req.body);

  sendSuccess(res, rule, 201, "Availability rule created successfully");
}

export async function updateRule(req: Request, res: Response) {
  const hostId = req.hostId as number;
  const { id } = req.params;

  const rule = await updateRuleService(Number(id), hostId, req.body);

  sendSuccess(res, rule, 200, "Availability rule updated successfully");
}

export async function removeRule(req: Request, res: Response) {
  const hostId = req.hostId as number;
  const { id } = req.params;

  const rule = await removeRuleService(hostId, Number(id));

  sendSuccess(res, rule, 200, "Availability rule removed successfully");
}

export async function listExceptions(req: Request, res: Response) {
  const hostId = req.hostId as number;

  const exceptions = await listExceptionsService(hostId);

  sendSuccess(res, exceptions);
}

export async function createException(req: Request, res: Response) {
  const hostId = req.hostId as number;

  const exception = await createExceptionService(hostId, req.body);

  sendSuccess(res, exception, 201, "Availability exception created successfully");
}

export async function updateException(req: Request, res: Response) {
  const hostId = req.hostId as number;
  const { id } = req.params;

  const exception = await updateExceptionService(Number(id), hostId, req.body);

  sendSuccess(res, exception, 200, "Availability exception updated successfully");
}

export async function removeException(req: Request, res: Response) {
  const hostId = req.hostId as number;
  const { id } = req.params;

  const exception = await removeExceptionService(hostId, Number(id));

  sendSuccess(res, exception, 200, "Availability exception removed successfully");
}
