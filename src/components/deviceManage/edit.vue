<template>
  <div class="add-dialog" v-if="edit_dialogFormVisible">
    <div class="account-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yuangong/icon3.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 18px">编辑设备</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleEditClose">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="account-add-content">
        <div class="edit-input" style="margin-right: 1%; width: 24%">
          <span>表号</span>
          <el-input v-model="editData.meterCode" class="input-item" disabled />
        </div>
        <div class="edit-input" style="margin-right: 1%; width: 24%">
          <span>imei号</span>
          <el-input v-model="editData.imei" class="input-item" disabled />
        </div>
        <div class="edit-input" style="margin-right: 1%; width: 24%">
          <span>所属水厂</span>
          <el-select v-model="editData.companyName" placeholder="请选择...">
            <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.name"></el-option>
          </el-select>
        </div>
        <div class="edit-input" style="margin-right: 1%; width: 24%">
          <span>所属厂商</span>
          <el-select v-model="editData.vendor" class="input-item">
            <el-option v-for="item in changshang_list" :key="item.id" :label="item.label" :value="item.label"></el-option>
          </el-select>
        </div>
        <div class="edit-input" style="margin-right: 1%">
          <span>产品ID</span>
          <el-input v-model="editData.productId" class="input-item"></el-input>
        </div>
        <div class="edit-input" style="margin-right: 1%">
          <span>设备ID</span>
          <el-input v-model="editData.deviceId" class="input-item"></el-input>
        </div>
        <div class="edit-input" style="margin-right: 1%">
          <span>masterKey</span>
          <el-input v-model="editData.masterKey" class="input-item"></el-input>
        </div>
      </div>
      <div class="btn">
        <div class="confirm-btn" @click="handleCommit">
          <el-icon style="margin-left: 15%"><Check /></el-icon>
          <span style="font-size: 16px; margin-left: 15%">确认</span>
        </div>
        <div class="cancel-btn" @click="handleEditClose">
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
    edit_dialogFormVisible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
    companyList: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      editData: {
        meterId: "",
        meterCode: "",
        imei: "",
        vendor: "",
        productId: "",
        deviceId: "",
        masterKey: "",
        companyId: "",
        companyName: "",
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      changshang_list: [
        { id: 1, label: "信驰", value: 1 },
        { id: 2, label: "集万讯", value: 2 },
        { id: 3, label: "太阳能", value: 3 },
        { id: 4, label: "圣鑫", value: 4 },
        { id: 5, label: "旧信驰", value: 5 },
      ],
      shuibiao_list: [
        {
          id: 1,
          label: "NB-IoT表",
        },
        {
          id: 2,
          label: "普通水表",
        },
      ],
    };
  },
  mounted() {
    this.assignment();
  },
  methods: {
    handleEditClose() {
      this.$emit("close");
    },
    assignment() {
      this.editData.meterId = this.data.meterId;
      this.editData.meterCode = this.data.meterCode;
      this.editData.imei = this.data.imei;
      this.editData.vendor = this.data.meterVendor;
      this.editData.productId = this.data.productId;
      this.editData.deviceId = this.data.deviceId;
      this.editData.masterKey = this.data.masterKey;
      this.editData.companyId = this.data.companyId;
      this.editData.companyName = this.data.companyName;
    },

    handleCommit() {
      let missingFields = [];
      this.companyList.forEach((item) => {
        if (item.name === this.editData.companyName) {
          this.editData.companyId = item.id;
        }
      });
      Object.keys(this.editData).forEach((key) => {
        if (typeof this.editData[key] === "string") {
          this.editData[key] = this.editData[key].trim();
        }
      });

      let formData = {
        meterId: this.editData.meterId,
        productId: this.editData.productId,
        deviceId: this.editData.deviceId,
        masterKey: this.editData.masterKey,
        companyId: this.editData.companyId,
        meterVendor: this.editData.vendor,
      };

      // 定义字段名映射，将属性名映射为友好的显示名称
      const fieldNameMap = {
        meterId: "表号",
        productId: "产品ID",
        deviceId: "设备ID",
        masterKey: "masterKey",
        companyId: "所属水厂",
        vendor: "所属厂商",
      };

      // 递归遍历对象属性
      function traverseObject(obj, parentKey = "") {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const fullKey = parentKey ? `${parentKey}.${key}` : key;
            const value = obj[key];
            if (key === "companyId" || key === "masterKey") {
              continue;
            } else {
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
        }
      }

      traverseObject(formData);

      if (missingFields.length > 0) {
        const fieldNames = missingFields.map((field) => fieldNameMap[field] || field);
        const message = fieldNames.join("、") + "不能为空";
        ElMessage.error(message);
        return;
      }

      console.log(formData);
      if (this.editData.masterKey !== "" && this.editData.masterKey !== null) {
        this.editData.masterKey = this.editData.masterKey.trim();
      }

      // 所有字段都不为空，提交数据到后台
      service
        .post("/userManage/meterRead/editMeter", formData)
        .then((res) => {
          if (res.code === 200) {
            ElMessage.success("提交成功");
            // 可以在这里添加提交成功后的其他逻辑，比如关闭对话框
            this.handleEditClose();
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
</style>
