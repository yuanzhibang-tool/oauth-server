import { RedisHelper } from '../src/redis-helper';
import { createClient } from 'redis';

const appId = process.env.TEST_APP_ID as string;
const redisUrl = "redis://localhost:6379";
const setTestData = async () => {
    const testClient = createClient({ url: redisUrl });
    await testClient.connect();
    const js_ticket_info_key = `type/js_ticket_info/app_id/${appId}`;
    await testClient.set(js_ticket_info_key, `{"js_ticket": "js_ticket:082675bb1bcbdc3b824fb040abdfd4e4b5e36e422af60365949e17e372cbcd4c", "expires_in": 1654575742}`);
    const server_access_token_info_key = `type/server_access_token_info/app_id/${appId}`;
    await testClient.set(server_access_token_info_key, `{"server_access_token": "server_access_token:082675bb1bcbdc3b824fb040abdfd4e4b5e36e422af60365949e17e372cbcd4c", "expires_in": 1654575742}`);
    await testClient.disconnect();
}

setTestData();

describe('RedisHelper check', () => {
    test('check getJsTicketCacheKey', () => {
        const key = RedisHelper.getJsTicketCacheKey(appId);
        const expectKey = `type/js_ticket_info/app_id/${appId}`;
        expect(key).toEqual(expectKey);
    });
    test('check getServerAccessTokenCacheKey', () => {
        const key = RedisHelper.getServerAccessTokenCacheKey(appId);
        const expectKey = `type/server_access_token_info/app_id/${appId}`;
        expect(key).toEqual(expectKey);
    });
    test('check getJsTicket', async () => {
        const helper = new RedisHelper(redisUrl);
        const value = await helper.getJsTicket(appId);
        const expectValue = "js_ticket:082675bb1bcbdc3b824fb040abdfd4e4b5e36e422af60365949e17e372cbcd4c";
        expect(value).toEqual(expectValue);
    });
    test('check getServerAccessToken', async () => {
        const helper = new RedisHelper(redisUrl);
        const value = await helper.getServerAccessToken(appId);
        const expectValue = "server_access_token:082675bb1bcbdc3b824fb040abdfd4e4b5e36e422af60365949e17e372cbcd4c";
        expect(value).toEqual(expectValue);
    });
});
