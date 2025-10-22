import { NextFunction , Request , Response } from "express";
import jwt from "jsonwebtoken"; 

export interface AuthRequest extends Request {
    userId?: string;
  }
  
export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
      }
  
      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Invalid token format" });
      }
  
      const secret = process.env.JSON_WEB_TOKEN_SECRET!;
      const decoded = jwt.verify(token, secret) as { userId: string };
  
      req.userId = decoded.userId;
      next();
    } catch (error) {
      console.error("Auth error:", error);
      return res.status(401).json({ message: "Unauthorized", error: error });
    }
  };