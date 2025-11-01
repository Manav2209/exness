import { Router } from "express";
import { getCandlesforSymbol } from "../services/candleService.js";
import { pool } from "@repo/timeseries-db";
import dotenv from "dotenv";
dotenv.config();

export const candleRouter = Router();

candleRouter.get("/" , getCandlesforSymbol);
candleRouter.get("/test-db", async (req, res) => {
    const result = await pool.query("SELECT current_database(), current_schema()");
    res.json(result.rows);
  });
  