<template>
  <div class="log-container">
    <div class="search-box">
      <div class="search-content">
        <div class="search-input" style="margin-left: 10px; width: 30%">
          <span>操作类别</span>
          <el-select v-model="params.queryType" placeholder="请选择">
            <el-option v-for="item in operateType" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </div>
        <!-- <div class="search-input" style="margin-left: 10px">
          <span>用户号</span>
          <el-input v-model="params.userNum" placeholder="请输入..." />
        </div> -->
        <div class="search-input" style="margin-left: 10px">
          <span>用户名称</span>
          <el-input v-model="params.userName" placeholder="请输入..." />
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>表号</span>
          <el-input v-model="params.meterCode" placeholder="请输入..." />
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>员工名称</span>
          <el-input v-model="params.operatorName" placeholder="请输入..." />
        </div>
      </div>
      <div class="buttons">
        <div class="sercah-btn" @click="search">
          <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 15%">搜索</span>
        </div>
        <div class="clear-btn" @click="clear">
          <img src="@/assets/rizhi/icon4.png" alt="" style="margin-left: 10px" />
          <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">清空</span>
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
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">导出</span>
        </div>
        <div class="reflush" style="margin-left: 10px" @click="reflush">
          <img src="@/assets/yonghu/icon15.png" alt="" />
        </div>
      </div>
      <div class="log-table">
        <el-table
          ref="multipleTableRef"
          :data="logData"
          row-key="index"
          style="width: auto; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
          border
          :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
          @selection-change="handleSelectionChange"
          id="log-table"
        >
          <el-table-column type="selection" :selectable="selectable" :width="selectionWidth" align="center" />
          <el-table-column property="index" label="序号" :width="indexWidth" align="center" />
          <el-table-column property="operatorName" label="员工名称" :width="workerNameWidth" align="center" />
          <el-table-column property="operationName" label="操作类别" :width="operateTypeWidth" align="center" />
          <el-table-column property="reportTime" label="操作时间" :width="operateTimeWidth" align="center" />
          <!-- <el-table-column property="userNum" label="用户号" :width="userNumWidth" align="center" /> -->
          <el-table-column property="userName" label="用户名称" :width="userNameWidth" align="center" />
          <el-table-column property="waterMeterUuid" label="表号" :width="biaohaoWidth" align="center" />
          <el-table-column property="imei" label="IMEI号" :width="imeiWidth" align="center" />
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
        queryType: null,
        operationBelong: 1,
        userName: null,
        meterCode: null,
        operatorName: null,
        optUser: null,
      },
      operateType: [],
      logData: [],
      multipleSelection: null,

      total: 100,
      belong: 1, //抄表系统

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
        this.getLogsDataByPage();
      },
    },
  },
  computed: {
    // 每列的百分比宽度
    columnPercentages() {
      return {
        selection: 5,
        index: 6,
        worker_name: 10,
        operate_type: 13,
        operate_time: 18,
        // user_num: 10,
        user_name: 10,
        biao_hao: 12,
        imei: 14,
        operate_content: 12,
      };
      // return {
      //   selection: 5,
      //   index: 6,
      //   worker_name: 12,
      //   operate_type: 15,
      //   operate_time: 20,
      //   user_name: 12,
      //   imei: 16,
      //   operate_content: 12,
      // };
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
        this.operateContentWidth = (this.columnPercentages.operate_content / 100) * parentWidth;
      }
    },
    getLogOptType() {
      service
        .get("/getAllLogOptType")
        .then((response) => {
          if (response.code === 200) {
            this.operateType = response.data.map((item) => {
              return {
                value: item,
                label: item,
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
    getLogsData() {
      this.params.optUser = JSON.parse(sessionStorage.getItem("userData")).username;
      //this.params.optUser = "123";
      const filteredParams = Object.fromEntries(Object.entries(this.params).filter(([_, value]) => value !== null && value !== ""));
      service
        .post("/queryLogs", filteredParams)
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
    search() {
      this.getLogsData();
    },
    clear() {
      this.params.queryType = null;
      this.params.userName = null;
      this.params.meterCode = null;
      this.params.operatorName = null;
    },
    reflush() {
      const params = {
        pageNo: 1,
        pageSize: 50,
        optUser: JSON.parse(sessionStorage.getItem("userData")).username,
        operationBelong: 2,
      };
      service
        .post("/queryLogs", params)
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
      const params = {
        pageNo: this.params.pageNo,
        pageSize: 50,
        optUser: JSON.parse(sessionStorage.getItem("userData")).username,
        operationBelong: 2,
      };
      service
        .post("/queryLogs", params)
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
      console.log(this.params);
      // 调用后端接口
      axios({
        url: `/exportLogsReport?belong=${this.belong}`, // 后端接口地址
        method: "POST",
        responseType: "blob", // 指定响应类型为二进制流
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error("导出失败: " + response.statusText);
          }

          // 获取 Blob 对象
          const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

          if (blob.size === 0) {
            alert("内容为空，无法下载");
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
  font-size: 14px;
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
  font-size: 14px;
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
