// import got from 'got';
// import { HttpProxyAgent } from 'hpagent';
import axios from 'axios';
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent';
import get from 'simple-get';

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


// ApiRequestHelper.post('https://api-service.david-health.cn/api/v1/Ip/getClientIp', {}, 'http://proxy_user:F2pkto4GtRPAqTpY@x.orzzzzzz.com:7789');