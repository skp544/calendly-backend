import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "../activities/index.js";

// create the proxy activities

const { createGoogleCalenderEventActivity } = proxyActivities<
  typeof activities
>({
  retry: { maximumAttempts: 3 },
  startToCloseTimeout: "10 minutes",
});

export async function createGoogleCalenderEventWorkflow(bookingId: number) {
  await createGoogleCalenderEventActivity(bookingId);
}
