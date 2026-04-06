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
            <el-radio value="10" class="recharge-green">10 元</el-radio>
            <el-radio value="50" class="recharge-green">50 元</el-radio>
            <el-radio value="100" class="recharge-green">100 元</el-radio>
            <el-radio value="150" class="recharge-green">150 元</el-radio>
            <el-radio value="200" class="recharge-green">200 元</el-radio>
            <el-radio value="500" class="recharge-green">500 元</el-radio>
            <el-radio value="" class="recharge-green">取消</el-radio>
          </el-radio-group>
        </div>
        <div class="recharge-input" style="margin-right: 1%">
          <span>充值金额（元）</span>
          <el-input
            v-model="rechargeData.money"
            @input="handleMoneyInput"
            @blur="handleMoneyBlur"
            placeholder="请输入充值金额"
          />
          <span v-if="moneyError" style="color: #f56c6c; font-size: 14px; margin-top: 5px;">{{ moneyError }}</span>
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

  <!-- 打印确认对话框 -->
  <el-dialog
    v-model="printDialogVisible"
    title="打印收据"
    width="500px"
    :close-on-click-modal="false"
    :show-close="false"
    custom-class="print-confirm-dialog"
    :lock-scroll="false"
  >
    <div class="print-dialog-content">
      <div class="print-icon">
        <el-icon size="80" color="#46B97E"><Printer /></el-icon>
      </div>
      <div class="print-message">
        <p style="font-size: 22px; color: #333; margin: 20px 0;">充值成功！</p>
        <p style="font-size: 20px; color: #666;">是否立即打印收据？</p>
      </div>

      <!-- ✅ 添加自动下载勾选框 -->
      <div class="auto-download-checkbox" style="margin: 20px 0 10px 0;">
        <el-checkbox v-model="autoDownload" size="large">
          <span style="font-size: 16px; color: #666;">自动下载PDF文件</span>
        </el-checkbox>
        <div style="font-size: 12px; color: #999; margin-top: 5px;">
          勾选后，打印时将自动保存PDF文件到本地
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleSkipPrint" style="width: 100px; font-size: 16px;">稍后打印</el-button>
        <el-button type="success" @click="handleConfirmPrint" style="width: 100px; font-size: 16px;">立即打印</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 隐藏的 PDF 容器，用于打印 -->
  <div id="print-container" style="position: absolute; left: -9999px; top: 0;"></div>
</template>

<script>
import { ElMessage } from "element-plus";
import service from "@/api/request";
import axios from "axios";

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
      printDialogVisible: false,
      receiptPDFBlob: null,
      receiptData: null,
      autoDownload: true,
      moneyError: "", // 添加金额错误提示
      isCharging: false, // 添加充值中状态
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
    // 处理金额输入
    handleMoneyInput(value) {
      this.moneyError = "";

      if (!value) {
        this.rechargeData.money = "";
        return;
      }

      // 只允许数字和小数点输入
      let cleanedValue = value.replace(/[^\d.]/g, "");

      // 确保只有一个小数点
      const parts = cleanedValue.split(".");
      if (parts.length > 2) {
        cleanedValue = parts[0] + "." + parts.slice(1).join("");
      }

      // 限制小数位数为 2 位
      if (cleanedValue.includes(".")) {
        const decimalParts = cleanedValue.split(".");
        if (decimalParts[1] && decimalParts[1].length > 2) {
          cleanedValue = decimalParts[0] + "." + decimalParts[1].substring(0, 2);
        }
      }

      this.rechargeData.money = cleanedValue;
    },
    // 处理金额失去焦点
    handleMoneyBlur() {
      if (!this.rechargeData.money) {
        this.moneyError = "";
        return;
      }

      let value = this.rechargeData.money;
      let numValue = parseFloat(value);

      // 检查是否为有效数字
      if (isNaN(numValue)) {
        this.moneyError = "请输入有效的数字";
        this.rechargeData.money = "";
        return;
      }

      // 检查是否为正数
      if (numValue <= 0) {
        this.moneyError = "充值金额必须大于 0";
        this.rechargeData.money = "";
        return;
      }

      // 检查金额上限（可选）
      if (numValue > 999999.99) {
        this.moneyError = "充值金额不能超过 999,999.99 元";
        this.rechargeData.money = "";
        return;
      }

      // 自动格式化为两位小数
      this.rechargeData.money = numValue.toFixed(2);
      this.moneyError = "";
    },
    handleConfirm() {
      if (this.isCharging) {
        ElMessage.warning('正在处理中，请勿重复操作');
        return;
      }
      // 先进行金额校验
      if (this.rechargeData.money && !this.rechargeData.quickmoney) {
        if (this.moneyError) {
          ElMessage.error(this.moneyError);
          return;
        }

        // 再次验证金额格式
        const numValue = parseFloat(this.rechargeData.money);
        if (isNaN(numValue) || numValue <= 0) {
          ElMessage.error("充值金额必须为正数");
          return;
        }

        // 验证是否为两位小数格式
        if (!/^\d+(\.\d{2})?$/.test(this.rechargeData.money)) {
          ElMessage.error("充值金额必须保留两位小数（例如：10.00）");
          return;
        }
      }

      let missingFields = [];
      Object.keys(this.rechargeData).forEach((key) => {
        if (typeof this.rechargeData[key] === "string") {
          this.rechargeData[key] = this.rechargeData[key].trim();
        }
      });
      const formData = this.rechargeData;
      console.log(formData);

      const fieldNameMap = {
        userName: "用户名称",
        meterCode: "表号",
        balance: "余额",
        quickmoney: "快捷充值金额",
        money: "充值金额",
      };

      if (formData.quickmoney && formData.money) {
        ElMessage.error("快捷充值金额和充值金额只能选择其一");
        return;
      }

      function traverseObject(obj, parentKey = "") {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const fullKey = parentKey ? `${parentKey}.${key}` : key;
            const value = obj[key];

            if (key === "quickmoney" || key === "money") {
              if (
                formData.quickmoney === undefined ||
                formData.quickmoney === null ||
                (formData.quickmoney === "" && (formData.money === undefined || formData.money === null || formData.money === ""))
              ) {
                missingFields.push(fullKey);
              }
              if (key === "money" && value !== null && value !== "") {
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue <= 0) {
                  ElMessage.error("充值金额必须为正数");
                  return false;
                }
              }
              continue;
            }

            if (typeof value === "object" && value !== null) {
              traverseObject(value, fullKey);
            } else {
              if (value === undefined || value === null || value === "") {
                missingFields.push(fullKey);
              }
            }
          }
        }
        return true;
      }
      const isValid = traverseObject(formData);
      if (!isValid) return;

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
        dataParams.rechargeAmount = parseFloat(formData.quickmoney).toFixed(2);
      } else if (formData.money) {
        dataParams.rechargeAmount = parseFloat(formData.money).toFixed(2);
      }
      console.log(dataParams);
      this.isCharging = true;
      service
        .post("/userManage/userCharge/rechargeUserMeter", dataParams)
        .then((response) => {
          if (response.code === 200) {
            // 保存收据数据
            const rechargeAmount = parseFloat(formData.quickmoney || formData.money);
            // this.receiptData=response.data;
            this.receiptData = {
              rechargeRecordId: response.data.rechargeRecordId,
              userId: this.data.userId || "",
              date: new Date().toISOString().replace("T", " ").substring(0, 19),
              userName: this.rechargeData.userName,
              userAddress: this.data.userAddr || "",
              operator: JSON.parse(sessionStorage.getItem("userData")).staffName,
              beforeAmount: parseFloat(this.rechargeData.balance) || 0,
              amount: rechargeAmount.toFixed(2),
              afterAmount: ((parseFloat(this.rechargeData.balance) || 0) + rechargeAmount).toFixed(2),
            };

            // 显示打印确认对话框
            this.printDialogVisible = true;
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        }).finally(() => {
        this.isCharging = false;
      });
    },
    handleSkipPrint() {
      this.printDialogVisible = false;

      // 保存数据副本
      const receiptDataCopy = this.receiptData;
      const autoDownloadEnabled = this.autoDownload;

      // 清空数据和关闭弹窗
      this.receiptData = null;
      this.handleRechargeClose();

      // 执行下载
      if (autoDownloadEnabled && receiptDataCopy) {
        this.downloadReceiptOnly(receiptDataCopy);
        ElMessage.info("已跳过打印，PDF文件已自动下载");
      } else {
        ElMessage.info("已跳过打印");
      }
    },
    handleConfirmPrint() {
      this.printDialogVisible = false;
      this.printAndDownloadReceipt();
    },
    // ✅ 新增：仅下载，不打印
    downloadReceiptOnly(receiptData) {
      console.log("自动下载收据参数:", receiptData);

      axios({
        url: "/userManage/userCharge/receipt",
        method: "POST",
        responseType: "blob",
        data: receiptData,
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error("导出失败：" + response.statusText);
          }

          const blob = new Blob([response.data], { type: "application/pdf" });
          if (blob.size === 0) {
            ElMessage.warning("内容为空，无法下载");
            return;
          }

          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = receiptData.userName + "-充值收据.pdf";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(link.href);
        })
        .catch((error) => {
          console.error("下载失败:", error);
          ElMessage.error("下载失败：" + error.message);
        });
    },
    // ✅ 修改：打印并可选下载
    printAndDownloadReceipt() {
      console.log("收据参数:", this.receiptData);

      axios({
        url: "/userManage/userCharge/receipt",
        method: "POST",
        responseType: "blob",
        data: this.receiptData,
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error("导出失败：" + response.statusText);
          }

          const blob = new Blob([response.data], { type: "application/pdf" });
          if (blob.size === 0) {
            ElMessage.warning("内容为空，无法下载");
            return;
          }

          this.receiptPDFBlob = blob;

          // ✅ 步骤 1: 根据 autoDownload 决定是否下载
          if (this.autoDownload) {
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = this.receiptData.userName + "-充值收据.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(link.href);
          }

          // 步骤 2: 在新窗口打开 PDF 并触发打印
          const pdfUrl = window.URL.createObjectURL(blob);
          const printWindow = window.open(pdfUrl, '_blank');
          if (printWindow) {
            printWindow.onload = () => {
              setTimeout(() => {
                printWindow.print();
              }, 500);
            };
          }

          this.handleRechargeClose();
          ElMessage.success("正在打印收据..." + (this.autoDownload ? " PDF文件已自动下载" : ""));
        })
        .catch((error) => {
          console.error("导出失败:", error);
          ElMessage.error("导出失败：" + error.message);
        });
    },
    printPDFWithWebPrintJS() {
      // 如果需要使用 web-print-js 的方案（需要先安装）
      // npm install web-print-js
      /*
      import WebPrint from 'web-print-js';

      const webPrint = new WebPrint();
      const printWindow = window.open('', '_blank');

      const blobUrl = window.URL.createObjectURL(this.receiptPDFBlob);

      webPrint.printToPDF(blobUrl).then(() => {
        this.handleRechargeClose();
        ElMessage.success("打印成功");
      }).catch((error) => {
        ElMessage.error("打印失败：" + error.message);
      });
      */
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
  height: 420px;
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
  justify-content: center;
  flex-direction: column;
  width: 32.3%;
  height: 85px;
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

/* 打印对话框样式 */
.print-dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.print-icon {
  margin: 20px 0;
}

.print-message {
  text-align: center;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 15px;
}

/* ✅ 添加自动下载复选框样式 */
.auto-download-checkbox {
  width: 100%;
  text-align: center;
}
</style>

<style>
/* 全局样式，用于自定义 Dialog 样式 */
.print-confirm-dialog .el-dialog__header {
  background-color: #f5f7fa;
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.print-confirm-dialog .el-dialog__title {
  font-size: 20px;
  color: #333;
}

.print-confirm-dialog .el-dialog__body {
  padding: 0;
}

.print-confirm-dialog .el-dialog__footer {
  padding: 15px 20px;
  border-top: 1px solid #e4e7ed;
}
</style>
