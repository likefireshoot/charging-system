import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { createPinia } from "pinia";

const app = createApp(App);

//全局css
import "@/styles/base.scss";
import Vant from "vant";
import "vant/lib/index.css";
app.use(Vant);

import selectCard from "@/components/form/select";
import selectCard2 from "@/components/form/select2";

import selectDate from "@/components/form/date";
import selectTime from "@/components/form/time";

app.component("selectCard", selectCard);
app.component("selectCard2", selectCard2);
app.component("selectDate", selectDate);
app.component("selectTime", selectTime);

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

import zhCn from "element-plus/es/locale/lang/zh-cn";

import * as ElementPlusIconsVue from "@element-plus/icons-vue";
app.use(ElementPlus, {
  locale: zhCn,
  theme: {
    colorPrimary: "#46b97e",
  },
});
// 注册 ElementPlusIconsVue 组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

import ajax from "@/api/ajax";
import { formatDate, formatDateTime, formatDate2, formatDateTime2, setTime, formatTime } from "@/api/being.js";
app.config.globalProperties.ajax = ajax;
app.config.globalProperties.$formatDate = formatDate;
app.config.globalProperties.$formatDateTime = formatDateTime;
app.config.globalProperties.$formatDate2 = formatDate2;
app.config.globalProperties.$formatDateTime2 = formatDateTime2;
app.config.globalProperties.$setTime = setTime;
app.config.globalProperties.$formatTime = formatTime;

import { showLoadingToast, closeToast, showToast } from "vant";
app.config.globalProperties.$showToast = showToast;
app.config.globalProperties.$showLoadingToast = showLoadingToast;
app.config.globalProperties.$closeToast = closeToast;

const pinia = createPinia();
app.use(pinia);

app.use(store).use(router).mount("#app");
