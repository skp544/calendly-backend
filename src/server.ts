import "dotenv/config";
import { app } from "./app.js";
import { PORT } from "./config/env.js";
import { connectDatabase } from "./config/database.js";

async function startServer() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`[server]: Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[server]: Failed to start server", err);
  process.exit(1);
});
