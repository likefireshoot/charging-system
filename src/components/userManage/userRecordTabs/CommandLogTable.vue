<template>
  <div class="command-log-table-container">
    <div class="search-bar">
      <div class="search-input-item fixed-meter">
        <span>表号</span>
        <el-input :model-value="user.meterCode || ''" disabled style="width: 180px" />
      </div>
      <div class="search-input-item">
        <span>通讯类别</span>
        <el-select v-model="filters.commandType" placeholder="全部" clearable style="width: 140px">
          <el-option v-for="item in commandTypeList" :key="item.value" :label="item.label" :value="item.label" />
        </el-select>
      </div>
      <div class="search-input-item">
        <span>通讯状态</span>
        <el-select v-model="filters.commandStatus" placeholder="全部" clearable style="width: 140px">
          <el-option v-for="item in commandStatusList" :key="item.value" :label="item.label" :value="item.label" />
        </el-select>
      </div>
      <div class="search-input-item">
        <span>下发时间</span>
        <el-date-picker
          v-model="filters.time"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 260px"
        />
      </div>
      <div class="search-buttons">
        <div class="search-btn" @click="handleSearch">
          <img src="@/assets/yonghu/icon16.png" alt="" />
          <span>搜索</span>
        </div>
        <div class="clear-btn" @click="handleClear">
          <img src="@/assets/yonghu/icon4.png" alt="" />
          <span>清空</span>
        </div>
      </div>
    </div>

    <div class="tool-bar">
      <div class="refresh-btn" @click="handleRefresh">
        <img src="@/assets/yonghu/icon15.png" alt="" />
      </div>
    </div>

    <div class="table-wrapper">
      <el-table
        :data="list"
        border
        v-loading="loading"
        style="width: 100%"
        :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
        :row-style="{ height: '50px' }"
        height="100%"
      >
        <el-table-column property="theId" label="序号" width="80" align="center" fixed="left" />
        <el-table-column property="displayUserId" label="用户号" min-width="120" align="center" />
        <el-table-column property="meterCode" label="表号" min-width="150" align="center" />
        <el-table-column property="commandType" label="通讯类别" min-width="130" align="center" />
        <el-table-column property="commandStatus" label="通讯状态" min-width="130" align="center" />
        <el-table-column property="createTime" label="通讯下发时间" min-width="180" align="center" />
        <el-table-column property="finishTime" label="通讯完成时间" min-width="180" align="center" />
<!--        <el-table-column property="meterVendor" label="厂商" min-width="120" align="center" />-->
        <el-table-column property="displayStaffName" label="下发员工" min-width="120" align="center" />
        <el-table-column property="description" label="描述" min-width="260" align="center" show-overflow-tooltip />
      </el-table>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        layout="total, prev, pager, next, jumper"
        :page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script>
import { ElMessage } from "element-plus";
import service from "@/api/request";

export default {
  name: "CommandLogTable",
  props: {
    user: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: false,
      isLoading: false,
      list: [],
      total: 0,
      currentPage: 1,
      pageSize: 30,
      filters: {
        commandStatus: null,
        commandType: null,
        time: null
      },
      commandStatusList: [
        { value: 1, label: "等待通讯" },
        { value: 2, label: "成功" },
        { value: 3, label: "失败" }
      ],
      commandTypeList: [
        { value: 1, label: "开启阀门" },
        { value: 2, label: "关闭阀门" },
        { value: 3, label: "修改基数" },
        { value: 4, label: "修改抄表周期" }
      ]
    };
  },
  mounted() {
    this.fetchCommandLogs();
  },
  watch: {
    "user.meterCode"(newValue, oldValue) {
      if (newValue && newValue !== oldValue) {
        this.currentPage = 1;
        this.fetchCommandLogs();
      }
    }
  },
  methods: {
    buildParams() {
      const params = {
        pageNum: this.currentPage,
        pageSize: this.pageSize,
        meterCode: this.user.meterCode,
        commandStatus: this.filters.commandStatus,
        commandType: this.filters.commandType,
        sendTimeStartAt: this.filters.time ? this.filters.time[0] : null,
        sendTimeEndAt: this.filters.time ? this.filters.time[1] : null
      };

      return this.filterNonEmptyParams(params);
    },
    async fetchCommandLogs() {
      if (!this.user.meterCode || this.isLoading) {
        return;
      }

      this.isLoading = true;
      this.loading = true;

      try {
        const response = await service.post("/command/queryCommandRecord", this.buildParams());
        if (response.code === 200) {
          const data = response.data || {};
          const records = data.records || [];
          const current = data.current || this.currentPage;

          this.list = records.map((item, index) => ({
            ...item,
            theId: this.pageSize * (current - 1) + index + 1,
            displayUserId: this.formatUserId(item.userId),
            displayStaffName: item.sendStaffName || "",
            createTime: item.createTime ? item.createTime.replace("T", " ") : "",
            finishTime: item.finishTime ? item.finishTime.replace("T", " ") : ""
          }));
          this.total = data.total || 0;
          this.currentPage = current;
        } else {
          ElMessage.error(response.msg);
        }
      } catch (error) {
        console.error("获取指令通讯记录失败", error);
        ElMessage.error("获取指令通讯记录失败");
      } finally {
        this.loading = false;
        this.isLoading = false;
      }
    },
    handleSearch() {
      this.currentPage = 1;
      this.fetchCommandLogs();
    },
    handleClear() {
      this.filters = {
        commandStatus: null,
        commandType: null,
        time: null
      };
      this.currentPage = 1;
      this.fetchCommandLogs();
    },
    handleRefresh() {
      this.handleClear();
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchCommandLogs();
    },
    filterNonEmptyParams(params) {
      const filteredParams = {};
      for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
          const value = params[key];
          if (value === "" || value === null || value === undefined) {
            continue;
          }
          filteredParams[key] = value;
        }
      }
      return filteredParams;
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
    }
  }
};
</script>

<style scoped>
.command-log-table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 15px;
  flex-wrap: wrap;
  background: #ffffff;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9eef2;
}

.search-input-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input-item > span {
  font-size: 18px;
  color: #606266;
  white-space: nowrap;
}

.fixed-meter :deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f7f8fa;
}

.search-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.search-btn,
.clear-btn,
.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 18px;
}

.search-btn {
  background-color: #46b97e;
  color: #fff;
}

.clear-btn,
.refresh-btn {
  background-color: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
}

.search-btn img,
.clear-btn img,
.refresh-btn img {
  width: 18px;
  height: 18px;
}

.search-btn:hover {
  background-color: #3aa06b;
}

.clear-btn:hover,
.refresh-btn:hover {
  background-color: #f5f7fa;
  border-color: #46b97e;
}

.tool-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.refresh-btn {
  padding: 6px 12px;
}

.table-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.pagination-container :deep(.el-pagination) {
  font-size: 20px;
}

.pagination-container :deep(.el-pagination .btn-prev),
.pagination-container :deep(.el-pagination .btn-next) {
  min-width: 44px;
  height: 44px;
  line-height: 44px;
  font-size: 18px;
}

.pagination-container :deep(.el-pager li) {
  min-width: 44px;
  height: 44px;
  line-height: 44px;
  font-size: 18px;
  margin: 0 4px;
}

.pagination-container :deep(.el-pagination__total) {
  font-size: 18px;
  line-height: 44px;
  margin-right: 20px;
}

.pagination-container :deep(.el-pagination__jump) {
  font-size: 18px;
  line-height: 44px;
  margin-left: 20px;
}

.pagination-container :deep(.el-pagination__jump input) {
  height: 36px;
  line-height: 36px;
}
</style>
