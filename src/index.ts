// import { OauthApiHelper } from './oauth-api-helper';

// const appId = "101170";
// const openId = "b3dFUWFoMW0vUFgwSGxzWlNOV3JLc2pFRENnSlp6Z2NBMFpsZ3NvQXVMVTR2RnJsUkRtQU5MS1Z3V2hSYzdtQ3hnQkZzelhjT0lXbTBGWmVOdHBRYTAwNys0NisramlxU21PZ3lrb1o5Q3FORC96bStTNW5ZbEtiRjRLeUQ5SVFsN1gyUHVld1lJaDkvWGJqZ0trNGx3eWZaUWhORDc1UjBWSGFDWVpFNlhnPQ"
// OauthApiHelper.getAppUserCount(appId).then((data) => {
//     console.log(data);
// }
// ).catch((error) => {
//     console.log(error);
// });


import { OauthApiHelper, OpenAuthError } from './oauth-api-helper';
import { ApiRequestHelper } from './api-request-helper';
import { JsSignHelper } from './js-sign-helper';
import { RedisHelper } from 'redis-helper';

export default { OauthApiHelper, ApiRequestHelper, JsSignHelper, RedisHelper, OpenAuthError };