<template>
  <div class="loginSecurity">
    <div class="header">
      <img src="@/assets/menu/icon32.png" class="headerIcon" alt="" />
      <span class="headerTitle">登录安全</span>
    </div>

    <div class="settingRow">
      <p class="settingName">账号密码登录</p>
      <el-select
        v-model="disablePasswordLogin"
        :disabled="saving"
        @change="onSwitchChange"
        class="bigSelect"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
  </div>
</template>

<script setup>
import { getCurrentInstance, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";

const { proxy } = getCurrentInstance();

// 是否关闭账号密码登录（true=关闭密码登录，false=允许账号密码登录）
const disablePasswordLogin = ref(false);
const saving = ref(false);
const options = [
  { label: "关闭", value: true },
  { label: "开启", value: false },
];

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

/* 设置行：标题 + 大下拉框 */
.settingRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 44px 0;
  border-bottom: 1px solid #ececec;
  .settingName {
    font-size: 32px;
    color: #333;
    font-weight: bold;
    margin: 0;
  }
}

.bigSelect {
  flex-shrink: 0;
  width: 200px !important;
  :deep(.el-select__wrapper) {
    min-height: 60px !important;
    padding: 0 18px !important;
    background: #fff !important;
    box-shadow: 0 0 0 1px #dcdfe6 inset !important;
    border-radius: 10px !important;
  }
  :deep(.el-select__placeholder),
  :deep(.el-select__selected-item) {
    font-size: 26px !important;
    font-weight: bold !important;
    color: #333 !important;
  }
  :deep(.el-select__suffix) {
    width: 30px !important;
  }
  :deep(.el-select__caret) {
    font-size: 22px !important;
    color: #46b97e !important;
  }
  :deep(.el-select__popper) {
    font-size: 26px !important;
  }
}
</style>
