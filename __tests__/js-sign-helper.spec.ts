import { JsSignHelper } from '../src/js-sign-helper';

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
