import { WebSocketServer , WebSocket} from 'ws';
import { UserManager } from './userManager.js';
import { SubscriptionManager } from './subscriptionManager.js';

const wss = new  WebSocketServer({ port: 8080 });

enum WS_MSG_TYPE {
    IDENTIFY = 'IDENTIFY',
    SUBSCRIBE = 'SUBSCRIBE',
    UNSUBSCRIBE = 'UNSUBSCRIBE',
}

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (msg: string) => {
        console.log(`Received message => ${msg}`);
        try{
            console.log("Received message:", msg.toString());

            const message = JSON.parse(msg.toString());
            if (message.type === WS_MSG_TYPE.IDENTIFY) {
                UserManager.getInstance().addUser(message.userId, ws);
            }
            else if (message.type === WS_MSG_TYPE.SUBSCRIBE || message.type === WS_MSG_TYPE.UNSUBSCRIBE) {
                SubscriptionManager.getInstance().handleSubscription(message, ws);
            }

        }
        catch(err){
            console.error('Error processing message:', err);

        }
    })

    ws.on('close', () => {
        console.log('Client disconnected');
        UserManager.getInstance().userLeft(ws);
    });

    ws.on('error', (error: Error) => {
        console.error(`WebSocket error: ${error.message}`);
        UserManager.getInstance().userLeft(ws);
    });
    

});