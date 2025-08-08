<template>
  <div class="user-info-dialog" v-if="user_info_dialogFormVisible">
    <div class="user-info-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon10.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 18px">用户信息编辑</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleUserInfoClose">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="user-info-content">
        <div class="user-info-input" style="margin-right: 1%">
          <span>用户名称</span>
          <el-input v-model="userInfoData.user_name" />
        </div>
        <div class="user-info-input" style="margin-right: 1%">
          <span>用户住址</span>
          <el-input v-model="userInfoData.user_address" />
        </div>
        <div class="user-info-input" style="margin-right: 1%">
          <span>所属区域</span>
          <el-select v-model="userInfoData.user_for_town_id">
            <el-option v-for="item in quyu_data" :key="item.id" :label="item.label" :value="item.label"> </el-option>
          </el-select>
        </div>
        <div class="user-info-input" style="margin-right: 1%">
          <span>联系电话</span>
          <el-input v-model="userInfoData.phone" />
        </div>
        <div class="user-info-input" style="margin-right: 1%">
          <span>表号</span>
          <el-input v-model="userInfoData.water_meter_uid" disabled />
        </div>
        <div class="user-info-input" style="margin-right: 1%">
          <span>水表类型</span>
          <el-input v-model="userInfoData.water_meter_type" disabled />
        </div>
        <div class="user-info-input" style="margin-right: 1%">
          <span>水表价格类型</span>
          <el-select v-model="userInfoData.water_meter_price_type">
            <el-option v-for="item in price_list" :key="item.id" :label="item.label" :value="item.label"></el-option>
          </el-select>
        </div>
        <div class="user-info-input" style="margin-right: 1%">
          <span>短信配置</span>
          <el-select v-model="userInfoData.sms_config">
            <el-option v-for="item in sms_config_list" :key="item.id" :label="item.label" :value="item.label"></el-option>
          </el-select>
        </div>
        <div class="user-info-input" style="margin-right: 1%">
          <span>开户审批人1</span>
          <el-select v-model="userInfoData.approver_1">
            <el-option v-for="item in approver_list" :key="item.id" :label="item.label" :value="item.label"> </el-option>
          </el-select>
        </div>
        <div class="user-info-input" style="margin-right: 1%">
          <span>开户审批人2</span>
          <el-select v-model="userInfoData.approver_2">
            <el-option v-for="item in approver_list" :key="item.id" :label="item.label" :value="item.label"> </el-option>
          </el-select>
        </div>
        <div class="user-info-input" style="margin-right: 1%">
          <span>开户审批人3</span>
          <el-select v-model="userInfoData.approver_3">
            <el-option v-for="item in approver_list" :key="item.id" :label="item.label" :value="item.label"> </el-option>
          </el-select>
        </div>
      </div>
      <div class="btn">
        <div class="confirm-btn" @click="handleCommit">
          <el-icon style="margin-left: 15%"><Check /></el-icon>
          <span style="font-size: 16px; margin-left: 15%">确认</span>
        </div>
        <div class="cancel-btn" @click="handleUserInfoClose">
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
    user_info_dialogFormVisible: {
      type: Boolean,
      default: false,
    },
    quyu_data: {
      type: Array,
      default: [],
    },
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      userInfoData: {
        user_name: "",
        user_address: "",
        user_for_town_id: "",
        phone: "",
        water_meter_uid: "",
        water_meter_type: "",
        water_meter_type_id: null,
        water_meter_price_type: "",
        water_meter_price_type_id: null,
        sms_config: null,
        sms_config_id: null,
        approver_1: "",
        approver_2: "",
        approver_3: "",
        optUser: JSON.parse(sessionStorage.getItem("userData")).username,
      },
      price_list: [],
      shuibiao_list: [],
      sms_config_list: [],
      approver_list: [],
    };
  },
  async mounted() {
    try {
      // 并行执行三个异步函数
      await Promise.all([this.getPriceList(), this.getShuibiaoList(), this.getSmsConfigList(), this.getApproverList()]);
      // 三个函数执行完毕后执行 assignmentData
    } catch (error) {
      console.error("获取数据时出错:", error);
    }
  },
  methods: {
    handleUserInfoClose() {
      this.$emit("close");
    },
    assignmentData() {
      console.log(this.data);
      this.userInfoData.user_name = this.data.user_name;
      this.userInfoData.user_address = this.data.user_address;
      this.userInfoData.user_for_town_id = this.data.user_region;
      this.userInfoData.phone = this.data.phone;
      this.userInfoData.water_meter_uid = this.data.water_meter_uid;
      this.userInfoData.water_meter_type = this.data.water_meter_type;
      this.userInfoData.water_meter_price_type = this.data.water_meter_price_type;
      this.userInfoData.sms_config = this.data.sms_config_name;
      this.userInfoData.approver_1 = this.data.approver1;
      this.userInfoData.approver_2 = this.data.approver2;
      this.userInfoData.approver_3 = this.data.approver3;
      console.log(this.sms_config_list);
      // 遍历 sms_config_list 查找匹配的 label
      for (let i = 0; i < this.sms_config_list.length; i++) {
        if (this.sms_config_list[i].label === this.userInfoData.sms_config) {
          this.userInfoData.sms_config_id = this.sms_config_list[i].id;
          console.log(this.userInfoData.sms_config_id);
          break; // 找到匹配项后跳出循环
        }
      }
      console.log(this.userInfoData);
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
        .get("/userManage/meterRead/getAllMeterType")
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
    getSmsConfigList() {
      let params = { pageNo: 1, pageSize: 1000 };
      service
        .post("/querySmsConfig", params)
        .then((response) => {
          if (response.code === 200) {
            this.sms_config_list = response.data.records.map((item) => ({
              id: item.id,
              label: item.smsConfigName,
            }));
            console.log(this.sms_config_list);
            this.assignmentData();
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    getApproverList() {
      let params = { pageNo: 1, pageSize: 1000 };
      service
        .post("/queryUsers", params)
        .then((response) => {
          if (response.code === 200) {
            this.approver_list = response.data.records.map((item) => ({
              id: item.index,
              label: item.username,
            }));
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    handleCommit() {
      // 遍历 shuibiao_list 查找匹配的 label
      console.log(this.shuibiao_list);
      for (let i = 0; i < this.shuibiao_list.length; i++) {
        if (this.shuibiao_list[i].label === this.userInfoData.water_meter_type) {
          this.userInfoData.water_meter_type_id = this.shuibiao_list[i].id;
          break; // 找到匹配项后跳出循环
        }
      }
      console.log(this.price_list);
      // 遍历 price_list 查找匹配的 label
      for (let i = 0; i < this.price_list.length; i++) {
        if (this.price_list[i].label === this.userInfoData.water_meter_price_type) {
          this.userInfoData.water_meter_price_type_id = this.price_list[i].id;
          break; // 找到匹配项后跳出循环
        }
      }
      // 遍历 quyu_data 查找匹配的 label
      for (let i = 0; i < this.quyu_data.length; i++) {
        if (this.quyu_data[i].label === this.userInfoData.user_for_town_id) {
          this.userInfoData.user_for_town_id = this.quyu_data[i].id;
          break; // 找到匹配项后跳出循环
        }
      }
      // 遍历 sms_config_list 查找匹配的 label
      for (let i = 0; i < this.sms_config_list.length; i++) {
        if (this.sms_config_list[i].label === this.userInfoData.sms_config) {
          this.userInfoData.sms_config_id = this.sms_config_list[i].id;
          break; // 找到匹配项后跳出循环
        }
      }
      const validations = [
        {
          condition: this.userInfoData.user_name === null || this.userInfoData.user_name === "",
          message: "用户名称不能为空！",
        },
        {
          condition: this.userInfoData.user_address === null || this.userInfoData.user_address === "",
          message: "用户住址不能为空！",
        },
        {
          condition: this.userInfoData.user_for_town_id === null || this.userInfoData.user_for_town_id === "",
          message: "用户所属区域不能为空！",
        },
        {
          condition: !/^1[3-9]\d{9}$/.test(this.userInfoData.phone),
          message: "用户联系电话格式不正确！",
        },
        {
          condition: this.userInfoData.water_meter_price_type === null || this.userInfoData.water_meter_price_type === "",
          message: "水表价格类型不能为空！",
        },
        {
          condition: this.userInfoData.sms_config === null || this.userInfoData.sms_config === "",
          message: "短信配置类型不能为空！",
        },
        {
          condition: this.userInfoData.approver_1 === null || this.userInfoData.approver_1 === "",
          message: "开户审批人1不能为空！",
        },
        {
          condition: this.userInfoData.approver_2 === null || this.userInfoData.approver_2 === "",
          message: "开户审批人2不能为空！",
        },
        {
          condition: this.userInfoData.approver_3 === null || this.userInfoData.approver_3 === "",
          message: "开户审批人3不能为空！",
        },
      ];
      for (const validation of validations) {
        if (validation.condition) {
          ElMessage.error(validation.message);
          return;
        }
      }

      let dataParams = {
        uuid: this.data.uuid,
        imei: this.data.imei,
        user_name: this.userInfoData.user_name,
        user_address: this.userInfoData.user_address,
        user_for_town_id: this.userInfoData.user_for_town_id,
        phone: this.userInfoData.phone,
        water_meter_uid: this.userInfoData.water_meter_uid,
        water_meter_type_id: this.userInfoData.water_meter_type_id,
        priceId: this.userInfoData.water_meter_price_type_id,
        smsConfigId: this.userInfoData.sms_config_id,
        approver_1: this.userInfoData.approver_1,
        approver_2: this.userInfoData.approver_2,
        approver_3: this.userInfoData.approver_3,
        optUser: this.userInfoData.optUser,
      };

      console.log(dataParams);

      service
        .post("/userManage/userCharge/editUserMeter", dataParams)
        .then((res) => {
          if (res.code === 200) {
            ElMessage.success("修改成功");
            this.handleUserInfoClose();
          } else {
            ElMessage.error(res.msg);
          }
        })
        .catch((err) => {
          ElMessage.error("修改失败");
        });
    },
  },
};
</script>

<style>
.user-info-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.user-info-dialog-content {
  width: 70%;
  height: 380px;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-top: -155px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-info-content {
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

.user-info-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 24%;
  height: 75px;
}

.user-info-input > span {
  font-size: 14px;
  color: #747374;
  margin-bottom: 5px;
}

.user-info-input > .el-input {
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
