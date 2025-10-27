import { Request, Response } from "express";
import { AuthRequest } from "../middleware.js";
import { redis } from "@repo/shared-redis";


export const getBalance = async (req : AuthRequest, res: Response) => {

    const userId = req.userId ;

    if(!userId){
        return res
        .status(401)
        .json({ message: "Unauthorized", error: "User ID not found in token" });
    }

    const userData = await redis.hGetAll(userId);
    if (!userData || !userData.balance) {
        return res.status(404).json({ message: "User data not found" });
    }

    const userBalance = JSON.parse(userData.balance);
    res.json(userBalance);

}
