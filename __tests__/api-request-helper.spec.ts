import { ApiRequestHelper } from '../src/api-request-helper';

describe('ApiRequestHelper check', () => {

    test('check post proxy', async () => {
        try {
            const proxy = 'http://proxy_user:F2pkto4GtRPAqTpY@x.orzzzzzz.com:7789'
            await ApiRequestHelper.post("https://api-service.david-health.cn/api/v1/Ip/getClientIp", null, proxy);
        } catch (error) {
            expect(error).toEqual("144.202.101.220");
        }

    });
});
