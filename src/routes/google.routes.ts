import { Router } from "express";
import {
  getGoogleSetupUrl,
  setupGoogleCallback,
} from "../controllers/google.controller.js";

const googleIntegrationRouter: Router = Router();

googleIntegrationRouter.get("/setup", getGoogleSetupUrl);
googleIntegrationRouter.get("/callback", setupGoogleCallback);

export default googleIntegrationRouter;
