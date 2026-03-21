<template>
  <div class="log-container">
    <div class="search-box">
      <div class="search-content">
        <!-- 当companyId为1时，代表是荆州的水厂，所以能查询company -->
        <div class="search-input" style="margin-left: 10px" v-if="companyId === 1">
          <span>所属水厂</span>
          <el-select v-model="params.company" placeholder="请选择所属水厂">
            <el-option v-for="item in companyList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>操作类别</span>
          <el-select v-model="params.operationId" placeholder="请选择">
            <el-option v-for="item in operateType" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </div>
        <!-- <div class="search-input" style="margin-left: 10px">
          <span>用户号</span>
          <el-input v-model="params.userNum" placeholder="请输入..." />
        </div> -->
        <div class="search-input" style="margin-left: 10px">
          <span>员工名称</span>
          <el-input v-model="params.staffName" placeholder="请输入..." />
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>用户号</span>
          <el-input v-model="params.userId" placeholder="请输入..." />
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>用户名称</span>
          <el-input v-model="params.userName" placeholder="请输入..." />
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>表号</span>
          <el-input v-model="params.meterCode" placeholder="请输入..." />
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
        <!-- <div class="export-in-btn" style="margin-left: 10px">
          <img src="@/assets/rizhi/icon1.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">导入</span>
          <input ref="fileInput" type="file" accept=".xls,.xlsx" style="display: none" />
        </div> -->
        <div class="export-out-btn" style="margin-left: 10px" @click="exportExcel">
          <img src="@/assets/rizhi/icon2.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">导出</span>
        </div>
        <div class="reflush" style="margin-left: 10px" @click="reflush">
          <img src="@/assets/yonghu/icon15.png" alt="" />
        </div>
      </div>
      <div class="log-table">
        <el-table
          ref="multipleTableRef"
          :data="logData"
          row-key="logId"
          style="width: auto; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
          border
          :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
          @selection-change="handleSelectionChange"
          id="log-table"
        >
          <el-table-column type="selection" :selectable="selectable" :width="selectionWidth" align="center" />
          <el-table-column label="序号" :width="indexWidth" align="center" #default="scope">
            {{ scope.$index + 1 + (params.pageNo - 1) * params.pageSize }}
          </el-table-column>
          <el-table-column property="staffName" label="员工名称" :width="workerNameWidth" align="center" />
          <el-table-column property="userId" label="用户号" :width="userNameWidth" align="center" />
          <el-table-column property="userName" label="用户名称" :width="userNameWidth" align="center" />
          <el-table-column property="meterCode" label="表号" :width="biaohaoWidth" align="center" />
          <el-table-column property="imei" label="IMEI号" :width="imeiWidth" align="center" />
          <el-table-column property="companyName" label="所属水厂" :width="companyWidth" align="center" />
          <el-table-column property="operationName" label="操作类别" :width="operateTypeWidth" align="center" />
          <el-table-column property="createTime" label="操作时间" :width="operateTimeWidth" align="center" />
          <el-table-column property="operationContent" label="操作内容" :width="operateContentWidth" align="center" />
        </el-table>
      </div>
      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination v-model:current-page="params.pageNo" v-model:page-size="params.pageSize" :page-sizes="[5, 10, 15]" layout="total,  prev, pager, next, jumper" :total="total" />
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
        pageNo: 1,
        pageSize: 50,
        userName: null,
        meterCode: null,
        operationId: null, // 操作类别ID
        staffName: null, // 员工名称
        operationBelong: 2,
        company: null, // 所属水厂
        userId: null, // 用户号
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId, // 所属水厂ID
      companyList: [],
      operateType: [],
      logData: [],
      multipleSelection: null,

      total: 100,
      belong: 2, //收费系统

      // 每列实际宽度
      selectionWidth: 0,
      indexWidth: 0,
      workerNameWidth: 0,
      operateTypeWidth: 0,
      operateTimeWidth: 0,
      userNumWidth: 0,
      userNameWidth: 0,
      biaohaoWidth: 0,
      imeiWidth: 0,
      operateContentWidth: 0,
      companyWidth: 0,

      // 父容器元素
      parentContainer: null,
      // ResizeObserver 实例
      resizeObserver: null,

      //表格勾选行
      selection: [],
    };
  },
  watch: {
    "params.pageNo": {
      handler() {
        this.getLogsData();
      },
    },
  },
  computed: {
    // 每列的百分比宽度
    columnPercentages() {
      return {
        selection: 3,
        index: 4,
        worker_name: 6,
        operate_type: 9,
        operate_time: 12,
        user_name: 6,
        biao_hao: 10,
        imei: 12,
        operate_content: 22,
        company: 9,
      };
    },
  },
  mounted() {
    // 获取父容器元素
    this.parentContainer = document.querySelector(".log-table");
    // 初始化列宽
    this.calculateColumnWidths();

    // 创建 ResizeObserver 实例并监听父容器宽度变化
    this.resizeObserver = new ResizeObserver(this.calculateColumnWidths);
    if (this.parentContainer) {
      this.resizeObserver.observe(this.parentContainer);
    }
    this.getLogsData();
    this.getLogOptType();
    this.getCompanyList();
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
    edit_click() {
      if (this.multipleSelection.length > 0) {
        this.edit_dialogFormVisible = true;
      }
    },
    // 计算列宽的函数
    calculateColumnWidths() {
      if (this.parentContainer) {
        const parentWidth = this.parentContainer.offsetWidth;
        this.selectionWidth = (this.columnPercentages.selection / 100) * parentWidth;
        this.indexWidth = (this.columnPercentages.index / 100) * parentWidth;
        this.workerNameWidth = (this.columnPercentages.worker_name / 100) * parentWidth;
        this.operateTypeWidth = (this.columnPercentages.operate_type / 100) * parentWidth;
        this.operateTimeWidth = (this.columnPercentages.operate_time / 100) * parentWidth;
        // this.userNumWidth = (this.columnPercentages.user_num / 100) * parentWidth;
        this.userNameWidth = (this.columnPercentages.user_name / 100) * parentWidth;
        this.biaohaoWidth = (this.columnPercentages.biao_hao / 100) * parentWidth;
        this.imeiWidth = (this.columnPercentages.imei / 100) * parentWidth;
        this.companyWidth = (this.columnPercentages.company / 100) * parentWidth;
        this.operateContentWidth = (this.columnPercentages.operate_content / 100) * parentWidth;
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
    getLogOptType() {
      // 从sessionStorage获取token
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
        .get("/log/getAllLogOptType", {
          headers: {
            Authorization: token,
            token: token,
          },
        })
        .then((response) => {
          if (response.code === 200) {
            this.operateType = response.data
              .map((item) => {
                return {
                  value: item.operationId,
                  label: item.operationName,
                  operationBelong: item.operationBelong,
                };
              })
              .filter((item) => item.operationBelong !== 1);
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    getLogsData() {
      let params = {
        pageNo: this.params.pageNo,
        pageSize: this.params.pageSize,
        userName: this.params.userName,
        meterCode: this.params.meterCode,
        operationId: this.params.operationId,
        staffName: this.params.staffName,
        // companyId: this.params.company ? this.params.company : this.companyId, // 所属水厂ID
        operationBelong: this.params.operationBelong,
        userId: this.params.userId, // 用户号
      };
      if (this.companyId === 1) {
        if (this.params.company) {
          params.companyId = this.params.company; // 所属水厂ID
        }
      } else {
        params.companyId = this.companyId; // 所属水厂ID
      }
      console.log(params);
      //this.params.optUser = "123";
      // 从sessionStorage获取token
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
        .post("/log/queryLogs", filteredParams, {
          headers: {
            Authorization: token,
            token: token,
          },
        })
        .then((response) => {
          if (response.code === 200) {
            this.total = response.data.total;
            this.logData = response.data.records;
            this.params.pageNo = response.data.current; // 更新当前页码
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    search() {
      this.getLogsData();
    },
    clear(isSearch) {
      this.params.operationId = null;
      this.params.userName = null;
      this.params.meterCode = null;
      this.params.staffName = null;
      this.params.company = null; // 清空所属水厂
      this.params.userId = null; // 清空用户号
      if (typeof isSearch != 'number' || isNaN(isSearch)) {
        this.params.pageNo = 1;
        this.getLogsData();
      }
    },
    reflush() {
      this.clear(1);
      let params = {
        pageNo: 1,
        pageSize: 50,
        operationBelong: 2,
      };
      if (this.companyId === 1) {
        if (this.params.company) {
          params.companyId = this.params.company; // 所属水厂ID
        }
      } else {
        params.companyId = this.companyId; // 所属水厂ID
      }
      service
        .post("/log/queryLogs", params)
        .then((response) => {
          if (response.code === 200) {
            this.total = response.data.total;
            this.params.pageNo = 1;
            this.logData = response.data.records;
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    getLogsDataByPage() {
      let params = {
        pageNo: this.params.pageNo,
        pageSize: 50,
        operationBelong: 2,
      };
      if (this.companyId === 1) {
        if (this.params.company) {
          params.companyId = this.params.company; // 所属水厂ID
        }
      } else {
        params.companyId = this.companyId; // 所属水厂ID
      }
      service
        .post("/log/queryLogs", params)
        .then((response) => {
          if (response.code === 200) {
            this.total = response.data.total;
            this.logData = response.data.records;
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    exportExcel() {
      const exportParams = {
        ...this.params,
        companyId: this.companyId === 1 ? this.params.company || null : this.companyId,
        belong: this.belong,
      };
      delete exportParams.company;
      delete exportParams.pageNo;
      delete exportParams.pageSize;
      delete exportParams.operationBelong;
      const requestParams = Object.fromEntries(Object.entries(exportParams).filter(([_, value]) => value !== null && value !== ""));
      axios({
        url: "/log/exportLogsReport",
        method: "POST",
        responseType: "blob",
        data: requestParams,
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error("导出失败: " + response.statusText);
          }

          const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

          if (blob.size === 0) {
            ElMessage.warning("内容为空，无法下载");
            return;
          }

          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = "日志数据列表.xlsx";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(link.href);
        })
        .catch((error) => {
          console.error("导出失败:", error);
          ElMessage.error("导出失败: " + error.message);
        });
      return;
      let url = "";
      let params = {};

      if (this.companyId === 1) {
        if (this.params.company) {
          params.companyId = this.params.company; // 所属水厂ID
          url = `/log/exportLogsReport?belong=${this.belong}&companyId=${params.companyId}`; // 后端接口地址
        } else {
          url = `/log/exportLogsReport?belong=${this.belong}`; // 后端接口地址
        }
      } else {
        params.companyId = this.companyId; // 所属水厂ID
        url = `/log/exportLogsReport?belong=${this.belong}&companyId=${params.companyId}`;
      }
      //const companyId = this.params.company ? this.params.company : this.companyId; // 获取所属水厂ID
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
          link.download = "日志数据列表.xlsx"; // 设置下载文件名
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
  font-size: 16px;
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
  justify-content:  space-around; /* 每个元素两侧的间隔相等 */
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
  width: 90px; /* 设置按钮的宽度 */
  height: 35px; /* 设置按钮的高度 */
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

.log-table,
.page-box {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.log-table {
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
