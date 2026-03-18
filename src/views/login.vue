<template>
  <div class="card">
    <div class="loginForm">
      <div class="loginTxt">
        <h2>荆州市水韵水务设备有限公司</h2>

        <div class="border"></div>

        <div class="logo">
          <img src="@/assets/logo.svg" class="icon" alt="" />
          <p>水务收费系统</p>
        </div>
      </div>
      <div class="form">
        <div class="title">
          <span></span>
          <h2>
            {{ isRegister ? "欢迎注册" : isForgetPassword ? "重置密码" : "欢迎登录" }}
          </h2>
          <span></span>
        </div>
        <ul v-if="!isRegister && !isForgetPassword">
          <li>
            <label for="" style="height: 55px">
              <img src="@/assets/icon1.svg" alt="" class="icon" />
              <input type="text" v-model="param.account" placeholder="请输入账户" />
            </label>
          </li>
          <li>
            <label for="" style="height: 55px">
              <img src="@/assets/icon2.svg" alt="" class="icon" />
              <input type="password" v-model="param.password" placeholder="请输入密码" />
            </label>
          </li>
          <li>
            <div class="txt">
              <a @click.stop="toggleRegister">注册</a>
              <a @click.stop="showForgetPassword" class="forget">忘记密码</a>
            </div>
          </li>

          <a class="btn" @click.stop="goLogin">登录</a>
        </ul>
        <ul v-if="isRegister">
          <li style="height: 55px">
            <label for="">
              <img src="@/assets/icon1.svg" alt="" class="icon" />
              <input type="text" v-model="registerParam.account" placeholder="请输入账户" />
            </label>
          </li>
          <li style="height: 55px">
            <label for="">
              <img src="@/assets/icon1.svg" alt="" class="icon" />
              <input type="text" v-model="registerParam.staffName" placeholder="请输入姓名" />
            </label>
          </li>
          <li style="height: 55px">
            <label for="">
              <img src="@/assets/icon1.svg" alt="" class="icon" />
              <el-select v-model="registerParam.companyId" placeholder="请选择所属水厂" style="background: #dff0ed; border-color: #dff0ed">
                <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
              <!-- <input type="text" v-model="registerParam.companyName" placeholder="请选择所属水厂" /> -->
            </label>
          </li>
          <li style="height: 55px">
            <label for="">
              <img src="@/assets/icon2.svg" alt="" class="icon" />
              <input type="password" v-model="registerParam.password" placeholder="请输入登录密码" />
            </label>
          </li>
          <li style="height: 55px">
            <label for="">
              <img src="@/assets/icon2.svg" alt="" class="icon" />
              <input type="password" v-model="registerParam.confirmPassword" placeholder="请确认密码" />
            </label>
          </li>
          <li style="height: 55px">
            <label for="">
              <img src="@/assets/icon1.svg" alt="" class="icon" />
              <input type="text" v-model="registerParam.staffPhone" placeholder="请输入手机号码" style="width: 120px" />
              <button @click="registerGetVerificationCode">获取验证码</button>
            </label>
          </li>
          <li style="height: 55px">
            <label for="">
              <img src="@/assets/icon1.svg" alt="" class="icon" />
              <input type="text" v-model="registerParam.code" placeholder="请输入验证码" />
            </label>
          </li>
          <li style="height: 55px">
            <div class="txt" style="margin-top: 50px">
              <a @click.stop="toggleRegister">返回登录</a>
            </div>
          </li>
          <a class="btn" @click.stop="goRegister">注册</a>
        </ul>
        <ul v-if="isForgetPassword">
          <li style="height: 60px">
            <label for="">
              <img src="@/assets/icon1.svg" alt="" class="icon" />
              <input type="text" v-model="forgetPasswordParam.account" placeholder="请输入账户" />
            </label>
          </li>
          <li style="height: 60px">
            <label for="">
              <img src="@/assets/icon1.svg" alt="" class="icon" />
              <input type="text" v-model="forgetPasswordParam.phone" placeholder="请输入手机号码" style="width: 120px" />
              <button @click="getVerificationCode">获取验证码</button>
            </label>
          </li>
          <li style="height: 60px">
            <label for="">
              <img src="@/assets/icon1.svg" alt="" class="icon" />
              <input type="text" v-model="forgetPasswordParam.code" placeholder="请输入验证码" />
            </label>
          </li>
          <li style="height: 60px">
            <label for="">
              <img src="@/assets/icon2.svg" alt="" class="icon" />
              <input type="password" v-model="forgetPasswordParam.newPassword" placeholder="请输入新密码" />
            </label>
          </li>
          <li style="height: 60px">
            <label for="">
              <img src="@/assets/icon2.svg" alt="" class="icon" />
              <input type="password" v-model="forgetPasswordParam.confirmNewPassword" placeholder="请确认新密码" />
            </label>
          </li>
          <li style="height: 60px">
            <div class="txt" style="margin-top: 50px">
              <a @click.stop="hideForgetPassword">返回登录</a>
            </div>
          </li>
          <a class="btn" @click.stop="resetPassword">重置密码</a>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStore } from "vuex";
import { getCurrentInstance, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import service from "@/api/request";

const { proxy } = getCurrentInstance();
const store = useStore();
const route = useRouter();

onMounted(() => {
  getCompanyList();
  console.log("onmounted");
  console.log(proxy.ajax);
});

const isRegister = ref(false);
const isForgetPassword = ref(false);

const param = reactive({
  account: "",
  password: "",
});

const registerParam = reactive({
  account: "",
  staffName: "",
  code: "",
  password: "",
  confirmPassword: "",
  staffPhone: "",
  companyId: "",
});

const companyList = ref([]);

const forgetPasswordParam = reactive({
  account: "",
  phone: "",
  code: "",
  newPassword: "",
  confirmNewPassword: "",
});

function getCompanyList() {
  service
    .get("/getAllUnblockCompany")
    .then((response) => {
      if (response.code === 200) {
        companyList.value = response.data.map((item) => {
          return {
            id: item.companyId,
            name: item.companyName,
          };
        });
      } else {
        ElMessage.error(response.msg);
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

function forget() {
  console.log("forget");
}

// async function goLogin() {
//   let { code, data } = await proxy.ajax.post("/staff/login", param, true);
//   if (code == 200) {
//     // 将 data 存入 sessionStorage
//     sessionStorage.setItem("userData", JSON.stringify(data));
//     store.commit("setUserData", data);
//     console.log("登录成功", data);

//     route.replace({ name: "home" });
//   }
// }

// async function goLogin() {
//   try {
//     let { code, data } = await proxy.ajax.post("/staff/login", param, true);
//     if (code == 200) {
//       sessionStorage.setItem("userData", JSON.stringify(data));
//       store.commit("setUserData", data);
//       console.log("登录成功", data);
//     }
//     let token = JSON.parse(sessionStorage.getItem("userData")).token;
//     console.log("token", token);

//     if (code == 200) {
//       route.replace({ name: "home" });
//     }
//   } catch (error) {
//     console.error("登录请求异常", error);
//   }
// }

async function goLogin() {
  try {
    let { code, data } = await proxy.ajax.post("/staff/login", param, true);
    if (code == 200) {
      sessionStorage.setItem("userData", JSON.stringify(data));
      store.commit("setUserData", data);
      console.log("登录成功", data);
    }

    // 循环获取token，直到有值
    let token = null;
    let retryCount = 0;
    const maxRetries = 10;

    while (retryCount < maxRetries) {
      const userData = sessionStorage.getItem("userData");
      if (userData) {
        try {
          token = JSON.parse(userData).token;
          if (token) {
            console.log("获取到token", token);
            break;
          }
        } catch (e) {
          console.error("解析userData失败", e);
        }
      }

      retryCount++;
      await new Promise((resolve) => setTimeout(resolve, 100)); // 等待100ms
    }

    if (token) {
      route.replace({ name: "home" });
    } else {
      console.error("获取token失败，达到最大重试次数");
      // 可以在这里添加失败处理逻辑，如显示错误消息
    }
  } catch (error) {
    console.error("登录请求异常", error);
  }
}

function toggleRegister() {
  isRegister.value = !isRegister.value;
}

async function goRegister() {
  if (registerParam.account === "") {
    ElMessage.error("账户不能为空！");
    return;
  }
  if (registerParam.staffName === "") {
    ElMessage.error("账户不能为空！");
    return;
  }
  if (registerParam.companyId === "") {
    ElMessage.error("所属水厂能为空！");
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(registerParam.staffPhone)) {
    ElMessage.error("请输入有效的手机号！");
    return;
  }
  if (registerParam.password !== registerParam.confirmPassword) {
    ElMessage.error("两次输入的密码不一致！");
    return;
  }
  if (registerParam.code === "") {
    ElMessage.error("验证码不能为空！");
    return;
  }
  registerParam.staffPostsId = 0;
  registerParam.staffCharacterId = 8;
  registerParam.staffAddr = "湖北省武汉市";
  console.log(registerParam);
  proxy.ajax
    .post("/staff/registerStaff", registerParam)
    .then((res) => {
      if (res.code === 200) {
        ElMessage.success("注册成功，请登录");
        toggleRegister();
      } else {
        ElMessage.error(res.msg || "注册失败");
      }
    })
    .catch((err) => {
      console.error("注册失败：", err);
      ElMessage.error("注册失败：", err);
    });
}

function showForgetPassword() {
  isForgetPassword.value = true;
  isRegister.value = false;
}

function hideForgetPassword() {
  isForgetPassword.value = false;
}

async function registerGetVerificationCode() {
  if (registerParam.account === "") {
    ElMessage.error("账户不能为空！");
    return;
  }
  if (registerParam.staffName === "") {
    ElMessage.error("姓名不能为空！");
    return;
  }
  if (registerParam.password === "") {
    ElMessage.error("密码不能为空！");
    return;
  }
  if (registerParam.confirmPassword === "") {
    ElMessage.error("请再次确认密码！");
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(registerParam.staffPhone)) {
    ElMessage.error("请输入有效的手机号！");
    return;
  }
  await proxy.ajax
    .get(`/staff/sendCaptcha?phoneNum=${registerParam.staffPhone}`)
    .then((res) => {
      if (res.code === 200) {
        ElMessage.success("验证码已发送，请查收");
      } else {
        ElMessage.error(res.msg || "获取验证码失败");
      }
    })
    .catch((err) => {
      console.error("获取验证码失败：", err);
      ElMessage.error("获取验证码失败：", err);
    });
}

async function getVerificationCode() {
  if (forgetPasswordParam.account === "") {
    ElMessage.error("账户不能为空！");
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(forgetPasswordParam.phone)) {
    ElMessage.error("请输入有效的手机号！");
    return;
  }
  await proxy.ajax
    .get(`/staff/sendCaptcha?phoneNum=${forgetPasswordParam.phone}`)
    .then((res) => {
      if (res.code === 200) {
        ElMessage.success("验证码已发送，请查收");
      } else {
        ElMessage.error(res.msg || "获取验证码失败");
      }
    })
    .catch((err) => {
      console.error("获取验证码失败：", err);
      ElMessage.error("获取验证码失败：", err);
    });
}

async function resetPassword() {
  if (forgetPasswordParam.account === "") {
    ElMessage.error("账户不能为空！");
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(forgetPasswordParam.phone)) {
    ElMessage.error("请输入有效的手机号！");
    return;
  }
  if (forgetPasswordParam.newPassword !== forgetPasswordParam.confirmNewPassword) {
    ElMessage.error("两次输入的新密码不一致！");
    return;
  }
  const requestData = {
    account: forgetPasswordParam.account,
    phoneNum: forgetPasswordParam.phone,
    code: forgetPasswordParam.code,
    newPassword: forgetPasswordParam.newPassword,
  };
  console.log(requestData);
  proxy.ajax
    .post("/staff/resetPassword", requestData)
    .then((res) => {
      if (res.code === 200) {
        ElMessage.success("重置密码成功。请登录");
        hideForgetPassword();
      } else {
        ElMessage.error(res.msg || "重置密码失败");
      }
    })
    .catch((err) => {
      console.error("重置密码失败：", err);
      ElMessage.error("重置密码失败：", err);
    });
}
</script>

<style lang="scss" scoped>
:deep(.el-select) {
  --el-color-primary: #dff0ed;
  --el-border-color-hover: #dff0ed;
  --el-select-input-font-size: 22px;

  .el-select__wrapper {
    --el-fill-color-blank: #dff0ed;
    --el-border-color: #dff0ed;
    line-height: 32px;
    --el-text-color-placeholder: #a0a0a0;
    font-size: 22px;
    padding-left: 0px;
  }
}

.card {
  justify-content: center;
  align-items: center;
  // background: #baefe4;
  background: url("@/assets/loginbg.png") center center no-repeat;
  background-size: cover;
  .loginForm {
    width: 1100px;
    height: 600px;
    background: rgba(255, 255, 255, 0.75);
    border-radius: 30px;

    display: flex;
    .loginTxt {
      width: 50%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      h2 {
        font-size: 34px;
        color: #46b97e;
        text-shadow: 2px -2px 0px rgba(255, 255, 255, 1);
      }
      .border {
        width: 36px;
        height: 2px;
        background: #7dcca8;
        margin: 75px 0 58px 0;
      }
    }
    .logo {
      display: flex;
      align-items: center;
      .icon {
        height: 50px;
        margin-right: 12px;
      }
      p {
        font-size: 30px;
        color: #46b97e;
        font-weight: bold;
      }
    }
  }

  .form {
    width: 50%;
    background: #fff;
    border-radius: 0 32px 32px 0;
    box-sizing: border-box;
    padding: 0 70px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .title {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      span {
        flex: 1;
        height: 1px;
        background: #d6e9e8;
      }
      h2 {
        font-size: 24px;
        color: #46b97e;
        font-weight: bold;
        margin: 0 30px;
      }
    }
    ul {
      li {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        label {
          flex: 1;
          border-radius: 10px;
          display: flex;
          align-items: center;
          background: #dff0ed;
          height: 48px;
          padding: 0 18px;
          margin-top: 10px;
          img {
            height: 20px;
            margin-right: 14px;
          }
          input {
            flex: 1;
            font-size: 22px;
            color: #585657;
            &::placeholder {
              color: #a0a0a0;
            }
          }
        }
        button {
          margin-left: 10px;
          padding: 10px 20px;
          width: 150px;
          height: 40px;
          background-color: #46b97e;
          color: #fff;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          /* --- 新增居中代码 --- */
          display: inline-flex;    /* 或者 display: flex */
          justify-content: center; /* 水平居中 */
          align-items: center;     /* 垂直居中 */
          /* ------------------ */
          &:hover {
            background-color: #4eb480;
          }
        }
      }
    }
    .txt {
      margin-bottom: 44px;
      flex: 1;
      height: 60px;
      display: flex;
      align-items: center;
      a {
        font-size: 20px;
        color: #46b97e;
        transition: all 0.2s;
        &.forget {
          margin-left: auto;
          color: #585657;
        }
        &:hover {
          color: #46b97e;
        }
      }
    }

    .btn {
      height: 48px;
      margin-top: 0px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: #46b97e;
      font-size: 22px;
      color: #ffffff;
      transition: all 0.2s;
      &:hover {
        background: #4eb480;
      }
    }
  }
}
</style>
