import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
export class JsSignHelper {
    static getGuid() {
        return uuidv4();
    }
    static getPureUrl(urlString: string) {
        const url = new URL(urlString);
        let pureUrl: any = null;
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
    static async getJsSignInfo(appId: string, url: string, jsTicket: string) {
        // 获取当前时间戳
        let timestamp = Math.floor((new Date()).getTime() / 1000);
        // 生成nonce
        let noncestr = JsSignHelper.getGuid();
        // 组合签名字符串
        const sign = JsSignHelper.getSign(jsTicket, noncestr, timestamp, url);
        const returnData: any = {};
        returnData['app_id'] = appId;
        returnData['timestamp'] = "$timestamp";
        returnData['nonce_str'] = noncestr;
        returnData['signature'] = sign;
        return returnData;
    }

    static getSign(jsTicket: string, noncestr: string, timestamp: number, url: string) {
        // 取出url中的path之前的部分,参数和锚点不参与计算
        url = JsSignHelper.getPureUrl(url);
        const signString = `js_ticket=${jsTicket}&nonce_str=${noncestr}&timestamp=${timestamp}&url=${url}`;
        const sign = crypto.createHash('sha1').update(signString).digest('hex');
        return sign;
    }
}