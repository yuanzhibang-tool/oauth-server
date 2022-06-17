import { JsSignHelper, ApiRequestHelper, OauthApiHelper, RedisHelper } from "../src/index";

describe('ApiRequestHelper check', () => {

    test('check post proxy', async () => {
        const proxy = process.env.TEST_PROXY;
        const expectIp = process.env.TEST_PROXY_IP;
        try {
            await ApiRequestHelper.post("https://api-service.yuanzhibang.com/api/v1/Ip/getClientIp", null, proxy);
        } catch (error) {
            expect(error).toEqual(expectIp);
        }
    });
});

describe('JsSignHelper check', () => {
    test('check getGuid', () => {
        const guid = JsSignHelper.getGuid();
        console.log(guid);
    });
    test('check getPureUrl', () => {
        const url = JsSignHelper.getPureUrl("https://yuanzhibang.com:80/a/b/?x=1&v=x#12");
        expect(url).toEqual("https://yuanzhibang.com:80/a/b");
    });
    test('check getSign', () => {
        const sign = JsSignHelper.getSign("a4dcdk", "1234", 1654850924, "https://yuanzhibang.com/a/b/?x=1&v=x#12");
        expect(sign).toEqual("a8cb02e00c2759372954bf5516d110066b911aa4");
    });
});

const appId = process.env.TEST_APP_ID as string;
const code = process.env.TEST_CODE as string;
const openId = process.env.TEST_OPEN_ID as string;

describe('OauthApiHelper check', () => {
    test('check OauthApiHelper right', async () => {
        const result: object = await OauthApiHelper.checkCode(appId, code, 'access_token');
        expect(result.hasOwnProperty('expires_in')).toEqual(true);
    });

    test('check OauthApiHelper wrong', async () => {
        const code = 'xx';
        const result = await OauthApiHelper.checkCode(appId, code, 'access_token');
        expect(result).toEqual(false);
    });
    test('check getAppUserCount', async () => {
        const result = await OauthApiHelper.getAppUserCount(appId, code);
        expect(typeof result === 'number').toEqual(true);
    });

    test('check getAppUserList', async () => {
        const result = await OauthApiHelper.getAppUserList(appId, code);
        expect(Array.isArray(result)).toEqual(true);
    });
    test('check getUserAppAccess', async () => {
        const result = await OauthApiHelper.getUserAppAccess(appId, openId, code);
        expect(Array.isArray(result)).toEqual(true);
    });
    test('check getUserIsAppAdded', async () => {
        const result = await OauthApiHelper.getUserIsAppAdded(appId, openId, code);
        expect(typeof result === 'boolean').toEqual(true);
    });
    test('check getUserBaseInfo', async () => {
        const result = await OauthApiHelper.getUserBaseInfo(appId, openId, code);
        expect(result !== null && typeof result === 'object').toEqual(true);
    });

});


import { createClient } from 'redis';

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

