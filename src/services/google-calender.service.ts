import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";
import {
  GOOGLE_CALENDER_ID,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_SENDER_EMAIL,
  REFRESH_TOKEN,
} from "../config/env.js";
import {
  findBookingById,
  updateBookingCalendarDetails,
} from "../repositories/booking.repository.js";
import { notFound } from "../utils/api-error.js";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
];

export function isProjectCalenderConfigured(): boolean {
  return Boolean(
    GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REDIRECT_URI,
  );
}

export function getGoogleAuthClient(): OAuth2Client {
  if (!isProjectCalenderConfigured()) {
    throw new Error("Google calender is not configured");
  }

  const googleAuthClient = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI,
  );

  return googleAuthClient;
}

export function getSetupAuthUrl() {
  const client = getGoogleAuthClient();

  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state: "setup",
  });
}

export async function exchangeSetupCode(code: string) {
  const client = getGoogleAuthClient();

  const { tokens } = await client.getToken(code);

  if (!tokens.refresh_token) {
    throw new Error("No refresh token found");
  }

  client.setCredentials(tokens);

  const oauth2 = google.oauth2({
    version: "v2",
    auth: client,
  }); // using this auth2 object we can get the user's info

  const { data } = await oauth2.userinfo.get();

  // instead of returning it should be store in the redis
  return {
    refreshToken: tokens.refresh_token,
    email: data.email ?? GOOGLE_SENDER_EMAIL,
  };
}

export function getGoogleCalenderClient() {
  if (!isProjectCalenderConfigured()) {
    throw new Error("Google calender project is not configured");
  }

  const client = getGoogleAuthClient();

  client.setCredentials({ refresh_token: REFRESH_TOKEN });

  return client;
}

// asynchrnously temporal workflow
export async function createGoogleCalenderEvent(bookingId: number) {
  const booking = await findBookingById(bookingId);

  if (!booking || booking.status !== "CONFIRMED") {
    throw notFound("Booking not found or not confirmed");
  }

  const client = getGoogleCalenderClient();

  const calender = google.calendar({
    version: "v3",
    auth: client,
  });

  const event = await calender.events.insert({
    calendarId: GOOGLE_CALENDER_ID,
    conferenceDataVersion: 1,
    sendUpdates: "all",
    requestBody: {
      summary: `${booking.eventType.title} with ${booking.host.name} is confirmed`,
      description: [
        booking.eventType.description,
        booking.inviteeNote ? `Invitee note:  ${booking.inviteeNote}` : "",
      ].join(`\n\n`),
      start: {
        dateTime: booking.slot.startAt.toISOString(),
        timeZone: booking.host.timezone,
      },
      end: {
        dateTime: booking.slot.endAt.toISOString(),
        timeZone: booking.host.timezone,
      },
      attendees: [
        { email: booking.host.email, displayName: booking.host.name },
        { email: booking.inviteeEmail, displayName: booking.inviteeName },
      ],
      conferenceData: {
        createRequest: {
          requestId: booking.id.toString(),
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    },
  });

  const meetLink =
    event.data.conferenceData?.entryPoints?.find(
      (e) => e.entryPointType === "video",
    )?.uri ??
    event.data.hangoutLink ??
    null;

  if (!event.data.id || !meetLink) {
    throw new Error("Failed to create google calender event");
  }

  await updateBookingCalendarDetails(booking.id, {
    meetLink,
    calendarEventId: event.data.id,
  });

  return {
    meetLink,
    calendarEventId: event.data.id,
  };
}
