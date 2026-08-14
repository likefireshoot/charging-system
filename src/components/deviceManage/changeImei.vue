<template>
  <div class="add-dialog" v-if="changeImei_dialogFormVisible">
    <div class="account-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yuangong/icon3.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 18px">修改IMEI</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleClose">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="account-add-content">
        <div class="edit-input" style="margin-right: 2%; width: 44%">
          <span>表号</span>
          <el-input
            v-model="formData.meterCode"
            class="input-item"
            placeholder="请输入表号"
            @input="handleMeterCodeInput"
            @blur="handleMeterCodeBlur"
          />
        </div>
        <div class="edit-input" style="width: 44%">
          <span>新imei号</span>
          <el-input v-model="formData.newImei" class="input-item" placeholder="请输入新imei号" />
        </div>

        <!-- 展示区：设备基本情况 + 用户绑定情况 -->
        <div v-if="loading" v-loading="loading" class="info-panel loading-panel"></div>

        <div v-else-if="searched" class="info-panel">
          <template v-if="deviceInfo">
            <div class="info-section-title">设备基本情况</div>
            <el-descriptions :column="3" border size="small">
              <el-descriptions-item label="表号">{{ deviceInfo.meterCode || "-" }}</el-descriptions-item>
              <el-descriptions-item label="当前imei号">{{ deviceInfo.imei || "-" }}</el-descriptions-item>
              <el-descriptions-item label="所属厂商">{{ deviceInfo.meterVendor || "-" }}</el-descriptions-item>
              <el-descriptions-item label="产品ID">{{ deviceInfo.productId || "-" }}</el-descriptions-item>
              <el-descriptions-item label="设备ID">{{ deviceInfo.deviceId || "-" }}</el-descriptions-item>
              <el-descriptions-item label="水表类型">{{ deviceInfo.meterType || "-" }}</el-descriptions-item>
              <el-descriptions-item label="所属水厂">{{ deviceInfo.companyName || "-" }}</el-descriptions-item>
            </el-descriptions>

            <div class="info-section-title">用户绑定情况</div>
            <template v-if="bindingInfo && bindingInfo.bound">
              <el-descriptions :column="3" border size="small">
                <el-descriptions-item label="用户姓名">{{ bindingInfo.userName || "-" }}</el-descriptions-item>
                <el-descriptions-item label="联系电话">{{ bindingInfo.userPhone || "-" }}</el-descriptions-item>
                <el-descriptions-item label="安装地址">{{ bindingInfo.address || "-" }}</el-descriptions-item>
              </el-descriptions>
            </template>
            <div v-else class="binding-empty">该表没有绑定用户</div>
          </template>
          <div v-else class="binding-empty">未查询到该表号对应的设备</div>
        </div>
      </div>
      <div class="btn">
        <div class="confirm-btn" @click="handleCommit">
          <el-icon style="margin-left: 15%"><Check /></el-icon>
          <span style="font-size: 16px; margin-left: 15%">提交</span>
        </div>
        <div class="cancel-btn" @click="handleClose">
          <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
          <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">取消</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { h } from "vue";
import service from "@/api/request";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  props: {
    changeImei_dialogFormVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      formData: {
        meterCode: "",
        newImei: "",
      },
      deviceInfo: null,
      bindingInfo: null,
      loading: false,
      searched: false,
    };
  },
  watch: {
    changeImei_dialogFormVisible(val) {
      if (val) {
        this.resetForm();
      }
    },
  },
  methods: {
    resetForm() {
      this.formData.meterCode = "";
      this.formData.newImei = "";
      this.deviceInfo = null;
      this.bindingInfo = null;
      this.loading = false;
      this.searched = false;
    },
    handleClose() {
      this.$emit("close");
    },
    handleMeterCodeInput() {
      this.deviceInfo = null;
      this.bindingInfo = null;
      this.searched = false;
    },
    async handleMeterCodeBlur() {
      const meterCode = this.formData.meterCode.trim();
      if (!meterCode) {
        this.deviceInfo = null;
        this.bindingInfo = null;
        this.searched = false;
        return;
      }

      this.loading = true;
      this.searched = true;
      try {
        const res = await service.get(
          `/userManage/meterRead/getMeterAndBindingByCode?meterCode=${encodeURIComponent(meterCode)}`,
          { skipAutoMsg: true }
        );
        if (res.code === 200 && res.data) {
          this.deviceInfo = res.data.meter || null;
          this.bindingInfo = res.data.binding || null;
          if (!this.deviceInfo) {
            ElMessage.warning("未查询到该表号对应的设备");
          }
        } else {
          this.deviceInfo = null;
          this.bindingInfo = null;
          ElMessage.error(res.msg || "查询失败");
        }
      } catch (err) {
        this.deviceInfo = null;
        this.bindingInfo = null;
        ElMessage.error("查询失败：" + (err.message || "网络错误"));
      } finally {
        this.loading = false;
      }
    },
    handleCommit() {
      const meterCode = this.formData.meterCode.trim();
      const newImei = this.formData.newImei.trim();

      if (!meterCode) {
        ElMessage.error("表号不能为空");
        return;
      }
      if (!newImei) {
        ElMessage.error("新imei号不能为空");
        return;
      }
      if (!this.deviceInfo) {
        ElMessage.warning("请先输入表号并查询设备信息");
        return;
      }

      const oldImei = this.deviceInfo.imei || "";
      if (newImei === oldImei) {
        ElMessage.warning("新imei号与原imei号相同，无需修改");
        return;
      }

      const msg = h("div", { style: "line-height: 2;" }, [
        h("div", { style: "background: #f5f7fa; border-radius: 8px; padding: 16px; margin-bottom: 12px;" }, [
          h("div", { style: "margin-bottom: 10px;" }, [
            h("span", { style: "color: #909399; font-size: 14px;" }, "原 IMEI"),
            h("div", { style: "color: #909399; font-size: 15px; word-break: break-all; text-decoration: line-through;" }, oldImei),
          ]),
          h("div", { style: "text-align: center; color: #c0c4cc; font-size: 18px; margin: 4px 0;" }, "⬇"),
          h("div", [
            h("span", { style: "color: #409eff; font-size: 14px; font-weight: 600;" }, "新 IMEI"),
            h("div", { style: "color: #409eff; font-size: 16px; font-weight: 700; word-break: break-all;" }, newImei),
          ]),
        ]),
        h("div", { style: "background: #fef0f0; border-left: 4px solid #f56c6c; border-radius: 4px; padding: 10px 14px;" }, [
          h("span", { style: "color: #f56c6c; font-size: 13px; font-weight: 600;" }, "⚠ 请务必确认新 IMEI 号准确无误，提交后无法二次修改！"),
        ]),
      ]);

      ElMessageBox.confirm(msg, "确认修改 IMEI", {
        confirmButtonText: "确认提交",
        cancelButtonText: "取消",
        customClass: "imei-confirm-dialog",
        lockScroll: false,
      })
        .then(() => {
          this.doSubmit(meterCode, oldImei, newImei);
        })
        .catch(() => {});
    },
    doSubmit(meterCode, oldImei, newImei) {
      service
        .post("/userManage/meterRead/changeMeterImei", {
          meterCode,
          oldImei,
          newImei,
        })
        .then((res) => {
          if (res.code === 200) {
            ElMessage.success("修改成功");
            this.handleClose();
          } else if (res.code === -1) {
            ElMessage.error(res.msg);
          }
        })
        .catch((err) => {
          ElMessage.error("提交失败：" + err.message);
        });
    },
  },
};
</script>

<style scoped>
.add-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgba(31, 33, 38, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.account-dialog-content {
  width: 60%;
  min-height: 200px;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  overflow: hidden;
}

.account-add-content {
  min-height: 75px;
  width: 94%;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 15px;
  margin-bottom: 5px;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: 15px;
  box-sizing: border-box;
  overflow-y: auto;
  max-height: 60vh;
}

.edit-input {
  display: flex;
  justify-content: center;
  flex-direction: column;
  height: 73px;
}

.edit-input > span {
  font-size: 20px;
  color: #747374;
  margin-bottom: 5px;
}

.edit-input > .el-input {
  height: 35px;
  width: 100%;
}

.input-item {
  height: 35px;
  width: 100%;
}

.title {
  width: 100%;
  background-color: #fff;
  border-radius: 8px 8px 0 0;
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

.info-panel {
  width: 100%;
  margin-top: 10px;
}

.loading-panel {
  min-height: 120px;
}

.info-section-title {
  font-size: 18px;
  color: #45ba7e;
  font-weight: 600;
  margin: 12px 0 8px;
  padding-left: 8px;
  border-left: 3px solid #45ba7e;
}

.binding-empty {
  padding: 14px 10px;
  color: #909399;
  font-size: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.imei-confirm-dialog {
  width: 480px;
}
</style>
