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
    // 设置测试信息进行测试,具体使用时候无需用到
    async setTestData(appId: string) {
        await this.client.connect();
        const js_ticket_info_key = `type/js_ticket_info/app_id/${appId}`;
        await this.client.set(js_ticket_info_key, `{"js_ticket": "js_ticket:082675bb1bcbdc3b824fb040abdfd4e4b5e36e422af60365949e17e372cbcd4c", "expires_in": 1654575742}`);
        const server_access_token_info_key = `type/server_access_token_info/app_id/${appId}`;
        await this.client.set(server_access_token_info_key, `{"server_access_token": "server_access_token:082675bb1bcbdc3b824fb040abdfd4e4b5e36e422af60365949e17e372cbcd4c", "expires_in": 1654575742}`);
        await this.client.disconnect();
    }
}

async function test() {
    const helper = new RedisHelper('redis://default:p8WOmXgzZg@demo-dev-cache-redis:6379');
    await helper.setTestData("100027");
    const jsTicket = await helper.getJsTicket("100027");
    const serverAccessToken = await helper.getServerAccessToken("100027");
    console.log(jsTicket);
    console.log(serverAccessToken);
}

test();