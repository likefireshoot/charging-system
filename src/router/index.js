import { createRouter, createWebHistory } from "vue-router";
import home from "../views/home.vue";
import homePage from "../views/homePage.vue";
import map from "../views/map.vue";
import field from "../views/field.vue";
import userManage from "../views/userManage.vue";
import priceManage from "../views/priceManage.vue";
import invoiceManage from "../views/invoiceManage.vue";
import report from "../views/report.vue";
import dailyReport from "@/components/report/dailyReport.vue";
import weeklyReport from "@/components/report/weeklyReport.vue";
import monthlyReport from "@/components/report/monthlyReport.vue";
import yearlyReport from "@/components/report/yearlyReport.vue";
import warningManage from "../views/warningManage.vue";
import field3 from "../views/field3.vue";
import login from "../views/login.vue";
import reportManage from "../views/reportManage.vue";
import smsConfiguration from "@/components/reportManage/smsConfiguration.vue";
import smsRecord from "@/components/reportManage/smsRecord.vue";
import employeeManage from "../views/employeeManage.vue";
import logManage from "../views/logManage.vue";
import accountManage from "@/views/accountManage.vue";
import readingCountDailyReport from "@/components/report/readingCountDailyReport.vue";
import readingCountWeeklyReport from "@/components/report/readingCountWeeklyReport.vue";
import readingCountMonthlyReport from "@/components/report/readingCountMonthlyReport.vue";
import readingCountYearlyReport from "@/components/report/readingCountYearlyReport.vue";
import roleManage from "@/views/roleManage.vue";
import { useWarningStore } from "@/store/warningStore.js";
import accountsReport from "@/components/report/accountsReport.vue";
import userRecordDetail from "@/components/userManage/userRecordDetail.vue";

// 命令日志 + 异常数据
import commandLog from "../views/commandLog.vue";
import errorReportRecord from "../views/errorReportRecord.vue";
import historyDataManage from "@/views/historyDataManage.vue";
import billDetailReport from "@/components/report/billDetailReport.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: home,
    redirect: "/homePage",
    children: [
      {
        path: "/homePage",
        name: "homePage",
        component: homePage,
      },
      {
        path: "/map",
        name: "map",
        component: map,
      },
      {
        path: "/field",
        name: "field",
        component: field,
      },
      {
        path: "/accountManage",
        name: "accountManage",
        component: accountManage,
      },
      {
        path: "/userManage",
        name: "userManage",
        component: userManage,
      },

      {
        path: "/userRecordDetail",
        name: "userRecordDetail",
        component: userRecordDetail,
      },
      {
        path: "/priceManage",
        name: "priceManage",
        component: priceManage,
      },
      {
        path: "/invoiceManage",
        name: "invoiceManage",
        component: invoiceManage,
      },
      {
        path: "/report",
        name: "report",
        component: report,
        children: [
          {
            path: "dailyReport",
            name: "dailyReport",
            component: dailyReport,
          },
          {
            path: "weeklyReport",
            name: "weeklyReport",
            component: weeklyReport,
          },
          {
            path: "monthlyReport",
            name: "monthlyReport",
            component: monthlyReport,
          },
          {
            path: "yearlyReport",
            name: "yearlyReport",
            component: yearlyReport,
          },
          {
            path: "accountsReport",
            name: "accountsReport",
            component: accountsReport,
          },
          {
            path: "readingCountDailyReport",
            name: "readingCountDailyReport",
            component: readingCountDailyReport,
          },
          {
            path: "readingCountWeeklyReport",
            name: "readingCountWeeklyReport",
            component: readingCountWeeklyReport,
          },
          {
            path: "readingCountMonthlyReport",
            name: "readingCountMonthlyReport",
            component: readingCountMonthlyReport,
          },
          {
            path: "readingCountYearlyReport",
            name: "readingCountYearlyReport",
            component: readingCountYearlyReport,
          },
          {
            path: "billDetailReport",
            name: "billDetailReport",
            component: billDetailReport,
          },
        ],
      },
      {
        path: "/reportManage",
        name: "reportManage",
        component: reportManage,
        children: [
          {
            path: "smsConfiguration",
            name: "smsConfiguration",
            component: smsConfiguration,
          },
          {
            path: "smsRecord",
            name: "smsRecord",
            component: smsRecord,
          },
        ],
      },
      {
        path: "/employeeManage",
        name: "employeeManage",
        component: employeeManage,
      },
      {
        path: "/roleManage",
        name: "roleManage",
        component: roleManage,
      },
      {
        path: "/logManage",
        name: "logManage",
        component: logManage,
      },
      {
        path: "/commandLog",
        name: "commandLog",
        component: commandLog,
      },
      {
        path: "/errorReportRecord",
        name: "errorReportRecord",
        component: errorReportRecord,
      },
      {
        path: "/warningManage",
        name: "warningManage",
        component: warningManage,
      },
      {
        path: "/historyDataManage",
        name: "historyDataManage",
        component: historyDataManage,
      },
      {
        path: "/field3",
        name: "field3",
        component: field3,
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    component: login,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const warningStore = useWarningStore();
  // 检查是否从首页跳转到警告页面
  if (from.name === "homePage" && to.name === "warningManage") {
    // 从首页跳转到警告页面，设置 isFromHomeClick 为 true
    warningStore.setIsFromHomeClick(true);
  } else {
    // 其他情况设置为 false
    warningStore.setIsFromHomeClick(false);
  }

  // 检查用户登录状态
  if (to.name !== "login") {
    if (!sessionStorage.getItem("userData")) {
      next({ path: "login" });
      return;
    }
  }
  next();
});

export default router;
