import { sendBookingConfirmationEmail } from "../../mailer/booking.mailer.js";
import {
  RegenerateHostsSlotInput,
  regenerateHostsSlot as runSlotGeneration,
} from "../../services/slot.service.js";
import { createGoogleCalenderEvent } from "../../services/google-calender.service.js";

export async function regenerateHostSlotsActivity(
  input: RegenerateHostsSlotInput,
) {
  await runSlotGeneration(input);
}

export async function sendBookingConfirmationEmailActivity(bookingId: number) {
  await sendBookingConfirmationEmail(bookingId);
}

export async function createGoogleCalenderEventActivity(bookingId: number) {
  await createGoogleCalenderEvent(bookingId);
}
