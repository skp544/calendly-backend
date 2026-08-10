import { Connection, Client } from "@temporalio/client";
import { TEMPORAL_ADDRESS, TEMPORAL_NAMESPACE } from "./env.js";

let client: Client | null = null;

export async function getTemporalClient() {
  if (client) return client;

  const connection = await Connection.connect({
    address: TEMPORAL_ADDRESS,
  });

  client = new Client({ connection, namespace: TEMPORAL_NAMESPACE });

  return client;
}

export async function disconnectTemporal() {
  if (client) {
    await client.connection.close();
    client = null;
  }
}

// Live check, not a cached/memoized one — `Connection.ensureConnected`
// memoizes its result after the first call, so it can't tell us the server
// went down later. Calling getSystemInfo directly makes a fresh gRPC round
// trip every time.
export async function isTemporalHealthy(timeoutMs = 3000): Promise<boolean> {
  try {
    const connectedClient = await Promise.race([
      getTemporalClient(),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Temporal health check timed out")),
          timeoutMs,
        ),
      ),
    ]);

    await connectedClient.connection.workflowService.getSystemInfo({});
    return true;
  } catch (err) {
    console.error("[temporal] Health check failed:", err);
    return false;
  }
}
