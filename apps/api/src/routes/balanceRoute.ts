

import { Router } from 'express';
import { authMiddleware } from '../middleware.js';
import { getBalance } from '../services/balanceService.js';

export const balanceRouter = Router();

balanceRouter.get("/" , authMiddleware , getBalance); 