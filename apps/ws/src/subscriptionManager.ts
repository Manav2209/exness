
import { WebSocket as WsWebSocket } from "ws";
import { UserManager } from "./userManager.js";
import { subscriber } from "@repo/shared-redis";

interface SubscriptionData {
    type: "SUBSCRIBE" | "UNSUBSCRIBE";
    market: string;
}  
export class SubscriptionManager {
    public static instance: SubscriptionManager
    // User to Markets
    private subscriptions: Map<string, string[]> = new Map();
    // Market to Users
    private reverseSubscriptions: Map<string, string[]> = new Map();

    public static getInstance() {
        if (!this.instance)  {
            this.instance = new SubscriptionManager();
        }
        return this.instance;
    }
    private  constructor() {}

    public handleSubscription (data : SubscriptionData , ws : WsWebSocket) {
        
        let user = UserManager.getInstance().getUserFromWs(ws);

        if (!user) {
            ws.send(JSON.stringify({ error: "Please identify first." })); // <-- Add this
            console.log("Subscription attempt by unidentified user.");
            return;
        }

        if(data.type === "SUBSCRIBE"){
            
            if(!this.reverseSubscriptions.has(data.market)){
                this.subscriptions.set(user, [data.market]);
                this.reverseSubscriptions.set(data.market, [user]);
                subscriber.subscribe(data.market , (message ) => {

                    console.log("Received message for market:", data.market);
                    // Get all subscribed users for this market
                    const users = this.reverseSubscriptions.get(data.market);
                    console.log("Subscribed users:", users);
                    users?.forEach((user) => {
                        // we have to userId here, get the user
                            UserManager.getInstance()
                            .getUserFromId(user)
                            ?.emit({
                                type: "TRADE",
                                data: JSON.parse(message),
                                market: data.market,
                            });
                        });
        

                });

            } else {
                // Market is already subscribed add the user to the list
                    this.subscriptions.set(user, [
                    ...(this.subscriptions.get(user) || []),
                    data.market,
                    ]);
                    this.reverseSubscriptions.set(data.market, [
                    ...(this.reverseSubscriptions.get(data.market) || []),
                    user,
                    ]);
                }
            } else if (data.type === "UNSUBSCRIBE") {
                // Remove the user from the market if no users are left, unsubscribe from redis
                    const markets = this.subscriptions.get(user);
                    this.subscriptions.delete(user);
            
                if (markets) {
                markets.forEach((market) => {
                    let users = this.reverseSubscriptions.get(market);
                    if (users) {
                        users = users.filter((u) => u != user);
            
                        this.reverseSubscriptions.set(market, users);
            
                        if (!users) {
                        // remove the subscription from the reverse Subscription
                        this.reverseSubscriptions.delete(market);
                        // Handle Unsuscribe
                        subscriber.unsubscribe(market);
                        }
                    } else {
                        // No user
                        // unsubscribe from the market
                        subscriber.unsubscribe(market);
                    }
                    });
                }
                }
            }
            
            public userLeft(userId: string) {
                // User Left, remove all subs and unscribe from redis if no users are left
            
                const markets = this.subscriptions.get(userId);
                this.subscriptions.delete(userId);
                if (markets) {
                // loop over each market and remove the user from reverseSubscription
                // after that check if there are any users left for that market
                // if no users are left, remove the market from subscriptions and
                // unsubscribe from redis
            
                markets.forEach((market) => {
                    let users = this.reverseSubscriptions.get(market);
                    if (users) {
                    users = users.filter((user) => user != userId);
            
                    this.reverseSubscriptions.set(market, users);
            
                    if (!users) {
                        // remove the subscription from the reverse Subscription
                        this.reverseSubscriptions.delete(market);
                        // Handle Unsuscribe
                        subscriber.unsubscribe(market);
                    }
                    } else {
                    // No user
                    // unsubscribe from the market
                    subscriber.unsubscribe(market);
                    }
                });
            }
        }
    }