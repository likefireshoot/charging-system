<template>
  <div class="log-container">
    <div class="search-box">
      <div class="search-content">
        <!-- 当companyId为1时，代表是荆州的水厂，所以能查询company -->
        <!-- <div class="search-input" style="margin-left: 10px" v-if="companyId === 1">
          <span>所属水厂</span>
          <el-select v-model="params.company" placeholder="请选择所属水厂">
            <el-option v-for="item in companyList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </div> -->
        <div class="search-input" style="margin-left: 10px">
          <span>所属厂商</span>
          <el-select v-model="params.meterVendor" placeholder="请选择">
            <el-option v-for="item in changshang_list" :key="item.id" :label="item.label" :value="item.label"></el-option>
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>表号</span>
          <el-input v-model="params.meterCode" placeholder="请输入..." />
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>通讯类别</span>
          <el-select v-model="params.commandType" placeholder="请选择">
            <el-option v-for="item in commandTypeList" :key="item.value" :label="item.label" :value="item.label"></el-option>
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>通讯状态</span>
          <el-select v-model="params.commandStatus" placeholder="请选择">
            <el-option v-for="item in commandStatusList" :key="item.value" :label="item.label" :value="item.label"></el-option>
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>通讯下发时间</span>
          <el-date-picker
              v-model="params.time"
              type="daterange"
              range-separator="至"
              start-placeholder="起始时间"
              end-placeholder="结束时间"
              size="default"
              class="date-time-picker"
              style="width: 95%; height: 35px; flex-grow: 0"
              value-format="YYYY-MM-DD"
          />
        </div>
      </div>
      <div class="buttons">
        <div class="sercah-btn" @click="search">
          <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 20px; margin-left: 15%">搜索</span>
        </div>
        <div class="clear-btn" @click="clear">
          <img src="@/assets/rizhi/icon4.png" alt="" style="margin-left: 10px" />
          <span style="font-size: 20px; margin-left: 15%; color: #5a5a5a">清空</span>
        </div>
      </div>
    </div>
    <div class="log-info">
      <div class="command-box">
        <div class="reflush" style="margin-left: 10px" @click="reflush">
          <img src="@/assets/yonghu/icon15.png" alt="" />
        </div>
      </div>
      <div class="commandLog-table">
        <el-table
            ref="multipleTableRef"
            :data="commandLogData"
            row-key="theId"
            style="width: 100%; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
            border
            :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
            @selection-change="handleSelectionChange"
            id="commandLog-table"
        >
          <el-table-column type="selection" :selectable="selectable" :width="selectionWidth" align="center" />
          <el-table-column property="theId" label="序号" :width="indexWidth" align="center" />
          <el-table-column property="displayUserId" label="用户号" :width="userIdWidth" align="center" />
          <el-table-column property="meterCode" label="表号" :width="biaohaoWidth" align="center" />
          <el-table-column property="commandType" label="通讯类别" :width="tongxunleibieWidth" align="center" />
          <el-table-column property="commandStatus" label="通讯状态" :width="tongxunzhaungtaiWidth" align="center" />
          <el-table-column property="createTime" label="通讯下发时间" :width="timeWidth" align="center" />
          <el-table-column property="finishTime" label="通讯完成时间" :width="timeWidth" align="center" />
          <el-table-column property="meterVendor" label="厂商" :width="changshangWidth" align="center" />
          <el-table-column property="displayStaffName" label="下发员工" :width="staffNameWidth" align="center" />
          <el-table-column property="description" label="描述" :width="descriptionWidth" align="center" />
        </el-table>
      </div>
      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination v-model:current-page="params.pageNum" v-model:page-size="params.pageSize" :page-sizes="[5, 10, 15]" layout="total,  prev, pager, next, jumper" :total="total" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import service from "@/api/request";
import axios from "axios";
import { ElMessage } from "element-plus";

export default {
  data() {
    return {
      params: {
        pageNum: 1,
        pageSize: 50,
        commandStatus: null, //
        commandType: null, // 操作类别
        meterCode: null, // 表号
        time: null, // 通讯下发时间
        meterVendor: null, // 所属厂商
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId, // 所属水厂ID
      companyList: [],
      commandStatusList: [
        { value: 1, label: "等待通讯" },
        { value: 2, label: "成功" },
        { value: 3, label: "失败" },
      ],
      commandTypeList: [
        { value: 1, label: "开启阀门" },
        { value: 2, label: "关闭阀门" },
        { value: 3, label: "修改基数" },
        { value: 4, label: "修改抄表周期" },
      ],
      commandLogData: [],
      multipleSelection: null,
      changshang_list: [
        { id: 1, label: "信驰", value: 1 },
        { id: 2, label: "集万讯", value: 2 },
        { id: 3, label: "太阳能", value: 3 },
        { id: 4, label: "圣鑫", value: 4 },
        { id: 5, label: "旧信驰", value: 5 },
        { id: 6, label: "4G信驰", value: 6 },
        { id: 7, label: "旧圣鑫", value: 7 },
      ],

      total: 100,

      // 每列实际宽度
      selectionWidth: 0,
      indexWidth: 0,
      biaohaoWidth: 0,
      userIdWidth: 0,
      staffNameWidth: 0,
      tongxunleibieWidth: 0,
      tongxunzhaungtaiWidth: 0,
      timeWidth: 0,
      changshangWidth: 0,
      descriptionWidth: 0,

      // 父容器元素
      parentContainer: null,
      // ResizeObserver 实例
      resizeObserver: null,

      //表格勾选行
      selection: [],
    };
  },
  watch: {
    "params.pageNum": {
      handler() {
        this.getCommandLogsData();
      },
    },
  },
  computed: {
    // 每列的百分比宽度
    columnPercentages() {
      return {
        selection: 3,
        index: 5,
        biao_hao: 9,
        userId: 8,
        staffName: 8,
        tongxunleibie: 7,
        tongxunzhaungtai: 8,
        time: 10,
        changshang: 7,
        description: 25,
      };
    },
  },
  mounted() {
    // 获取父容器元素
    this.parentContainer = document.querySelector(".commandLog-table");
    // 初始化列宽
    this.calculateColumnWidths();

    // 创建 ResizeObserver 实例并监听父容器宽度变化
    this.resizeObserver = new ResizeObserver(this.calculateColumnWidths);
    if (this.parentContainer) {
      this.resizeObserver.observe(this.parentContainer);
    }
    this.getCommandLogsData();
    // this.getCompanyList();
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
    // 计算列宽的函数
    calculateColumnWidths() {
      if (this.parentContainer) {
        const parentWidth = this.parentContainer.offsetWidth;
        this.selectionWidth = (this.columnPercentages.selection / 100) * parentWidth;
        this.indexWidth = (this.columnPercentages.index / 100) * parentWidth;
        this.biaohaoWidth = (this.columnPercentages.biao_hao / 100) * parentWidth;
        this.userIdWidth = (this.columnPercentages.userId / 100) * parentWidth;
        this.staffNameWidth = (this.columnPercentages.staffName / 100) * parentWidth;
        this.tongxunleibieWidth = (this.columnPercentages.tongxunleibie / 100) * parentWidth;
        this.tongxunzhaungtaiWidth = (this.columnPercentages.tongxunzhaungtai / 100) * parentWidth;
        this.timeWidth = (this.columnPercentages.time / 100) * parentWidth;
        this.changshangWidth = (this.columnPercentages.changshang / 100) * parentWidth;
        this.descriptionWidth = (this.columnPercentages.description / 100) * parentWidth;
      }
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
    formatUserId(userId) {
      if (userId === null || userId === undefined || userId === "") {
        return "";
      }
      const numericUserId = Number(userId);
      if (Number.isNaN(numericUserId)) {
        return userId;
      }
      return numericUserId % 10000000;
    },
    getCommandLogsData() {
      let params = {
        pageNum: this.params.pageNum,
        pageSize: this.params.pageSize,
        commandStatus: this.params.commandStatus,
        commandType: this.params.commandType,
        meterCode: this.params.meterCode,
        meterVendor: this.params.meterVendor,
        sendTimeStartAt: this.params.time ? this.params.time[0] : null,
        sendTimeEndAt: this.params.time ? this.params.time[1] : null,
      };
      console.log(params);
      let token = "";
      const userData = sessionStorage.getItem("userData");
      if (userData) {
        try {
          token = JSON.parse(userData).token;
        } catch (e) {
          console.error("解析userData失败", e);
        }
      }
      const filteredParams = Object.fromEntries(Object.entries(params).filter(([_, value]) => value !== null && value !== ""));
      service
          .post("/command/queryCommandRecord", filteredParams, {
            headers: {
              Authorization: token,
              token: token,
            },
          })
          .then((response) => {
            if (response.code === 200) {
              response.data.records.map((v, i) => {
                v.theId = this.params.pageSize * (response.data.current - 1) + i + 1;
                v.displayUserId = this.formatUserId(v.userId);
                v.displayStaffName = v.sendStaffName || "";
              });
              this.total = response.data.total;
              this.commandLogData = response.data.records;
              this.params.pageNum = response.data.current; // 更新当前页码
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          });
    },
    search() {
      this.getCommandLogsData();
    },
    clear() {
      this.params.commandStatus = null;
      this.params.meterCode = null;
      this.params.commandType = null;
      this.params.time = null;
      this.params.meterVendor = null;
    },
    reflush() {
      this.clear();
      let params = {
        pageNum: 1,
        pageSize: 50,
      };
      service
          .post("/command/queryCommandRecord", params)
          .then((response) => {
            if (response.code === 200) {
              response.data.records.map((v, i) => {
                v.theId = this.params.pageSize * (response.data.current - 1) + i + 1;
                v.displayUserId = this.formatUserId(v.userId);
                v.displayStaffName = v.sendStaffName || "";
              });
              this.total = response.data.total;
              this.params.pageNum = 1;
              this.commandLogData = response.data.records;
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          });
    },
  },
};
</script>

<style scoped>
:deep(.el-date-editor.el-date-editor--daterange.el-input__wrapper.el-range-editor.date-time-picker.el-tooltip__trigger.el-tooltip__trigger) {
  height: 35px !important;
}

/* 方案1：使用 :deep 穿透 scoped，针对当前组件内的时间选择器 */
:deep(.date-time-picker .el-range-editor) {
  height: 35px !important;
  line-height: 35px !important; /* 同步设置行高，避免文字垂直居中异常 */
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

:deep(.el-select .el-select__wrapper) {
  height: 35px;
}

:deep(.el-select) {
  --el-color-primary: #46b97e;
}

:deep(.el-pagination) {
  --el-color-primary: #46b97e;
}

/* 修改分页整体字号（包括“共 x 条”） */
:deep(.el-pagination) {
  font-size: 18px;
}

/* 修改页码数字按钮的大小 */
:deep(.el-pagination .el-pager li) {
  font-size: 16px;
  min-width: 35px; /* 数字变大后，按钮也要相应加宽 */
  height: 35px;
  line-height: 35px;
}

/* 如果有下拉选择每页条数，修改其内部文字 */
:deep(.el-pagination .el-select .el-input) {
  font-size: 16px;
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

:deep(.el-range-separator) {
  height: 35px !important;
}

.log-container {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  width: 100%;
  height: 98%;
  padding: 0px 20px;
}

.search-box {
  margin-top: 15px;
  margin-bottom: 20px;
  width: 100%;
  height: 112px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  background-color: #fff;
}

.search-content {
  display: flex;
  width: 80%;
  height: 100%;
}

.search-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 20%;
  height: 100%;
  margin-right: 20px;
}

.search-input > span {
  font-size: 18px;
  margin-bottom: 5px;
}

.time-input {
  display: flex;
}

.time-input > span {
  font-size: 18px;
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
  margin-left: 50px;
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

.log-info {
  width: 100%;
  height: calc(100% - 150px);
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
  margin-bottom: 10px;
}

.command-box > * {
  margin-right: 20px;
}
.add-btn,
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
  font-size: 20px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
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
  font-size: 20px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
}

.commandLog-table,
.page-box {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.commandLog-table {
  height: calc(98% - 110px);
  width: 98%;
}

.page-box {
  height: 65px;
  position: absolute;
  bottom: 0;
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
