// axios 二次封装

// 引入文件
import axios from 'axios';
import Notification from '@/utils/modal/NotificationUtil';

// 请求异常
const NETWORK_ERROR = '网络异常,请稍后重试';

// 全局配置
const service = axios.create({
  baseURL: 'http://wallpaper.apc.360.cn',
  timeout: 30000,
});

// 请求拦截
service.interceptors.request.use((req) => {
  return req;
});

// 响应拦截
service.interceptors.response.use(
  (res) => {
    const { errno, errmsg } = res.data;
    if (errno === '0') {
      return Promise.resolve(res.data);
    } else {
			Notification.error(errmsg || NETWORK_ERROR); // 常规报错
      return Promise.reject(errmsg || NETWORK_ERROR);
    }
  },
  (error) => {
    console.log('error=======>', error)
  }
);

// request 方法
function request(options) {
  options.method = options.method || 'get';

  if (options.method.toLowerCase() === 'get') {
    options.params = options.data;
  }

  return service(options);
}

// 使用对象的方式调用
['get', 'post', 'put', 'delete', 'patch'].forEach((item) => {
  request[item] = (url, data, options) => {
    return request({
      url,
      data,
      method: item,
      ...options,
    });
  };
});

export default request;
