import { RedisClientType } from '@redis/client';
import { createClient } from 'redis';

export class RedisHelper {
    client: RedisClientType;
    constructor(redisUrl: string) {
        this.client = createClient({ url: redisUrl });
    }
    static getJsTicketCacheKey(appId: string) {
        const key = `type/js_ticket_info/app_id/${appId}`;
        return key;
    }
    static getServerAccessTokenCacheKey(appId: string) {
        const key = `type/server_access_token_info/app_id/${appId}`;
        return key;
    }

    async getJsTicket(appId: string) {
        const key = RedisHelper.getJsTicketCacheKey(appId);
        const value = await this.getRedisJsonValueByKey(key, 'js_ticket');
        return value;
    }

    async getServerAccessToken(appId: string) {
        const key = RedisHelper.getServerAccessTokenCacheKey(appId);
        const value = await this.getRedisJsonValueByKey(key, 'server_access_token');
        return value;
    }

    async getRedisJsonValueByKey(key: string, codeKey: string) {
        await this.client.connect();
        const value = await this.client.get(key);
        await this.client.disconnect();
        if (value) {
            const valueObject = JSON.parse(value);
            return valueObject[codeKey];
        }
        return value;
    }
}