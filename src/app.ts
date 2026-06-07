import express, { Express } from "express";

const app: Express = express();

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export { app };
