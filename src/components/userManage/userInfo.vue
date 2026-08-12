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
      <div class="user-info-content" v-loading="pageLoading" element-loading-text="正在加载用户信息...">
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
        <div class="user-info-input" v-if="companyId === 95">
          <span>所属表册</span>
          <el-select v-model="userInfoData.codeBookId" class="big-font-el-select" :disabled="!userInfoData.regionName">
            <el-option v-for="item in codeBookList" :key="item.id" :label="item.label" :value="item.id"></el-option>
          </el-select>
        </div>
        <div class="user-info-input">
          <span>联系电话</span>
          <el-input v-model="userInfoData.userPhone" />
        </div>
        <div class="user-info-input" v-if="userInfoData.userOtherPhone != null || companyId === 95">
          <span>联系电话2</span>
          <el-input v-model="userInfoData.userOtherPhone" />
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
          <span>开户审批人</span>
          <el-select v-model="userInfoData.approver_1" class="big-font-el-select">
            <el-option v-for="item in approver_list" :key="item.id" :label="item.label" :value="item.label"> </el-option>
          </el-select>
        </div>
        <div class="user-info-input">
          <span>出厂日期</span>
          <el-date-picker v-model="userInfoData.factoryDate" type="date" placeholder="选择日期" style="width: 100%" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
        </div>
        <div class="user-info-input">
          <span>首检日期</span>
          <el-date-picker v-model="userInfoData.firstInspectDate" type="date" placeholder="选择日期" style="width: 100%" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
        </div>
        <div class="user-info-input">
          <span>开户时间</span>
          <el-date-picker v-model="userInfoData.createTime" type="date" placeholder="选择日期" style="width: 100%" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
        </div>
        <div class="user-info-input">
          <span>水表关阀设置（后付费设置）</span>
          <el-select v-model="userInfoData.enableArrearsValve" class="big-font-el-select">
            <el-option label="默认(跟随区域开关阀配置)" value="default"></el-option>
            <el-option label="预付费(欠费自动关阀)" :value="0"></el-option>
            <el-option label="后付费(欠费不关阀)" :value="1"></el-option>
          </el-select>
        </div>
        <div class="user-info-input">
          <span>水表开阀设置（不欠费时系统持续开阀）</span>
          <el-select v-model="userInfoData.keepValveOpenFree" class="big-font-el-select">
            <el-option label="启用（不欠费不可关阀）" :value="1"></el-option>
            <el-option label="暂停（不欠费可关阀）" :value="0"></el-option>
          </el-select>
        </div>
        <div class="user-info-input" v-if="userInfoData.userRemark != null || companyId === 95">
          <span>备注</span>
          <el-input v-model="userInfoData.userRemark" />
        </div>
      </div>
      <div class="btn">
        <div class="left-btn">
          <div v-if="userInfoData.isPause === 0  && staffPermissionIds.includes(63)" class="operate-btn stop-btn" @click="openStopDialog" >
            <img src="@/assets/menu/icon20.png" alt="" style="margin-left: 8px" />
            <span style="font-size: 20px; margin-left: 9%;">暂停用户</span>
          </div>
          <div v-if="userInfoData.isPause === 1  && staffPermissionIds.includes(73)" class="operate-btn stop-btn" @click="openStartDialog" >
            <img src="@/assets/menu/icon20.png" alt="" style="margin-left: 8px" />
            <span style="font-size: 20px; margin-left: 9%;">恢复用户</span>
          </div>
          <div v-if="staffPermissionIds.includes(70)" class="operate-btn refund-btn" @click="openRefundBalanceDialog">
            <img src="@/assets/menu/icon5.png" alt="" style="margin-left: 10px" />
            <span style="font-size: 20px; margin-left: 9%; color: #5a5a5a">余额退款</span>
          </div>
          <div v-if="staffPermissionIds.includes(65)" class="operate-btn close-btn" @click="openCloseAccountDialog">
            <img src="@/assets/yonghu/icon4.png" alt="" style="margin-left: 8px" />
            <span style="font-size: 20px; margin-left: 9%; color: #5a5a5a">销户</span>
          </div>
        </div>
        <div class="right-btn">
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
  </div>

  <!-- 新增：暂停使用弹窗 -->
  <el-dialog v-model="stopDialogVisible" title="暂停用户确认" width="600" :lock-scroll="false">
    <div style="font-size: 20px; text-align: center; line-height: 2; padding: 10px 0;">
      确定要将用户【{{ userInfoData.userName }}】暂停使用吗？暂停后将不再收取保底费并下达水表关阀命令
    </div>
    <template #footer>
      <div style="display: flex; justify-content: center; gap: 20px;">
        <el-button @click="stopDialogVisible = false">取消</el-button>
        <el-button @click="handleStopUser" style="background-color: #45ba7e; color: #fff" :loading="loading" :disabled="loading">确认暂停</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog v-model="startDialogVisible" title="恢复用户确认" width="600" :lock-scroll="false">
    <div style="font-size: 20px; text-align: center; line-height: 2; padding: 10px 0;">
      确定要将用户【{{ userInfoData.userName }}】恢复使用吗？恢复后将开始收取保底费并下达水表开阀命令
    </div>
    <template #footer>
      <div style="display: flex; justify-content: center; gap: 20px;">
        <el-button @click="stopDialogVisible = false">取消</el-button>
        <el-button @click="handleStartUser" style="background-color: #45ba7e; color: #fff" :loading="loading" :disabled="loading">确认恢复</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 新增：销户退款选择弹窗 -->
  <el-dialog v-model="closeAccountDialogVisible" title="销户退款确认" width="600" :lock-scroll="false">
    <div style="padding: 10px; font-size: 20px; color: #5a5a5a; line-height: 2; text-align: center;">
      <div v-if="Number(userInfoData.balance) > 0" style="color:#5a5a5a;">
        用户【{{ userInfoData.userName }}】当前余额 {{ userInfoData.balance }} 元，请注意先执行【余额退款】操作！！！
      </div>
      <div v-else-if="Number(userInfoData.balance) < 0" style="color:#5a5a5a;">
        用户【{{ userInfoData.userName }}】当前欠费 {{ Math.abs(Number(userInfoData.balance)) }} 元，用户需结清欠费！
      </div>
      <div v-else style="color:#5a5a5a;">
        确定要将用户【{{ userInfoData.userName }}】永久销户吗？销户后用户绑定关系将全部清除，无法恢复！
      </div>
    </div>
    <template #footer>
      <div style="display: flex; justify-content: center; gap: 20px;">
        <el-button @click="closeAccountDialogVisible = false">取消</el-button>
        <el-button @click="handleCloseAccount" style="background-color: #45ba7e; color: #fff" :loading="loading" :disabled="loading">确认销户</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 新增：余额预退款弹窗（只退余额，不销户） -->
  <el-dialog v-model="refundBalanceDialogVisible" title="余额退款确认" width="600" custom-class="big-title-dialog" :lock-scroll="false">
    <div style="padding: 10px;">
      <div style="font-size: 20px; color: #5a5a5a; line-height: 2; text-align: center;">
        确定要将用户【{{ userInfoData.userName }}】账户内 {{ userInfoData.balance }} 元余额全部返还？操作后用户账号保留，仅清空账户余额。
      </div>
    </div>
    <template #footer>
      <div style="display: flex; justify-content: center; gap: 20px;">
        <el-button @click="refundBalanceDialogVisible = false">取消</el-button>
        <el-button @click="handleRefundBalance" style="background-color: #45ba7e; color: #fff" :loading="loading" :disabled="loading">确认退款</el-button>
      </div>
    </template>
  </el-dialog>
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
        userId: "",
        imei: "",
        userName: "",
        userAddr: "",
        regionName: "",
        userPhone: "",
        userOtherPhone: null,
        userRemark: null,
        meterCode: "",
        meterType: "",
        priceName: "",
        priceId: null,
        sms_config: null,
        smsConfigId: null,
        approver_1: "",
        // approver_2: "",
        // approver_3: "",
        factoryDate: "",
        firstInspectDate: "",
        company: null, // 新增水厂字段
        companyId: null,
        createTime: "",
        enableArrearsValve: null,
        keepValveOpenFree: 1,
        isPause: 0,
        balance: 0,
        codeBookId: null,
      },
      flag: 0,
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      staffPermissionIds: JSON.parse(sessionStorage.getItem("userData")).staffPermissionIds,
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
      codeBookList: [],
      sms_config_list: [],
      approver_list: [],
      companyList: [],
      // 暂停弹窗控制
      stopDialogVisible: false,
      // 恢复弹窗控制
      startDialogVisible: false,
      // 销户弹窗控制+退款类型
      closeAccountDialogVisible: false,
      // 余额预退款弹窗
      refundBalanceDialogVisible: false,
      loading: false,

      pageLoading: false,
    };
  },
  async mounted() {
    // this.assignmentData();
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
        this.userInfoData.codeBookId = null;
        this.codeBookList = [];
        this.getRegionData();
        this.getPriceList();
        this.getSmsConfigList();
        this.getApproverList();
      }
    },
    "userInfoData.regionName": function (newVal) {
      if (this.companyId === 95 && this.flag === 1) {
        this.userInfoData.codeBookId = null;
        if (newVal) {
          this.getCodeBookList();
        } else {
          this.codeBookList = [];
        }
      }
    },
    flag: function (newVal) {
      if (newVal) {
      }
    },
    data: {
      handler(newVal) {
        if (!newVal || !newVal.meterCode) return;
        // 每次传入行数据（打开弹窗），根据表号查询完整用户信息
        this.fetchFullUserInfo(newVal);
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    handleUserInfoClose() {
      this.$emit("close");
    },
    assignmentData() {
      console.log(this.data);
      // 初始化用户信息数据
      this.userInfoData.userId = this.data.userId;
      this.userInfoData.imei = this.data.imei;
      this.userInfoData.userName = this.data.userName;
      this.userInfoData.userAddr = this.data.userAddr;
      this.userInfoData.regionName = this.data.regionName;
      this.userInfoData.userPhone = this.data.phone;
      this.userInfoData.userOtherPhone = this.data.userOtherPhone;
      this.userInfoData.userRemark = this.data.userRemark;
      this.userInfoData.meterCode = this.data.meterCode;
      this.userInfoData.meterType = this.data.meterType;
      this.userInfoData.priceId = this.data.priceId;
      this.userInfoData.smsConfigId = this.data.smsConfigId;
      this.userInfoData.approver_1 = this.data.approver1;
      this.userInfoData.factoryDate = this.data.factoryDate;
      this.userInfoData.firstInspectDate = this.data.firstInspectDate;
      // this.userInfoData.approver_2 = this.data.approver2;
      // this.userInfoData.approver_3 = this.data.approver3;
      this.userInfoData.company = this.data.companyName;
      this.userInfoData.companyId = this.data.companyId; // 关键：确保companyId先被赋值
      this.userInfoData.createTime = this.data.createTime;
      this.userInfoData.enableArrearsValve = this.data.enableArrearsValve === null ? "default" : this.data.enableArrearsValve;
      this.userInfoData.keepValveOpenFree = this.data.keepValveOpenFree === null ? 1 : this.data.keepValveOpenFree;
      this.userInfoData.isPause = this.data.isPause ?? 0;
      this.userInfoData.balance = this.data.balance ?? 0;
      this.userInfoData.codeBookId = this.data.codeBookId ?? null;

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
            // 区域加载完成后，如果是95水厂且已有区域，加载表册
            if (this.companyId === 95 && this.userInfoData.regionName) {
              this.getCodeBookList();
            }
          }
        })
        .catch((error) => {
          ElMessage.error("获取区域数据失败");
        });
    },
    getCodeBookList() {
      const regionName = this.userInfoData.regionName;
      if (!regionName) {
        this.codeBookList = [];
        return;
      }
      const region = this.quyu_data.find((item) => item.label === regionName);
      const regionId = region ? region.id : null;
      if (!regionId) {
        this.codeBookList = [];
        return;
      }
      const companyId = this.userInfoData.companyId || this.companyId;
      service
        .get(`/getCodeBookByRegion?companyId=${companyId}&regionId=${regionId}`)
        .then((res) => {
          if (res.code === 200) {
            this.codeBookList = (res.data || []).map((item) => ({
              id: item.codeBookId,
              label: item.codeBookName,
            }));
          } else {
            this.codeBookList = [];
          }
        })
        .catch(() => {
          this.codeBookList = [];
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
          condition: this.companyId === 95 && (this.userInfoData.codeBookId === null || this.userInfoData.codeBookId === ""),
          message: "所属表册不能为空！",
        },
        {
          condition: this.userInfoData.userPhone && !/^1[3-9]\d{9}$/.test(this.userInfoData.userPhone.trim()),
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
          message: "开户审批人不能为空！",
        },
        // {
        //   condition: this.userInfoData.approver_2 === null || this.userInfoData.approver_2 === "",
        //   message: "开户审批人2不能为空！",
        // },
        // {
        //   condition: this.userInfoData.approver_3 === null || this.userInfoData.approver_3 === "",
        //   message: "开户审批人3不能为空！",
        // },
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

      Object.keys(this.userInfoData).forEach((key) => {
        if (typeof this.userInfoData[key] === "string") {
          this.userInfoData[key] = this.userInfoData[key].trim();
        }
      });

      const userPhone = !this.userInfoData.userPhone || this.userInfoData.userPhone.trim() === "" ? null : this.userInfoData.userPhone;
      const approver_2 = !this.userInfoData.approver_2 || this.userInfoData.approver_2.trim() === "" ? null : this.userInfoData.approver_2;
      const approver_3 = !this.userInfoData.approver_3 || this.userInfoData.approver_3.trim() === "" ? null : this.userInfoData.approver_3;

      let dataParams = {
        userId: this.userInfoData.userId,
        userName: this.userInfoData.userName,
        userAddr: this.userInfoData.userAddr,
        regionName: this.userInfoData.regionName,
        userPhone: userPhone,
        userOtherPhone: this.userInfoData.userOtherPhone || null,
        userRemark: this.userInfoData.userRemark || null,
        imei: this.userInfoData.imei,
        approver_1: this.userInfoData.approver_1,
        approver_2: approver_2,
        approver_3: approver_3,
        factoryDate: this.userInfoData.factoryDate || null,
        firstInspectDate: this.userInfoData.firstInspectDate || null,
        smsConfigId: this.userInfoData.smsConfigId,
        priceId: this.userInfoData.priceId,
        meterType: this.userInfoData.meterType,
        companyId: this.userInfoData.companyId,
        createTime: this.userInfoData.createTime,
        enableArrearsValve: this.userInfoData.enableArrearsValve === "default" ? null : this.userInfoData.enableArrearsValve,
        keepValveOpenFree: this.userInfoData.keepValveOpenFree,
        codeBookId: this.companyId === 95 ? this.userInfoData.codeBookId : null,
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

    // 打开暂停弹窗
    openStopDialog() {
      this.stopDialogVisible = true;
    },
    // 暂停用户执行
    async handleStopUser() {
      this.loading = true;
      try {
        const form = {
          imei: this.userInfoData.imei,
          userId: this.userInfoData.userId,
          companyId: this.userInfoData.companyId,
          meterCode: this.userInfoData.meterCode,
          staffId: this.$store.state.userData.staffId
        };
        const res = await service.post("/userManage/userCharge/pauseMeter", form);
        if (res.code === 200) {
          ElMessage.success("操作成功，用户已暂停");
          this.stopDialogVisible = false;
          this.handleUserInfoClose();
        } else {
          ElMessage.error(res.msg || "暂停失败");
        }
      } catch (err) {
        console.error("暂停接口报错：", err);
        ElMessage.error("暂停请求异常，请稍后重试");
      } finally {
        this.loading = false;
      }
    },

    // 打开恢复弹窗
    openStartDialog() {
      this.startDialogVisible = true;
    },
    // 恢复用户执行
    async handleStartUser() {
      this.loading = true;
      // 暂停接口预留 resumeMeter
      try {
        const form = {
          imei: this.userInfoData.imei,
          userId: this.userInfoData.userId,
          companyId: this.userInfoData.companyId,
          meterCode: this.userInfoData.meterCode,
          staffId: this.$store.state.userData.staffId
        };
        const res = await service.post("/userManage/userCharge/resumeMeter", form);
        if (res.code === 200) {
          ElMessage.success("操作成功，用户已恢复");
          this.stopDialogVisible = false;
          this.handleUserInfoClose();
        } else {
          ElMessage.error(res.msg || "恢复失败");
        }
      } catch (err) {
        console.error("暂停接口报错：", err);
        ElMessage.error("恢复请求异常，请稍后重试");
      } finally {
        this.loading = false;
      }
    },

// 打开销户弹窗
    openCloseAccountDialog() {
      // 默认选中现金
      this.closeAccountDialogVisible = true;
    },
// 销户执行
    handleCloseAccount() {
      this.loading = true;
      const form = {
        imei: this.userInfoData.imei,
        userId: this.userInfoData.userId,
        companyId: this.userInfoData.companyId,
        meterCode: this.userInfoData.meterCode,
        staffId: this.$store.state.userData.staffId
      };
      service.post("/userManage/userCharge/cancelUserMeter", form).then(res => {
        if (res.code === 200) {
          ElMessage.success("销户成功");
          this.closeAccountDialogVisible = false;
          this.handleUserInfoClose();
        } else {
          ElMessage.error(res.msg || "销户失败");
        }
      }).catch(err => {
        ElMessage.error("销户请求异常");
        console.error("销户接口报错：", err);
      }).finally(()=>{
        this.loading = false; // 请求无论成功失败，最后关闭loading
      });
    },
    // 打开余额预退款弹窗
    openRefundBalanceDialog() {
      this.refundBalanceDialogVisible = true;
    },
// 执行余额预退款（仅退余额，不销户）
    handleRefundBalance() {
      this.loading = true;
      const balance = Number(this.userInfoData.balance);
      if (balance < 0) {
        ElMessage.warning(`当前用户欠费，无法执行退款操作`);
        this.loading = false;
        return;
      }else if (balance === 0){
        ElMessage.warning(`当前用户余额为 0 元，无法执行退款操作`);
        this.loading = false;
        return;
      }
      const form = {
        imei: this.userInfoData.imei,
        userId: this.userInfoData.userId,
        companyId: this.userInfoData.companyId,
        meterCode: this.userInfoData.meterCode,
        staffId: this.$store.state.userData.staffId
      };
      service.post("/userManage/userCharge/cancelRefund", form).then(res => {
        if (res.code === 200) {
          ElMessage.success("余额退款成功");
          this.refundBalanceDialogVisible = false;
          this.handleUserInfoClose();
        } else {
          ElMessage.error(res.msg || "退款失败");
        }
      }).catch(err => {
        ElMessage.error("退款请求异常");
        console.error("退款接口报错：", err);
      }).finally(()=>{
        this.loading = false;
      });
    },
    // 根据表号获取完整用户信息
    async fetchFullUserInfo(row) {
      this.pageLoading = true;
      try {
        const meterCode = row.meterCode;
        // 第一步：根据表号进行查询
        const res = await service.get(`/userManage/userCharge/user/info/byMeterCode?meterCode=${encodeURIComponent(meterCode)}`, {
          headers: { Authorization: this.$store.state.userData.token },
          skipAutoMsg: true // 开启静默模式，拦截器不再自动弹报错
        })
        if (res.code === 200 && res.data) {
          // 完整数据覆盖 userInfoData
          this.fillUserData(res.data);
          return;
        }
        throw new Error("表号可能不再使用，根据表号查询用户信息查询失败，即将根据用户号进行查询");
      } catch (err) {
        console.log("byMeterCode查询失败，切换备用接口", err);
        try {
          // 第二步：备用方案，使用 userId+meterCode+companyId 查询
          const meterCode = row.meterCode;
          const userId = row.userId;
          const companyId = row.companyId;
          const resBackup = await service.get(`/userManage/userCharge/user/info/byUserId?meterCode=${encodeURIComponent(meterCode)}&userId=${userId}&companyId=${companyId}`, {
            headers: { Authorization: this.$store.state.userData.token }
          })
          if (resBackup.code === 200 && resBackup.data) {
            this.fillUserData(resBackup.data);
            return;
          }
          throw new Error("用户信息查询失败");
        } catch (err2) {
          console.error("查询用户信息失败", err2);
          ElMessage.warning("无法获取完整用户信息，使用表格基础数据");
          // 双接口全部失败，使用父组件传入的基础行数据填充
          this.assignmentData();
        }
      } finally {
        this.pageLoading = false;
      }
    },
    // 抽离公共赋值方法，避免重复代码
    fillUserData(full) {
      this.userInfoData.userId = full.userId;
      this.userInfoData.imei = full.imei;
      this.userInfoData.userName = full.userName;
      this.userInfoData.userAddr = full.userAddr;
      this.userInfoData.company = full.companyName;
      this.userInfoData.companyId = full.companyId;
      this.userInfoData.regionName = full.regionName;
      this.userInfoData.userPhone = full.phone;
      this.userInfoData.userOtherPhone = full.userOtherPhone;
      this.userInfoData.userRemark = full.userRemark;
      this.userInfoData.meterCode = full.meterCode;
      this.userInfoData.meterType = full.meterType;
      this.userInfoData.priceId = full.priceId;
      this.userInfoData.smsConfigId = full.smsConfigId;
      this.userInfoData.approver_1 = full.approver1;
      this.userInfoData.factoryDate = full.factoryDate || "";
      this.userInfoData.firstInspectDate = full.firstInspectDate || "";
      this.userInfoData.createTime = full.createTime ? full.createTime.split(" ")[0] : "";
      this.userInfoData.enableArrearsValve = full.enableArrearsValve === null ? "default" : full.enableArrearsValve;
      this.userInfoData.keepValveOpenFree = full.keepValveOpenFree ?? 1;
      this.userInfoData.isPause = full.isPause ?? 0;
      this.userInfoData.balance = full.balance ?? 0;
      this.userInfoData.codeBookId = full.codeBookId ?? null;
      // 重新加载下拉选项（水厂/区域/价格/审批人）
      Promise.all([this.getCompanyList(), this.getRegionData(), this.getPriceList(), this.getSmsConfigList(), this.getApproverList()]).then(() => {
        this.flag = 1;
      })
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
  width: 75%;
  height: 750px;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-top: -425px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-info-content {
  width: 96%;
  flex: 1;
  min-height: 0;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 15px;
  margin-bottom: 5px;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: 15px;
  overflow-y: auto;
  row-gap: 15px;
  column-gap: 30px;
}

.user-info-input {
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 30%;
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
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  margin-bottom: 15px;
}

.left-btn, .right-btn{
  display: flex;
  align-items: center;
}

.left-btn{
  margin-left: 15px;
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
  margin-right: 15px;
}

.operate-btn {
  height: 35px;
  width: 90px;
  cursor: pointer;
  border: 1px solid #f2f2f2;
  border-radius: 5px;
  display: flex;
  align-items: center;
}
.stop-btn {
  width: 135px;
  background-color: #45ba7e;
  margin-right: 15px;
  color: #fff;
}
.close-btn {
  background-color: #fff;
  margin-right: 30px;
}
.refund-btn {
  width: 135px;
  background-color: #fff;
  margin-right: 15px;
}
</style>
