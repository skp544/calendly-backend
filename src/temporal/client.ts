import { TEMPORAL_ENABLED, TEMPORAL_TASK_QUEUE } from "../config/env.js";
import { getTemporalClient, isTemporalHealthy } from "../config/temporal.js";
import { RegenerateHostsSlotInput } from "../services/slot.service.js";

async function startWorkflow(
  workflowName: string,
  workflowId: string,
  args: unknown[],
) {
  if (!TEMPORAL_ENABLED) {
    console.warn("[temporal] Temporal is not enabled, skipping workflow start");
    return null;
  }

  if (!(await isTemporalHealthy())) {
    console.warn("[temporal] Temporal health check failed, skipping workflow start");
    return null;
  }

  try {
    const client = await getTemporalClient();

    // Only one regeneration should ever be in flight per workflowId at a time.
    // If a mutation lands while a previous regeneration for the same host is
    // still running, terminate it and start fresh so the latest state always
    // wins instead of the start silently failing or two runs racing on writes.
    const handle = await client.workflow.start(workflowName, {
      taskQueue: TEMPORAL_TASK_QUEUE,
      workflowId,
      workflowIdConflictPolicy: "TERMINATE_EXISTING",
      args,
    });

    return handle.workflowId;
  } catch (err) {
    console.error(
      `[temporal] Error starting workflow: ${workflowName} with id: ${workflowId}, error: ${err} `,
    );
    return null;
  }
}

export async function startRegenerateHostSlotWorkflow(
  input: RegenerateHostsSlotInput,
) {
  return startWorkflow(
    "regenerateHostSlotsWorkflow",
    `regenerate-host-slots-${input.hostId}`,
    [input],
  );
}

export async function startConfirmBookingWorkflow(bookingId: number) {
  return startWorkflow(
    "confirmBookingWorkflow",
    `confirm-booking-${bookingId}`,
    [bookingId],
  );
}

export async function startCancelBookingWorkflow(bookingId: number) {
  return startWorkflow(
    "cancelBookingWorkflow",
    `cancel-booking-${bookingId}`,
    [bookingId],
  );
}

// Not called from the booking flow — confirmBookingWorkflow already covers
// that. Kept for a future manual/admin re-sync trigger.
export async function startCreateGoogleCalenderEventWorkflow(
  bookingId: number,
) {
  return startWorkflow(
    "createGoogleCalenderEventWorkflow",
    `create-google-calender-event-${bookingId}`,
    [bookingId],
  );
}
