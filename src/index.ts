import { HttpsProxyAgent } from 'hpagent';
import get from 'simple-get';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { RedisClientType } from '@redis/client';
import { createClient } from 'redis';


/**
 * Oauth接口正确响应的声明接口
 */
export interface ApiResponse {
    status: string;
    message: string;
    data?: any;
}


/**
 * 进行Oauth接口请求的类,支持设置代理
 */
export class ApiRequestHelper {

    /**
     * Post请求
     * @param api 接口地址,为完整路径
     * @param data 发送的表单内容
     * @param [proxy] 设置的代理地址,例如:http://proxy_user:proxy_password@proxy_ip_or_host:proxy_port
     * @returns promise对象 
     */
    static post(api: string, data: object, proxy: string | null = null): Promise<ApiResponse> {
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


/**
 * 辅助Js生成签名信息的类
 */
export class JsSignHelper {

    /**
     * 生成guid的方法,用作noncestr
     * @returns 生成的guid
     */
    static getGuid(): string {
        return uuidv4();
    }

    /**
     * 获取url的除了参数,锚点的其他部分的方法,最后有/则清除
     * @param urlString 原始的url
     * @returns pure url 返回生成的新的url
     */
    static getPureUrl(urlString: string): string {
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


    /**
     * 生成js签名验证信息的方法
     * @param appId 对应的open.yuanzhibang.com的app_id
     * @param url 当前网页的url
     * @param jsTicket 从redis或者其他部分取得的js_ticket
     * @returns js sign 返回返回给前端的js签名验证信息对象
     */
    static getJsSignInfo(appId: string, url: string, jsTicket: string): object {
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
        returnData['url'] = url;
        return returnData;
    }


    /**
     * 计算sign签名值的方法
     * @param jsTicket 从redis或者其他部分取得的js_ticket
     * @param noncestr 随机生成的字符串,最大长度128
     * @param timestamp 当前时间戳,到秒
     * @param url 当前页面的url
     * @returns  返回签名值的内容
     */
    static getSign(jsTicket: string, noncestr: string, timestamp: number, url: string) {
        // 取出url中的path之前的部分,参数和锚点不参与计算
        url = JsSignHelper.getPureUrl(url);
        const signString = `js_ticket=${jsTicket}&nonce_str=${noncestr}&timestamp=${timestamp}&url=${url}`;
        const sign = crypto.createHash('sha1').update(signString).digest('hex');
        return sign;
    }
}



/**
 * oauth接口返回的错误对象
 */
export class OpenAuthError extends Error {

    /**
     * 错误码
     */
    code: string;

    /**
     * 错误描述
     */
    message: string;

    /**
     * 构建方法
     * @param code 错误码
     * @param message 错误信息
     */
    constructor(code: string, message: string) {
        super();
        this.code = code;
        this.message = message;
    }
}


/**
 * 进行oauth请求的类
 */
export class OauthApiHelper {

    /**
     * 检测code是否有效的方法,access_token,js_ticket.参考http://doc.yuanzhibang.com/2798213#access_tokenjs_ticket_127
     * @returns  有效返回{"expires_in":12323441},无效返回false
     */
    static checkCode(appId: string, code: string, type: string, proxy: string | null = null): Promise<any> {
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

    /**
     * 获取应用用户数量的方法.参考http://doc.yuanzhibang.com/2798214#_5
     * @returns  返回数量,如41
     */
    static getAppUserCount(appId: string, serverAccessToken: string, proxy: string | null = null): Promise<number> {
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

    /**
     * 获取应用用户列表的方法.参考http://doc.yuanzhibang.com/2798214#ID_30
     */
    // static getAppUserList(appId: string, serverAccessToken: string, proxy: string | null = null) {
    //     const api = OauthApiHelper.getApiByPath("/CommonResource/getUserList");
    //     const postData = {
    //         'app_id': appId,
    //         'access_token': serverAccessToken,
    //         'load_more_id': 0,
    //         'load_more_count': 100
    //     };
    //     return new Promise<Array<string>>((resolve, reject) => {
    //         this.apiRequest(api, postData, proxy).then((data) => {
    //             resolve(data);
    //         }
    //         ).catch((error) => {
    //             reject(error);
    //         });
    //     });
    // }

    /**
     * 获取应用用户权限的方法.参考http://doc.yuanzhibang.com/2798215#_4
     * @returns  返回用户的权限:["user/get_user_base_info"],没有返回空数组,目前仅有user/get_user_base_info一个获取用户基础信息的权限
     */
    static getUserAppAccess(appId: string, openId: string, serverAccessToken: string, proxy: string | null = null): Promise<Array<string>> {
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

    /**
     * 获取应用用户是否添加过该应用的方法.参考http://doc.yuanzhibang.com/2798215#_4
     * @returns  返回用户是否添加了该应用,返回true|false
     */
    static getUserIsAppAdded(appId: string, openId: string, serverAccessToken: string, proxy: string | null = null): Promise<boolean> {
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

    /**
     * 获取用户基础信息的方法.参考http://doc.yuanzhibang.com/2798215#_39
     * @returns  如果有权限返回下方,没有权限返回null
     * {
     *  "nick": "天使",
     *  "avatar": "https://upload.yuanzhibang.com/file/2019-07-21/0B4C96B3-DD62-47F9-B9BF-080CAF090DBA.jpeg",
     *  "sex": "1"
     *  }
     */
    static getUserBaseInfo(appId: string, openId: string, serverAccessToken: string, proxy: string | null = null): Promise<object | null> {
        const api = OauthApiHelper.getApiByPath("/UserResource/getUserBaseInfo");
        const postData = {
            'open_id': openId,
            'app_id': appId,
            'access_token': serverAccessToken
        };
        return new Promise<object | null>((resolve, reject) => {
            this.apiRequest(api, postData, proxy).then((data) => {
                resolve(data);
            }
            ).catch((error) => {
                const code = error.code;
                if (code === "4103") {
                    resolve(null);
                } else {
                    reject(error);
                }
            });
        });
    }


    /**
     * 组合接口地址的方法
     * @param path api的path
     * @returns  返回完整的api url
     */
    static getApiByPath(path: string): string {
        const api = `https://oauth.yuanzhibang.com${path}`;
        return api;
    }

    /**
     * 具体请求的方法
     * @param url 接口url
     * @param postData  发送的表单信息为{}object
     * @param [proxy] 设置的代理地址,例如:http://proxy_user:proxy_password@proxy_ip_or_host:proxy_port
     * @returns ApiResponse对象的data部分
     */
    static apiRequest(url: string, postData: object, proxy: string | null = null): Promise<any> {
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


/**
 * Redis来获取js_ticket或者server_access_token的辅助类
 */
export class RedisHelper {

    /**
     * redis的客户端
     */
    client: RedisClientType;

    /**
     * 构建方法
     * @param redisUrl 参考:redis://redis_password@redis_host:redis_port,具体参照:https://www.npmjs.com/package/redis
     */
    constructor(redisUrl: string) {
        this.client = createClient({ url: redisUrl });
    }

    /**
     * 生成js_ticket_info的存储缓存键
     * @param appId 对应的open.yuanzhibang.com的app_id
     * @returns 存储缓存键
     */
    static getJsTicketCacheKey(appId: string): string {
        const key = `type/js_ticket_info/app_id/${appId}`;
        return key;
    }

    /**
     * 生成server_access_token_info的存储缓存键
     * @param appId 对应的open.yuanzhibang.com的app_id
     * @returns 存储缓存键
     */
    static getServerAccessTokenCacheKey(appId: string): string {
        const key = `type/server_access_token_info/app_id/${appId}`;
        return key;
    }


    /**
     * 从redis中获取js_ticket的值
     * @param appId 对应的open.yuanzhibang.com的app_id
     * @returns  js_ticket的值
     */
    async getJsTicket(appId: string): Promise<string | null> {
        const key = RedisHelper.getJsTicketCacheKey(appId);
        const value = await this.getRedisJsonValueByKey(key, 'js_ticket');
        return value;
    }

    /**
     * 从redis中获取server_access_token的值
     * @param appId 对应的open.yuanzhibang.com的app_id
     * @returns  server_access_token的值
     */
    async getServerAccessToken(appId: string): Promise<string | null> {
        const key = RedisHelper.getServerAccessTokenCacheKey(appId);
        const value = await this.getRedisJsonValueByKey(key, 'server_access_token');
        return value;
    }


    /**
     * 具体从redis中取code的方法
     * @param key 对应的缓存键
     * @param codeKey 对应存储json中的code键
     * @returns  
     */
    async getRedisJsonValueByKey(key: string, codeKey: string): Promise<string | null> {
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