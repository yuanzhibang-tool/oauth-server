import { ApiRequestHelper } from './api-request-helper';

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
