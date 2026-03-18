<template>
  <div class="user-info-dialog" v-if="user_info_dialogFormVisible">
    <div class="user-info-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon10.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 20px">用户信息编辑</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleUserInfoClose">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="user-info-content">
        <div class="user-info-input">
          <span>用户名称</span>
          <el-input v-model="userInfoData.userName" />
        </div>
        <div class="user-info-input">
          <span>用户住址</span>
          <el-input v-model="userInfoData.userAddr" />
        </div>
        <div class="user-info-input">
          <span>所属水厂</span>
          <el-select v-model="userInfoData.company" class="big-font-el-select" placeholder="请选择所属水厂">
            <el-option v-for="item in companyList" :key="item.id" :value="item.name" :label="item.name" :disabled="companyId !== 1"></el-option>
          </el-select>
        </div>
        <div class="user-info-input">
          <span>所属区域</span>
          <el-select v-model="userInfoData.regionName" class="big-font-el-select">
            <el-option v-for="item in quyu_data" :key="item.id" :label="item.label" :value="item.label"> </el-option>
          </el-select>
        </div>
        <div class="user-info-input">
          <span>联系电话</span>
          <el-input v-model="userInfoData.userPhone" />
        </div>
        <div class="user-info-input">
          <span>表号</span>
          <el-input v-model="userInfoData.meterCode" disabled />
        </div>
        <div class="user-info-input">
          <span>水表类型</span>
          <el-input v-model="userInfoData.meterType" disabled />
        </div>
        <div class="user-info-input">
          <span>水表价格类型</span>
          <el-select v-model="userInfoData.priceId" class="big-font-el-select">
            <el-option v-for="item in price_list" :key="item.id" :label="item.label" :value="item.id"></el-option>
          </el-select>
        </div>
        <div class="user-info-input">
          <span>短信配置</span>
          <el-select v-model="userInfoData.smsConfigId" class="big-font-el-select">
            <el-option v-for="item in sms_config_list" :key="item.id" :label="item.label" :value="item.id"></el-option>
          </el-select>
        </div>
        <div class="user-info-input">
          <span>开户审批人1</span>
          <el-select v-model="userInfoData.approver_1" class="big-font-el-select">
            <el-option v-for="item in approver_list" :key="item.id" :label="item.label" :value="item.label"> </el-option>
          </el-select>
        </div>
        <div class="user-info-input">
          <span>开户审批人2</span>
          <el-select v-model="userInfoData.approver_2" class="big-font-el-select">
            <el-option v-for="item in approver_list" :key="item.id" :label="item.label" :value="item.label"> </el-option>
          </el-select>
        </div>
        <div class="user-info-input">
          <span>开户审批人3</span>
          <el-select v-model="userInfoData.approver_3" class="big-font-el-select">
            <el-option v-for="item in approver_list" :key="item.id" :label="item.label" :value="item.label"> </el-option>
          </el-select>
        </div>
        <div class="user-info-input" style="width: 98%">
          <span>开户时间</span>
          <el-date-picker v-model="userInfoData.createTime" type="date" placeholder="选择日期" style="flex-grow: 1; width: 24.5%; max-height: 35px" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
        </div>
      </div>
      <div class="btn">
        <div class="confirm-btn" @click="handleCommit">
          <el-icon style="margin-left: -3%"><Check /></el-icon>
          <span style="font-size: 20px; margin-left: 9%">确认</span>
        </div>
        <div class="cancel-btn" @click="handleUserInfoClose">
          <el-icon style="margin-left: -3%; color: #45ba7e"><Close /></el-icon>
          <span style="font-size: 20px; margin-left: 9%; color: #5a5a5a">取消</span>
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
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      userInfoData: {
        userName: "",
        userAddr: "",
        regionName: "",
        userPhone: "",
        meterCode: "",
        meterType: "",
        priceName: "",
        priceId: null,
        sms_config: null,
        smsConfigId: null,
        approver_1: "",
        approver_2: "",
        approver_3: "",
        company: null, // 新增水厂字段
        companyId: null,
        createTime: "",
      },
      flag: 0,
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      price_list: [],
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
      quyu_data: [],
      sms_config_list: [],
      approver_list: [],
      companyList: [],
    };
  },
  async mounted() {
    this.assignmentData();
  },
  watch: {
    "userInfoData.company": function (newVal) {
      if (newVal) {
        for (let i = 0; i < this.companyList.length; i++) {
          if (this.companyList[i].name === newVal) {
            this.userInfoData.companyId = this.companyList[i].id; // 确保companyId被正确赋值
            break;
          }
        }
      }
    },
    "userInfoData.companyId": function (newVal) {
      if (newVal && this.flag === 1) {
        this.userInfoData.regionName = ""; // 清空区域选择
        this.userInfoData.priceName = ""; // 清空价格类型选择
        this.userInfoData.sms_config = ""; // 清空短信配置选择
        this.getRegionData();
        this.getPriceList();
        this.getSmsConfigList();
        this.getApproverList();
      }
    },
    flag: function (newVal) {
      if (newVal) {
      }
    },
  },
  methods: {
    handleUserInfoClose() {
      this.$emit("close");
    },
    assignmentData() {
      console.log(this.data);
      // 初始化用户信息数据
      this.userInfoData.userName = this.data.userName;
      this.userInfoData.userAddr = this.data.userAddr;
      this.userInfoData.regionName = this.data.regionName;
      this.userInfoData.userPhone = this.data.phone;
      this.userInfoData.meterCode = this.data.meterCode;
      this.userInfoData.meterType = this.data.meterType;
      this.userInfoData.priceId = this.data.priceId;
      this.userInfoData.smsConfigId = this.data.smsConfigId;
      this.userInfoData.approver_1 = this.data.approver1;
      this.userInfoData.approver_2 = this.data.approver2;
      this.userInfoData.approver_3 = this.data.approver3;
      this.userInfoData.company = this.data.companyName;
      this.userInfoData.companyId = this.data.companyId; // 关键：确保companyId先被赋值
      this.userInfoData.createTime = this.data.createTime;

      console.log("初始化数据完成:", this.userInfoData);

      // 数据初始化后，再执行四个异步函数
      try {
        Promise.all([this.getPriceList(), this.getSmsConfigList(), this.getApproverList(), this.getCompanyList(), this.getRegionData()]).then(() => {
          console.log("所有数据加载完成");
          this.flag = 1;
        });
      } catch (error) {
        console.error("获取数据时出错:", error);
      }
    },
    getRegionData() {
      let url = "";
      if (this.companyId === 1) {
        if (this.userInfoData.companyId) {
          url = `/getRegion?companyId=${this.userInfoData.companyId}`; // 所属水厂ID
        } else {
          url = `/getRegion`; // 所属水厂ID
        }
      } else {
        url = `/getRegion?companyId=${this.companyId}`; // 所属水厂ID
      }
      console.log(url);
      service
        .get(`${url}`, {
          headers: {
            Authorization: this.token,
          },
        })
        .then((response) => {
          if (response.code === 200) {
            this.quyu_data = response.data.map((item) => {
              return {
                id: item.regionId,
                value: item.regionId,
                label: item.regionName,
              };
            });
            console.log(this.quyu_data);
          }
        })
        .catch((error) => {
          ElMessage.error("获取区域数据失败");
        });
    },
    getPriceList() {
      let params = { pageNo: 1, pageSize: 1000, companyId: this.userInfoData.companyId };
      service
        .post("/price/queryPriceMg", params)
        .then((res) => {
          this.price_list = res.data.records.map((item) => ({
            id: item.priceId,
            label: item.priceName,
          }));
        })
        .catch((err) => {
          ElMessage.error("获取价格类型失败");
        });
    },
    getSmsConfigList() {
      let params = { pageNo: 1, pageSize: 1000, companyId: this.userInfoData.companyId };
      service
        .post("/sms/querySmsConfig", params)
        .then((response) => {
          if (response.code === 200) {
            this.sms_config_list = response.data.records.map((item) => ({
              id: item.smsConfigId,
              label: item.smsConfigName,
            }));
            console.log(this.sms_config_list);
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    getApproverList() {
      let params = { pageNo: 1, pageSize: 1000, companyId: this.userInfoData.companyId };
      service
        .post("/staff/queryStaff", params)
        .then((response) => {
          if (response.code === 200) {
            this.approver_list = response.data.records.map((item) => ({
              id: item.staffId,
              label: item.staffName,
            }));
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    getCompanyList() {
      service
        .get("/getAllUnblockCompany")
        .then((response) => {
          if (response.code === 200) {
            this.companyList = response.data.map((item) => {
              return {
                id: item.companyId,
                name: item.companyName,
              };
            });
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    handleCommit() {
      const validations = [
        {
          condition: this.userInfoData.userName === null || this.userInfoData.userName === "",
          message: "用户名称不能为空！",
        },
        {
          condition: this.userInfoData.userAddr === null || this.userInfoData.userAddr === "",
          message: "用户住址不能为空！",
        },
        {
          condition: this.userInfoData.regionName === null || this.userInfoData.regionName === "",
          message: "用户所属区域不能为空！",
        },
        {
          condition: !/^1[3-9]\d{9}$/.test(this.userInfoData.userPhone),
          message: "用户联系电话格式不正确！",
        },
        {
          condition: this.userInfoData.priceId === null || this.userInfoData.priceId === "",
          message: "水表价格类型不能为空！",
        },
        {
          condition: this.userInfoData.smsConfigId === null || this.userInfoData.smsConfigId === "",
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
        {
          condition: this.userInfoData.createTime === null || this.userInfoData.createTime === "",
          message: "开户时间不能为空！",
        },
      ];
      for (const validation of validations) {
        if (validation.condition) {
          ElMessage.error(validation.message);
          return;
        }
      }

      // console.log(this.price_list);
      // // 遍历 price_list 查找匹配的 label
      // for (let i = 0; i < this.price_list.length; i++) {
      //   if (this.price_list[i].label === this.userInfoData.priceName) {
      //     this.userInfoData.priceId = this.price_list[i].id;
      //     break; // 找到匹配项后跳出循环
      //   }
      // }

      // // 遍历 sms_config_list 查找匹配的 label
      // for (let i = 0; i < this.sms_config_list.length; i++) {
      //   if (this.sms_config_list[i].label === this.userInfoData.sms_config) {
      //     this.userInfoData.smsConfigId = this.sms_config_list[i].id;
      //     break; // 找到匹配项后跳出循环
      //   }
      // }

      Object.keys(this.userInfoData).forEach((key) => {
        if (typeof this.userInfoData[key] === "string") {
          this.userInfoData[key] = this.userInfoData[key].trim();
        }
      });
      let dataParams = {
        userId: this.data.userId,
        userName: this.userInfoData.userName,
        userAddr: this.userInfoData.userAddr,
        regionName: this.userInfoData.regionName,
        userPhone: this.userInfoData.userPhone,
        imei: this.data.imei,
        approver_1: this.userInfoData.approver_1,
        approver_2: this.userInfoData.approver_2,
        approver_3: this.userInfoData.approver_3,
        smsConfigId: this.userInfoData.smsConfigId,
        priceId: this.userInfoData.priceId,
        meterType: this.userInfoData.meterType,
        companyId: this.userInfoData.companyId,
        createTime: this.userInfoData.createTime,
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

<style scoped>
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
  height: 450px;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-top: -225px;
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
  /* justify-content: flex-start; */
  justify-content: space-evenly;
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
  font-size: 20px;
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
