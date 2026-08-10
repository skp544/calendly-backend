import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "../activities/index.js";

// create the proxy activities

const {
  createGoogleCalenderEventActivity,
  sendBookingConfirmationEmailActivity,
  sendBookingCancellationEmailActivity,
} = proxyActivities<typeof activities>({
  retry: { maximumAttempts: 3 },
  startToCloseTimeout: "10 minutes",
});

// Runs the calendar event activity before the email activity (rather than
// starting both independently) so the confirmation email can reliably read
// back a persisted meetLink — the two were previously separate workflows
// racing on the same booking row.
export async function confirmBookingWorkflow(bookingId: number) {
  await createGoogleCalenderEventActivity(bookingId);
  await sendBookingConfirmationEmailActivity(bookingId);
}

export async function cancelBookingWorkflow(bookingId: number) {
  await sendBookingCancellationEmailActivity(bookingId);
}
