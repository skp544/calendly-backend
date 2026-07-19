import { NativeConnection, Worker } from "@temporalio/worker";
import {
  TEMPORAL_ADDRESS,
  TEMPORAL_NAMESPACE,
  TEMPORAL_TASK_QUEUE,
} from "../config/env.js";
import * as activities from "./activities/index.js";
import { fileURLToPath } from "node:url";

async function run() {
  const connection = await NativeConnection.connect({
    address: TEMPORAL_ADDRESS,
  });

  const worker = await Worker.create({
    connection,
    namespace: TEMPORAL_NAMESPACE,
    taskQueue: TEMPORAL_TASK_QUEUE,
    activities,
    // workflowsPath: require.resolve("./workflows/index.js"),
    workflowsPath: fileURLToPath(
      new URL("./workflows/index.ts", import.meta.url),
    ),
  });

  await worker.run();
}

run().catch((err) => {
  console.error("[temporal] Error starting the worker", err);
  process.exit(1);
});
