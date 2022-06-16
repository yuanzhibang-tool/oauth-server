import { isObject } from 'util';
import { isBooleanObject } from 'util/types';
import { OauthApiHelper } from '../src/oauth-api-helper';


const appId = '101170';
const code = 'df71774c79004765db6d49f8b0730c556f3239b9666ad1d0474990088b32f07b';
const openId = "b3dFUWFoMW0vUFgwSGxzWlNOV3JLc2pFRENnSlp6Z2NBMFpsZ3NvQXVMVTR2RnJsUkRtQU5MS1Z3V2hSYzdtQ3hnQkZzelhjT0lXbTBGWmVOdHBRYTAwNys0NisramlxU21PZ3lrb1o5Q3FORC96bStTNW5ZbEtiRjRLeUQ5SVFsN1gyUHVld1lJaDkvWGJqZ0trNGx3eWZaUWhORDc1UjBWSGFDWVpFNlhnPQ";

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
