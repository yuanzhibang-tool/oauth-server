import { OauthApiHelper } from '../src/oauth-api-helper';


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
