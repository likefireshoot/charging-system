<template>
  <div class="yuangong-container">
    <div class="search-box">
      <div class="search-content">
        <div class="search-input" v-if="companyId === 1">
          <span>所属水厂</span>
          <el-select v-model="params.company" placeholder="请选择所属水厂">
            <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </div>
        <div class="search-input">
          <span>姓名</span>
          <el-input v-model="params.staffName" placeholder="请输入..." />
        </div>
        <div class="search-input" style="width: 320px">
          <span>登录日期</span>
          <el-date-picker
              v-model="timeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              style="width:100%"
          ></el-date-picker>
        </div>
      </div>
      <div class="buttons" >
        <div class="sercah-btn" @click="search">
          <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: 10px" />
          <span style="margin-left: 10%">搜索</span>
        </div>
        <div class="clear-btn" @click="clear">
          <img src="@/assets/yuangong/icon4.png" alt="" style="margin-left: 10px" />
          <span style="margin-left: 10%; color: #5a5a5a">清空</span>
        </div>
      </div>
    </div>
    <div class="yuangong-info">
      <div class="command-box">
        <div class="reflush" @click="reflush">
          <img src="@/assets/yonghu/icon15.png" alt="" />
        </div>
        <div class="security-btn" @click="openLoginSecurity">
          <img src="@/assets/menu/icon32.png" alt="" />
          <span style="margin-left: 6px; color: #5a5a5a">登录方式设置</span>
        </div>
      </div>
      <div class="yuangong-table">
        <el-table
            ref="multipleTableRef"
            :data="employeeData"
            row-key="staffId"
            style="width: auto; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
            border
            :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
            @selection-change="handleSelectionChange"
            id="yuangong-table"
            v-loading="isLoading"
        >
          <el-table-column type="selection" :selectable="selectable" :width="selectionWidth" align="center" />
          <el-table-column label="序号" :width="indexWidth" align="center" fixed="left" #default="scope">
            {{ scope.$index + 1 + (params.pageNo - 1) * params.pageSize }}
          </el-table-column>
          <el-table-column property="account" label="账户" :width="accountWidth" align="center" />
          <el-table-column property="staffName" label="姓名" :width="staffNameWidth" align="center" />
          <el-table-column property="loginIp" label="登录ip" :width="ipWidth" align="center" />
          <el-table-column property="ipAddress" label="ip归属地" :width="addressWidth" align="center" />
          <el-table-column label="登录时间" :width="timeWidth" align="center" #default="scope">
            {{ scope.row.createTime ? scope.row.createTime.replace('T',' ') : '' }}
          </el-table-column>
        </el-table>
      </div>
      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination v-model:current-page="params.pageNo" v-model:page-size="params.pageSize" :page-sizes="[5, 10, 15]" layout="total,  prev, pager, next, jumper" :total="total"
                         @current-change="handlePageChange"/>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="loginSecurityDialogVisible"
      title="登录安全设置"
      width="680px"
      :close-on-click-modal="false"
      :lock-scroll="false"
      append-to-body
      destroy-on-close
    >
      <div class="security-setting-row">
        <span class="security-setting-name">账号密码登录</span>
        <el-select
          v-model="disablePasswordLogin"
          :disabled="loginSecuritySaving"
          @change="onSwitchChange"
          class="security-select"
        >
          <el-option
            v-for="item in loginSecurityOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div class="tip" style="font-size: 15px; color: #ff0202">
        <span>说明：若关闭账号密码登录方式，则仅可使用短信验证登录系统。</span>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import service from "@/api/request";
import { ElMessage } from "element-plus";

export default {
  data() {
    return {
      timeRange: null,
      params: {
        staffName: null,
        company: null,
        companyId: null,
        pageNo: 1,
        pageSize: 50,
        startTime: null,
        endTime: null,
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      companyList: [],
      employeeData: [],
      multipleSelection: [],
      total: null,

      selectionWidth: 0,
      indexWidth: 0,
      accountWidth: 0,
      staffNameWidth: 0,
      ipWidth: 0,
      addressWidth: 0,
      timeWidth: 0,

      parentContainer: null,
      resizeObserver: null,

      isLoading: false,

      loginSecurityDialogVisible: false,
      disablePasswordLogin: false,
      loginSecuritySaving: false,
      loginSecurityOptions: [
        { label: "关闭", value: true },
        { label: "开启", value: false },
      ],
    };
  },
  computed: {
    columnPercentages() {
      return {
        selection: 4,
        index: 7,
        account: 10,
        staff_name: 19,
        ip: 16,
        address: 28,
        time: 16,
      };
    },
  },
  mounted() {
    this.parentContainer = document.querySelector(".yuangong-table");
    this.calculateColumnWidths();
    this.resizeObserver = new ResizeObserver(this.calculateColumnWidths);
    if (this.parentContainer) {
      this.resizeObserver.observe(this.parentContainer);
    }
    this.getCompanyList();
    this.getEmployeeData();
  },
  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  methods: {
    handlePageChange(page) {
      if (this.isLoading) return;
      this.params.pageNo = page;
      this.getEmployeeData();
    },
    selectable() {
      return true;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    calculateColumnWidths() {
      if (!this.parentContainer) return;
      const parentWidth = this.parentContainer.offsetWidth;
      this.selectionWidth = (this.columnPercentages.selection / 100) * parentWidth;
      this.indexWidth = (this.columnPercentages.index / 100) * parentWidth;
      this.accountWidth = (this.columnPercentages.account / 100) * parentWidth;
      this.staffNameWidth = (this.columnPercentages.staff_name / 100) * parentWidth;
      this.ipWidth = (this.columnPercentages.ip / 100) * parentWidth;
      this.addressWidth = (this.columnPercentages.address / 100) * parentWidth;
      this.timeWidth = (this.columnPercentages.time / 100) * parentWidth;
    },
    getCompanyList() {
      service
          .get("/getAllCompany")
          .then((response) => {
            if (response.code === 200) {
              this.companyList = response.data.map((item) => ({
                id: item.companyId,
                name: item.companyName,
              }));
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            console.error(error);
          });
    },
    getEmployeeData() {
      if (this.isLoading) return;
      this.isLoading = true;
      if (this.companyId === 1) {
        this.params.companyId = this.params.company || null;
      } else {
        this.params.companyId = this.companyId;
      }
      let token = "";
      const userData = sessionStorage.getItem("userData");
      if (userData) {
        try {
          token = JSON.parse(userData).token;
        } catch (e) {
          console.error("解析userData失败", e);
        }
      }
      service
          .post("/log/queryLoginLogs", this.params, {
            headers: {
              Authorization: token,
              token: token,
            },
          })
          .then((response) => {
            if (response.code === 200) {
              this.total = response.data.total;
              this.employeeData = response.data.records;
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          })
          .finally(() => {
            this.isLoading = false;
          });
    },
    search() {
      if (this.timeRange && this.timeRange.length === 2) {
        this.params.startTime = this.timeRange[0] + ' 00:00:00'
        this.params.endTime = this.timeRange[1] + ' 23:59:59'
      } else {
        this.params.startTime = null
        this.params.endTime = null
      }
      this.getEmployeeData();
    },
    clear(isSearch) {
      this.params.staffName = null;
      this.params.company = null;
      this.params.companyId = null;
      this.params.startTime = null;
      this.params.endTime = null;
      this.timeRange = null;
      if (typeof isSearch != 'number' || isNaN(isSearch)) {
        this.params.pageNo = 1;
        this.getEmployeeData();
      }
    },
    reflush() {
      this.params.pageNo = 1;
      this.search();
    },
    openLoginSecurity() {
      this.loginSecurityDialogVisible = true;
      this.getLoginSetting();
    },
    getLoginSetting() {
      service
        .get("/staff/loginSetting")
        .then((res) => {
          if (res.code === 200) {
            this.disablePasswordLogin = !!res.data.disablePasswordLogin;
          } else {
            ElMessage.error(res.msg || "获取登录安全设置失败");
          }
        })
        .catch((err) => {
          console.error("获取登录安全设置失败：", err);
        });
    },
    onSwitchChange(val) {
      this.loginSecuritySaving = true;
      service
        .post("/staff/loginSetting", { disablePasswordLogin: val })
        .then((res) => {
          if (res.code === 200) {
            ElMessage.success("设置已保存");
            this.disablePasswordLogin = val;
          } else {
            ElMessage.error(res.msg || "保存失败");
            this.disablePasswordLogin = !val;
          }
        })
        .catch((err) => {
          console.error("保存失败：", err);
          this.disablePasswordLogin = !val;
        })
        .finally(() => {
          this.loginSecuritySaving = false;
        });
    },
  },
};
</script>

<style scoped>
:deep(.el-table__body tr:nth-child(odd)) {
  background-color: #edf8f2;
}

:deep(.el-table__body tr:nth-child(even)) {
  background-color: #ffffff;
}

:deep(.el-table__body tr:hover > td) {
  background-color: #fbf2cb !important;
}

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
  font-size: 16px;
}

:deep(.el-pagination .el-pager li) {
  font-size: 16px;
  min-width: 35px;
  height: 35px;
  line-height: 35px;
}

.yuangong-container {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  min-width: 94%;
  height: 100%;
  padding: 0px 15px;
}

.search-box {
  margin-top: 5px;
  margin-bottom: 10px;
  width: 99.3%;
  height: 98px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  background-color: #fff;
}

.search-content {
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  width: 80%;
  min-height: 100%;
}

.search-input {
  display: flex;
  flex-direction: column;
  width: 15%;
  margin-right: 10px;
  height: 100%;
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
  width: 220px;
  height: 100%;
  align-items: center;
  position: absolute;
  right: 10px;
  margin-left: 0;
}

.buttons > * {
  width: 100px;
  margin-right: 10px;
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
  font-size: 18px;
}

.sercah-btn {
  background-color: #45ba7e;
}

.clear-btn {
  background-color: #fff;
  border: 2px solid #f2f2f2;
  margin-right: 10px;
}

.yuangong-info {
  width: 99.3%;
  height: calc(100% - 120px);
  margin-bottom: 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  background-color: #fff;
  position: relative;
  padding: 0 10px;
}

.command-box {
  display: flex;
  align-items: center;
  width: 100%;
  height: auto;
  margin-top: 10px;
}

.command-box > * {
  margin-right: 10px;
}

.reflush {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 20px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
}

.security-btn {
  display: flex;
  align-items: center;
  width: auto;
  height: 35px;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 18px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
  padding: 0 8px;
}

.security-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
}

.security-setting-name {
  font-size: 18px;
  color: #333;
  font-weight: bold;
}

.security-select {
  width: 160px;
}

.yuangong-table,
.page-box {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.yuangong-table {
  height: calc(100% - 100px);
  margin-top: 8px;
}

.page-box {
  height: 40px;
  position: absolute;
  bottom: 0;
}
</style>

<style>
html {
  overflow-y: scroll;
}
</style>

<style scoped>
:deep(.el-input__inner) {
  font-size: 16px !important;
}

:deep(.el-select__wrapper .el-select__placeholder) {
  font-size: 16px !important;
}

:deep(.el-select__wrapper .el-select__selected-item) {
  font-size: 16px !important;
}
</style>