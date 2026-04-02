import http from "./request";

import { showLoadingToast   } from "vant";

export default {
  get(url, data, isLoading) {


    if (isLoading) {
      showLoadingToast({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
      });
    }
    return http({
      url,
      method: "get",
      data,

    });
  },
  post(url, data, isLoading) {
    if (isLoading) {
      showLoadingToast({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
      });
    }
    return http({
      url,
      method: "post",
      data,
    });
  },
};
