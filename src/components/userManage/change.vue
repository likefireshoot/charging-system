<template>
  <div class="change-dialog" v-if="change_dialogFormVisible">
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
        <div class="change-input" style="margin-right: 1%">
          <span>用户号</span>
          <el-input v-model="changeData.userId" disabled />
        </div>
        <div class="change-input" style="margin-right: 1%">
          <span>用户名称</span>
          <el-input v-model="changeData.userName" disabled />
        </div>
        <div class="change-input" style="margin-right: 1%">
          <span>联系电话</span>
          <el-input v-model="changeData.userPhone" disabled />
        </div>
        <div class="change-input" style="margin-right: 1%; width: 23%">
          <span>旧表号</span>
          <el-input v-model="changeData.oldMeterCode" disabled />
        </div>
        <!-- <div class="change-input" style="margin-right: 1%">
          <span>旧IMEI号</span>
          <el-input v-model="changeData.oldImei" disabled />
        </div> -->
        <!-- <div class="change-input" style="margin-right: 1%">
          <span>旧表类型</span>
          <el-input v-model="changeData.oldMeterType" disabled />
        </div> -->
        <div class="change-input" style="margin-right: 1%; width: 23%">
          <span>旧表读数</span>
          <el-input v-model="changeData.oldCount" disabled />
        </div>
        <div class="change-input" style="margin-right: 1%; width: 23%">
          <span>新表号</span>
          <el-input v-model="changeData.newMeterCode" />
        </div>
        <!-- <div class="change-input" style="margin-right: 1%">
          <span>新IMEI号</span>
          <el-input v-model="changeData.newImei" />
        </div> -->
        <!-- <div class="change-input" style="margin-right: 1%">
          <span>新表类型</span>
          <el-select v-model="changeData.newMeterType">
            <el-option v-for="item in shuibiao_list" :key="item.id" :label="item.label" :value="item.label"></el-option>
          </el-select>
        </div> -->
        <div class="change-input" style="margin-right: 1%; width: 23%">
          <span>新表读数</span>
          <el-input v-model="changeData.newCount" />
        </div>
        <!-- <div class="change-input" style="margin-right: 1%">
          <span>新表厂商</span>
          <el-select v-model="changeData.meterVendor">
            <el-option v-for="item in changshang_list" :key="item.id" :label="item.label" :value="item.label"></el-option>
          </el-select>
        </div>
        <div v-if="changeData.meterVendor === '信驰' || changeData.meterVendor === '集万讯'" class="change-input" style="margin-right: 1%">
          <span>产品ID</span>
          <el-form-item style="margin-bottom: 0">
            <el-input v-model="changeData.productId" class="input-item"></el-input>
          </el-form-item>
        </div>
        <div v-if="changeData.meterVendor === '信驰' || changeData.meterVendor === '集万讯'" class="change-input" style="margin-right: 1%">
          <span>设备ID</span>
          <el-form-item style="margin-bottom: 0">
            <el-input v-model="changeData.deviceId" class="input-item"></el-input>
          </el-form-item>
        </div>
        <div v-if="changeData.meterVendor === '信驰' || changeData.meterVendor === '集万讯'" class="change-input" style="margin-right: 1%">
          <span>设备名称</span>
          <el-form-item style="margin-bottom: 0">
            <el-input v-model="changeData.meterName" class="input-item"></el-input>
          </el-form-item>
        </div> -->
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
import { ElMessage } from "element-plus";

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
        // oldMeterCode: "",
        // oldImei: "",
        oldCount: "",
        oldMeterType: "",
        newMeterCode: "",
        // newImei: "",
        newCount: "",
        // newMeterType: "",
        // meterVendor: "",
        // productId: "",
        // deviceId: "",
        // meterName: "",
      },
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
      price_list: [],
      changshang_list: [
        { id: 1, label: "信驰", value: 1 },
        { id: 2, label: "集万讯", value: 2 },
        { id: 3, label: "太阳能", value: 3 },
        // { id: 3, label: "卓正" },
        // { id: 4, label: "千宝通" },
      ],
    };
  },
  mounted() {
    this.assignmentData();
    //this.getPriceList();
    //this.getShuibiaoList();
  },
  methods: {
    handleChangeCancel() {
      this.$emit("close");
    },
    assignmentData() {
      console.log(this.data);
      this.changeData.userId = this.data.userId;
      this.changeData.userName = this.data.userName;
      this.changeData.userPhone = this.data.phone;
      this.changeData.oldMeterCode = this.data.meterCode;
      // this.changeData.oldImei = this.data.imei;
      this.changeData.oldMeterType = this.data.meterType;
      this.changeData.userId = this.data.userId;
      this.changeData.oldCount = this.data.newReading;
    },
    getPriceList() {
      service
        .get("/getAllPriceMg")
        .then((res) => {
          this.price_list = res.data.map((item) => ({
            id: item.priceId,
            label: item.priceName,
          }));
        })
        .catch((err) => {
          ElMessage.error("获取价格类型失败");
        });
    },
    // getShuibiaoList() {
    //   service
    //     .get("/userManage/meterRead/getAllMeterType")
    //     .then((res) => {
    //       this.shuibiao_list = res.data.map((item) => ({
    //         id: item.id,
    //         label: item.name,
    //       }));
    //     })
    //     .catch((err) => {
    //       ElMessage.error("获取水表类型失败");
    //     });
    // },
    handleCommit() {
      let missingFields = [];
      Object.keys(this.changeData).forEach((key) => {
        if (typeof this.changeData[key] === "string") {
          this.changeData[key] = this.changeData[key].trim();
        }
      });
      let formData = {
        userId: this.changeData.userId,
        userName: this.changeData.userName,
        userPhone: this.changeData.userPhone,
        oldMeterCode: this.changeData.oldMeterCode,
        oldCount: this.changeData.oldCount,
        newMeterCode: this.changeData.newMeterCode,
        newCount: this.changeData.newCount,
      };

      // 定义字段名映射，将属性名映射为友好的显示名称
      const fieldNameMap = {
        userId: "用户号",
        userName: "用户名称",
        userPhone: "联系电话",
        oldMeterCode: "旧表号",
        oldCount: "旧表读数",
        newMeterCode: "新表号",
        newCount: "新表读数",
      };

      // 递归遍历对象属性
      function traverseObject(obj, parentKey = "") {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const fullKey = parentKey ? `${parentKey}.${key}` : key;
            const value = obj[key];

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

      traverseObject(formData);

      if (missingFields.length > 0) {
        const fieldNames = missingFields.map((field) => fieldNameMap[field] || field);
        const message = fieldNames.join("、") + "不能为空";
        ElMessage.error(message);
        return;
      }
      console.log(this.shuibiao_list);
      console.log(this.price_list);
      let params = {
        oldMeterCode: formData.oldMeterCode,
        newMeterCode: formData.newMeterCode,
        newReading: formData.newCount,
      };

      service
        .put("/userManage/meterRead/changeMeter", params)
        .then((res) => {
          if (res.code === 200) {
            ElMessage.success("提交成功");
            // 可以在这里添加提交成功后的其他逻辑，比如关闭对话框
            this.handleChangeCancel();
          } else {
            ElMessage.error("提交失败：" + res.msg);
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
  justify-content: space-around;
  flex-wrap: wrap;
  padding: 5px;
  overflow-y: auto;
}

.change-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 31%;
  height: 75px;
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
