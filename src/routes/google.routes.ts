import { Router } from "express";
import { setupGoogleCallback } from "../controllers/google.controller.js";

const googleIntegrationRouter: Router = Router();

googleIntegrationRouter.get("/callback", setupGoogleCallback);

export default googleIntegrationRouter;
