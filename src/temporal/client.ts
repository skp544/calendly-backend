import { TEMPORAL_ENABLED, TEMPORAL_TASK_QUEUE } from "../config/env.js";
import { getTemporalClient } from "../config/temporal.js";
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

  try {
    const client = await Promise.race([
      getTemporalClient(),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Temporal client connection timeout")),
          5000,
        ),
      ),
    ]);

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

export async function startSendBookingConfirmationEmailWorkflow(
  bookingId: number,
) {
  return startWorkflow(
    "sendBookingConfirmationEmailWorkflow",
    `send-booking-confirmation-email-${bookingId}`,
    [bookingId],
  );
}

export async function startCreateGoogleCalenderEventWorkflow(
  bookingId: number,
) {
  return startWorkflow(
    "createGoogleCalenderEventWorkflow",
    `create-google-calender-event-${bookingId}`,
    [bookingId],
  );
}
