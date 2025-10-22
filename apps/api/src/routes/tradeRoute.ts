import { Router } from 'express';
import { authMiddleware } from '../middleware.js';
import { createTrade, getClosedTrade, getOpenTrade } from '../services/tradeService.js';

const tradeRouter: Router = Router();

tradeRouter.post("/" , authMiddleware , createTrade);
tradeRouter.get("/open" , authMiddleware, getOpenTrade) ;
tradeRouter.get("/close" , authMiddleware, getClosedTrade);

export default tradeRouter; 