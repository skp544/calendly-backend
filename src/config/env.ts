import "dotenv/config";

export const PORT = process.env.PORT || 3000;

export const DATABASE_URL = process.env.DATABASE_URL || "";

export const SLOT_GENERATION_DAYS =
  Number(process.env.SLOT_GENERATION_DAYS) || 30;

export const TEMPORAL_ADDRESS =
  process.env.TEMPORAL_ADDRESS || "localhost:7233";
export const TEMPORAL_NAMESPACE = process.env.TEMPORAL_NAMESPACE || "default";
export const TEMPORAL_TASK_QUEUE =
  process.env.TEMPORAL_TASK_QUEUE || "calendly-tasks";

// Static on/off switch for opting out of Temporal entirely (e.g. local dev
// without docker-compose up). Whether the server is actually reachable
// right now is checked separately via isTemporalHealthy() in
// src/config/temporal.ts.
export const TEMPORAL_ENABLED = process.env.TEMPORAL_ENABLED === "true";

export const SMTP_HOST = process.env.SMTP_HOST || "localhost";
export const SMTP_PORT = process.env.SMTP_PORT
  ? Number(process.env.SMTP_PORT)
  : undefined;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const EMAIL_FROM = process.env.EMAIL_FROM;

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
export const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "";

export const GOOGLE_SENDER_EMAIL =
  process.env.GOOGLE_SENDER_EMAIL || "info@example.com";

export const GOOGLE_CALENDER_ID = process.env.GOOGLE_CALENDER_ID || "primary";

export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
