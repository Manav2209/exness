import { Request, Response } from "express";
import  { prismaClient } from "@repo/db/client";
import { redis } from "@repo/shared-redis";


export const getAssets = async (req : Request, res : Response) => {

    const data = await prismaClient.asset.findMany();

    if (!data || data.length === 0) {
        return res.status(200).json({ assets: [] });
    }

    const assets = await Promise.all(
        data.map(async (asset) => {
            const tradeData = await redis.get(`trade:${asset.symbol.toLowerCase()}`);
            if (!tradeData) {
                return;
            }
        
            const { buy, sell } = JSON.parse(tradeData);
        
            return {
                name: asset.name,
                symbol: asset.symbol,
                buyPrice: buy,
                sellPrice: sell,
                decimals: asset.decimals,
                img_url: asset.imgUrl ?? "",
            };
            })
        );
    
    res.status(200).json({ assets });

}
