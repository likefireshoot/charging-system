<template>
  <!-- 充值弹出框 -->
  <div class="recharge-dialog" v-if="recharge_dialogFormVisible">
    <div class="recharge-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon6.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 20px">充值</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleRechargeClose">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="recharge-content">
        <div class="recharge-input" style="margin-right: 1%">
          <span>用户名称</span>
          <el-input v-model="rechargeData.userName" disabled />
        </div>
        <div class="recharge-input" style="margin-right: 1%">
          <span>表号</span>
          <el-input v-model="rechargeData.meterCode" disabled />
        </div>
        <div class="recharge-input" style="margin-right: 1%">
          <span>当前可用余额</span>
          <el-input v-model="rechargeData.balance" disabled />
        </div>
        <div class="recharge-input" style="margin-right: 1%; width: 100%">
          <span>快捷充值金额</span>
          <el-radio-group v-model="rechargeData.quickmoney">
            <el-radio value="10" class="recharge-green">10元</el-radio>
            <el-radio value="50" class="recharge-green">50元</el-radio>
            <el-radio value="100" class="recharge-green">100元</el-radio>
            <el-radio value="150" class="recharge-green">150元</el-radio>
            <el-radio value="200" class="recharge-green">200元</el-radio>
            <el-radio value="500" class="recharge-green">500元</el-radio>
            <el-radio value="" class="recharge-green">取消</el-radio>
          </el-radio-group>
        </div>
        <div class="recharge-input" style="margin-right: 1%">
          <span>充值金额（元）</span>
          <el-input v-model="rechargeData.money" />
        </div>
        <!-- 添加的提示文字 -->
        <div style="font-size: 17px; color: #999; padding-top: 18px;">
          <div style="height: 19px"></div>
          <span style="margin-left: 16px">   快捷充值金额 与 充值金额 二选一即可</span>
        </div>
      </div>
      <div class="btn">
        <div class="confirm-btn" @click="handleConfirm">
          <el-icon style="margin-left: 5%"><Check /></el-icon>
          <span style="font-size: 20px; margin-left: 15%">确认</span>
        </div>
        <div class="cancel-btn" @click="handleRechargeClose">
          <el-icon style="margin-left: 5%; color: #45ba7e"><Close /></el-icon>
          <span style="font-size: 20px; margin-left: 15%; color: #5a5a5a">取消</span>
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
    recharge_dialogFormVisible: {
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
        userName: "",
        meterCode: "",
        balance: "",
        quickmoney: "",
        money: "",
        rechargeType: "现金",
        region: "",
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
      this.rechargeData.userName = this.data.userName;
      this.rechargeData.balance = this.data.balance;
      this.rechargeData.meterCode = this.data.meterCode;
      this.rechargeData.region = this.data.regionName;
    },
    handleConfirm() {
      let missingFields = [];
      Object.keys(this.rechargeData).forEach((key) => {
        if (typeof this.rechargeData[key] === "string") {
          this.rechargeData[key] = this.rechargeData[key].trim();
        }
      });
      const formData = this.rechargeData;
      console.log(formData);

      // 定义字段名映射，将属性名映射为友好的显示名称
      const fieldNameMap = {
        userName: "用户名称",
        meterCode: "表号",
        balance: "余额",
        quickmoney: "快捷充值金额",
        money: "充值金额",
      };

      // 检查快捷充值金额和充值金额是否同时存在
      if (formData.quickmoney && formData.money) {
        ElMessage.error("快捷充值金额和充值金额只能选择其一");
        return;
      }

      // 递归遍历对象属性
      function traverseObject(obj, parentKey = "") {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const fullKey = parentKey ? `${parentKey}.${key}` : key;
            const value = obj[key];

            // 特殊处理快捷充值金额和充值金额
            if (key === "quickmoney" || key === "money") {
              // 如果两者都为空，才认为是缺失字段
              if (
                formData.quickmoney === undefined ||
                formData.quickmoney === null ||
                (formData.quickmoney === "" && (formData.money === undefined || formData.money === null || formData.money === ""))
              ) {
                missingFields.push(fullKey);
              }
              // 检查 money 是否为正数
              if (key === "money" && value !== null && value !== "") {
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue <= 0) {
                  ElMessage.error("充值金额必须为正数");
                  return false; // ❗返回 false 表示校验失败
                }
              }
              continue; // 跳过后续的空值检查
            }

            if (typeof value === "object" && value !== null) {
              // 如果是对象，继续递归遍历
              traverseObject(value, fullKey);
            } else {
              // 检查值是否为空，排除0的情况
              if (value === undefined || value === null || value === "") {
                missingFields.push(fullKey);
              }
            }
          }
        }
        return true; // ✅ 校验通过
      }
      const isValid = traverseObject(formData);
      if (!isValid) return; // ❗直接终止 handleConfirm 执行

      if (missingFields.length > 0) {
        const fieldNames = missingFields.map((field) => fieldNameMap[field] || field);
        const message = fieldNames.join("、") + "不能为空";
        ElMessage.error(message);
        return;
      }
      let dataParams = {
        meterCode: formData.meterCode,
        rechargeType: "现金",
        rechargeAmount: null,
        region: formData.region
      };
      if (formData.quickmoney) {
        dataParams.rechargeAmount = formData.quickmoney;
      } else if (formData.money) {
        dataParams.rechargeAmount = formData.money;
      }
      console.log(dataParams);
      service
        .post("/userManage/userCharge/rechargeUserMeter", dataParams)
        .then((response) => {
          if (response.code === 200) {
            ElMessage.success("充值成功");
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

<style scoped>
.recharge-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.recharge-dialog-content {
  width: 60%;
  height: 380px;
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
  font-size: 20px;
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
