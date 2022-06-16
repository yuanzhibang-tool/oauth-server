import got from 'got';
import { HttpsProxyAgent } from 'hpagent';

export interface ApiResponse {
    status: string;
    message: string;
    data?: any;
}

export class ApiRequestHelper {
    static post(api: string, data: any, proxy: string | null = null) {
        let agent: any = null;
        if (proxy) {
            const httpAgent = new HttpsProxyAgent({
                keepAlive: true,
                keepAliveMsecs: 1000,
                maxSockets: 256,
                maxFreeSockets: 256,
                proxy
            })
            agent = {
                https: httpAgent,
                http: httpAgent
            }
        }

        return new Promise<ApiResponse>((resolve, reject) => {
            got.post(api, {
                form: data,
                agent
            }).then((response) => {
                const stringBody = response.body;
                try {
                    const responseObject = JSON.parse(stringBody);
                    resolve(responseObject);
                } catch (error) {
                    reject(error)
                }
            }).catch((error) => {
                reject(error)
            });
        });
    }
}


// ApiRequestHelper.post('https://api-service.david-health.cn/api/v1/Ip/getClientIp', {}, 'http://proxy_user:F2pkto4GtRPAqTpY@x.orzzzzzz.com:7789');