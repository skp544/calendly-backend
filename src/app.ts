import express, { Express, Request, Response, NextFunction } from "express";
import userRouter from "./routes/user.routes.js";
import eventTypeRouter from "./routes/event-type.routes.js";
import publicEventTypeRouter from "./routes/public-event-type.routes.js";
import availabilityRouter from "./routes/availability.routes.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { routeNotFound } from "./middlewares/route-not-found.js";

const app: Express = express();

function logRequest(req: Request, _res: Response, next: NextFunction) {
  console.log(`${req.method} ${req.url}`);
  next();
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// custom routes
app.get("/health", logRequest, (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// app router
app.use("/api/v1/users", userRouter);
app.use("/api/v1/event-types", eventTypeRouter);
app.use("/api/v1/public/event-types", publicEventTypeRouter);
app.use("/api/v1/availability", availabilityRouter);

app.use(routeNotFound);
app.use(errorHandler);

export { app };
