import {Heap } from "heap-js";
import { IOpenOrderRes, IClosedOrderRes } from "../services/tradeService.js";
import { redis } from "@repo/shared-redis";
import crypto from "crypto";


const SCALE = 100;
export const p = (x: number | string) => Math.round(Number(x) * SCALE);  // multuply by 100 and round to integer
export const u = (x: number | string) => Number(x) / SCALE;

interface TradeData {
    type: "market" | "limit";
    side: "buy" | "sell";
    QTY: number; // decimal
    TP?: number; // raw price
    SL?: number; // raw price
    market: string; // e.g., SOLUSDT
    balance: string;
    userId: string;
    leverage: number; 
}
export type  Balance = {
    usd : number; // scale
    locked_usd : number;
    [asset: string]: any;
}

interface HeapNode {
    orderId : string;
    price : number;  // will be store as scaled integer
}

export interface OPEN_ORDERS extends IOpenOrderRes {
    userId: string;
}

export interface CLOSED_ORDERS extends IClosedOrderRes {
    userId: string;
}

export class Engine {
    // <orderId , Order> 
    public static OPEN_ORDERS = new Map<string, OPEN_ORDERS>();
    public static CLOSED_ORDERS = new Map<string, CLOSED_ORDERS>();

    public static userOrderMap = new Map<string, Set<string>>();

    public static stopLossLongMap = new Map<string, Heap<HeapNode>>();
    public static stopLossShortMap = new Map<string, Heap<HeapNode>>();

    public static takeProfitLongMap = new Map<string, Heap<HeapNode>>();
    public static takeProfitShortMap = new Map<string, Heap<HeapNode>>();

    public static leveragedLongMap = new Map<string, Heap<HeapNode>>();
    public static leveragedShortMap = new Map<string, Heap<HeapNode>>();


    private constructor() { }

    public static async getUserData(userId: string){
        const data = await redis.hGetAll(userId);
        if (!data || !data.balance) throw new Error("User data not found");

        const balance : Balance = data.balance ? JSON.parse(data.balance) : { usd: 0, locked_usd: 0 };

        return {
            ...data,
            balance,
            assets: data.assets ? JSON.parse(data.assets) : {},
            borrowedAssets: data.borrowedAssets ? JSON.parse(data.borrowedAssets) : {},
        };

    }

        // lock scaledAmount (integer) from usd -> locked_usd
    public static async LockBalance({ userId, amountToLock,}: {
            amountToLock: number; // scaled integer
            userId: string;
        }) {
            const user = await this.getUserData(userId);
            console.log("User before locking:", user);
            const bal = user.balance as Balance;



            if (bal.usd < amountToLock) {
            throw new Error("Insufficient balance");
            }

            const newBal: Balance = {
            ...bal,
            usd: bal.usd - amountToLock,
            locked_usd: bal.locked_usd + amountToLock,
            };

            await this.updateUserData(userId, { balance: newBal });
        }

    public static async updateUserData(
            userId: string,
            updates: {
                balance?: Balance;
                assets?: Record<string, any>;
                borrowedAssets?: Record<string, number>;
            }) 
            {
            const current = await redis.hGetAll(userId);
            const next: Record<string, string> = { ...current };
        
            if (updates.balance) next.balance = JSON.stringify(updates.balance);
            if (updates.assets) next.assets = JSON.stringify(updates.assets);
            if (updates.borrowedAssets)
                next.borrowedAssets = JSON.stringify(updates.borrowedAssets);
        
            await redis.hSet(userId, next);
        }


    /* Engine maanges order placement , balance and liquidity triggers
        -- if leverage >1 -- leverageed trades buy/sell
        -- if leverage =1 -- spot trades buy/sell
    */

    public static async process(data: TradeData){

        const market = data.market.toLowerCase();
        // 1st get trade data from redis
        const tradeData = await  redis.get(`trade:${market}`);
        if(!tradeData){
            throw new Error(`No trade data for market: ${market}`);
        }

        const { buy, sell } = JSON.parse(tradeData);
        // scale prices
        const buyPriceScaled = p(buy);
        const sellPriceScaled = p(sell);
        
        // 2nd get user data from redis
        let user = await this.getUserData(data.userId);
        let bal = user.balance as Balance;

        // 3rd validate leverage
        const leverageUsed = data.leverage ?  Number(data.leverage) : 1 ;
        if(leverageUsed <=0 || leverageUsed >50){
            throw new Error(`Invalid leverage: ${data.leverage}`);
        }

        let amountToLockScaled = 0;

        const qty = Number(data.QTY);
        if (qty <= 0) throw new Error("Quantity must be > 0");

        // 4th calcuate amountoLock and postion 

        if(data.side === "buy"){
            // LONG position
            const position = qty * sellPriceScaled;
            amountToLockScaled = leverageUsed >1 ? Math.floor(position / leverageUsed) : position;

            await this.LockBalance({
                userId: data.userId,
                amountToLock: amountToLockScaled,
            });
        
        }else{

            if (leverageUsed === 1) {
                // spot sell -> ensure user owns asset
                const assets = user.assets || {};
                const holding = assets[market]?.qty || 0;
                if (holding < qty) {
                    throw new Error("Insufficient asset balance for sell");
                }
                amountToLockScaled = 0; // nothing to lock in USD
                } else {
                // leveraged short -> lock margin based on buy price
                const position = Math.floor(qty * buyPriceScaled);
                amountToLockScaled = Math.floor(position/ leverageUsed);
                await this.LockBalance({
                    userId: data.userId,
                    amountToLock: amountToLockScaled,
                });
                }

        }

        // reload user after lock
            user = await this.getUserData(data.userId);
            bal = user.balance as Balance;

            const orderId = crypto.randomUUID();



        const registerOpenOrders = (order : OPEN_ORDERS) => {
            this.OPEN_ORDERS.set(order.orderId, order);
            // userOrderMap
            if(!this.userOrderMap.has(order.userId)){
                this.userOrderMap.set(order.userId, new Set());
            }
            this.userOrderMap.get(order.userId)!.add(order.orderId);

        }

         // 5th Register order in orderMaps 

            if(data.side == "buy"){

                if(data.type ==="market" && leverageUsed ===1){
                    
                    const position = Math.floor(qty * sellPriceScaled );
                    // spot buy market order
                    const order: OPEN_ORDERS = {
                        orderId,
                        type: "market",
                        side: "buy",
                        QTY: qty,
                        TP: data.TP !== undefined ? p(data.TP) : undefined,
                        SL: data.SL !== undefined ? p(data.SL) : undefined,
                        userId: data.userId,
                        market: data.market,
                        createdAt: new Date().toISOString(),
                        openPrice: sellPriceScaled,
                        } as OPEN_ORDERS;
                    
                    // register order
                    registerOpenOrders(order);

                    // push TP/SL
                    if (data.SL !== undefined && data.SL > 0) {
                        if (!this.stopLossLongMap.has(market))
                        this.stopLossLongMap.set(
                            market,
                            new Heap<HeapNode>((a, b) => a.price - b.price)
                        );
                        this.stopLossLongMap
                        .get(market)!
                        .push({ orderId, price: p(data.SL) });
                    }

                    if (data.TP !== undefined && data.TP > 0) {
                        if (!this.takeProfitLongMap.has(market))
                        this.takeProfitLongMap.set(
                            market,
                            new Heap<HeapNode>((a, b) => b.price - a.price)
                        );
                        this.takeProfitLongMap
                        .get(market)!
                        .push({ orderId, price: p(data.TP) });
                    }

                    
                    // consume locked USD -> credit assets
                    // we locked notionalScaled earlier; now consume it from locked_usd
                    const newBal: Balance = {
                        ...bal,
                        locked_usd: bal.locked_usd - position,
                    };
            
                    const assets = user.assets || {};
                    assets[market] = {
                        side: "long",
                        qty: (assets[market]?.qty || 0) + qty,
                        leverage: 1,
                        entryPrice: sellPriceScaled,
                    };
            
                    await this.updateUserData(data.userId, { balance: newBal, assets });
                    return orderId;

                }
                if(data.type ==="market" && leverageUsed > 1){
                    const totalQty = qty;
                    
                    const position = Math.floor(qty * sellPriceScaled );

                    //calculate Margin that order can be placed or not if use has that balance if it goes on loss
                    const margin = Math.floor(position / leverageUsed);

                    if( margin > bal.locked_usd){
                        throw new Error("Insufficient locked balance for leveraged buy");
                    }
                    // spot buy market order
                    const order: OPEN_ORDERS = {
                        orderId,
                        type: "market",
                        side: "buy",
                        QTY: totalQty,
                        TP: data.TP !== undefined ? p(data.TP) : undefined,
                        SL: data.SL !== undefined ? p(data.SL) : undefined,
                        userId: data.userId,
                        market: data.market,
                        createdAt: new Date().toISOString(),
                        openPrice: sellPriceScaled,
                        } as OPEN_ORDERS;
                    
                    // register order
                    registerOpenOrders(order);

                     // push TP/SL
                    if (data.SL !== undefined && data.SL > 0) {
                        if (!this.stopLossLongMap.has(market))
                        this.stopLossLongMap.set(
                            market,
                            new Heap<HeapNode>((a, b) => a.price - b.price)
                        );
                        this.stopLossLongMap
                        .get(market)!
                        .push({ orderId, price: p(data.SL) });
                    }

                    if (data.TP !== undefined && data.TP > 0) {
                        if (!this.takeProfitLongMap.has(market))
                        this.takeProfitLongMap.set(
                            market,
                            new Heap<HeapNode>((a, b) => b.price - a.price)
                        );
                        this.takeProfitLongMap
                        .get(market)!
                        .push({ orderId, price: p(data.TP) });
                    }

                    // Since the order is leveraged which is not totally own by user that why put on a leveraged map
                    if (!this.leveragedLongMap.has(market))
                        this.leveragedLongMap.set(
                            market,
                            new Heap<HeapNode>((a, b) => b.price - a.price)
                        );
                        this.leveragedLongMap
                        .get(market)!
                        .push({ orderId, price: sellPriceScaled });
                    
                    

                
                    // Update borrowedAssets: we consider treasury/lending handled elsewhere.
                    const borrowedAssets = user.borrowedAssets || {};
                            borrowedAssets[market] = {
                            side: "long",
                            qty: totalQty + (borrowedAssets[market]?.qty || 0),
                            leverage: leverageUsed,
                            entryPrice: sellPriceScaled,
                        };

                        // consume margin from locked_usd (it was reserved earlier)
                        const newBal: Balance = {
                            ...bal,
                            locked_usd: bal.locked_usd - margin,
                        };

                        await this.updateUserData(data.userId, {
                            borrowedAssets,
                            balance: newBal,
                            });
                            return orderId;
                }
                    // rn just habdle market order / limit  order remaninig 
        }

        //    --------------SELL ----------------------

        if(data.side == "sell"){

            // Market order handles both spot sell and leveraged sell

            if( data.type == "market" ){
                // leverageUsed ===1 ---> SPOT SEll means decuted the asset from the user 
                if(leverageUsed === 1){
                    // 1 Create an closed Order response
                    const order: CLOSED_ORDERS = {
                        orderId,
                        type: "market",
                        side: "sell",
                        QTY: qty,
                        TP: data.TP !== undefined ? p(data.TP) : undefined,
                        SL: data.SL !== undefined ? p(data.SL) : undefined,
                        userId: data.userId,
                        market: data.market,
                        createdAt: new Date().toISOString(),
                        openPrice: 0,
                        leverage: leverageUsed,
                        margin:
                            leverageUsed > 1
                                ? Math.floor((qty * buyPriceScaled) / leverageUsed)
                                : undefined,
                        closePrice: buyPriceScaled,
                        pnl : 0       
                        } ;

                    // 2nd  user Data 
                    const user = await this.getUserData(data.userId);
                    const assets = user.assets || {};
                    const borrowedAssets = user.borrowedAssets || {};
                    const balanceAfter = { ...user.balance } as Balance;

                    assets[market] = {
                        side: assets[market]?.side || "long",
                        qty: (assets[market]?.qty || 0) - qty,
                        leverage: 1,
                        entryPrice: assets[market]?.entryPrice || buyPriceScaled,
                    };

                    const credit = Math.floor(qty * buyPriceScaled);
                    balanceAfter.usd = (balanceAfter.usd || 0) + credit;

                    await this.updateUserData(data.userId,{
                        balance: balanceAfter as Balance,
                        assets,
                        borrowedAssets,
                    })

                    const entryPrice = assets[market]?.entryPrice ;
                    order.openPrice = entryPrice;

                
                    const pnlCalculated =  Math.floor((buyPriceScaled - entryPrice) * order.QTY);
                    order.pnl = u(pnlCalculated);
                    
                    // create a CLOSED_ORDERS entry (so listener/UI can show closed orders)
                    this.CLOSED_ORDERS.set(orderId, order);
                    console.log("closed Orders",this.CLOSED_ORDERS)

                    if(!this.userOrderMap.has(order.userId)){
                        this.userOrderMap.set(order.userId, new Set());
                    }
                    this.userOrderMap.get(order.userId)!.add(order.orderId);
                    console.log( this.userOrderMap.get(order.userId))


                    console.log(`Executed spot sell ${orderId} for ${market} at ${u(buyPriceScaled)}`);
                    return orderId;

                }
                else {
                
                const order: OPEN_ORDERS = {
                        orderId,
                        type: "market",
                        side: "sell",
                        QTY: qty,
                        TP: data.TP !== undefined ? p(data.TP) : undefined,
                        SL: data.SL !== undefined ? p(data.SL) : undefined,
                        userId: data.userId,
                        market: data.market,
                        createdAt: new Date().toISOString(),
                        openPrice: buyPriceScaled,
                        leverage: leverageUsed,
                        margin:
                            leverageUsed > 1
                                ? Math.floor((qty * buyPriceScaled) / leverageUsed)
                                : undefined,
                        } as OPEN_ORDERS;    
            
                // For Leverages sell leverageUsed > 1
                // register order
                registerOpenOrders(order);

                // push TP/SL
                // STOP LOSS for shorts(SELL) -> max-heap
                if (data.SL !== undefined && data.SL > 0) {
                    if (!this.stopLossShortMap.has(market))
                    this.stopLossShortMap.set(
                        market,
                        new Heap<HeapNode>((a, b) => b.price - a.price)
                    );
                    this.stopLossShortMap
                    .get(market)!
                    .push({ orderId, price: p(data.SL) });
                }

                // TAKE PROFIT for shorts(SELL) -> max-heap
                if (data.TP !== undefined && data.TP > 0) {
                    if (!this.takeProfitShortMap.has(market))
                    this.takeProfitShortMap.set(
                        market,
                        new Heap<HeapNode>((a, b) => b.price - a.price)
                    );
                    this.takeProfitShortMap
                    .get(market)!
                    .push({ orderId, price: p(data.TP) });
                }

                if (!this.leveragedShortMap.has(market))
                    this.leveragedShortMap.set(
                        market,
                        new Heap<HeapNode>((a, b) => b.price - a.price) // USING MAX-HEAP FOR SHORTS
                    );
                    this.leveragedShortMap
                    .get(market)!
                    .push({ orderId, price: buyPriceScaled 

                });
                
                // settle depending on leveraged path: adjust borrowedAssets and locked_usd

                const userAfter = await this.getUserData(data.userId);
                const assetsAfter = userAfter.assets || {};
                const borrowedAfter: Record<string, any> = userAfter.borrowedAssets || {};
                const balanceAfter2 = { ...userAfter.balance } as Balance;

                // LEVERAGED SHORT: we recorded margin earlier by LockBalance
                borrowedAfter[market] = {
                    side: "short",
                    qty: (borrowedAfter[market]?.qty || 0) + qty,
                    leverage: leverageUsed,
                    entryPrice: buyPriceScaled,
                };

                const margin = Math.floor((qty * buyPriceScaled) / leverageUsed);
                balanceAfter2.locked_usd = (balanceAfter2.locked_usd || 0) - margin;

                await this.updateUserData(data.userId, {
                    balance: balanceAfter2,
                    assets: assetsAfter,
                    borrowedAssets: borrowedAfter,
                });

                return orderId;
                }
            }

                throw new Error("Unsupported branch / invalid input");

            
        }
    }
}
