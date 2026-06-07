import "dotenv/config";
import { app } from "./app.js";
import { PORT } from "./config/env.js";

export function startServer() {
  app.listen(PORT, () => {
    console.log(`[server]: Running on http://localhost:${PORT}`);
  });
}

startServer();
