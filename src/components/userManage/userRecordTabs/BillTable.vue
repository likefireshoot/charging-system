<template>
  <div class="bill-table-container">
    <div class="search-bar">
      <!-- 扣费类型筛选 - 暂时注释
      <div class="search-input-item">
        <span>扣费类型</span>
        <el-select v-model="searchParams.chargeType" placeholder="全部" clearable style="width: 120px">
          <el-option label="全部" value="" />
          <el-option label="抄表扣费" value="0" />
          <el-option label="保底扣费" value="1" />
          <el-option label="补扣费用" value="2" />
        </el-select>
      </div>
      -->
      <div class="search-input-item">
        <span style="margin-right: 20px">时间</span>
        <div class="time-input">
          <el-select v-model="searchParams.timeType" placeholder="请选择" style="width: 100px; font-size: 18px;">
            <el-option label="年" value="year" />
            <el-option label="月" value="month" />
            <el-option label="日" value="day" />
          </el-select>
          <el-date-picker
            v-if="searchParams.timeType === 'year'"
            v-model="searchParams.createTime"
            type="year"
            placeholder="选择年份"
            value-format="YYYY"
            style="width: 180px; font-size: 18px;"
          />
          <el-date-picker
            v-else-if="searchParams.timeType === 'month'"
            v-model="searchParams.createTime"
            type="month"
            placeholder="选择月份"
            value-format="YYYY-MM"
            style="width: 180px; font-size: 18px;"
          />
          <el-date-picker
            v-else
            v-model="searchParams.createTime"
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
      <div class="export-btn" @click="exportExcel">
        <img src="@/assets/yonghu/icon1.3.png" alt="" />
        <span>导出</span>
      </div>
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
        <el-table-column type="selection" width="50" align="center" fixed="left" />
        <el-table-column property="userId" label="用户号" min-width="120" align="center" />
        <el-table-column property="userName" label="用户名称" min-width="140" align="center" />
        <el-table-column property="meterCode" label="表号" min-width="160" align="center" />
        <el-table-column property="chargeAmount" label="扣费金额" min-width="110" align="center">
          <template #default="scope">{{ scope.row.chargeAmount }} 元</template>
        </el-table-column>
        <el-table-column property="oldBalance" label="原金额" min-width="110" align="center">
          <template #default="scope">{{ scope.row.oldBalance }} 元</template>
        </el-table-column>
        <el-table-column property="newBalance" label="余额" min-width="110" align="center">
          <template #default="scope">{{ scope.row.newBalance }} 元</template>
        </el-table-column>
        <el-table-column property="createTime" label="扣费时间" min-width="180" align="center" />
        <el-table-column label="扣费类型" min-width="120" align="center">
          <template #default="scope">
            <span>{{ formatChargeType(scope.row.type) }}</span>
          </template>
        </el-table-column>
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
  name: "BillTable",
  props: {
    user: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  emits: ["update-total-money"],
  data() {
    return {
      loading: false,
      isLoading: false,
      list: [],
      total: 0,
      currentPage: 1,
      pageSize: 30,
      searchParams: {
        // chargeType: "", // 扣费类型 - 暂时注释
        timeType: "day",
        createTime: ""
      }
    };
  },
  mounted() {
    this.fetchBillRecords();
  },
  watch: {
    "user.userId"(newValue, oldValue) {
      if (newValue && newValue !== oldValue) {
        this.currentPage = 1;
        this.fetchBillRecords();
      }
    }
  },
  methods: {
    buildQueryParams() {
      let params = {
        userId: this.user.userId,
        meterCode: this.user.meterCode,
        companyId: this.user.companyId,
        pageSizeV2: this.pageSize
      };

      // 扣费类型筛选 - 暂时注释
      // if (this.searchParams.chargeType !== "") {
      //   params.type = this.searchParams.chargeType;
      // }

      if (this.searchParams.createTime && this.searchParams.timeType) {
        let formattedTime = "";
        let timeTypeValue = null;

        switch (this.searchParams.timeType) {
          case "year":
            formattedTime = `${this.searchParams.createTime}-01-01 00:00:00`;
            timeTypeValue = 1;
            break;
          case "month":
            formattedTime = `${this.searchParams.createTime}-01 00:00:00`;
            timeTypeValue = 2;
            break;
          case "day":
            formattedTime = `${this.searchParams.createTime} 00:00:00`;
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
    async fetchBillRecords() {
      if (!this.user.userId || !this.user.meterCode || this.isLoading) {
        return;
      }

      this.isLoading = true;
      this.loading = true;

      try {
        const params = this.buildQueryParams();
        const queryString = this.buildQueryString(params);
        const url = `/userManage/userCharge/showMeterChargeRecords/${this.currentPage}${queryString}`;
        const response = await service.get(url);

        if (response.code === 200) {
          const records = response.data.userSingleRechargeRecordData || [];
          records.map((item, index) => {
            item.theId = this.pageSize * (response.data.currentPages - 1) + index + 1;
            return item;
          });

          this.list = records.map((item) => {
            if (item.createTime) {
              return {
                ...item,
                createTime: item.createTime.replace("T", " ")
              };
            }
            return item;
          });

          this.total = response.data.totalElements || 0;
          await this.fetchTotalMoney();
        } else {
          ElMessage.error(response.msg);
        }
      } catch (error) {
        console.error("获取账单记录失败", error);
        ElMessage.error("获取账单记录失败");
      } finally {
        this.loading = false;
        this.isLoading = false;
      }
    },
    async fetchTotalMoney() {
      try {
        const params = this.buildQueryParams();
        const queryString = this.buildQueryString(params);
        const url = `/userManage/userCharge/getTotalChargeAmount${queryString}`;
        const response = await service.get(url);
        if (response.code === 200) {
          this.$emit("update-total-money", response.data || 0);
        }
      } catch (error) {
        console.error("获取扣费总额失败", error);
      }
    },
    handleSearch() {
      if (!this.searchParams.createTime && this.searchParams.timeType !== "") {
        ElMessage.warning("请选择时间");
        return;
      }
      this.currentPage = 1;
      this.fetchBillRecords();
    },
    handleClear() {
      this.searchParams = {
        // chargeType: "", // 扣费类型 - 暂时注释
        timeType: "day",
        createTime: ""
      };
      this.currentPage = 1;
      this.fetchBillRecords();
    },
    handleRefresh() {
      this.handleClear();
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchBillRecords();
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
    // 扣费类型格式化函数
    formatChargeType(type) {
      if (type === 0 || type === "0") return "抄表扣费";
      if (type === 1 || type === "1") return "保底扣费";
      if (type === 2 || type === "2") return "补扣费用";
      return "-";
    },
    async exportExcel() {
      try {
        const params = this.buildQueryParams();
        const response = await axios({
          url: "/userManage/userCharge/exportChargeRecord",
          method: "GET",
          responseType: "blob",
          params: params
        });

        if (response.status !== 200) {
          throw new Error("导出失败: " + response.statusText);
        }

        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        if (blob.size === 0) {
          ElMessage.warning("内容为空，无法下载");
          return;
        }

        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `${this.user.userName || "用户"}_历史扣费记录.xlsx`;
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
.bill-table-container {
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
  font-size: 20px;
  color: #606266;
  white-space: nowrap;
}

.time-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 时间选择器字体调大 */
.time-input :deep(.el-input__inner) {
  font-size: 20px;
  height: 40px;
  line-height: 40px;
}

.time-input :deep(.el-date-editor .el-input__inner) {
  font-size: 20px;
}

/* 下拉选项字体调大 */
.time-input :deep(.el-select-dropdown__item) {
  font-size: 20px;
}

.time-input :deep(.el-date-table td) {
  font-size: 20px;
}

.time-input :deep(.el-date-table td span) {
  font-size: 20px;
}

.time-input :deep(.el-month-table td .cell) {
  font-size: 20px;
}

.time-input :deep(.el-year-table td .cell) {
  font-size: 20px;
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
  font-size: 20px;
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

.export-btn, .refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
  font-size: 20px;
  color: #606266;
}

.export-btn img, .refresh-btn img {
  width: 18px;
  height: 18px;
}

.export-btn:hover, .refresh-btn:hover {
  background-color: #f5f7fa;
  border-color: #46B97E;
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
