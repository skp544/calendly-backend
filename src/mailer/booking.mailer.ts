import { sendEmail } from "../config/nodemailer.js";
import { findBookingById } from "../repositories/booking.repository.js";

export async function sendBookingConfirmationEmail(bookingId: number) {
  const booking = await findBookingById(bookingId);

  if (!booking || booking.status !== "CONFIRMED") return;

  const when = booking.slot.startAt.toUTCString();

  await sendEmail(
    booking.inviteeEmail,
    `Booking Confirmation : ${bookingId}`,
    `<p>Dear ${booking.inviteeName},</p>
<p>Your booking for ${booking.eventType.title} on ${when} has been confirmed.</p>
${booking.meetLink ? `<p>Join via Google Meet: <a href="${booking.meetLink}">${booking.meetLink}</a></p>` : ""}
<p>Thank you for booking with us</p>
`,
  );
}

export async function sendBookingCancellationEmail(bookingId: number) {
  const booking = await findBookingById(bookingId);

  if (!booking || booking.status !== "CANCELLED") return;

  const when = booking.slot.startAt.toUTCString();

  await sendEmail(
    booking.inviteeEmail,
    `Booking Cancelled : ${bookingId}`,
    `<p>Dear ${booking.inviteeName},</p>
<p>Your booking for ${booking.eventType.title} on ${when} has been cancelled.</p>
<p>Feel free to book a new time whenever works for you.</p>
`,
  );
}
