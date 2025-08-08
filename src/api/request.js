import axios from "axios";
import { closeToast, showLoadingToast } from "vant";
import { ElMessage } from "element-plus";

if (process.env.NODE_ENV == "development") {
  axios.defaults.baseURL = "/api";
} else {
  axios.defaults.baseURL = "https://sushijie.mynatapp.cc";
  //axios.defaults.baseURL = "https://192.168.0.13";
}
console.log(axios.defaults.baseURL);
axios.defaults.headers.post["Content-Type"] = "application/json;charset=utf-8";
axios.defaults.headers.get["Content-Type"] = "application/x-www-form-urlencoded";
const service = axios.create({
  // baseUrl:'',
  // withCredentials: true, //
  timeout: 3 * 60 * 1000, // request timeout
  transformRequest(data) {
    if (data) {
      if (!(data instanceof FormData)) {
        data = JSON.stringify(data);
      } else {
        return data;
      }
    }

    return data;
  },
});

service.interceptors.request.use(
  (config) => {
    let { data, method, url } = config;
    if (!data) data = {};
    if (method === "get") {
      config.params = data;
    }
    // if (method === "post") config.params = data;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  (response, req) => {
    closeToast();

    const res = response.data;
    if (res.code == 500) {
      ElMessage.error("系统错误" + 500);
      return Promise.reject(error);
    }

    if (res.code == "-1") {
      return Promise.resolve(res);
    }

    if (res.code == 200) {
      return Promise.resolve(res);
    } else {
      ElMessage.error(res.msg);
      return Promise.reject(res);
    }
    return Promise.reject(res);
  },
  (error) => {
    closeToast();
    if (error.message == "Network Error") {
      ElMessage.error("系统错误");

      return Promise.reject(error);
    }

    let status = error.response.status;
    closeToast();
    if (status == 500 || status == 404 || status == "500" || status == "404" || status == 403 || status == 403 || status == 503 || status == "503") {
      ElMessage.error("系统错误" + status);

      return Promise.reject(error);
    }

    ElMessage.error(error.message);

    return Promise.reject(error);
  }
);

export default service;
