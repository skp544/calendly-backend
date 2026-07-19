import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "../activities/index.js";
import { RegenerateHostsSlotInput } from "../../services/slot.service.js";

// create the proxy activities

const { regenerateHostSlotsActivity } = proxyActivities<typeof activities>({
  retry: { maximumAttempts: 3 },
  startToCloseTimeout: "10 minutes",
});

export async function regenerateHostSlotsWorkflow(
  input: RegenerateHostsSlotInput,
) {
  await regenerateHostSlotsActivity(input);
}
