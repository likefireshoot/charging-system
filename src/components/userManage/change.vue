<template>
  <div v-if="change_dialogFormVisible" class="change-dialog">
    <div class="change-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon8.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 20px">换表</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleChangeCancel">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>

      <div class="change-content">
        <div class="change-input input-31">
          <span>用户号</span>
          <el-input v-model="changeData.userId" disabled />
        </div>
        <div class="change-input input-31">
          <span>用户名称</span>
          <el-input v-model="changeData.userName" disabled />
        </div>
        <div class="change-input input-31">
          <span>联系电话</span>
          <el-input v-model="changeData.userPhone" disabled />
        </div>
        <div class="change-input input-23">
          <span>旧表号</span>
          <el-input v-model="changeData.oldMeterCode" disabled />
        </div>
        <div class="change-input input-23">
          <span>旧表读数</span>
          <el-input v-model="changeData.oldCount" disabled />
        </div>
        <div class="change-input input-23">
          <span>换表时表数</span>
          <el-input v-model="changeData.changeCount" type="number" />
        </div>
        <div class="change-input input-23">
          <span>补扣费用</span>
          <el-input :model-value="previewCharge" disabled />
        </div>
        <div class="change-input input-23">
          <span>新表号</span>
          <el-input v-model="changeData.newMeterCode" />
        </div>
        <div class="change-input input-23">
          <span>新表读数</span>
          <el-input v-model="changeData.newMeterReading" type="number" />
        </div>
      </div>

      <div class="btn">
        <div class="confirm-btn" @click="handleCommit">
          <el-icon style="margin-left: 15%"><Check /></el-icon>
          <span style="font-size: 20px; margin-left: 15%">确认</span>
        </div>
        <div class="cancel-btn" @click="handleChangeCancel">
          <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
          <span style="font-size: 20px; margin-left: 15%; color: #5a5a5a">取消</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import service from "@/api/request";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  props: {
    change_dialogFormVisible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      changeData: {
        userId: "",
        userName: "",
        userPhone: "",
        oldMeterCode: "",
        oldCount: "",
        newMeterCode: "",
        newMeterReading: "",
        changeCount: "",
      },
      previewCharge: "0.00",
    };
  },
  watch: {
    data: {
      handler() {
        this.assignmentData();
      },
      immediate: true,
      deep: true,
    },
    "changeData.changeCount"() {
      this.refreshChargePreview();
    },
  },
  methods: {
    handleChangeCancel() {
      this.$emit("close");
    },
    assignmentData() {
      const oldReading = this.normalizeNumber(this.data?.newReading);
      const oldReadingText = oldReading === null ? "" : String(oldReading);
      this.changeData.userId = this.data?.userId ?? "";
      this.changeData.userName = this.data?.userName ?? "";
      this.changeData.userPhone = this.data?.phone ?? "";
      this.changeData.oldMeterCode = this.data?.meterCode ?? "";
      this.changeData.oldCount = oldReadingText;
      this.changeData.newMeterCode = "";
      this.changeData.newMeterReading = "";
      this.changeData.changeCount = oldReadingText;
      this.previewCharge = "0.00";
    },
    normalizeNumber(value) {
      if (value === "" || value === null || value === undefined) {
        return null;
      }
      const num = Number(value);
      return Number.isFinite(num) ? num : null;
    },
    formatAmount(value) {
      const num = this.normalizeNumber(value);
      return num === null ? "0.00" : num.toFixed(2);
    },
    refreshChargePreview() {
      const oldCount = this.normalizeNumber(this.changeData.oldCount);
      const changeCount = this.normalizeNumber(this.changeData.changeCount);
      if (!this.changeData.oldMeterCode || oldCount === null || changeCount === null || changeCount < oldCount) {
        this.previewCharge = "0.00";
        return;
      }

      service
        .post("/userManage/meterRead/previewChangeMeterCharge", {
          oldMeterCode: this.changeData.oldMeterCode,
          changeReading: changeCount,
        })
        .then((res) => {
          this.previewCharge = this.formatAmount(res.data?.chargeAmount);
        })
        .catch(() => {
          this.previewCharge = "0.00";
        });
    },
    handleCommit() {
      Object.keys(this.changeData).forEach((key) => {
        if (typeof this.changeData[key] === "string") {
          this.changeData[key] = this.changeData[key].trim();
        }
      });

      const formData = {
        userId: this.changeData.userId,
        userName: this.changeData.userName,
        oldMeterCode: this.changeData.oldMeterCode,
        oldCount: this.changeData.oldCount,
        newMeterCode: this.changeData.newMeterCode,
        newMeterReading: this.changeData.newMeterReading,
        changeCount: this.changeData.changeCount,
      };

      const fieldNameMap = {
        userId: "用户号",
        userName: "用户名称",
        oldMeterCode: "旧表号",
        oldCount: "旧表读数",
        newMeterCode: "新表号",
        newMeterReading: "新表读数",
        changeCount: "换表时表数",
      };

      const requiredFields = ["userId", "userName", "oldMeterCode", "oldCount", "newMeterCode", "newMeterReading", "changeCount"];
      const missingFields = requiredFields.filter((key) => {
        const value = formData[key];
        return value === undefined || value === null || value === "";
      });

      if (missingFields.length > 0) {
        ElMessage.error(missingFields.map((field) => fieldNameMap[field] || field).join("、") + "不能为空");
        return;
      }

      const oldCount = this.normalizeNumber(formData.oldCount);
      const newMeterReading = this.normalizeNumber(formData.newMeterReading);
      const changeCount = this.normalizeNumber(formData.changeCount);
      if (newMeterReading === null) {
        ElMessage.error("新表读数格式不正确");
        return;
      }
      if (changeCount === null) {
        ElMessage.error("换表时表数格式不正确");
        return;
      }
      if (oldCount !== null && changeCount < oldCount) {
        ElMessage.error("换表时表数不能小于旧表读数");
        return;
      }

      const doSubmit = () => {
        service
          .put("/userManage/meterRead/changeMeter", {
            oldMeterCode: formData.oldMeterCode,
            newMeterCode: formData.newMeterCode,
            newReading: newMeterReading,
            changeReading: changeCount,
          })
          .then((res) => {
            if (res.code === 200) {
              ElMessage.success("提交成功");
              this.handleChangeCancel();
            } else {
              ElMessage.error("提交失败：" + res.msg);
            }
          })
          .catch((err) => {
            ElMessage.error("提交失败：" + err.message);
          });
      };

      ElMessageBox.confirm(
        `<div class="confirm-body">
          <div class="confirm-title">请确认以下换表信息</div>
          <div class="confirm-section">
            <div class="section-title">用户信息</div>
            <div class="section-row">
              <span class="field"><label>用户号：</label>${formData.userId}</span>
              <span class="field"><label>用户名称：</label>${formData.userName}</span>
            </div>
          </div>
          <div class="confirm-section">
            <div class="section-title">旧表信息</div>
            <div class="section-row">
              <span class="field"><label>表号：</label>${formData.oldMeterCode}</span>
              <span class="field"><label>旧表读数：</label>${formData.oldCount}</span>
              <span class="field"><label>换表时读数：</label>${formData.changeCount}</span>
            </div>
          </div>
          <div class="confirm-section">
            <div class="section-title">新表信息</div>
            <div class="section-row">
              <span class="field"><label>表号：</label>${formData.newMeterCode}</span>
              <span class="field"><label>新表读数：</label><b>${formData.newMeterReading}</b></span>
            </div>
          </div>
          <div class="confirm-warning">⚠ 新表将从该读数开始计费，请务必确认清楚，否则可能造成不必要的扣费。</div>
        </div>`,
        "确认换表",
        {
          confirmButtonText: "确认提交",
          cancelButtonText: "取消",
          dangerouslyUseHTMLString: true,
          type: "warning",
          customClass: "change-confirm-box",
          lockScroll: false,
        }
      )
        .then(() => {
          doSubmit();
        })
        .catch(() => {});
    },
  },
};
</script>

<style scoped>
.change-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.change-dialog-content {
  width: 75%;
  min-height: 300px;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-top: -150px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.change-content {
  width: 94%;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 20px;
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 0 1%;
  padding: 5px;
  overflow-y: auto;
}

.change-input {
  display: flex;
  justify-content: center;
  flex-direction: column;
  height: 75px;
}

.input-31 {
  width: 31%;
}

.input-23 {
  width: 23%;
}

.change-input > span {
  font-size: 20px;
  color: #747374;
  margin-bottom: 5px;
}

.change-input > .el-input {
  height: 35px;
  width: 100%;
}

.title {
  width: 100%;
  background-color: #fff;
  border-radius: 5px 5px 0 0;
  box-shadow: 0 0 5px rgb(0 0 0 / 10%);
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
  height: 42px;
  width: 110px;
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

<style>
.change-confirm-box {
  width: 760px;
  max-width: 90vw;
}

.change-confirm-box .el-message-box__header {
  padding: 20px 28px 0;
}

.change-confirm-box .el-message-box__content {
  padding: 18px 28px 20px;
}

.change-confirm-box .el-message-box__status {
  display: none;
}

.change-confirm-box .el-message-box__message {
  padding: 0;
}

.change-confirm-box .el-message-box__btns {
  padding: 8px 28px 20px;
}

.change-confirm-box .el-button {
  padding: 6px 16px;
  font-size: 14px;
  height: auto;
}

.confirm-body {
  font-size: 15px;
  color: #555;
}

.confirm-body .confirm-title {
  font-weight: 600;
  color: #333;
  font-size: 17px;
  margin-bottom: 14px;
}

.confirm-body .confirm-section {
  background: #f7f9fc;
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 10px;
}

.confirm-body .section-title {
  font-weight: 600;
  color: #666;
  font-size: 13px;
  margin-bottom: 6px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 4px;
}

.confirm-body .section-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
}

.confirm-body .field {
  white-space: nowrap;
}

.confirm-body .field label {
  color: #999;
}

.confirm-body .confirm-warning {
  margin-top: 12px;
  color: #e74c3c;
  font-weight: 600;
  font-size: 14px;
}
</style>
