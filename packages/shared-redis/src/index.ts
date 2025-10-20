import { createClient , RedisClientType as RedisType} from 'redis';

export class RedisManager {

    private static standardClient: RedisType;
    private static subscriberClient: RedisType;

    private constructor () {}

    public static getStandardClient(): RedisType {
        if (!this.standardClient) {
            this.standardClient = createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379'
            });
            this.standardClient.connect().catch(console.error);
        }
        return this.standardClient;
    } 
    public static getSubscriberClient(): RedisType {
        if (!this.subscriberClient) {
            this.subscriberClient = createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379'
            });
            this.subscriberClient.connect().catch(console.error);
        }
        return this.subscriberClient;
    } 
}

export const redis = RedisManager.getStandardClient();

export const publisher = redis;

export const subscriber = RedisManager.getSubscriberClient();
