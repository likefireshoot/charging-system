<template>
  <div class="duanxin-container">
    <div class="search-box">
      <div class="search-content">
        <div class="search-input" v-if="companyId === 1" style="margin-left: 10px">
          <span>所属水厂</span>
          <el-select v-model="params.company" placeholder="请选择所属水厂">
            <el-option v-for="item in companyList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>短信配置编号</span>
          <el-input v-model="params.configId" placeholder="请输入..." />
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>短信配置名称</span>
          <el-input v-model="params.configName" placeholder="请输入..." />
        </div>
      </div>
      <div class="buttons">
        <div class="sercah-btn" @click="search">
          <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 15%">搜索</span>
        </div>
        <div class="clear-btn" @click="clear">
          <img src="@/assets/yuangong/icon4.png" alt="" style="margin-left: 10px" />
          <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">清空</span>
        </div>
      </div>
    </div>
    <div class="duanxin-info">
      <div class="command-box">
        <div class="add-btn" style="margin-left: 10px" @click="add_dialogFormVisible = true" v-if="staffPermissionIds.includes(23)">
          <img src="@/assets/yuangong/icon6.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">新增</span>
        </div>
        <div class="delete-btn" style="margin-left: 10px" @click="delete_click" v-if="staffPermissionIds.includes(24)">
          <img src="@/assets/yuangong/icon4.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">删除</span>
        </div>
        <div class="edit-btn" style="margin-left: 10px" @click="edit_click" v-if="staffPermissionIds.includes(25)">
          <img src="@/assets/yuangong/icon3.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">编辑</span>
        </div>
        <div
          class="water_outage-btn"
          style="margin-left: 10px"
          @click="
            water_outage_dialogFormVisible = true;
            flag = 1;
          "
          v-if="staffPermissionIds.includes(26)"
        >
          <img src="@/assets/yonghu/icon19.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">停水通知</span>
        </div>
        <!-- <div class="export-in-btn" style="margin-left: 10px" @click="triggerFileInput">
          <img src="@/assets/yuangong/icon1.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">导入</span>
          <input ref="fileInput" type="file" accept=".xls,.xlsx" style="display: none" @change="exportIn" />
        </div> -->
        <div class="export-out-btn" style="margin-left: 10px" @click="exportExcel">
          <img src="@/assets/yuangong/icon2.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">导出</span>
        </div>
        <div class="reflush" style="margin-left: 10px" @click="reflush">
          <img src="@/assets/yonghu/icon15.png" alt="" />
        </div>
      </div>
      <div class="duanxin-table">
        <el-table
          ref="multipleTableRef"
          :data="smsData"
          row-key="smsConfigId"
          style="width: auto; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
          border
          :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
          @selection-change="handleSelectionChange"
          id="duanxin-table"
        >
          <el-table-column type="selection" :selectable="selectable" :width="selectionWidth" align="center" />
          <el-table-column label="序号" :width="indexWidth" align="center" #default="scope">
            {{ scope.$index + 1 + (params.pageNo - 1) * params.pageSize }}
          </el-table-column>
          <el-table-column property="smsConfigId" label="短信配置编号" :width="idWidth" align="center" />
          <el-table-column property="smsConfigName" label="短信配置名称" :width="nameWidth" align="center" />
          <el-table-column property="smsSendType" label="发送方式" :width="sendTypeWidth" align="center" />
          <el-table-column property="smsSendTime" label="短信定时发送时间" :width="sendTimeWidth" align="center" />
          <el-table-column property="minimumBalanceThreshold" label="余额不足发送预警值" :width="warningValueWidth" align="center" />
          <!-- <el-table-column property="balanceWarningDays" label="余额不足短信提醒天数" :width="warningDayWidth" align="center" /> -->
          <el-table-column property="companyName" label="所属水厂" :width="companyWidth" align="center" />
        </el-table>
      </div>
      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination v-model:current-page="params.pageNo" v-model:page-size="params.pageSize" :page-sizes="[5, 10, 15]" layout="total,  prev, pager, next, jumper" :total="total" />
        </div>
      </div>
    </div>
    <!-- 新增按钮弹出框 -->
    <div class="test-dialog" v-if="add_dialogFormVisible">
      <div class="test-dialog-content">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/yuangong/icon6.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 18px">新增</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="add_dialogFormVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="test-content">
          <div class="test-input">
            <span>短信配置名称</span>
            <el-input v-model="addData.smsConfigName" />
          </div>
          <div class="test-input">
            <span>发送方式</span>
            <el-select v-model="addData.smsSendType" style="height: 35px">
              <el-option label="实时发送" value="实时发送"></el-option>
              <el-option label="定时发送" value="定时发送"></el-option>
            </el-select>
          </div>
          <div class="test-input" style="margin-right: 0">
            <span>定时发送时间</span>
            <el-input v-model="addData.smsSendTime" placeholder="请输入定时发送时间（0~23）" :disabled="isAddSendTimeDisabled"></el-input>
          </div>
          <div class="test-input">
            <span>余额不足发送预警值（元）</span>
            <el-input v-model="addData.minimumBalanceThreshold" />
          </div>
          <div class="test-input">
            <span>余额不足短信提醒天数</span>
            <el-input v-model="addData.balanceWarningDays" />
          </div>
          <div class="test-input" style="margin-right: 0" v-if="companyId === 1">
            <span>所属水厂</span>
            <el-select v-model="addData.companyId" placeholder="请选择所属水厂">
              <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </div>
        </div>
        <div class="btn">
          <div class="confirm-btn" @click="addConfirm">
            <el-icon style="margin-left: 15%"><Check /></el-icon>
            <span style="font-size: 16px; margin-left: 15%">确认</span>
          </div>
          <div class="cancel-btn" @click="add_cancel">
            <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
            <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">取消</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 删除按钮弹出框 -->
    <div class="delete-dialog" v-if="delete_dialogFormVisible">
      <div class="delete-dialog-content">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/yuangong/icon4.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 18px">删除</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="delete_dialogFormVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="delete-content">
          <el-icon style="margin-right: 10px; margin-top: 35px; font-size: 40px; color: #f33125" align-self="center"><WarningFilled /></el-icon>
          <span style="margin-top: 5px">删除后不可恢复，确认删除数据吗？</span>
        </div>
        <div class="btn">
          <div class="confirm-btn" @click="deleteConfirm">
            <el-icon style="margin-left: 15%"><Check /></el-icon>
            <span style="font-size: 16px; margin-left: 15%">确认</span>
          </div>
          <div class="cancel-btn" @click="delete_dialogFormVisible = false">
            <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
            <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">取消</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 编辑按钮弹出框 -->
    <div class="test-dialog" v-if="edit_dialogFormVisible">
      <div class="test-dialog-content">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/yuangong/icon3.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 18px">编辑</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="edit_dialogFormVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="test-content">
          <div class="test-input">
            <span>短信配置名称</span>
            <el-input v-model="editData.smsConfigName" />
          </div>
          <div class="test-input">
            <span>发送方式</span>
            <el-select v-model="editData.smsSendType">
              <el-option label="实时发送" value="实时发送"></el-option>
              <el-option label="定时发送" value="定时发送"></el-option>
            </el-select>
          </div>
          <div class="test-input" style="margin-right: 0">
            <span>定时发送时间</span>
            <el-input v-model="editData.smsSendTime" placeholder="请输入定时发送时间（0~23）" :disabled="isEditSendTimeDisabled"></el-input>
          </div>
          <div class="test-input">
            <span>余额不足发送预警值（元）</span>
            <el-input v-model="editData.minimumBalanceThreshold" />
          </div>
          <!-- <div class="test-input">
            <span>余额不足短信提醒天数</span>
            <el-input v-model="editData.balanceWarningDays" />
          </div> -->
          <div class="test-input" style="margin-right: 0" v-if="companyId === 1">
            <span>所属水厂</span>
            <el-select v-model="editData.companyName" placeholder="请选择所属水厂">
              <el-option v-for="item in companyList" :key="item.id" :value="item.name" :label="item.name"></el-option>
            </el-select>
          </div>
        </div>
        <div class="btn">
          <div class="confirm-btn" @click="editConfirm">
            <el-icon style="margin-left: 15%"><Check /></el-icon>
            <span style="font-size: 16px; margin-left: 15%">确认</span>
          </div>
          <div class="cancel-btn" @click="edit_dialogFormVisible = false">
            <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
            <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">取消</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 停水通知弹出框 -->
    <div class="test-dialog" v-if="water_outage_dialogFormVisible">
      <div class="test-dialog-content" style="margin-top: -300px">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/yonghu/icon19.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 18px">停水通知</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="water_outage_dialogFormVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="test-content">
          <div class="test-input" v-if="companyId === 1">
            <span>所属水厂</span>
            <el-select v-model="waterOutageData.companyId" placeholder="请选择所属水厂">
              <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </div>
          <div class="test-input">
            <span>区域</span>
            <el-select v-model="waterOutageData.region" placeholder="请选择所属水厂">
              <el-option v-for="item in quyu_data" :key="item.id" :label="item.label" :value="item.id"></el-option>
            </el-select>
          </div>
          <div class="test-input">
            <span>用户列表</span>
            <el-select v-model="waterOutageData.userList" multiple clearable collapse-tags placeholder="请选择用户" popper-class="custom-header" :max-collapse-tags="1">
              <template #header>
                <el-checkbox class="user-checkbox" v-model="checkAll" :indeterminate="indeterminate" @change="handleCheckAll"> 全选 </el-checkbox>
              </template>
              <el-option v-for="item in userAllList" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </div>
          <div class="test-input">
            <span>停水原因</span>
            <el-input v-model="waterOutageData.reason"></el-input>
          </div>
          <div class="test-input" style="width: 50%">
            <span>停水起止时间</span>
            <div class="demo-datetime-picker">
              <div class="block">
                <el-date-picker
                  v-model="waterOutageData.time"
                  type="datetimerange"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  format="YYYY-MM-DD HH:mm:ss"
                  date-format="YYYY年MM月DD日"
                  time-format="HH:mm:ss"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="btn">
          <div class="confirm-btn" @click="addOutageConfirm">
            <el-icon style="margin-left: 15%"><Check /></el-icon>
            <span style="font-size: 16px; margin-left: 15%">确认</span>
          </div>
          <div class="cancel-btn" @click="addOutage_cancel">
            <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
            <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">取消</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import service from "@/api/request";
import { ElMessage } from "element-plus";
import axios from "axios";

export default {
  data() {
    return {
      params: {
        configName: null,
        configId: null,
        company: null,
        pageNo: 1,
        pageSize: 50,
        companyId: null,
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      staffPermissionIds: JSON.parse(sessionStorage.getItem("userData")).staffPermissionIds,
      postsList: [
        {
          id: 1,
          name: "经理",
        },
        {
          id: 2,
          name: "员工",
        },
      ],
      rolesList: [
        {
          id: 1,
          name: "管理员",
        },
        {
          id: 2,
          name: "普通员工",
        },
      ],
      smsData: [],
      multipleSelection: [],
      companyList: [],
      addData: {
        smsConfigName: null,
        smsSendType: null,
        smsSendTime: null,
        minimumBalanceThreshold: null,
        balanceWarningDays: null,
        companyId: null,
      },
      editData: {
        smsConfigName: null,
        smsSendType: null,
        smsSendTime: null,
        minimumBalanceThreshold: null,
        balanceWarningDays: null,
        companyName: null,
      },
      waterOutageData: {
        region: null,
        userList: [],
        time: null,
        startTime: null,
        endTime: null,
        reason: null,
        companyId: null,
      },
      flag: 0,
      checkAll: false,
      indeterminate: false,
      quyu_data: [],

      userAllList: [],

      total: 100,

      // 每列实际宽度
      selectionWidth: 0,
      indexWidth: 0,
      idWidth: 0,
      nameWidth: 0,
      sendTypeWidth: 0,
      sendTimeWidth: 0,
      warningValueWidth: 0,
      warningDayWidth: 0,
      companyWidth: 0,

      // 父容器元素
      parentContainer: null,
      // ResizeObserver 实例
      resizeObserver: null,

      //弹出框显示与否
      delete_dialogFormVisible: false,
      add_dialogFormVisible: false,
      edit_dialogFormVisible: false,
      water_outage_dialogFormVisible: false,

      //表格勾选行
      selection: [],
    };
  },
  watch: {
    "params.pageNo": {
      handler() {
        this.getSmsConfigData();
      },
    },
    "addData.smsSendType": {
      handler() {
        if (this.isAddSendTimeDisabled) {
          this.addData.smsSendTime = null;
        }
      },
    },
    "editData.smsSendType": {
      handler() {
        if (this.isEditSendTimeDisabled) {
          this.editData.smsSendTime = null;
        }
      },
    },
    "waterOutageData.companyId": {
      handler() {
        this.waterOutageData.region = null; // 清空区域选择
        this.getRegionData();
      },
    },
    "waterOutageData.region": {
      handler() {
        if (this.flag === 1) {
          this.getUserByRegionId();
        }
      },
    },
    "waterOutageData.userList": {
      handler(val) {
        if (val.length === 0) {
          this.checkAll = false;
          this.indeterminate = false;
        } else if (val.length === this.userAllList.length) {
          this.checkAll = true;
          this.indeterminate = false;
        } else {
          this.indeterminate = true;
        }
      },
    },
  },
  computed: {
    // 每列的百分比宽度
    columnPercentages() {
      return {
        selection: 5,
        index: 8,
        id: 12,
        name: 15,
        sendType: 15,
        sendTime: 18,
        warningValue: 15,
        // warningDay: 10,
        company: 10,
      };
    },
    isAddSendTimeDisabled() {
      return this.addData.smsSendType === "实时发送";
    },
    isEditSendTimeDisabled() {
      return this.editData.smsSendType === "实时发送";
    },
  },
  mounted() {
    // 获取父容器元素
    this.parentContainer = document.querySelector(".duanxin-table");
    // 初始化列宽
    this.calculateColumnWidths();

    // 创建 ResizeObserver 实例并监听父容器宽度变化
    this.resizeObserver = new ResizeObserver(this.calculateColumnWidths);
    if (this.parentContainer) {
      this.resizeObserver.observe(this.parentContainer);
    }

    this.getSmsConfigData();
    this.getCompanyList();
    this.getRegionData();
  },
  beforeUnmount() {
    // 组件卸载时取消监听
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  methods: {
    selectable() {
      return true; // 目前允许所有行选择，你可以加上你的业务逻辑
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleCheckAll(val) {
      this.indeterminate = false;
      if (val) {
        this.waterOutageData.userList = this.userAllList.map((_) => _.id);
      } else {
        this.waterOutageData.userList = [];
      }
    },
    // 计算列宽的函数
    calculateColumnWidths() {
      if (this.parentContainer) {
        const parentWidth = this.parentContainer.offsetWidth;
        this.selectionWidth = (this.columnPercentages.selection / 100) * parentWidth;
        this.indexWidth = (this.columnPercentages.index / 100) * parentWidth;
        this.idWidth = (this.columnPercentages.id / 100) * parentWidth;
        this.nameWidth = (this.columnPercentages.name / 100) * parentWidth;
        this.sendTypeWidth = (this.columnPercentages.sendType / 100) * parentWidth;
        this.sendTimeWidth = (this.columnPercentages.sendTime / 100) * parentWidth;
        this.warningValueWidth = (this.columnPercentages.warningValue / 100) * parentWidth;
        // this.warningDayWidth = (this.columnPercentages.warningDay / 100) * parentWidth;
        this.companyWidth = (this.columnPercentages.company / 100) * parentWidth;
      }
    },
    getUserByRegionId() {
      service
        .get(`/getUserByRegionId?regionId=${this.waterOutageData.region}`)
        .then((response) => {
          if (response.code === 200) {
            this.userAllList = response.data.map((item) => {
              return {
                id: item.userId,
                label: item.userName,
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
    getSmsConfigData() {
      if (this.companyId === 1) {
        if (this.params.company) {
          this.params.companyId = this.params.company; // 所属水厂ID
        }
      } else {
        this.params.companyId = this.companyId; // 所属水厂ID
      }
      const filteredParams = Object.fromEntries(Object.entries(this.params).filter(([_, value]) => value !== null && value !== ""));
      service
        .post("/sms/querySmsConfig", filteredParams)
        .then((response) => {
          if (response.code === 200) {
            this.smsData = response.data.records;
            this.smsData.forEach((item) => {
              if (item.smsSendType === "实时发送") {
                item.smsSendTime = "";
              }
            });
            this.total = response.data.total;
            this.params.pageNo = response.data.current; // 重置页码
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },

    getSmsConfigDataByPage() {
      const params = {
        pageNo: this.params.pageNo,
        pageSize: this.params.pageSize,
        companyId: this.params.company ? this.params.company : this.companyId,
      };
      console.log(params);
      service
        .post("/sms/querySmsConfig", params)
        .then((response) => {
          if (response.code === 200) {
            this.smsData = response.data.records;
            this.smsData.forEach((item) => {
              if (item.smsSendType === "实时发送") {
                item.smsSendTime = "";
              }
            });
            this.total = response.data.total;
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },

    reflush() {
      this.clear();
      let params = { pageNo: 1, pageSize: 50 };
      if (this.companyId === 1) {
        if (this.params.company) {
          params.companyId = this.params.company; // 所属水厂ID
        }
      } else {
        params.companyId = this.companyId; // 所属水厂ID
      }
      this.params.pageNo = 1;
      this.params.pageSize = 50;
      console.log(params);
      service
        .post("/sms/querySmsConfig", params)
        .then((response) => {
          if (response.code === 200) {
            this.smsData = response.data.records;
            this.smsData.forEach((item) => {
              if (item.smsSendType === "实时发送") {
                item.smsSendTime = "";
              }
            });
            this.total = response.data.total;
            this.params.pageNo = 1;
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },

    delete_click() {
      if (this.multipleSelection.length > 0) {
        this.delete_dialogFormVisible = true;
      } else {
        ElMessage.error("请选择需要删除的数据");
      }
    },

    edit_click() {
      if (this.multipleSelection.length > 0) {
        this.editData = this.multipleSelection[0];
        this.edit_dialogFormVisible = true;
      } else {
        ElMessage.error("请选择需要编辑的数据");
      }
    },

    search() {
      this.getSmsConfigData();
    },

    clear() {
      this.params.configName = null;
      this.params.configId = null;
      this.params.company = null;
      this.params.companyId = null;
    },

    addConfirm() {
      if (this.companyId === 1) {
        if (this.addData.companyId === null || this.addData.companyId === "") {
          ElMessage.error("所属水厂不能为空！");
          return;
        }
      } else {
        this.addData.companyId = this.companyId; // 设置所属水厂ID
      }
      const validations = [
        { condition: this.addData.smsConfigName === null || this.addData.smsConfigName === "", message: "短信配置名称不能为空！" },
        { condition: this.addData.smsSendType === null || this.addData.smsSendType === "", message: "发送方式不能为空！" },
        {
          condition: this.addData.smsSendType === "定时发送" && (this.addData.smsSendTime === null || this.addData.smsSendTime === ""),
          message: "定时发送时间不能为空！",
        },
        {
          condition: this.addData.smsSendType === "定时发送" && (isNaN(parseInt(this.addData.smsSendTime)) || parseInt(this.addData.smsSendTime) < 0 || parseInt(this.addData.smsSendTime) > 23),
          message: "定时发送时间必须为0 - 23的整数！",
        },
        {
          condition: this.addData.minimumBalanceThreshold === null || this.addData.minimumBalanceThreshold === "",
          message: "余额不足发送预警值不能为空！",
        },
        {
          condition: isNaN(parseFloat(this.addData.minimumBalanceThreshold)) || parseFloat(this.addData.minimumBalanceThreshold) < 0,
          message: "余额不足发送预警值必须为正数",
        },
        {
          condition: this.addData.balanceWarningDays === null || this.addData.balanceWarningDays === "",
          message: "余额不足短信提醒天数不能为空！",
        },
        {
          condition: isNaN(parseInt(this.addData.balanceWarningDays)) || parseInt(this.addData.balanceWarningDays) < 0,
          message: "余额不足短信提醒天数必须为正整数",
        },
        {
          condition: this.addData.companyId === null || this.addData.companyId === "",
          message: "所属水厂不能为空！",
        },
      ];

      for (const validation of validations) {
        if (validation.condition) {
          ElMessage.error(validation.message);
          return;
        }
      }
      //this.addData.companyId = JSON.parse(sessionStorage.getItem("userData")).companyId;
      const filteredParams = Object.fromEntries(Object.entries(this.addData).filter(([_, value]) => value !== null && value !== ""));
      service
        .post("/sms/smsAddConfig", filteredParams)
        .then((response) => {
          if (response.code === 200) {
            ElMessage.success("添加成功");
            this.add_dialogFormVisible = false;
            this.addData = {
              smsConfigName: null,
              smsSendType: null,
              smsSendTime: null,
              smsSendBound: null,
              smsSendWarningTotalDays: null,
            };
            this.getSmsConfigData();
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    add_cancel() {
      this.add_dialogFormVisible = false;
      this.addData = {
        smsConfigName: null,
        smsSendType: null,
        smsSendTime: null,
        minimumBalanceThreshold: null,
        balanceWarningDays: null,
        companyId: null,
      };
    },
    addOutage_cancel() {
      this.water_outage_dialogFormVisible = false;
      this.waterOutageData = {
        region: null,
        userList: [],
        startTime: null,
        endTime: null,
        reason: null,
        companyId: null,
      };
      this.checkAll = false;
      this.indeterminate = false;
      this.flag = 0;
    },

    editConfirm() {
      const validations = [
        { condition: this.editData.smsConfigName === null || this.editData.smsConfigName === "", message: "短信配置名称不能为空！" },
        { condition: this.editData.smsSendType === null || this.editData.smsSendType === "", message: "发送方式不能为空！" },
        {
          condition: this.editData.smsSendType === "定时发送" && (this.editData.smsSendTime === null || this.editData.smsSendTime === ""),
          message: "定时发送时间不能为空！",
        },
        {
          condition: this.editData.smsSendType === "定时发送" && (isNaN(parseInt(this.editData.smsSendTime)) || parseInt(this.editData.smsSendTime) < 0 || parseInt(this.editData.smsSendTime) > 23),
          message: "定时发送时间必须为0 - 23的整数！",
        },
        {
          condition: this.editData.minimumBalanceThreshold === null || this.editData.minimumBalanceThreshold === "",
          message: "余额不足发送预警值不能为空！",
        },
        {
          condition: isNaN(parseFloat(this.editData.minimumBalanceThreshold)) || parseFloat(this.editData.minimumBalanceThreshold) < 0,
          message: "余额不足发送预警值必须为正数",
        },
        {
          condition: this.editData.balanceWarningDays === null || this.editData.balanceWarningDays === "",
          message: "余额不足短信提醒天数不能为空！",
        },
        {
          condition: isNaN(parseInt(this.editData.balanceWarningDays)) || parseInt(this.editData.balanceWarningDays) < 0,
          message: "余额不足短信提醒天数必须为正整数",
        },
        {
          condition: this.editData.companyName === null || this.editData.companyName === "",
          message: "所属水厂不能为空！",
        },
      ];

      for (const validation of validations) {
        if (validation.condition) {
          ElMessage.error(validation.message);
          return;
        }
      }
      console.log(this.editData);
      let params = {
        smsConfigId: this.editData.smsConfigId,
        smsConfigName: this.editData.smsConfigName,
        smsSendType: this.editData.smsSendType,
        smsSendTime: this.editData.smsSendTime,
        minimumBalanceThreshold: this.editData.minimumBalanceThreshold,
        balanceWarningDays: this.editData.balanceWarningDays,
        companyId: null,
      };
      for (let item of this.companyList) {
        if (item.name === this.editData.companyName) {
          params.companyId = item.id; // 获取对应的公司ID
          break;
        }
      }
      service
        .post("/sms/smsUpdateConfig", params)
        .then((response) => {
          if (response.code === 200) {
            ElMessage.success("修改成功");
            this.edit_dialogFormVisible = false;
            this.getSmsConfigData();
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });

      this.edit_dialogFormVisible = false;
    },

    deleteConfirm() {
      let hasDefault = false;
      console.log(this.multipleSelection);
      for (let item of this.multipleSelection) {
        console.log(item);
        if (item.smsConfigId === 40) {
          hasDefault = true;
          break;
        }
      }
      console.log(hasDefault);

      if (hasDefault) {
        ElMessage.warning("该配置为默认短信配置，无法删除！");
        this.delete_dialogFormVisible = false;
        this.multipleSelection = [];
        this.reflush();
        return;
      }

      // 若没有默认配置，再收集id并发送请求
      let ids = this.multipleSelection.map((item) => item.smsConfigId);
      const requstData = {
        ids: ids,
      };
      service
        .post("/sms/smsDeleteConfig", requstData)
        .then((response) => {
          if (response.code === 200) {
            ElMessage.success("删除成功");
            this.delete_dialogFormVisible = false;
            this.multipleSelection = [];
            this.reflush();
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },

    addOutageConfirm() {
      console.log(this.waterOutageData);
      let validations = [
        {
          condition: this.waterOutageData.companyId === null || this.waterOutageData.companyId === "",
          message: "所属水厂不能为空！",
        },
        {
          condition: this.waterOutageData.region === null || this.waterOutageData.region === "",
          message: "区域不能为空！",
        },
        {
          condition: this.waterOutageData.userList.length === 0,
          message: "用户列表不能为空！",
        },
        {
          condition: this.waterOutageData.reason === null || this.waterOutageData.reason === "",
          message: "停水原因不能为空！",
        },
        {
          condition: this.waterOutageData.time === null || this.waterOutageData.time.length !== 2,
          message: "停水起止时间不能为空！",
        },
      ];
      for (const validation of validations) {
        if (validation.condition) {
          ElMessage.error(validation.message);
          return;
        }
      }
      let params = {
        userIds: this.waterOutageData.userList,
        startTime: this.waterOutageData.time[0],
        endTime: this.waterOutageData.time[1],
        reason: this.waterOutageData.reason,
      };
      service
        .post("/sms/sendWaterShutOffNotice", params)
        .then((response) => {
          if (response.code === 200) {
            ElMessage.success("停水通知设置成功");
            this.water_outage_dialogFormVisible = false;
            this.waterOutageData = {
              region: null,
              userList: [],
              time: null,
              startTime: null,
              endTime: null,
              reason: null,
              companyId: null,
            };
            this.checkAll = false;
            this.indeterminate = false;
            this.flag = 0;
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },

    // 触发文件输入框点击
    triggerFileInput() {
      this.$refs.fileInput.value = ""; // 清空文件输入框，确保每次点击都能触发 @change
      this.$refs.fileInput.click();
    },
    // 处理文件上传
    async exportIn() {
      const fileInput = this.$refs.fileInput;
      const file = fileInput.files[0];

      if (!file) {
        ElMessage.warning("请选择要上传的文件");
        return;
      }

      // 文件类型验证
      const allowedTypes = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
      if (!allowedTypes.includes(file.type)) {
        ElMessage.warning("仅支持上传 .xls 或 .xlsx 文件");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await service.post("/uploadSmsConfig", formData);
        ElMessage.success("导入成功");
        fileInput.value = ""; // 清空文件输入框
        this.reflush();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "未知错误";
        ElMessage.error("导入失败: " + errorMessage);
        console.error("上传失败:", error);
      }
    },
    exportExcel() {
      let url = "";
      let params = {};
      if (this.companyId === 1) {
        if (this.params.company) {
          params.companyId = this.params.company; // 所属水厂ID
          url = `/sms/exportSmsConfig?companyId=${params.companyId}`; // 后端接口地址
        } else {
          url = `/sms/exportSmsConfig`; // 后端接口地址
        }
      } else {
        params.companyId = this.companyId; // 所属水厂ID
        url = `/sms/exportSmsConfig?companyId=${params.companyId}`;
      }
      // 调用后端接口
      axios({
        url: url, // 后端接口地址
        method: "GET",
        responseType: "blob", // 指定响应类型为二进制流
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error("导出失败: " + response.statusText);
          }

          // 获取 Blob 对象
          const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

          if (blob.size === 0) {
            ElMessage.warning("内容为空，无法下载");
            return;
          }

          // 创建一个链接元素
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob); // 创建 Blob URL
          link.download = "短信配置数据列表.xlsx"; // 设置下载文件名
          document.body.appendChild(link);
          link.click(); // 触发下载
          document.body.removeChild(link); // 移除链接元素
          window.URL.revokeObjectURL(link.href); // 释放 Blob URL
        })
        .catch((error) => {
          console.error("导出失败:", error);
          ElMessage.error("导出失败: " + error.message);
        });
    },

    getRegionData() {
      let url = "";
      if (this.companyId === 1) {
        if (this.waterOutageData.companyId) {
          url = `/getRegion?companyId=${this.waterOutageData.companyId}`; // 所属水厂ID
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
  },
};
</script>

<style scoped>
/* 使用更高优先级的选择器 */
:global(:root) {
  --el-color-primary: #46b97e !important;
}

:deep(.el-table__body tr:nth-child(odd)) {
  background-color: #edf8f2;
}

:deep(.el-table__body tr:nth-child(even)) {
  background-color: #ffffff;
}

:deep(.el-table__body tr:hover > td) {
  background-color: #fbf2cb !important;
}

/* 修改勾选框选中时的背景颜色和边框颜色 */
:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #45bb81;
  border-color: #45bb81;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner::after) {
  border-color: #fff;
}

:deep(.el-input) {
  --el-color-primary: #46b97e;
}

:deep(.el-select) {
  --el-color-primary: #46b97e;
}

:deep(.el-select .el-select__wrapper) {
  height: 35px;
}

:deep(.el-pagination) {
  --el-color-primary: #46b97e;
}

:deep(.el-tree) {
  --el-fill-color-light: #46b97e;
  --el-fill-color-blank: #e8f3ed;
  --el-text-color-primary: #fff;
}

:deep(.el-tree-node__content) {
  height: 40px;
  line-height: 40px;
  border-radius: 5px;
  margin: 0 10px;
}

/* 设置鼠标滑过选项时的字体颜色 */
:deep(.el-tree-node__content:hover) {
  color: #fff;
}

.duanxin-container {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  width: 90%;
  height: 98%;
  padding: 0px 20px;
}

.search-box {
  margin-top: 15px;
  margin-bottom: 20px;
  width: 100%;
  height: 98px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  background-color: #fff;
}

.search-content {
  display: flex;
  width: 70%;
  height: 100%;
}

.search-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 25%;
  height: 100%;
  margin-right: 20px;
}

.search-input > span {
  font-size: 14px;
  margin-bottom: 5px;
}

.time-input {
  display: flex;
}

.time-input > span {
  font-size: 14px;
  margin-bottom: 5px;
  align-self: center;
  margin-left: 5px;
  margin-right: 5px;
}

.buttons {
  display: flex;
  width: 240px;
  height: 100%;
  align-items: center;
}

.buttons > * {
  width: 120px;
}

.sercah-btn,
.clear-btn {
  display: flex;
  align-items: center;
  height: 32px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  color: #fff;
}

.sercah-btn {
  background-color: #45ba7e;
  margin-right: 30px;
}
.clear-btn {
  background-color: #fff;
  border: 2px solid #f2f2f2;
  margin-right: 10px;
}

.duanxin-info {
  width: 100%;
  height: calc(100% - 135px);
  margin-bottom: 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  background-color: #fff;
  position: relative;
}

.command-box {
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  margin-top: 15px;
  margin-bottom: 15px;
}

.command-box > * {
  margin-right: 20px;
}

.add-btn,
.delete-btn,
.edit-btn,
.water_outage-btn,
.export-in-btn,
.export-out-btn {
  display: flex;
  align-items: center;
  width: 80px; /* 设置按钮的宽度 */
  height: 32px; /* 设置按钮的高度 */
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
}

.water_outage-btn {
  width: 115px;
}

.reflush {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px; /* 设置按钮的宽度 */
  height: 32px; /* 设置按钮的高度 */
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
}

.duanxin-table,
.page-box {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.duanxin-table {
  height: calc(98% - 110px);
}

.page-box {
  height: 65px;
  position: absolute;
  bottom: 0;
}

/* 删除弹出框 */
.delete-dialog,
.test-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.delete-dialog-content,
.test-dialog-content {
  width: 35%;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 20%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.delete-dialog-content {
  height: 300px;
  top: 50%;
  margin-top: -150px;
}

.test-dialog-content {
  height: 350px;
  width: 70%;
  top: 50%;
  margin-top: -175px;
}

.title {
  width: 100%;
  background-color: #fff;
  border-radius: 5px 5px 0 0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  height: 45px;
  line-height: 40px;
  text-align: center;
  display: flex;
  justify-content: space-between;
}

.delete-content,
.test-content {
  width: 94%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
}

.delete-content {
  height: 150px;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 25px;
}

.test-content {
  width: 90%;
  height: 200px;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 15px;
  margin-bottom: 5px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: 1%;
}

.test-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 31%;
  height: 80px;
  margin-right: 3.5%;
}

.test-content > .test-input:nth-child(3),
.test-content > .test-input:nth-child(6) {
  margin-right: 0;
}

.test-input > span {
  font-size: 16px;
  margin-bottom: 5px;
}

.test-input > .el-input {
  height: 35px;
  width: 100%;
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

.demo-datetime-picker {
  display: flex;
  width: 100%;
  padding: 0;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: stretch;
}
.demo-datetime-picker .block {
  width: 100%;
  height: 35px;
  padding: 0;
  text-align: center;
}

.demo-datetime-picker .block .el-date-editor {
  width: 100%;
  height: 35px;
  padding: 0;
  --el-input-focus-border-color: #46b97e;
}

:deep(.el-date-editor) {
  width: calc(100% - 20px) !important;
  height: 35px !important;
  --el-input-focus-border-color: #46b97e;
}
</style>
