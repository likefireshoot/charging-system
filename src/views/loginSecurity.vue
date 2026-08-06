<template>
  <div class="loginSecurity">
    <div class="header">
      <img src="@/assets/menu/icon32.png" class="headerIcon" alt="" />
      <span class="headerTitle">登录安全</span>
    </div>

    <div class="statusBanner" :class="disablePasswordLogin ? 'off' : 'on'">
      <span class="statusDot"></span>
      <span class="statusText">
        当前状态：{{ disablePasswordLogin ? "已关闭账号密码登录" : "允许账号密码登录" }}
      </span>
    </div>

    <div class="settingRow">
      <div class="settingInfo">
        <p class="settingName">关闭账号密码登录</p>
        <p class="settingDesc">
          开启后，网页端将禁止使用“账号 + 密码”方式登录，员工只能通过短信验证码登录系统。
        </p>
      </div>
      <el-switch
        v-model="disablePasswordLogin"
        :loading="saving"
        @change="onSwitchChange"
        class="bigSwitch"
      />
    </div>

    <div class="tipRow">
      <img src="@/assets/menu/icon32.png" class="tipIcon" alt="" />
      <span class="tipText">该设置仅影响网页端登录，不影响小程序端登录方式。</span>
    </div>
  </div>
</template>

<script setup>
import { getCurrentInstance, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";

const { proxy } = getCurrentInstance();

// 是否关闭账号密码登录（true=关闭密码登录）
const disablePasswordLogin = ref(false);
const saving = ref(false);

// 读取当前设置
async function getLoginSetting() {
  try {
    const res = await proxy.ajax.get("/staff/loginSetting");
    if (res.code === 200) {
      disablePasswordLogin.value = !!res.data.disablePasswordLogin;
    } else {
      ElMessage.error(res.msg || "获取登录安全设置失败");
    }
  } catch (err) {
    console.error("获取登录安全设置失败：", err);
  }
}

// 切换开关：只传 disablePasswordLogin（非 null 才更新）
async function onSwitchChange(val) {
  saving.value = true;
  try {
    const res = await proxy.ajax.post("/staff/loginSetting", { disablePasswordLogin: val });
    if (res.code === 200) {
      ElMessage.success("设置已保存");
      disablePasswordLogin.value = val;
    } else {
      ElMessage.error(res.msg || "保存失败");
      // 回滚
      disablePasswordLogin.value = !val;
    }
  } catch (err) {
    console.error("保存失败：", err);
    disablePasswordLogin.value = !val;
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  getLoginSetting();
});
</script>

<style lang="scss" scoped>
.loginSecurity {
  padding: 48px 60px;
  height: 100%;
  box-sizing: border-box;
  background: #fafafa;
  overflow: auto;
  max-width: 900px;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 36px;
  .headerIcon {
    width: 40px;
    height: 40px;
    margin-right: 16px;
  }
  .headerTitle {
    font-size: 34px;
    color: #46b97e;
    font-weight: bold;
    letter-spacing: 2px;
  }
}

/* 当前状态提示条 */
.statusBanner {
  display: flex;
  align-items: center;
  padding: 20px 26px;
  border-radius: 12px;
  margin-bottom: 40px;
  font-size: 24px;
  &.on {
    background: #eafaf1;
    color: #46b97e;
  }
  &.off {
    background: #fff4e6;
    color: #e8920c;
  }
  .statusDot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-right: 16px;
  }
  &.on .statusDot {
    background: #46b97e;
  }
  &.off .statusDot {
    background: #e8920c;
  }
  .statusText {
    font-weight: bold;
  }
}

/* 设置行：标题 + 描述 + 大开关 */
.settingRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 44px 0;
  border-bottom: 1px solid #ececec;
  .settingInfo {
    flex: 1;
    padding-right: 40px;
    .settingName {
      font-size: 32px;
      color: #333;
      font-weight: bold;
      margin: 0 0 18px 0;
    }
    .settingDesc {
      font-size: 24px;
      color: #888;
      line-height: 1.8;
      margin: 0;
      max-width: 720px;
    }
  }
  .bigSwitch {
    flex-shrink: 0;
    :deep(.el-switch) {
      --el-switch-on-color: #46b97e;
      --el-switch-off-color: #c0c4cc;
    }
    :deep(.el-switch__core) {
      width: 84px !important;
      height: 44px !important;
    }
    :deep(.el-switch__action) {
      width: 38px !important;
      height: 38px !important;
    }
  }
}

.tipRow {
  display: flex;
  align-items: center;
  margin-top: 36px;
  .tipIcon {
    width: 26px;
    height: 26px;
    margin-right: 12px;
    opacity: 0.5;
  }
  .tipText {
    font-size: 21px;
    color: #aaa;
  }
}
</style>
