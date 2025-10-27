import { Router } from "express";
import { getCandlesforSymbol } from "../services/candleService.js";



export const candleRouter = Router();

candleRouter.get("/" , getCandlesforSymbol);