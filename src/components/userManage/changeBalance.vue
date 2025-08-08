<template>
  <!-- 充值弹出框 -->
  <div class="recharge-dialog" v-if="changeBalance_dialogFormVisible">
    <div class="change-balance-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon20.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 18px">余额调整</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleRechargeClose">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="recharge-content">
        <div class="recharge-input" style="margin-right: 1%">
          <span>用户号</span>
          <el-input v-model="rechargeData.userId" disabled />
        </div>
        <div class="recharge-input" style="margin-right: 1%">
          <span>用户名称</span>
          <el-input v-model="rechargeData.userName" disabled />
        </div>
        <div class="recharge-input" style="margin-right: 1%">
          <span>表号</span>
          <el-input v-model="rechargeData.meterCode" disabled />
        </div>
        <div class="recharge-input" style="margin-right: 1%">
          <span>当前可用余额/元</span>
          <el-input v-model="rechargeData.balance" disabled />
        </div>
        <div class="recharge-input" style="margin-right: 1%">
          <span>修改后的余额/元</span>
          <el-input v-model="rechargeData.newBalance" />
        </div>
      </div>
      <div class="btn">
        <div class="confirm-btn" @click="handleConfirm">
          <el-icon style="margin-left: 15%"><Check /></el-icon>
          <span style="font-size: 16px; margin-left: 15%">确认</span>
        </div>
        <div class="cancel-btn" @click="handleRechargeClose">
          <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
          <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">取消</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessage } from "element-plus";
import service from "@/api/request";

export default {
  props: {
    changeBalance_dialogFormVisible: {
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
      rechargeData: {
        userId: "",
        userName: "",
        meterCode: "",
        balance: "",
        newBalance: "",
      },
    };
  },
  mounted() {
    this.assignmentData();
  },
  methods: {
    handleRechargeClose() {
      this.$emit("close");
    },
    assignmentData() {
      this.rechargeData.userId = this.data.userId;
      this.rechargeData.userName = this.data.userName;
      this.rechargeData.balance = this.data.balance;
      this.rechargeData.meterCode = this.data.meterCode;
    },
    handleConfirm() {
      let missingFields = [];
      let params = {
        userId: this.rechargeData.userId,
        meterCode: this.rechargeData.meterCode,
        newBalance: this.rechargeData.newBalance,
      };
      console.log(params);

      // 定义字段名映射，将属性名映射为友好的显示名称
      const fieldNameMap = {
        userId: "用户号",
        meterCode: "表号",
        newBalance: "修改后的余额",
      };

      function traverseObject(obj, parentKey = "") {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const fullKey = parentKey ? `${parentKey}.${key}` : key;
            const value = obj[key];

            if (key === "newBalance" && value !== null && value !== "") {
              const numValue = parseFloat(value);
              if (isNaN(numValue) || numValue <= 0) {
                ElMessage.error("调整后的余额必须为正数");
                return false; // ❗返回 false 表示校验失败
              }
            }
          }
        }
        return true; // ✅ 校验通过
      }

      const isValid = traverseObject(params);
      if (!isValid) return; // ❗直接终止 handleConfirm 执行

      traverseObject(params);

      if (missingFields.length > 0) {
        const fieldNames = missingFields.map((field) => fieldNameMap[field] || field);
        const message = fieldNames.join("、") + "不能为空";
        ElMessage.error(message);
        return;
      }
      service
        .put("/userManage/userCharge/changeBalance", params)
        .then((response) => {
          if (response.code === 200) {
            ElMessage.success("调整余额成功");
            this.handleRechargeClose();
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
  },
};
</script>

<style>
.recharge-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.change-balance-dialog-content {
  width: 60%;
  height: 320px;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-top: -200px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.recharge-content {
  width: 94%;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 15px;
  margin-bottom: 5px;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: 10px;
  overflow-y: auto;
}

.recharge-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 32.3%;
  height: 75px;
}

.recharge-input > span {
  font-size: 14px;
  color: #747374;
  margin-bottom: 5px;
}

.recharge-input > .el-input {
  height: 35px;
  width: 100%;
}

.el-radio {
  --el-color-primary: #46b97e;
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
