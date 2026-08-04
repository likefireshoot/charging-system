<template>
  <div class="add-dialog" v-if="add_dialogFormVisible">
    <div class="account-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon13.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 20px">新增设备</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleAddClose">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="account-add-content">
        <div class="edit-input" style="margin-right: 1%">
          <span>表号</span>
          <el-input v-model="addData.meterCode" class="input-item" @input="onMeterCodeChange" />
        </div>
        <div class="edit-input" style="margin-right: 1%">
          <span>水表吨位数</span>
          <el-input v-model.number="addData.tonnage" type="number" class="input-item" placeholder="默认为 0" />
        </div>
        <div v-if="addData.meterVendor" class="auto-info">
          <span>自动识别：</span>
          <span class="auto-tag">{{ addData.meterVendor }}</span>
        </div>
      </div>
      <div class="btn">
        <div class="confirm-btn" @click="handleCommit">
          <el-icon style="margin-left: 15%"><Check /></el-icon>
          <span style="font-size: 16px; margin-left: 15%">确认</span>
        </div>
        <div class="cancel-btn" @click="handleAddClose">
          <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
          <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">取消</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import service from "@/api/request";
import { ElMessage } from "element-plus";

export default {
  props: {
    add_dialogFormVisible: {
      type: Boolean,
      default: false,
    },
    companyList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      addData: {
        meterCode: "",
        imei: "",
        meterVendor: "",
        productId: "",
        deviceId: "",
        meterType: "",
        masterKey: null,
        companyId: null,
        tonnage: 0,
      },
    };
  },
  methods: {
    handleAddClose() {
      this.$emit("close");
    },

    onMeterCodeChange() {
      const code = this.addData.meterCode.trim();
      if (!code) {
        this.resetAutoFields();
        return;
      }

      this.addData.imei = code + "_新表_自动检测中...";
      this.addData.meterType = "NB-IoT表";
      this.addData.companyId = 1;

      if (/^[1379]\d{9}$/.test(code)) {
        this.addData.meterVendor = "信驰";
        this.addData.masterKey = "5eb4f253756d4b16858afd965f39ad43";
        this.addData.productId = "17245445";
        this.addData.deviceId = "默认id";
      } else if (/^1\d{13}$/.test(code)) {
        this.addData.meterVendor = "集万讯";
        this.addData.masterKey = "无";
        this.addData.productId = "无";
        this.addData.deviceId = "无";
      } else if (/^6\d{13}$/.test(code)) {
        this.addData.meterVendor = "圣鑫";
        this.addData.masterKey = "e44c23dee3804ddea74f4f10b720d368";
        this.addData.productId = "17247122";
        this.addData.deviceId = "默认id";
      } else if (/^00\d{12}$/.test(code)) {
        this.addData.meterVendor = "千宝通";
        this.addData.masterKey = "无";
        this.addData.productId = "无";
        this.addData.deviceId = "无";
      } else if (/^00\d{10}$/.test(code)) {
        this.addData.meterVendor = "千宝通";
        this.addData.imei = code + "_对接方式接入无需imei";
        this.addData.masterKey = "无";
        this.addData.productId = "无";
        this.addData.deviceId = "无";
        this.addData.meterType = "有线表";
      } else {
        this.addData.meterVendor = "";
        this.addData.masterKey = null;
        this.addData.productId = "";
        this.addData.deviceId = "";
      }
    },

    resetAutoFields() {
      this.addData.imei = "";
      this.addData.meterVendor = "";
      this.addData.productId = "";
      this.addData.deviceId = "";
      this.addData.meterType = "";
      this.addData.masterKey = null;
      this.addData.companyId = null;
    },

    handleCommit() {
      Object.keys(this.addData).forEach((key) => {
        if (typeof this.addData[key] === "string") {
          this.addData[key] = this.addData[key].trim();
        }
      });

      const formData = this.addData;

      if (!formData.meterCode) {
        ElMessage.error("表号不能为空");
        return;
      }

      if (!formData.meterVendor) {
        ElMessage.error("表号格式不正确，请重新确认");
        return;
      }

      if (formData.tonnage !== undefined && formData.tonnage !== null && formData.tonnage !== "") {
        if (!/^-?\d+(\.\d+)?$/.test(formData.tonnage)) {
          ElMessage.error("水表吨位数必须是数字");
          return;
        }
        formData.tonnage = Number(formData.tonnage);
      } else {
        formData.tonnage = 0;
      }

      if (formData.tonnage < 0) {
        ElMessage.error("水表吨位数不能为负数");
        return;
      }
      if (!Number.isInteger(formData.tonnage * 100)) {
        ElMessage.error("水表吨位数最多保留 2 位小数");
        return;
      }

      service
        .post("/userManage/meterRead/addMeter", formData)
        .then((res) => {
          if (res.code === 200) {
            ElMessage.success("提交成功");
            this.handleAddClose();
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

<style>
.add-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.account-dialog-content {
  width: 70%;
  min-height: 200px;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%);
  margin-top: -150px;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  padding: 5px;
  overflow-y: auto;
}

.edit-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 32.3%;
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

.auto-info {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 0;
  font-size: 16px;
  color: #747374;
}

.auto-tag {
  color: #45ba7e;
  font-weight: bold;
  margin-left: 8px;
}
</style>
