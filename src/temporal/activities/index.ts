import { sendBookingConfirmationEmail } from "../../mailer/booking.mailer.js";
import {
  RegenerateHostsSlotInput,
  regenerateHostsSlot as runSlotGeneration,
} from "../../services/slot.service.js";

export async function regenerateHostSlotsActivity(
  input: RegenerateHostsSlotInput,
) {
  await runSlotGeneration(input);
}

export async function sendBookingConfirmationEmailActivity(bookingId: number) {
  await sendBookingConfirmationEmail(bookingId);
}
