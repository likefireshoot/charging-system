<template>
  <div class="change-dialog" v-if="deviceBinding_dialogFormVisible">
    <div class="device-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon21.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 20px">设备绑定</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="closeDeviceBindingDialog">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="device-add-content">
        <div class="edit-input" style="margin-right: 1%">
          <span>所属水厂</span>
          <el-select v-model="addData.companyId" class="input-item big-font-el-select">
            <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id" :disabled="companyId !== 1"> </el-option>
          </el-select>
        </div>
        <div class="edit-input" style="margin-right: 1%">
          <span>用户号</span>
          <el-input v-model="addData.userId" class="input-item"></el-input>
        </div>
        <div class="edit-input" style="margin-right: 1%">
          <span>用户名称</span>
          <el-input v-model="addData.userName" class="input-item" disabled></el-input>
        </div>
        <div class="edit-input" style="margin-right: 1%">
          <span>表号</span>
          <el-input v-model="addData.meterCode" class="input-item" />
        </div>
        <div class="edit-input" style="margin-right: 1%">
          <span>价格类型</span>
          <el-select v-model="addData.priceId" class="input-item big-font-el-select">
            <el-option v-for="item in price_list" :key="item.id" :label="item.label" :value="item.id"></el-option>
          </el-select>
        </div>
        <div class="edit-input" style="margin-right: 1%">
          <span>短信配置</span>
          <el-select v-model="addData.smsConfigId" class="input-item big-font-el-select">
            <el-option v-for="item in sms_config_list" :key="item.id" :label="item.label" :value="item.id"></el-option>
          </el-select>
        </div>
        <div class="edit-input" style="margin-right: 1%">
          <span>开户审批人1</span>
          <el-select v-model="addData.approver_1" class="input-item big-font-el-select">
            <el-option v-for="item in approver_list" :key="item.id" :label="item.label" :value="item.label"></el-option>
          </el-select>
        </div>
        <div class="edit-input" style="margin-right: 1%">
          <span>出厂日期</span>
          <el-select v-model="addData.approver_2" class="input-item big-font-el-select">
            <el-option v-for="item in approver_list" :key="item.id" :label="item.label" :value="item.label"></el-option>
          </el-select>
        </div>
        <div class="edit-input" style="margin-right: 1%">
          <span>首检日期</span>
          <el-select v-model="addData.approver_3" class="input-item big-font-el-select">
            <el-option v-for="item in approver_list" :key="item.id" :label="item.label" :value="item.label"></el-option>
          </el-select>
        </div>
      </div>
      <div class="btn">
        <div class="confirm-btn" @click="handleCommit">
          <el-icon style="margin-left: 15%"><Check /></el-icon>
          <span style="font-size: 20px; margin-left: 15%">确认</span>
        </div>
        <div class="cancel-btn" @click="handleAddClose">
          <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
          <span style="font-size: 20px; margin-left: 15%; color: #5a5a5a">取消</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import debounce from "lodash/debounce";
import service from "@/api/request";
import { ElMessage } from "element-plus";

export default {
  props: {
    deviceBinding_dialogFormVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const userDataStr = sessionStorage.getItem("userData");
    if (!userDataStr) {
      throw new Error("未找到用户登录信息，请重新登录！");
    }
  
    const userData = JSON.parse(userDataStr);
  
  // 验证必要字段是否存在
  if (!userData.staffName || !userData.companyId) {
    throw new Error("用户信息不完整，请重新登录！");
  }
    return {
      addData: {
        companyId: userData.companyId, // 新增水厂字段
        //regionName: "",
        userId: "",
        userName: "",
        userName: "",
        meterCode: "",
        priceId: null,
        smsConfigId: null,
        approver_1: userData.staffName || "",  // 修改：默认当前用户
        approver_2: userData.staffName || "",  // 修改：默认当前用户
        approver_3: userData.staffName || "",  // 修改：默认当前用户
        //balance: "",
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      price_list: [],
      quyu_data: [],
      companyList: [],
      userIdList: [],
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
      sms_config_list: [],
      approver_list: [],
    };
  },
  mounted() {
    // 二次检查 sessionStorage 数据
    // (避免form组件由于sessionStorage缺少信息, 加载失败, 直接白屏的情况出现)
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    if (!userData || !userData.staffName) {
      ElMessage.error("员工信息不完整，请重新登录！");
      this.handleClose();
      return;
    }
    this.getCompanyList();
    // this.getPriceList();
    // this.getSmsConfigList();
    // this.getApproverList();
    //this.getRegionData();
  },
  watch: {
    "addData.companyId": function (newVal) {
      if (newVal) {
        this.addData.userName = "";
        this.addData.userId = "";
      }
    },
    "addData.userId": function (newVal) {
      if (this.addData.companyId != null) {
        if (newVal && newVal.trim() !== "" && newVal != null) {
          this.debouncedGetUserName();
        } else {
          this.addData.userName = "";
        }
      }
    },
  },
  methods: {
    handleAddClose() {
      this.$emit("close");
    },
    getRegionData() {
      let url = "";
      if (this.companyId === 1) {
        if (this.addData.companyId) {
          url = `/getRegion?companyId=${this.addData.companyId}`; // 所属水厂ID
        } else {
          url = `/getRegion`; // 所属水厂ID
        }
      } else {
        url = `/getRegion?companyId=${this.companyId}`; // 所属水厂ID
      }
      console.log(url);
      service
        .get(`${url}`)
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
    getPriceList() {
      let params = { pageNo: 1, pageSize: 1000, companyId: this.addData.companyId };
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
      let params = { pageNo: 1, pageSize: 1000, companyId: this.addData.companyId };
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
      let token = JSON.parse(sessionStorage.getItem("userData")).token;
      let params = { pageNo: 1, pageSize: 1000, companyId: this.addData.companyId, staffCharacterId: 7 };
      service
        .post("/staff/queryStaff", params, {
          headers: {
            Authorization: token, // 添加token请求头
            token: token, // 添加token请求头
          },
        })
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
    debouncedGetUserName: debounce(function () {
      this.getUserName();
    }, 1500), // 1500ms 内无输入才触发
    getUserName() {
      service
        .get(`/userManage/userCharge/getUserName/${this.addData.companyId}/${this.addData.userId}`)
        .then((response) => {
          if (response.code === 200) {
            this.addData.userName = response.data.userName;
            this.addData.companyId = response.data.companyId; // 设置所属水厂ID
            this.getPriceList();
            this.getSmsConfigList();
            this.getApproverList();
          } else {
            ElMessage.warning("用户号为" + this.addData.userId + "的用户不存在");
          }
        })
        .catch((error) => {
          ElMessage.warning("用户号为" + this.addData.userId + "的用户不存在");
        });
    },
    handleCommit() {
      let missingFields = [];
      Object.keys(this.addData).forEach((key) => {
        if (typeof this.addData[key] === "string") {
          this.addData[key] = this.addData[key].trim();
        }
      });
      let formData = {
        companyId: this.addData.companyId,
        userId: this.addData.userId,
        meterCode: this.addData.meterCode,
        priceId: this.addData.priceId,
        smsConfigId: this.addData.smsConfigId,
        approver_1: this.addData.approver_1,
        approver_2: this.addData.approver_2,
        approver_3: this.addData.approver_3,
      };

      // 定义字段名映射，将属性名映射为友好的显示名称
      const fieldNameMap = {
        userName: "用户名称",
        userAddr: "用户住址",
        companyId: "所属水厂",
        regionName: "所属区域",
        meterCode: "表号",
        priceId: "价格类型",
        smsConfigId: "短信配置",
        approver_1: "开户审批人1",
        approver_2: "开户审批人2",
        approver_3: "开户审批人3",
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

      console.log(formData);

      // 所有字段都不为空，提交数据到后台
      service
        .post("/userManage/userCharge/userMeterBind", formData)
        .then((res) => {
          if (res.code === 200) {
            ElMessage.success("设备绑定成功");
            // 可以在这里添加提交成功后的其他逻辑，比如关闭对话框
            this.handleAddClose();
          } else if (res.code === -1) {
            ElMessage.error(res.msg);
          }
        })
        .catch((err) => {
          ElMessage.error("提交失败：" + err.message);
        });
    },
    closeDeviceBindingDialog() {
      this.$emit("close");
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

.device-dialog-content {
  width: 70%;
  height: 400px;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%);
  margin-top: -200px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.device-add-content {
  height: 370px;
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
  width: 100px;
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
