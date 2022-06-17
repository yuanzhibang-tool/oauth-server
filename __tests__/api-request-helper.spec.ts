import { ApiRequestHelper } from '../src/api-request-helper';

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
