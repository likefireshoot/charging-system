<template>
  <div class="change-dialog" v-if="add_dialogFormVisible">
    <div class="edit-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon13.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 18px">新增</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleAddClose">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="edit-content">
        <el-form :model="addData" :rules="rules" class="edit-content" style="padding: 0; width: 100%; height: 320px">
          <div class="edit-input" style="margin-right: 1%; width: 24%">
            <span>用户名称</span>
            <el-form-item prop="userName">
              <el-input v-model="addData.userName" class="input-item" />
            </el-form-item>
          </div>
          <div class="edit-input" style="margin-right: 1%; width: 24%">
            <span>用户住址</span>
            <el-form-item prop="userAddr">
              <el-input v-model="addData.userAddr" class="input-item" />
            </el-form-item>
          </div>
          <div class="edit-input" style="margin-right: 1%; width: 24%">
            <span>所属水厂</span>
            <el-form-item prop="company">
              <el-select v-model="addData.companyId" class="input-item">
                <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id" :disabled="companyId !== 1"> </el-option>
              </el-select>
            </el-form-item>
          </div>
          <div class="edit-input" style="margin-right: 1%; width: 24%">
            <span>所属区域</span>
            <el-form-item prop="regionName">
              <el-select v-model="addData.regionName" class="input-item">
                <el-option v-for="item in quyu_data" :key="item.id" :label="item.label" :value="item.label"> </el-option>
              </el-select>
            </el-form-item>
          </div>
          <div class="edit-input" style="margin-right: 1%; width: 24%">
            <span>联系电话</span>
            <el-form-item prop="userPhone">
              <el-input v-model="addData.userPhone" class="input-item" />
            </el-form-item>
          </div>
          <div class="edit-input" style="margin-right: 1%; width: 24%">
            <span>表号</span>
            <el-form-item prop="meterCode">
              <el-input v-model="addData.meterCode" class="input-item" />
            </el-form-item>
          </div>
          <div class="edit-input" style="margin-right: 1%; width: 24%">
            <span>IMEI号</span>
            <el-form-item prop="imei">
              <el-input v-model="addData.imei" class="input-item" />
            </el-form-item>
          </div>
          <div class="edit-input" style="margin-right: 1%; width: 24%">
            <span>水表厂商</span>
            <el-form-item prop="vendor">
              <el-select v-model="addData.vendor" class="input-item">
                <el-option v-for="item in changshang_list" :key="item.id" :label="item.label" :value="item.label"></el-option>
              </el-select>
            </el-form-item>
          </div>
          <div v-if="addData.vendor === '信驰' || addData.vendor === '集万讯'" class="edit-input" style="margin-right: 1%">
            <span>产品ID</span>
            <el-form-item>
              <el-input v-model="addData.productId" class="input-item"></el-input>
            </el-form-item>
          </div>
          <div v-if="addData.vendor === '信驰' || addData.vendor === '集万讯'" class="edit-input" style="margin-right: 1%">
            <span>设备ID</span>
            <el-form-item>
              <el-input v-model="addData.deviceId" class="input-item"></el-input>
            </el-form-item>
          </div>
          <div v-if="addData.vendor === '信驰' || addData.vendor === '集万讯'" class="edit-input" style="margin-right: 1%">
            <span>设备名称</span>
            <el-form-item>
              <el-input v-model="addData.meterName" class="input-item"></el-input>
            </el-form-item>
          </div>
          <div class="edit-input" style="margin-right: 1%">
            <span>水表类型</span>
            <el-form-item prop="meterType">
              <el-select v-model="addData.meterType" class="input-item">
                <el-option v-for="item in shuibiao_list" :key="item.id" :label="item.label" :value="item.label"></el-option>
              </el-select>
            </el-form-item>
          </div>
          <div class="edit-input" style="margin-right: 1%">
            <span>价格类型</span>
            <el-form-item prop="priceId">
              <el-select v-model="addData.priceId" class="input-item">
                <el-option v-for="item in price_list" :key="item.id" :label="item.label" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
          </div>
          <!-- <div class="edit-input" style="margin-right: 1%; width: 24%">
            <span>余额</span>
            <el-form-item prop="balance">
              <el-input v-model="addData.balance" class="input-item" />
            </el-form-item>
          </div> -->
          <div class="edit-input" style="margin-right: 1%">
            <span>短信配置</span>
            <el-form-item prop="smsConfigId">
              <el-select v-model="addData.smsConfigId" class="input-item">
                <el-option v-for="item in sms_config_list" :key="item.id" :label="item.label" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
          </div>
          <div class="edit-input" style="margin-right: 1%">
            <span>开户审批人1</span>
            <el-form-item>
              <el-select v-model="addData.approver_1" class="input-item">
                <el-option v-for="item in approver_list" :key="item.id" :label="item.label" :value="item.label"></el-option>
              </el-select>
            </el-form-item>
          </div>
          <div class="edit-input" style="margin-right: 1%">
            <span>开户审批人2</span>
            <el-form-item>
              <el-select v-model="addData.approver_2" class="input-item">
                <el-option v-for="item in approver_list" :key="item.id" :label="item.label" :value="item.label"></el-option>
              </el-select>
            </el-form-item>
          </div>
          <div class="edit-input" style="margin-right: 1%">
            <span>开户审批人3</span>
            <el-form-item>
              <el-select v-model="addData.approver_3" class="input-item">
                <el-option v-for="item in approver_list" :key="item.id" :label="item.label" :value="item.label"></el-option>
              </el-select>
            </el-form-item>
          </div>
        </el-form>
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
  },
  data() {
    return {
      addData: {
        userName: "",
        userAddr: "",
        regionName: "",
        companyId: JSON.parse(sessionStorage.getItem("userData")).companyId, // 新增水厂字段
        userPhone: "",
        meterCode: null,
        imei: "",
        meterType: null,
        priceId: null,
        approver_1: "",
        approver_2: "",
        approver_3: "",
        //balance: "",
        smsConfigId: null,
        productId: null,
        deviceId: null,
        meterName: null,
        vendor: "",
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      price_list: [],
      quyu_data: [],
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
      changshang_list: [
        { id: 1, label: "信驰", value: 1 },
        { id: 2, label: "集万讯", value: 2 },
        { id: 3, label: "太阳能", value: 3 },
        { id: 4, label: "圣鑫", value: 4 },
      ],
      companyList: [],
      rules: {
        userName: [{ required: true, message: "请输入用户名称", trigger: "blur" }],
        userAddr: [{ required: true, message: "请输入用户住址", trigger: "blur" }],
        regionName: [{ required: true, message: "请选择所属区域", trigger: "change" }],
        userPhone: [{ required: true, message: "请输入联系电话", trigger: "blur" }],
        meterCode: [{ required: true, message: "请输入表号", trigger: "blur" }],
        imei: [{ required: true, message: "请输入IMEI号", trigger: "blur" }],
        vendor: [{ required: true, message: "请选择水表厂商", trigger: "blur" }],
        meterType: [{ required: true, message: "请选择水表类型", trigger: "blur" }],
        priceId: [{ required: true, message: "请选择价格类型", trigger: "blur" }],
        //balance: [{ required: true, message: "请输入余额", trigger: "blur" }],
        smsConfigId: [{ required: true, message: "请选择短信配置", trigger: "blur" }],
        approver_1: [{ required: true, message: "请选择开户审批人1", trigger: "change" }],
        approver_2: [{ required: true, message: "请选择开户审批人2", trigger: "change" }],
        approver_3: [{ required: true, message: "请选择开户审批人3", trigger: "change" }],
        companyId: [{ required: true, message: "请选择所属水厂", trigger: "change" }],
      },
    };
  },
  mounted() {
    this.getCompanyList();
    this.getPriceList();
    this.getSmsConfigList();
    this.getApproverList();
    this.getRegionData();
  },
  watch: {
    "addData.companyId": function (newVal) {
      if (newVal) {
        this.getPriceList();
        this.getSmsConfigList();
        this.getApproverList();
        this.addData.regionName = ""; // 清空所属区域
        this.getRegionData();
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
        .get("/getAllCompany")
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
      let params = { pageNo: 1, pageSize: 1000, companyId: this.addData.companyId };
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
    handleCommit() {
      let missingFields = [];
      let formData = {};
      if (this.addData.vendor === "信驰" || this.addData.vendor === "集万讯") {
        formData = this.addData;
      } else {
        formData = {
          userName: this.addData.userName,
          userAddr: this.addData.userAddr,
          regionName: this.addData.regionName,
          userPhone: this.addData.userPhone,
          meterCode: this.addData.meterCode,
          imei: this.addData.imei,
          vendor: this.addData.vendor,
          meterType: this.addData.meterType,
          priceId: this.addData.priceId,
          smsConfigId: this.addData.smsConfigId,
          approver_1: this.addData.approver_1,
          approver_2: this.addData.approver_2,
          approver_3: this.addData.approver_3,
          productId: "5678",
          deviceId: "1234",
          meterName: "太阳能",
          companyId: this.addData.companyId,
        };
      }
      //const formData = this.addData;

      // 定义字段名映射，将属性名映射为友好的显示名称
      const fieldNameMap = {
        userName: "用户名称",
        userAddr: "用户住址",
        regionName: "所属区域",
        userPhone: "联系电话",
        meterCode: "表号",
        imei: "IMEI号",
        vendor: "水表厂商",
        meterType: "水表类型",
        priceId: "价格类型",
        balance: "余额",
        smsConfigId: "短信配置",
        productId: "产品ID",
        deviceId: "设备ID",
        meterName: "设备名称",
        approver_1: "开户审批人1",
        approver_2: "开户审批人2",
        approver_3: "开户审批人3",
        companyId: "所属水厂",
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

      // 对联系电话和余额进行额外校验
      if (formData.userPhone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(formData.userPhone)) {
          ElMessage.error("请输入正确格式的联系电话！");
          return;
        }
      }

      // if (formData.balance !== undefined && formData.balance !== null) {
      //   const balance = parseFloat(formData.balance);
      //   if (isNaN(balance) || balance < 0) {
      //     ElMessage.error("余额必须为正数！");
      //     return;
      //   }
      // }

      if (missingFields.length > 0) {
        const fieldNames = missingFields.map((field) => fieldNameMap[field] || field);
        const message = fieldNames.join("、") + "不能为空";
        ElMessage.error(message);
        return;
      }

      console.log(formData);

      // 所有字段都不为空，提交数据到后台
      service
        .post("/userManage/userCharge/addUserMeter", formData)
        .then((res) => {
          if (res.code === 200) {
            ElMessage.success("提交成功");
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

.edit-dialog-content {
  width: 70%;
  min-height: 500px;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%);
  margin-top: -250px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.edit-content {
  min-height: 370px;
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
  font-size: 14px;
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
