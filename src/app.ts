import express, { Express, Request, Response, NextFunction } from "express";
import userRouter from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/error-handler.js";

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

app.use(errorHandler);

export { app };
