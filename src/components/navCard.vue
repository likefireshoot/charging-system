<template>
  <div class="navPage">
    <div class="inBox" v-if="slide">
      <div class="returnCard" @click.stop="slide = false">
        <a class="btn">
          <img src="@/assets/icon5.png" alt="" />
          <img class="hov" src="@/assets/icon6.png" alt="" />
        </a>
      </div>
      <div class="logo">
        <img src="@/assets/logo.png" class="icon" alt="" />
        <p>水务收费系统</p>
      </div>

      <div class="userCard">
        <div class="imgBox">
          <img src="@/assets/user.png" alt="" />
        </div>
        <p>你好,{{ userData.staffName }}</p>
        <img src="@/assets/menu/icon21.png" alt="" style="margin-left: 40px; width: 25px; height: 25px; cursor: pointer" @click="handleEditUserInfo" />
      </div>

      <div class="navLists">
        <template v-for="(item, index) in navLists" :key="index">
          <a class="item" :class="navIndex == index ? 'on' : ''" @click.stop="toggleSubMenu(item, index)" :style="{ cursor: item.children && item.children.length > 0 ? 'pointer' : 'default' }">
            <div class="imgBox">
              <img :src="item.icon" alt="" />
              <img class="hov" :src="item.icon2" alt="" />
            </div>
            <p>{{ item.name }}</p>
            <!-- 添加箭头图标 -->
            <img v-if="item.children && item.children.length > 0" :src="subNavOpen[index] ? item.arrowIcon1 : item.arrowIcon2" alt="arrow" class="arrow-icon" />
          </a>
          <div v-if="item.children && item.children.length > 0" class="subNavList" :style="{ display: subNavOpen[index] ? 'block' : 'none' }">
            <template v-for="(child, childIndex) in item.children" :key="child.id">
              <a class="subItem" :class="subNavIndex === `${index}-${childIndex}` ? 'on' : ''" @click.stop="pushRouter(child, `${index}-${childIndex}`)">
                <div class="imgBox">
                  <img :src="child.icon" alt="" />
                  <img class="hov" :src="child.icon2" alt="" />
                </div>
                <p>{{ child.name }}</p>
              </a>
            </template>
          </div>
        </template>
      </div>

      <div class="logOut" @click.stop="logOut">
        <a class="btn">
          <img src="@/assets/icon3.png" alt="" />
          <img class="hov" src="@/assets/icon4.png" alt="" />
        </a>
      </div>
    </div>

    <div class="inBox2" v-else>
      <div class="returnCard" @click.stop="slide = true">
        <a class="btn">
          <img src="@/assets/icon5.png" alt="" />
          <img class="hov" src="@/assets/icon6.png" alt="" />
        </a>
      </div>
      <div class="logo">
        <img src="@/assets/logo.png" class="icon" alt="" />
      </div>

      <div class="userCard">
        <div class="imgBox">
          <img src="@/assets/user.png" alt="" />
        </div>
      </div>

      <div class="navLists">
        <template v-for="(item, index) in navLists" :key="index">
          <a class="item" :class="navIndex == index ? 'on' : ''" @click.stop="handleMenuClick(item, index)">
            <div class="imgBox">
              <img :src="item.icon" alt="" />
              <img class="hov" :src="item.icon2" alt="" />
            </div>
          </a>
          <div v-if="item.children && item.children.length > 0" class="subNavList" :style="{ display: subNavOpen[index] ? 'block' : 'none' }" style="padding-left: 0">
            <template v-for="(child, childIndex) in item.children" :key="child.id">
              <a class="subItem" :class="subNavIndex === `${index}-${childIndex}` ? 'on' : ''" @click.stop="pushRouter(child, `${index}-${childIndex}`)">
                <div class="imgBox">
                  <img :src="child.icon" alt="" />
                  <img class="hov" :src="child.icon2" alt="" />
                </div>
              </a>
            </template>
          </div>
        </template>
      </div>

      <div class="logOut" @click.stop="logOut">
        <a class="btn">
          <img src="@/assets/icon3.png" alt="" />
          <img class="hov" src="@/assets/icon4.png" alt="" />
        </a>
      </div>
    </div>
  </div>

  <div class="user-info-dialog" v-if="user_info_dialogFormVisible">
    <div class="user-info-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon10.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 18px">个人信息编辑</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="user_info_dialogFormVisible = false">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="user-info-content">
        <div class="user-info-input" style="margin-right: 1%">
          <span>姓名</span>
          <el-input v-model="userInfoData.staffName" />
        </div>
        <!-- <div class="user-info-input" style="margin-right: 1%" v-if="userData.value.companyId === 1">
          <span>所属水厂</span>
          <el-select v-model="userInfoData.companyName">
            <el-option v-for="item in companyList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </div> -->
        <div class="user-info-input" style="margin-right: 1%">
          <span>住址</span>
          <el-input v-model="userInfoData.staffAddr" />
        </div>
        <div class="user-info-input" style="margin-right: 1%">
          <span>手机号</span>
          <el-input v-model="userInfoData.staffPhone" />
        </div>
        <div class="user-info-input" style="margin-right: 1%">
          <span>修改密码</span>
          <el-input v-model="userInfoData.password" />
        </div>
        <div class="user-info-input" style="margin-right: 1%">
          <span>确认密码</span>
          <el-input v-model="userInfoData.againPassword" />
        </div>
      </div>
      <div class="btn">
        <div class="confirm-btn" @click="Confirm">
          <el-icon style="margin-left: 15%"><Check /></el-icon>
          <span style="font-size: 16px; margin-left: 15%">确认</span>
        </div>
        <div class="cancel-btn" @click="user_info_dialogFormVisible = false">
          <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
          <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">取消</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStore } from "vuex";
import { getCurrentInstance, reactive, ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import service from "@/api/request";
import { ElMessage } from "element-plus";

// 引入箭头图标
const arrowIcon1 = require("@/assets/arrowIcon1.png");
const arrowIcon2 = require("@/assets/arrowIcon2.png");

const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
const store = useStore();
const navIndex = computed(() => store.state.navIndex);

const subNavIndex = ref(null);

const subNavOpen = reactive({});

const staffPermissionIds = computed(() => {
  return store.state.userData.staffPermissionIds;
});

let navLists = reactive([
  { id: 0, name: "首页", icon: require("@/assets/menu/icon1.png"), icon2: require("@/assets/menu/icon2.png"), path: "/homePage" },
  { id: 2, name: "用户管理", icon: require("@/assets/menu/icon3.png"), icon2: require("@/assets/menu/icon4.png"), path: "/userManage" },
  {
    id: 4,
    name: "报表统计",
    icon: require("@/assets/menu/icon9.png"),
    icon2: require("@/assets/menu/icon10.png"),
    path: "/report",
    // 添加箭头图标信息
    arrowIcon1,
    arrowIcon2,
    children: [
      { id: 41, name: "收费日报表", icon: require("@/assets/menu/icon11.png"), icon2: require("@/assets/menu/icon12.png"), path: "/report/dailyReport" },
      { id: 42, name: "收费周报表", icon: require("@/assets/menu/icon13.png"), icon2: require("@/assets/menu/icon14.png"), path: "/report/weeklyReport" },
      { id: 43, name: "收费月报表", icon: require("@/assets/menu/icon15.png"), icon2: require("@/assets/menu/icon16.png"), path: "/report/monthlyReport" },
      { id: 44, name: "收费年报表", icon: require("@/assets/menu/icon17.png"), icon2: require("@/assets/menu/icon18.png"), path: "/report/yearlyReport" },
      { id: 45, name: "用水日报表", icon: require("@/assets/menu/icon11.png"), icon2: require("@/assets/menu/icon12.png"), path: "/report/readingCountDailyReport" },
      { id: 46, name: "用水周报表", icon: require("@/assets/menu/icon13.png"), icon2: require("@/assets/menu/icon14.png"), path: "/report/readingCountWeeklyReport" },
      { id: 47, name: "用水月报表", icon: require("@/assets/menu/icon15.png"), icon2: require("@/assets/menu/icon16.png"), path: "/report/readingCountMonthlyReport" },
      { id: 48, name: "用水年报表", icon: require("@/assets/menu/icon17.png"), icon2: require("@/assets/menu/icon18.png"), path: "/report/readingCountYearlyReport" },
    ],
  },
  {
    id: 5,
    name: "通知管理",
    icon: require("@/assets/add/icon-02.png"),
    icon2: require("@/assets/add/icon-03.png"),
    path: "/reportManage", // 添加箭头图标信息
    arrowIcon1,
    arrowIcon2,
    children: [
      { id: 51, name: "短信配置", icon: require("@/assets/add/icon-04.png"), icon2: require("@/assets/add/icon-05.png"), path: "/reportManage/smsConfiguration" },
      { id: 52, name: "短信记录", icon: require("@/assets/add/icon-06.png"), icon2: require("@/assets/add/icon-07.png"), path: "/reportManage/smsRecord" },
    ],
  },
]);

if (staffPermissionIds.value.includes(19)) {
  navLists.push({ id: 3, name: "价格管理", icon: require("@/assets/menu/icon5.png"), icon2: require("@/assets/menu/icon6.png"), path: "/priceManage" });
}
if (staffPermissionIds.value.includes(29)) {
  navLists.push({ id: 7, name: "员工中心", icon: require("@/assets/add/icon-08.png"), icon2: require("@/assets/add/icon-09.png"), path: "/employeeManage" });
}
if (staffPermissionIds.value.includes(1)) {
  navLists.push({ id: 1, name: "开户管理", icon: require("@//assets/menu/icon24.png"), icon2: require("@/assets/menu/icon23.png"), path: "/accountManage" });
}
if (staffPermissionIds.value.includes(39)) {
  navLists.push({ id: 9, name: "日志管理", icon: require("@/assets/add/icon-10.png"), icon2: require("@/assets/add/icon-11.png"), path: "/logManage" });
}
if (staffPermissionIds.value.includes(35)) {
  navLists.push({ id: 8, name: "角色管理", icon: require("@/assets/menu/icon27.png"), icon2: require("@/assets/menu/icon28.png"), path: "/roleManage" });
}
if (staffPermissionIds.value.includes(27)) {
  navLists.push({ id: 6, name: "警告管理", icon: require("@/assets/menu/icon19.png"), icon2: require("@/assets/menu/icon20.png"), path: "/warningManage" });
}

const adminNavList = reactive([
  { id: 0, name: "首页", icon: require("@/assets/menu/icon1.png"), icon2: require("@/assets/menu/icon2.png"), path: "/homePage" },
  { id: 1, name: "开户管理", icon: require("@//assets/menu/icon24.png"), icon2: require("@/assets/menu/icon23.png"), path: "/accountManage" },
  { id: 2, name: "用户管理", icon: require("@//assets/menu/icon3.png"), icon2: require("@/assets/menu/icon4.png"), path: "/userManage" },
  { id: 3, name: "价格管理", icon: require("@/assets/menu/icon5.png"), icon2: require("@/assets/menu/icon6.png"), path: "/priceManage" },
  // { id: 3, name: "发票管理", icon: require("@/assets/menu/icon7.png"), icon2: require("@/assets/menu/icon8.png"), path: "/invoiceManage" },
  {
    id: 4,
    name: "报表统计",
    icon: require("@/assets/menu/icon9.png"),
    icon2: require("@/assets/menu/icon10.png"),
    path: "/report",
    // 添加箭头图标信息
    arrowIcon1,
    arrowIcon2,
    children: [
      { id: 41, name: "收费日报表", icon: require("@/assets/menu/icon11.png"), icon2: require("@/assets/menu/icon12.png"), path: "/report/dailyReport" },
      { id: 42, name: "收费周报表", icon: require("@/assets/menu/icon13.png"), icon2: require("@/assets/menu/icon14.png"), path: "/report/weeklyReport" },
      { id: 43, name: "收费月报表", icon: require("@/assets/menu/icon15.png"), icon2: require("@/assets/menu/icon16.png"), path: "/report/monthlyReport" },
      { id: 44, name: "收费年报表", icon: require("@/assets/menu/icon17.png"), icon2: require("@/assets/menu/icon18.png"), path: "/report/yearlyReport" },
      { id: 45, name: "用水日报表", icon: require("@/assets/menu/icon11.png"), icon2: require("@/assets/menu/icon12.png"), path: "/report/readingCountDailyReport" },
      { id: 46, name: "用水周报表", icon: require("@/assets/menu/icon13.png"), icon2: require("@/assets/menu/icon14.png"), path: "/report/readingCountWeeklyReport" },
      { id: 47, name: "用水月报表", icon: require("@/assets/menu/icon15.png"), icon2: require("@/assets/menu/icon16.png"), path: "/report/readingCountMonthlyReport" },
      { id: 48, name: "用水年报表", icon: require("@/assets/menu/icon17.png"), icon2: require("@/assets/menu/icon18.png"), path: "/report/readingCountYearlyReport" },
    ],
  },
  {
    id: 5,
    name: "通知管理",
    icon: require("@/assets/add/icon-02.png"),
    icon2: require("@/assets/add/icon-03.png"),
    path: "/reportManage", // 添加箭头图标信息
    arrowIcon1,
    arrowIcon2,
    children: [
      { id: 51, name: "短信配置", icon: require("@/assets/add/icon-04.png"), icon2: require("@/assets/add/icon-05.png"), path: "/reportManage/smsConfiguration" },
      { id: 52, name: "短信记录", icon: require("@/assets/add/icon-06.png"), icon2: require("@/assets/add/icon-07.png"), path: "/reportManage/smsRecord" },
    ],
  },
  { id: 6, name: "警告管理", icon: require("@/assets/menu/icon19.png"), icon2: require("@/assets/menu/icon20.png"), path: "/warningManage" },
  { id: 7, name: "员工中心", icon: require("@/assets/add/icon-08.png"), icon2: require("@/assets/add/icon-09.png"), path: "/employeeManage" },
  { id: 8, name: "角色管理", icon: require("@/assets/menu/icon27.png"), icon2: require("@/assets/menu/icon28.png"), path: "/roleManage" },
  { id: 9, name: "日志管理", icon: require("@/assets/add/icon-10.png"), icon2: require("@/assets/add/icon-11.png"), path: "/logManage" },
]);
// 定义非管理员的navList
const nonAdminNavList = reactive([
  { id: 0, name: "首页", icon: require("@/assets/menu/icon1.png"), icon2: require("@/assets/menu/icon2.png"), path: "/homePage" },
  { id: 1, name: "开户管理", icon: require("@//assets/menu/icon24.png"), icon2: require("@/assets/menu/icon23.png"), path: "/accountManage" },
  { id: 2, name: "用户管理", icon: require("@//assets/menu/icon3.png"), icon2: require("@/assets/menu/icon4.png"), path: "/userManage" },
  { id: 3, name: "价格管理", icon: require("@/assets/menu/icon5.png"), icon2: require("@/assets/menu/icon6.png"), path: "/priceManage" },
  //{ id: 3, name: "发票管理", icon: require("@/assets/menu/icon7.png"), icon2: require("@/assets/menu/icon8.png"), path: "/invoiceManage" },
  {
    id: 4,
    name: "报表统计",
    icon: require("@/assets/menu/icon9.png"),
    icon2: require("@/assets/menu/icon10.png"),
    path: "/report",
    // 添加箭头图标信息
    arrowIcon1,
    arrowIcon2,
    children: [
      { id: 41, name: "收费日报表", icon: require("@/assets/menu/icon11.png"), icon2: require("@/assets/menu/icon12.png"), path: "/report/dailyReport" },
      { id: 42, name: "收费周报表", icon: require("@/assets/menu/icon13.png"), icon2: require("@/assets/menu/icon14.png"), path: "/report/weeklyReport" },
      { id: 43, name: "收费月报表", icon: require("@/assets/menu/icon15.png"), icon2: require("@/assets/menu/icon16.png"), path: "/report/monthlyReport" },
      { id: 44, name: "收费年报表", icon: require("@/assets/menu/icon17.png"), icon2: require("@/assets/menu/icon18.png"), path: "/report/yearlyReport" },
      { id: 45, name: "用水日报表", icon: require("@/assets/menu/icon11.png"), icon2: require("@/assets/menu/icon12.png"), path: "/report/readingCountDailyReport" },
      { id: 46, name: "用水周报表", icon: require("@/assets/menu/icon13.png"), icon2: require("@/assets/menu/icon14.png"), path: "/report/readingCountWeeklyReport" },
      { id: 47, name: "用水月报表", icon: require("@/assets/menu/icon15.png"), icon2: require("@/assets/menu/icon16.png"), path: "/report/readingCountMonthlyReport" },
      { id: 48, name: "用水年报表", icon: require("@/assets/menu/icon17.png"), icon2: require("@/assets/menu/icon18.png"), path: "/report/readingCountYearlyReport" },
    ],
  },
  {
    id: 5,
    name: "通知管理",
    icon: require("@/assets/add/icon-02.png"),
    icon2: require("@/assets/add/icon-03.png"),
    path: "/reportManage", // 添加箭头图标信息
    arrowIcon1,
    arrowIcon2,
    children: [
      { id: 51, name: "短信配置", icon: require("@/assets/add/icon-04.png"), icon2: require("@/assets/add/icon-05.png"), path: "/reportManage/smsConfiguration" },
      { id: 52, name: "短信记录", icon: require("@/assets/add/icon-06.png"), icon2: require("@/assets/add/icon-07.png"), path: "/reportManage/smsRecord" },
    ],
  },
  { id: 6, name: "警告管理", icon: require("@/assets/menu/icon19.png"), icon2: require("@/assets/menu/icon20.png"), path: "/warningManage" },
]);

// ✅ 排序：按 adminNavList 的顺序
navLists.sort((a, b) => {
  const indexA = adminNavList.findIndex((item) => item.id === a.id);
  const indexB = adminNavList.findIndex((item) => item.id === b.id);
  return indexA - indexB;
});

console.log(navLists);

// 动态的navList
const navList = reactive([]);

const user_info_dialogFormVisible = ref(false);
const userInfoData = reactive({
  staffId: "",
  staffName: "",
  companyId: "",
  staffAddr: "",
  staffPhone: "",
  password: "",
  againPassword: "",
});
const companyList = reactive([]);
const watchRoute = () => {
  console.log(route, "route");
  console.log(navLists, "navLists");
  console.log(navLists.findIndex((item) => item.path === route.fullPath));

  if (route.matched.length === 2) {
    store.commit(
      "setNavIndex",
      navLists.findIndex((item) => item.path === route.fullPath)
    );
  } else if (route.matched.length === 3) {
    const findIndexFn = (arr) => {
      const indexArr = [];
      const fn = (arr) => {
        arr.map((v, i) => {
          if (v.path === route.matched[1].path) {
            indexArr.push(i.toString());
            v.children.map((value, index) => {
              if (value.path === route.fullPath) {
                indexArr.push(index.toString());
              }
            });
          }
        });
      };
      fn(arr);
      return indexArr;
    };
    store.commit("setNavIndex", null);
    // console.log(findIndexFn(navLists), "findIndexFn(navLists)");
    const indexArr = findIndexFn(navLists);
    subNavIndex.value = indexArr.join("-");
    subNavOpen[subNavIndex.value[0]] = true;
  }
};
// console.log(navIndex.value, route, route.fullPath, "navIndex");
watch(route, (to, from) => {
  console.log(to, from, "to,from");
  watchRoute();
});
if (route.matched.length === 2) {
  store.commit(
    "setNavIndex",
    navLists.findIndex((item) => item.path === route.fullPath)
  );
} else if (route.matched.length === 3) {
  const findIndexFn = (arr) => {
    const indexArr = [];
    const fn = (arr) => {
      arr.map((v, i) => {
        if (v.path === route.matched[1].path) {
          indexArr.push(i.toString());
          v.children.map((value, index) => {
            if (value.path === route.fullPath) {
              indexArr.push(index.toString());
            }
          });
        }
      });
    };
    fn(arr);
    return indexArr;
  };
  store.commit("setNavIndex", null);
  // console.log(findIndexFn(navLists), "findIndexFn(navLists)");
  const indexArr = findIndexFn(navLists);
  subNavIndex.value = indexArr.join("-");
  subNavOpen[subNavIndex.value[0]] = true;
}
const userData = computed(() => {
  // console.log("123123123");
  // console.log(store.state.userData);
  return store.state.userData;
});

// 监听userData的变化
watch(
  userData,
  (newUserData) => {
    navList.length = 0;
    if (newUserData.staffCharacterId) {
      // 如果是管理员，使用管理员的navList
      adminNavList.forEach((item) => navList.push({ ...item }));
    } else {
      // 如果不是管理员，使用非管理员的navList
      nonAdminNavList.forEach((item) => navList.push({ ...item }));
    }
    watchRoute();
  },
  { immediate: true }
);

function pushRouter(item, index) {
  console.log(item, index);
  if (item.path) {
    store.commit("setNavIndex", index); // 更新 navIndex
    setTimeout(() => {
      console.log(navIndex.value, "navIndex");
    }, 1000);
    subNavIndex.value = index; // 更新 subNavIndex
    router.replace(item.path);
  }
}

function toggleSubMenu(item, index) {
  if (item.children && item.children.length > 0) {
    subNavOpen[index] = !subNavOpen[index];
    console.log(subNavOpen, "subNavOpen");
  } else {
    store.commit("setNavIndex", index); // 更新 navIndex
    pushRouter(item, index);
  }
}

function handleMenuClick(item, index) {
  if (item.children && item.children.length > 0) {
    toggleSubMenu(item, index);
  } else {
    pushRouter(item, index);
  }
}

function logOut() {
  sessionStorage.removeItem("userData");
  router.replace({ name: "login" });
}

async function getCompanyList() {
  service.get("/getAllCompany").then((response) => {
    if (response.code === 200) {
      response.data.forEach((item) => {
        companyList.push({ id: item.companyId, name: item.companyName });
      });
    } else {
      ElMessage.error(response.msg);
    }
  });
}

async function handleEditUserInfo() {
  await getCompanyList();
  const params = {
    pageNo: 1,
    pageSize: 10,
    staffName: userData.value.staffName,
    companyId: userData.value.companyId,
    staffPhone: userData.value.staffPhone,
  };
  let token = JSON.parse(sessionStorage.getItem("userData")).token;
  service
    .post("/staff/queryStaff", params, {
      headers: {
        Authorization: token,
        token: token,
      },
    })
    .then((response) => {
      if (response.code === 200) {
        userInfoData.staffId = response.data.records[0].staffId;
        userInfoData.staffName = response.data.records[0].staffName;
        userInfoData.companyId = response.data.records[0].companyId;
        userInfoData.staffAddr = response.data.records[0].staffAddr;
        userInfoData.staffPhone = response.data.records[0].staffPhone;
        console.log(response.data.records[0]);
        console.log(userInfoData);
      }
    });
  user_info_dialogFormVisible.value = true;
}

function Confirm() {
  const validations = [
    {
      condition: userInfoData.staffName === "",
      message: "用户名不能为空",
    },
    // {
    //   condition: userInfoData.company === "",
    //   message: "所属水厂不能为空",
    // },
    {
      condition: userInfoData.staffAddr === "",
      message: "住址不能为空",
    },
    // {
    //   condition: userInfoData.password === "",
    //   message: "密码不能为空",
    // },
    // {
    //   condition: userInfoData.againPassword === "",
    //   message: "确认密码不能为空",
    // },
    {
      condition: userInfoData.password !== userInfoData.againPassword,
      message: "两次密码不一致",
    },
    {
      condition: userInfoData.staffPhone === "" || !/^1[34578]\d{9}$/.test(userInfoData.staffPhone),
      message: "手机号格式不对",
    },
  ];
  for (const validation of validations) {
    if (validation.condition) {
      ElMessage.error(validation.message);
      return;
    }
  }
  const params = {
    staffId: userInfoData.staffId,
    staffName: userInfoData.staffName,
    companyId: userInfoData.companyId,
    staffAddr: userInfoData.staffAddr,
    staffPhone: userInfoData.staffPhone,
    password: userInfoData.againPassword,
  };
  const filteredParams = Object.fromEntries(Object.entries(params).filter(([_, value]) => value !== null && value !== ""));
  console.log(params);
  service
    .post("/staff/editStaff", filteredParams)
    .then((response) => {
      if (response.code === 200) {
        ElMessage.success("修改成功");
        user_info_dialogFormVisible.value = false;
        userInfoData.password = "";
        userInfoData.againPassword = "";
        // logOut();
      } else {
        ElMessage.error(response.msg);
      }
    })
    .catch((error) => {
      ElMessage.error(error);
    });
}

const slide = ref(true);
</script>

<style lang="scss" scoped>
:deep(.el-input) {
  --el-color-primary: #46b97e;
}

:deep(.el-select) {
  --el-color-primary: #46b97e;
}

:deep(.el-select .el-select__wrapper) {
  height: 35px;
}
.navPage {
  transition: all 0.2s;
  background: #fff;
  display: flex;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  flex-direction: column;
  box-sizing: border-box;
  .inBox {
    width: 280px;
  }
  .inBox2 {
    width: 100px;
  }
  .returnCard {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    .btn {
      margin: 7px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: all 0.2s;
      border-radius: 4px;
      &:hover {
        background: #f0f0f0;
        img.hov {
          opacity: 1;
        }
      }
      img {
        width: 20px;
        &.hov {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translateX(-50%) translateY(-50%);
          opacity: 0;
        }
      }
    }
  }

  .logo {
    padding-top: 6px;
    padding-bottom: 22px;
    margin: 0 14px;
    border-bottom: 2px solid #ececec;
    display: flex;
    align-items: center;
    justify-content: center;
    .icon {
      width: 44px;
      margin-right: 8px;
    }
    p {
      font-size: 26px;
      color: #46b97e;
      font-weight: bold;
    }
  }
  .userCard {
    margin: 20px;
    border: 1px solid #f5f5f5;
    border-radius: 4px;
    height: 58px;
    padding: 0 14px;
    display: flex;
    align-items: center;
    min-height: 58px;
    img {
      width: 36px;
      height: 36px;
      border-radius: 36px;
      margin-right: 8px;
    }
    p {
      font-size: 16px;
      color: #585657;
    }
  }

  .navList,
  .navLists {
    flex: 1;
    overflow: auto;
    .item {
      display: flex;
      align-items: center;
      height: 44px;
      margin: 0 20px;
      border-radius: 10px;
      padding: 0 12px;
      transition: all 0.2s;
      &:hover {
        background: #f5f5f5;
      }
      &.on {
        background: #46b97e;
        .imgBox {
          img.hov {
            opacity: 1;
          }
        }

        p {
          color: #fff;
        }
      }
      .imgBox {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        margin-right: 12px;

        img {
          width: 24px;
          &.hov {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translateX(-50%) translateY(-50%);
            opacity: 0;
          }
        }
        p {
          display: block;
          font-size: 18px;
          color: #585657;
          width: 60px;
          flex-shrink: 0;
        }
      }
    }
  }
  .arrow-icon {
    width: 20px; /* 修改宽度为20px */
    height: 20px; /* 修改高度为20px */
    // margin-left: 40%;
    margin-left: auto; /* 使用自动左边距将箭头推到右侧 */
    transition: transform 0.3s ease;
  }
  .subNavList {
    padding-left: 20px;
    .subItem {
      display: flex;
      align-items: center;
      height: 44px;
      margin: 0 20px;
      border-radius: 10px;
      padding: 0 12px;
      transition: all 0.2s;
      &:hover {
        background: #f5f5f5;
      }
      &.on {
        background: #46b97e;
        .imgBox {
          img.hov {
            opacity: 1;
          }
        }

        p {
          color: #fff;
        }
      }
      .imgBox {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        margin-right: 12px;

        img {
          width: 24px;
          &.hov {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translateX(-50%) translateY(-50%);
            opacity: 0;
          }
        }
        p {
          font-size: 18px;
          color: #585657;
        }
      }
    }
  }
  .logOut {
    margin: 18px;
    a {
      width: 34px;
      height: 34px;
      border: 2px solid #f3f3f3;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      border-radius: 6px;
      &:hover {
        img {
          &.hov {
            opacity: 1;
          }
        }
      }
      img {
        width: 24px;
        &.hov {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translateX(-50%) translateY(-50%);
          opacity: 0;
        }
      }
    }
  }
}

.navPage {
  .inBox {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .inBox2 {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .returnCard {
      justify-content: center;
    }
    .userCard {
      border: none;
      margin-top: 24px;
      margin-bottom: 23px;
      margin-left: auto;
      margin-right: auto;

      img {
        margin-right: 0;
      }
    }
  }
}

.user-info-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.user-info-dialog-content {
  width: 70%;
  height: 320px;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateY(-50%);
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-info-content {
  width: 94%;
  max-height: 100%;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 15px;
  margin-bottom: 5px;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: 15px;
  // overflow-y: auto;
}

.user-info-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 32.3%;
  height: 75px;
}

.user-info-input > span {
  font-size: 14px;
  color: #747374;
  margin-bottom: 5px;
}

.user-info-input > .el-input {
  height: 35px;
  width: 100%;
}

.title {
  width: 100%;
  background-color: #fff;
  border-radius: 5px 5px 0 0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  height: 45px;
  line-height: 45px;
  text-align: center;
  display: flex;
  justify-content: space-between;
}

.btn {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 15px;
  margin-bottom: 15px;
}

.confirm-btn,
.cancel-btn {
  height: 35px;
  width: 90px;
  cursor: pointer;
  border: 1px solid #f2f2f2;
  border-radius: 5px;
  display: flex;
  align-items: center;
}

.confirm-btn {
  background-color: #45ba7e;
  margin-right: 15px;
  color: #fff;
}

.cancel-btn {
  background-color: #fff;
  margin-right: 5%;
}
</style>
