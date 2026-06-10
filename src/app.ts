import express, { Express } from "express";
import userRouter from "./routes/user.routes.js";

const app: Express = express();

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/users", userRouter);

export { app };
