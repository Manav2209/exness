import { AuthRequest } from "../middleware.js";
import { Response } from "express";
import { redis } from "@repo/shared-redis";
import { Engine } from "../Engine/index.js";

interface ICreateTradeRequest {
    type: "market" | "limit";
    leverage: number;
    QTY: number;
    TP?: number;
    SL?: number;
    market: string;
    side: "buy" | "sell";
}

export interface IOpenOrderRes {
    orderId: string;
    type: "market" | "limit";
    side: "buy" | "sell";
    margin?: number;
    QTY: number;
    leverage?: number;
    openPrice: number;
    createdAt: string;
    TP?: number;
    SL?: number;
    market: string;
}

export interface IClosedOrderRes extends IOpenOrderRes {
    closePrice: number;
    pnl: number;
}

interface IGetOpenOrdersResponse {
    orders: IOpenOrderRes[];
}

interface IGetClosedOrdersResponse {
    orders: IClosedOrderRes[];
}

export const OPEN_ORDERS: IOpenOrderRes[] = [];


export const createTrade = async ( req : AuthRequest, res : Response) => { 

    const userId = req.userId;

    if (!userId) {
        return res
        .status(401)
        .json({ message: "Unauthorized", error: "User ID not found in token" });
    }

    const { type, leverage, QTY, TP, SL, market, side } =
    req.body as ICreateTradeRequest;

    if (!type || !market || !QTY) {
        return res.status(411).json({ message: "Incorrect inputs" });
    }

    const user = await redis.hGetAll(userId);

    if (!user || !user.balance) {
        return res
        .status(401)
        .json({ message: "User doesn't have enough balance" });
    }

    const data = {
        type,
        side,
        QTY,
        TP,
        SL,
        market,
        balance: user.balance,
        userId: userId,
        leverage,
    };
    
    //send data to trade Engine
    const orderId = await Engine.process(data);
    
    
    return res.status(200).json({ orderId });
    
}

export const getOpenTrade = async ( req : AuthRequest, res : Response) => {

    const userId = req.userId;

    if (!userId) {
        return res
        .status(401)
        .json({ message: "Unauthorized", error: "User ID not found in token" });
    }

    // fetch open trades from trade engine
    const orderIds = await  Engine.userOrderMap.get(userId);
    if (orderIds) {
        const orders = Array.from(orderIds).map((id) => Engine.OPEN_ORDERS.get(id));
        return res.status(200).json({ orders } as IGetOpenOrdersResponse);
    }

    res.status(200).json({ orders: [] } as IGetOpenOrdersResponse);

    
}
export const getClosedTrade = async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
  
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized", error: "User ID not found in token" });
    }
  
    // fetch closed trades from trade engine
    const ordersIds = Engine.userOrderMap.get(userId);
    console.log("OrderId", ordersIds);
  
    if (ordersIds && ordersIds.size > 0) {
      const orders = Array.from(ordersIds).map((id) =>
        Engine.CLOSED_ORDERS.get(id)
      );
  
      console.log("closed Order", orders);
  
      return res.status(200).json({
        orders,
      } as IGetClosedOrdersResponse);
    }
  
    // default fallback
    return res.status(200).json({
      orders: [],
    } as IGetClosedOrdersResponse);
  };