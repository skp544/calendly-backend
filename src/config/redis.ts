import { Redis } from "ioredis";
import { REDIS_URL } from "./env.js";

let client: Redis | null = null;

export function getRedisClient(): Redis {
  if (!client) {
    client = new Redis(REDIS_URL);
  }

  return client;
}

export async function disconnectRedis() {
  if (client) {
    await client.quit();
    client = null;
  }
}
