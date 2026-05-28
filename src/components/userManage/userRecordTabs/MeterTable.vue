<template>
  <div class="meter-table-container">
    <div class="search-bar">
      <div class="search-input-item">
        <span>时间</span>
        <div class="time-input">
          <el-select v-model="meterData.timeType" placeholder="请选择" style="width: 100px; font-size: 18px;">
            <el-option label="年" value="year" />
            <el-option label="月" value="month" />
            <el-option label="日" value="day" />
          </el-select>
          <el-date-picker
            v-if="meterData.timeType === 'year'"
            v-model="meterData.accurateTime"
            type="year"
            placeholder="选择年份"
            value-format="YYYY"
            style="width: 180px; font-size: 18px;"
          />
          <el-date-picker
            v-else-if="meterData.timeType === 'month'"
            v-model="meterData.accurateTime"
            type="month"
            placeholder="选择月份"
            value-format="YYYY-MM"
            style="width: 180px; font-size: 18px;"
          />
          <el-date-picker
            v-else
            v-model="meterData.accurateTime"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 200px; font-size: 18px;"
          />
        </div>
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
      <div class="tool-btn" @click="downloadTemplate" v-if="staffPermissionIds.includes(16)">
        <img src="@/assets/yonghu/icon1.png" alt="" />
        <span>历史数据导⼊模版下载</span>
      </div>
      <div class="tool-btn" @click="triggerFileInput" v-if="staffPermissionIds.includes(16)">
        <img src="@/assets/yonghu/icon1.png" alt="" />
        <span>历史数据导⼊</span>
        <input ref="fileInput" type="file" accept=".xls,.xlsx" style="display: none" @change="handleImport" />
      </div>
      <div class="tool-btn" @click="exportExcel">
        <img src="@/assets/yonghu/icon1.3.png" alt="" />
        <span>导出</span>
      </div>
      <div class="refresh-btn" @click="handleRefresh">
        <img src="@/assets/yonghu/icon15.png" alt="" />
      </div>
    </div>

    <div class="table-wrapper">
      <el-table
        ref="multipleTableRef"
        :data="list"
        border
        v-loading="loading"
        style="width: 100%"
        :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
        :row-style="{ height: '50px' }"
        height="100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" fixed="left" />
        <el-table-column property="userId" label="用户号" min-width="120" align="center" fixed="left" />
        <el-table-column property="userName" label="用户名称" min-width="140" align="center" />
        <el-table-column label="表号" min-width="190" align="center">
          <template #default="scope">
            <div class="meter-code-cell">
              <span class="meter-code-text">{{ scope.row.meterCode || "-" }}</span>
              <!-- 已改为按表号切换查询，不再需要区分当前表/历史表 -->
              <!-- <span :class="['meter-status', isCurrentMeter(scope.row) ? 'current' : 'history']">
                {{ isCurrentMeter(scope.row) ? "当前表" : "历史表" }}
              </span> -->
            </div>
          </template>
        </el-table-column>
        <el-table-column property="readingCount" label="水表读数/吨" min-width="160" align="center" />
        <el-table-column property="deltaWater" label="本次用水量/吨" min-width="160" align="center" />
        <el-table-column property="feeThisTime" label="本次扣费/元" min-width="160" align="center" />
        <el-table-column property="balanceThisTime" label="本次余额/元" min-width="160" align="center" />
        <el-table-column property="valveStatus" label="阀门状态" min-width="160" align="center" />
        <el-table-column property="createTime" label="抄表时间" min-width="180" align="center" />
<!--        <el-table-column property="userPhone" label="手机号" min-width="180" align="center" />-->
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
import axios from "axios";

export default {
  name: "MeterTable",
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
      multipleSelection: [],
      total: 0,
      currentPage: 1,
      pageSize: 30,
      staffPermissionIds: JSON.parse(sessionStorage.getItem("userData") || "{}").staffPermissionIds || [],
      token: JSON.parse(sessionStorage.getItem("userData") || "{}").token || "",
      meterData: {
        timeType: "",
        accurateTime: ""
      }
    };
  },
  mounted() {
    this.fetchMeterRecords();
  },
  watch: {
    "user.userId"(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.currentPage = 1;
        this.fetchMeterRecords();
      }
    },
    "user.meterCode"(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.currentPage = 1;
        this.fetchMeterRecords();
      }
    }
  },
  methods: {
    isCurrentMeter(row) {
      return String(row?.meterCode ?? "") === String(this.user?.meterCode ?? "");
    },
    buildBaseParams() {
      return {
        userId: this.user.userId,
        meterCode: this.user.meterCode,
        companyId: this.user.companyId
      };
    },
    buildSearchParams() {
      const params = { ...this.buildBaseParams() };

      if (this.meterData.accurateTime && this.meterData.timeType) {
        let formattedTime = "";
        let timeTypeValue = null;

        switch (this.meterData.timeType) {
          case "year":
            formattedTime = `${this.meterData.accurateTime}-01-01 00:00:00`;
            timeTypeValue = 1;
            break;
          case "month":
            formattedTime = `${this.meterData.accurateTime}-01 00:00:00`;
            timeTypeValue = 2;
            break;
          case "day":
            formattedTime = `${this.meterData.accurateTime} 00:00:00`;
            timeTypeValue = 3;
            break;
        }

        if (timeTypeValue) {
          params.timeType = timeTypeValue;
          params.createTime = formattedTime;
        }
      }

      return this.filterNonEmptyParams(params);
    },
    buildQueryString(params) {
      let queryString = "";
      for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
          const value = params[key];
          if (queryString) {
            queryString += `&${key}=${encodeURIComponent(value)}`;
          } else {
            queryString += `?${key}=${encodeURIComponent(value)}`;
          }
        }
      }
      return queryString;
    },
    async fetchMeterRecords() {
      if (!this.user.userId || !this.user.meterCode || this.isLoading) return;

      this.isLoading = true;
      this.loading = true;

      try {
        const params = this.buildBaseParams();
        const queryString = this.buildQueryString(params);
        const url = `/userManage/meterRead/showReadMeterRecords/${this.currentPage}${queryString}`;
        const response = await service.get(url);

        if (response.code === 200) {
          const records = response.data.userInfoData || [];
          records.forEach((item, index) => {
            item.theId = this.pageSize * (response.data.currentPages - 1) + index + 1;
          });

          this.list = records.map(item => ({
            ...item,
            createTime: item.createTime ? item.createTime.replace("T", " ") : ""
          }));

          this.total = response.data.totalElements || 0;
        } else {
          ElMessage.error(response.msg);
        }
      } catch (error) {
        console.error("获取抄表记录失败", error);
        ElMessage.error("获取抄表记录失败");
      } finally {
        this.loading = false;
        this.isLoading = false;
      }
    },
    async fetchWithSearch() {
      if (this.isLoading) return;

      this.isLoading = true;
      this.loading = true;

      try {
        const params = this.buildSearchParams();
        const queryString = this.buildQueryString(params);
        const url = `/userManage/meterRead/showReadMeterRecords/${this.currentPage}${queryString}`;
        const response = await service.get(url);

        if (response.code === 200) {
          const records = response.data.userInfoData || [];
          records.forEach((item, index) => {
            item.theId = this.pageSize * (response.data.currentPages - 1) + index + 1;
          });

          this.list = records.map(item => ({
            ...item,
            createTime: item.createTime ? item.createTime.replace("T", " ") : ""
          }));

          this.total = response.data.totalElements || 0;
        } else {
          ElMessage.error(response.msg);
        }
      } catch (error) {
        console.error("搜索抄表记录失败", error);
        ElMessage.error("搜索抄表记录失败");
      } finally {
        this.loading = false;
        this.isLoading = false;
      }
    },
    handleSearch() {
      if (!this.meterData.accurateTime && this.meterData.timeType) {
        ElMessage.warning("请选择时间");
        return;
      }
      this.currentPage = 1;
      this.fetchWithSearch();
    },
    handleClear() {
      this.meterData.timeType = "";
      this.meterData.accurateTime = "";
      this.currentPage = 1;
      this.fetchMeterRecords();
    },
    handleRefresh() {
      this.handleClear();
    },
    handlePageChange(page) {
      this.currentPage = page;
      if (this.meterData.accurateTime && this.meterData.timeType) {
        this.fetchWithSearch();
      } else {
        this.fetchMeterRecords();
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
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
    triggerFileInput() {
      this.$refs.fileInput.value = "";
      this.$refs.fileInput.click();
    },
    async handleImport() {
      const fileInput = this.$refs.fileInput;
      const file = fileInput.files[0];

      if (!file) {
        ElMessage.warning("请选择要上传的文件");
        return;
      }

      const allowedTypes = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
      if (!allowedTypes.includes(file.type)) {
        ElMessage.warning("仅支持上传 .xls 或 .xlsx 文件");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("companyId", this.user.companyId);

      try {
        const response = await service.post("/userManage/userCharge/importMeterReportRecord", formData, { responseType: "blob" });
        const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

        if (blob.size === 0) {
          ElMessage.success("导入成功");
          fileInput.value = "";
          this.handleRefresh();
          return;
        }

        ElMessage.warning("部分数据导入失败，等待下载失败列表");
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = "抄表记录导入数据失败列表.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
        fileInput.value = "";
        this.handleRefresh();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "未知错误";
        ElMessage.error("导入失败: " + errorMessage);
        console.error("上传失败:", error);
      }
    },
    downloadTemplate() {
      axios({
        url: "/userManage/userCharge/importMeterReportRecordTemplate",
        method: "GET",
        responseType: "blob",
        headers: {
          Authorization: this.token
        }
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error("下载失败: " + response.statusText);
          }

          const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = "历史数据导⼊模版下载.xlsx";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(link.href);
        })
        .catch((error) => {
          console.error("下载失败:", error);
          ElMessage.error("下载失败: " + error.message);
        });
    },
    async exportExcel() {
      try {
        const params = this.buildSearchParams();
        const response = await axios({
          url: "/userManage/meterRead/exportMeterReportRecord",
          method: "GET",
          responseType: "blob",
          params: params
        });

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
        link.download = `${this.user.userName || "用户"}_抄表数据记录.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
        ElMessage.success("导出成功");
      } catch (error) {
        console.error("导出失败:", error);
        ElMessage.error("导出失败: " + error.message);
      }
    }
  }
};
</script>

<style scoped>
.meter-table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 20px;
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

.time-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-input :deep(.el-input__inner) {
  font-size: 18px;
  height: 40px;
  line-height: 40px;
}

.time-input :deep(.el-date-editor .el-input__inner) {
  font-size: 18px;
}

.time-input :deep(.el-select-dropdown__item) {
  font-size: 18px;
}

.time-input :deep(.el-date-table td) {
  font-size: 18px;
}

.time-input :deep(.el-date-table td span) {
  font-size: 18px;
}

.time-input :deep(.el-month-table td .cell) {
  font-size: 18px;
}

.time-input :deep(.el-year-table td .cell) {
  font-size: 18px;
}

.search-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.search-btn, .clear-btn {
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
  background-color: #46B97E;
  color: #fff;
}

.search-btn img {
  width: 18px;
  height: 18px;
}

.clear-btn {
  background-color: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
}

.clear-btn img {
  width: 18px;
  height: 18px;
}

.search-btn:hover {
  background-color: #3aa06b;
}

.clear-btn:hover {
  background-color: #f5f7fa;
}

.tool-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.tool-btn, .refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
  font-size: 18px;
  color: #606266;
}

.tool-btn img, .refresh-btn img {
  width: 18px;
  height: 18px;
}

.tool-btn:hover, .refresh-btn:hover {
  background-color: #f5f7fa;
  border-color: #46B97E;
}

.refresh-btn {
  padding: 6px 12px;
}

.meter-code-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  max-width: 100%;
}

.meter-code-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meter-status {
  flex-shrink: 0;
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 20px;
  border: 1px solid transparent;
  white-space: nowrap;
}

.meter-status.current {
  color: #2f9e63;
  background-color: #eef9f2;
  border-color: #bfe8d1;
}

.meter-status.history {
  color: #8a8f99;
  background-color: #f3f4f6;
  border-color: #dcdfe6;
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
