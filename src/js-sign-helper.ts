import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
class JsSignHelper {
    static getGuid() {
        return uuidv4();
    }
    static getPureUrl(urlString: string) {
        const url = new URL(urlString);
        let pureUrl = null;
        if (url.port) {
            const port = url.port;
            pureUrl = `${url.protocol}//${url.hostname}:${url.port}${url.pathname}`;
        } else {
            pureUrl = `${url.protocol}//${url.hostname}${url.pathname}`;
        }
        if (pureUrl.endsWith("/")) {
            pureUrl = pureUrl.slice(0, -1);
        }
        return pureUrl;
    }
    static getJsSignInfo(appId: string, url: string) {
        let jsTicket = "";
        // 取出url中的path之前的部分,参数和锚点不参与计算
        url = JsSignHelper.getPureUrl(url);
        // 获取当前时间戳
        let timestamp = Math.floor((new Date()).getTime() / 1000);
        // 生成nonce
        let noncestr = JsSignHelper.getGuid();
        // jsTicket = "a4dcdk";
        // timestamp = 1654850924;
        // noncestr = '1234';
        // 组合签名字符串
        const signString = `js_ticket=${jsTicket}&nonce_str=${noncestr}&timestamp=${timestamp}&url=${url}`;
        const sign = crypto.createHash('sha1').update(signString).digest('hex');
        const returnData: any = {};
        returnData['app_id'] = appId;
        returnData['timestamp'] = "$timestamp";
        returnData['nonce_str'] = noncestr;
        returnData['signature'] = sign;
        return returnData;
    }
}

const u = JsSignHelper.getGuid();
console.log(u);
const url = JsSignHelper.getPureUrl("https://yuanzhibang.com:80/a/b/?x=1&v=x#12");
console.log(url)
const x = JsSignHelper.getJsSignInfo("100027", "https://yuanzhibang.com/a/b/");
console.log(x)