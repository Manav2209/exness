import { WebSocket as WsWebSocket } from "ws";
import { User } from "./user.js";
import { SubscriptionManager } from "./subscriptionManager.js";

export class UserManager{
    private static instance: UserManager;
    // <userId ,  <User> >
    private users: Map<string, User > = new Map();

    //< WsWebSocket , userId >

    private wsToUserId: Map<WsWebSocket, string> = new Map();

    private constructor() {}

    public static getInstance() {
        if (!this.instance) {
        this.instance = new UserManager();
        }
        return this.instance;
    }

    public addUser(userId: string, ws: WsWebSocket) {
        const user = new User(userId, ws);
        this.users.set(userId, user);
        this.wsToUserId.set(ws, userId);
    }

    public getUserFromWs(ws: WsWebSocket) {
        return this.wsToUserId.get(ws);
      }
    
    public getUserFromId(id: string) {
        return this.users.get(id);
      }
    

    public userLeft(ws: WsWebSocket) {
        // get the userId
        const userId = this.wsToUserId.get(ws);
        if (userId) {
          this.users.delete(userId);
          this.wsToUserId.delete(ws);
          // Also need to remove the users from all the subscriptions
          SubscriptionManager.getInstance().userLeft(userId);
        }
      }
}