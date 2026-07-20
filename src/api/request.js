import axios from "axios";
import { closeToast, showLoadingToast } from "vant";
import { ElMessage } from "element-plus";

const UNAUTHORIZED_MESSAGE = "登录过期，请重新登录";
let isHandlingUnauthorized = false;

if (process.env.NODE_ENV == "development") {
  axios.defaults.baseURL = "/api";
  // axios.defaults.baseURL = "http://jingzhoudb.mynatapp.cc";
} else {
  axios.defaults.baseURL = "https://jingzhoudb.mynatapp.cc";
  // axios.defaults.baseURL = "https://192.168.0.13:8080";
//   axios.defaults.baseURL = "https://sushijie.mynatapp.cc";
  // axios.defaults.baseURL = "http://127.0.0.1:8080";
  // axios.defaults.baseURL = "/api";
}
console.log(axios.defaults.baseURL);
axios.defaults.headers.post["Content-Type"] = "application/json;charset=utf-8";
axios.defaults.headers.put["Content-Type"] = "application/json;charset=utf-8";
axios.defaults.headers.get["Content-Type"] = "application/x-www-form-urlencoded";

function isUnauthorizedResponse(response) {
  return response?.status === 401 || response?.data?.code == 401;
}

function handleUnauthorized() {
  if (isHandlingUnauthorized) return;

  isHandlingUnauthorized = true;
  closeToast();
  sessionStorage.removeItem("userData");
  ElMessage.error(UNAUTHORIZED_MESSAGE);

  import("@/router")
    .then(({ default: router }) => {
      if (router.currentRoute.value.name !== "login") {
        router.replace({ name: "login" });
      }
    })
    .finally(() => {
      setTimeout(() => {
        isHandlingUnauthorized = false;
      }, 1500);
    });
}

// 给默认实例加拦截器
axios.interceptors.request.use(
  (config) => {
    const userData = sessionStorage.getItem("userData");
    const token = JSON.parse(userData)?.token || "";
    if (token) {
      config.headers.Authorization = token; // 或者 Bearer ${token}
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    if (isUnauthorizedResponse(response)) {
      handleUnauthorized();
      return Promise.reject(new Error(UNAUTHORIZED_MESSAGE));
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      handleUnauthorized();
    }
    return Promise.reject(error);
  }
);

const service = axios.create({
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

    // 每次请求前都从sessionStorage中获取最新的token
    const userData = sessionStorage.getItem("userData");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        if (parsedData.token) {
          config.headers["Authorization"] = parsedData.token;
        }
      } catch (error) {
        console.error("解析用户数据失败:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  (response) => {
    closeToast();

    if (isUnauthorizedResponse(response)) {
      handleUnauthorized();
      return Promise.reject(new Error(UNAUTHORIZED_MESSAGE));
    }

    console.log(response, "response");
    const res = response.data;
    if (res.code == 500) {
      ElMessage.error("系统错误" + 500);
      return Promise.reject(new Error(res.msg || "Error"));
    }

    if (res.code == "-1") {
      return Promise.resolve(res);
    }

    if (res.code == 200) {
      return Promise.resolve(res);
    } else if (response.request.responseType === "blob" && response.status == 200) {
      return Promise.resolve(response);
    } else {
      ElMessage.error(res.msg);
      return Promise.reject(new Error(res.msg || "Error"));
    }
  },
  (error) => {
    closeToast();

    if (error.response?.status === 401) {
      handleUnauthorized();
      return Promise.reject(error);
    }

    if (error.message == "Network Error") {
      ElMessage.error("网络错误");
      return Promise.reject(error);
    }

    const status = error.response?.status;
    if (status === 500 || status === 404 || status === 403 || status === 503) {
      ElMessage.error("系统错误" + status);
      return Promise.reject(error);
    }

    ElMessage.error(error.message);
    return Promise.reject(error);
  }
);

export default service;
