import { Router } from "express";
import { authMiddleware } from "../middleware.js";
import { getAssets } from "../services/assetService.js";

export const assetRouter = Router();

assetRouter.get("/",  authMiddleware , getAssets);