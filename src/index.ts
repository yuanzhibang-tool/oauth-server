import { HttpsProxyAgent } from 'hpagent';
import get from 'simple-get';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { RedisClientType } from '@redis/client';
import { createClient } from 'redis';

export interface ApiResponse {
    status: string;
    message: string;
    data?: any;
}

export class ApiRequestHelper {
    static post(api: string, data: any, proxy: any | null = null) {
        let agent: any = null;
        if (proxy) {
            agent = new HttpsProxyAgent({
                keepAlive: true,
                keepAliveMsecs: 1000,
                maxSockets: 256,
                maxFreeSockets: 256,
                scheduling: 'lifo',
                proxy
            })
        }

        return new Promise<ApiResponse>((resolve, reject) => {
            const opts: any = {
                method: 'POST',
                url: api,
                agent
            }
            if (data) {
                opts.form = data;
            }
            get.concat(opts, (err, res, data) => {
                if (err) {
                    reject(err);
                } else {
                    const stringBody = data.toString();
                    try {
                        const responseObject = JSON.parse(stringBody);
                        resolve(responseObject);
                    } catch (error) {
                        reject(stringBody)
                    }
                    resolve(res);
                }
            });
        });
    }

}

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

export class OpenAuthError extends Error {
    code: string;
    message: string;
    constructor(code: string, message: string) {
        super();
        this.code = code;
        this.message = message;
    }
}

export class OauthApiHelper {
    static checkCode(appId: string, code: string, type: string, proxy: string | null = null) {
        const api = OauthApiHelper.getApiByPath("/OAuth2/checkCode");
        const postData = {
            'app_id': appId,
            'code': code,
            'type': type
        };
        return new Promise<any>((resolve, reject) => {
            this.apiRequest(api, postData, proxy).then((data) => {
                resolve(data);
            }
            ).catch((error) => {
                const code = error.code;
                if (code === "4102") {
                    resolve(false);
                } else {
                    reject(error);
                }
            });
        });
    }


    static getAppUserCount(appId: string, serverAccessToken: string, proxy: string | null = null) {
        const api = OauthApiHelper.getApiByPath("/CommonResource/getUserCount");
        const postData = {
            'app_id': appId,
            'access_token': serverAccessToken
        };
        return new Promise<number>((resolve, reject) => {
            this.apiRequest(api, postData, proxy).then((data) => {
                const count = data['user_count'];
                resolve(count);
            }
            ).catch((error) => {
                reject(error);
            });
        });
    }

    static getAppUserList(appId: string, serverAccessToken: string, proxy: string | null = null) {
        const api = OauthApiHelper.getApiByPath("/CommonResource/getUserList");
        const postData = {
            'app_id': appId,
            'access_token': serverAccessToken,
            'load_more_id': 0,
            'load_more_count': 100
        };
        return new Promise<Array<string>>((resolve, reject) => {
            this.apiRequest(api, postData, proxy).then((data) => {
                resolve(data);
            }
            ).catch((error) => {
                reject(error);
            });
        });
    }

    static getUserAppAccess(appId: string, openId: string, serverAccessToken: string, proxy: string | null = null) {
        const api = OauthApiHelper.getApiByPath("/UserResource/getAppAccess");
        const postData = {
            'open_id': openId,
            'app_id': appId,
            'access_token': serverAccessToken
        };
        return new Promise<Array<string>>((resolve, reject) => {
            this.apiRequest(api, postData, proxy).then((data) => {
                resolve(data);
            }
            ).catch((error) => {
                reject(error);
            });
        });
    }

    static getUserIsAppAdded(appId: string, openId: string, serverAccessToken: string, proxy: string | null = null) {
        const api = OauthApiHelper.getApiByPath("/UserResource/getAppIsAdded");
        const postData = {
            'open_id': openId,
            'app_id': appId,
            'access_token': serverAccessToken
        };
        return new Promise<boolean>((resolve, reject) => {
            this.apiRequest(api, postData, proxy).then((data) => {
                const isAdded = data['is_added'];
                resolve(isAdded);
            }
            ).catch((error) => {
                reject(error);
            });
        });
    }


    static getUserBaseInfo(appId: string, openId: string, serverAccessToken: string, proxy: string | null = null) {
        const api = OauthApiHelper.getApiByPath("/UserResource/getUserBaseInfo");
        const postData = {
            'open_id': openId,
            'app_id': appId,
            'access_token': serverAccessToken
        };
        return new Promise<any>((resolve, reject) => {
            this.apiRequest(api, postData, proxy).then((data) => {
                resolve(data);
            }
            ).catch((error) => {
                const code = error.code;
                if (code === "4103") {
                    resolve(false);
                } else {
                    reject(error);
                }
            });
        });
    }

    static getApiByPath(path: string) {
        const api = `https://oauth.yuanzhibang.com${path}`;
        return api;
    }

    static apiRequest(url: string, postData: object, proxy: string | null = null) {
        return new Promise<any>((resolve, reject) => {
            ApiRequestHelper.post(url, postData, proxy).then((responseInfo) => {
                const status = responseInfo.status;
                const message = responseInfo.message;
                const responseData = responseInfo.data;
                if ("2000" == status) {
                    resolve(responseData);
                } else {
                    reject(new OpenAuthError(status, message));
                }
            }
            ).catch((error) => {
                reject(new OpenAuthError("0000", "网络错误!"));
            });
        });
    }
}


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
}