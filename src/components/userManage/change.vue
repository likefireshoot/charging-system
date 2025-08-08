<template>
  <div class="change-dialog" v-if="change_dialogFormVisible">
    <div class="change-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon8.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 18px">换表</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleChangeCancel">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="change-content">
        <div class="change-input" style="margin-right: 1%">
          <span>用户名称</span>
          <el-input v-model="changeData.user_name" disabled />
        </div>
        <div class="change-input" style="margin-right: 1%">
          <span>联系电话</span>
          <el-input v-model="changeData.phone" disabled />
        </div>
        <div class="change-input" style="margin-right: 1%">
          <span>余额</span>
          <el-input v-model="changeData.balance" />
        </div>
        <div class="change-input" style="margin-right: 1%; width: 23.9%">
          <span>旧表号</span>
          <el-input v-model="changeData.old_water_meter_uid" disabled />
        </div>
        <div class="change-input" style="margin-right: 1%; width: 23.9%">
          <span>旧IMEI号</span>
          <el-input v-model="changeData.old_imei" disabled />
        </div>
        <div class="change-input" style="margin-right: 1%; width: 23.9%">
          <span>旧表类型</span>
          <el-input v-model="changeData.old_water_meter_type" disabled />
        </div>
        <div class="change-input" style="margin-right: 1%; width: 23.9%">
          <span>旧表价格类型</span>
          <el-input v-model="changeData.old_water_meter_price_type" disabled />
        </div>
        <div class="change-input" style="margin-right: 1%; width: 23.9%">
          <span>新表号</span>
          <el-input v-model="changeData.new_water_meter_uid" />
        </div>
        <div class="change-input" style="margin-right: 1%; width: 23.9%">
          <span>新IMEI号</span>
          <el-input v-model="changeData.new_imei" />
        </div>
        <div class="change-input" style="margin-right: 1%; width: 23.9%">
          <span>新表类型</span>
          <el-select v-model="changeData.new_water_meter_type">
            <el-option v-for="item in shuibiao_list" :key="item.id" :label="item.label" :value="item.label"></el-option>
          </el-select>
        </div>
        <div class="change-input" style="margin-right: 1%; width: 23.9%">
          <span>新表价格类型</span>
          <el-select v-model="changeData.new_water_meter_price_type">
            <el-option v-for="item in price_list" :key="item.id" :label="item.label" :value="item.label"></el-option>
          </el-select>
        </div>
      </div>
      <div class="btn">
        <div class="confirm-btn" @click="handleCommit">
          <el-icon style="margin-left: 15%"><Check /></el-icon>
          <span style="font-size: 16px; margin-left: 15%">确认</span>
        </div>
        <div class="cancel-btn" @click="handleChangeCancel">
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
        user_name: "",
        phone: "",
        balance: "",
        old_water_meter_uid: "",
        old_imei: "",
        old_water_meter_type: "",
        old_water_meter_price_type: "",
        new_water_meter_uid: "",
        new_imei: "",
        new_water_meter_type: "",
        new_water_meter_price_type: "",
      },
      shuibiao_list: [],
      price_list: [],
      change_record_currentPage: 1,
      change_record_pageSize: 100,
      change_record_total: 1000,
    };
  },
  mounted() {
    this.assignmentData();
    this.getPriceList();
    this.getShuibiaoList();
  },
  methods: {
    handleChangeCancel() {
      this.$emit("close");
    },
    assignmentData() {
      this.changeData.user_name = this.data.user_name;
      this.changeData.phone = this.data.phone;
      this.changeData.balance = this.data.balance;
      this.changeData.old_water_meter_uid = this.data.water_meter_uid;
      this.changeData.old_imei = this.data.imei;
      this.changeData.old_water_meter_type = this.data.water_meter_type;
      this.changeData.old_water_meter_price_type = this.data.water_meter_price_type;
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
    getShuibiaoList() {
      service
        .get("/userManage/getAllMeterType")
        .then((res) => {
          this.shuibiao_list = res.data.map((item) => ({
            id: item.id,
            label: item.name,
          }));
        })
        .catch((err) => {
          ElMessage.error("获取水表类型失败");
        });
    },
    handleCommit() {
      let missingFields = [];
      const formData = this.changeData;

      // 定义字段名映射，将属性名映射为友好的显示名称
      const fieldNameMap = {
        user_name: "用户名称",
        phone: "联系电话",
        balance: "余额",
        old_water_meter_uid: "旧表号",
        old_imei: "旧IMEI号",
        old_water_meter_type: "旧表类型",
        old_water_meter_price_type: "旧表价格类型",
        new_water_meter_uid: "新表号",
        new_imei: "新IMEI号",
        new_water_meter_type_id: "新表类型",
        new_water_meter_type: "新表价格类型",
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
              // 检查值是否为空
              if (!value || value === "") {
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

      let dataParams = {
        old_water_meter_uid: formData.old_water_meter_uid,
        old_imei: formData.old_imei,
        old_water_meter_type: formData.old_water_meter_type,
        old_water_meter_price_type: formData.old_water_meter_price_type,
        new_water_meter_uid: formData.new_water_meter_uid,
        new_imei: formData.new_imei,
        new_water_meter_type_id: null,
        new_water_meter_type: formData.new_water_meter_type,
        new_water_meter_price_type_id: null,
        new_water_meter_price_type: formData.new_water_meter_price_type,
        new_balance: formData.balance,
      };
      console.log(this.shuibiao_list);
      console.log(this.price_list);
      // 遍历 shuibiao_list 查找匹配的 label
      for (let i = 0; i < this.shuibiao_list.length; i++) {
        if (this.shuibiao_list[i].label === dataParams.new_water_meter_type) {
          dataParams.new_water_meter_type_id = this.shuibiao_list[i].id;
          break; // 找到匹配项后跳出循环
        }
      }
      // 遍历 price_list 查找匹配的 label
      for (let i = 0; i < this.price_list.length; i++) {
        if (this.price_list[i].label === dataParams.new_water_meter_price_type) {
          dataParams.new_water_meter_price_type_id = this.price_list[i].id;
          break; // 找到匹配项后跳出循环
        }
      }
      console.log(dataParams);
      // 所有字段都不为空，提交数据到后台
      service
        .post("/userManage/changeUserMeter", dataParams)
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

<style>
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
  height: 400px;
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

.change-content {
  width: 94%;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 20px;
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: 1%;
  overflow-y: auto;
}

.change-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 32.3%;
  height: 75px;
}

.change-input > span {
  font-size: 14px;
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
