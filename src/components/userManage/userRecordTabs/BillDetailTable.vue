<template>
  <div class="bill-table-container">
    <div class="search-bar">
      <div class="search-input-item">
        <span style="margin-right: 20px">时间</span>
        <div class="time-input">
          <el-select v-model="searchParams.timeType" placeholder="请选择" style="width: 100px; font-size: 18px;">
            <el-option label="年" value="year" />
            <el-option label="月" value="month" />
            <el-option label="日" value="day" />
            <el-option label="自定义" value="custom" />
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
              v-else-if="searchParams.timeType === 'day'"
              v-model="searchParams.createTime"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 200px; font-size: 18px;"
          />
          <el-date-picker
              v-else-if="searchParams.timeType === 'custom'"
              v-model="searchParams.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 300px; font-size: 18px;"
          />
        </div>
      </div>
<!--      <div class="total-summary">-->
<!--        <span class="summary-label">水费汇总</span>-->
<!--        <span class="summary-value">{{ waterTotal }} 元</span>-->
<!--        <span class="summary-label" style="margin-left:20px">污水处理费汇总</span>-->
<!--        <span class="summary-value">{{ sewageTotal }} 元</span>-->
<!--      </div>-->
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
      <div class="table-scroll">
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
        <el-table-column property="theId" label="序号" width="70" align="center" fixed="left" />
        <el-table-column property="userId" label="用户号" min-width="100" align="center" />
        <el-table-column property="userName" label="用户名" min-width="140" align="center" />
<!--        <el-table-column property="userAddr" label="地址" min-width="260" align="center" />-->
        <el-table-column property="startRead" label="起码" min-width="100" align="center" />
        <el-table-column property="endRead" label="止码" min-width="100" align="center" />
        <el-table-column property="waterUse" label="用水量" min-width="100" align="center">
          <template #default="scope">{{ scope.row.waterUse }}</template>
        </el-table-column>
        <el-table-column property="waterFee" label="水费" min-width="100" align="center">
          <template #default="scope">{{ scope.row.waterFee }}</template>
        </el-table-column>
        <el-table-column property="sewageFee" label="污水处理费" min-width="130" align="center">
          <template #default="scope">{{ scope.row.sewageFee }}</template>
        </el-table-column>
        <el-table-column property="minFee" label="保底消费" min-width="110" align="center">
          <template #default="scope">{{ scope.row.minFee }}</template>
        </el-table-column>
        <el-table-column property="createTime" label="算费日期" min-width="140" align="center" />
      </el-table>
    </div>
      <!-- 底部固定汇总行，无表头，紧贴表格下方 -->
      <el-table
        :data="totalSummaryRow"
        border
        style="width:100%;margin-top:-1px;"
        :show-header="false"
        row-class-name="summary-row"
      >
        <el-table-column property="theId" width="120" align="center" fixed="left" />
        <el-table-column property="userId" min-width="100" align="center" />
        <el-table-column property="userName" min-width="140" align="center" />
        <el-table-column property="startRead" min-width="100" align="center" />
        <el-table-column property="endRead" min-width="100" align="center" />
        <el-table-column property="waterUse" min-width="100" align="center" />
        <el-table-column property="waterFee" min-width="100" align="center" />
        <el-table-column property="sewageFee" min-width="130" align="center" />
        <el-table-column property="minFee" min-width="110" align="center" />
        <el-table-column property="createTime" min-width="140" align="center" />
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
  name: "BillDetailTable",
  props: {
    user: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  emits: [],
  data() {
    return {
      loading: false,
      isLoading: false,
      list: [],
      total: 0,
      currentPage: 1,
      pageSize: 30,
      staffPermissionIds: JSON.parse(sessionStorage.getItem("userData") || "{}").staffPermissionIds || [],
      token: JSON.parse(sessionStorage.getItem("userData") || "{}").token || "",
      // 汇总金额
      // waterTotal: 0,  // 总水费
      // sewageTotal: 0, // 总污水费
      searchParams: {
        timeType: "day",
        createTime: "",
        dateRange: null
      },

      // 新增底部汇总行
      totalSummaryRow: [
        {
          theId: "统计总额",
          userId: "",
          userName: "",
          startRead: "",
          endRead: "",
          waterUse: "0",
          waterFee: "0.00",
          sewageFee: "0.00",
          minFee: "0.00",
          createTime: ""
        }
      ],
    };
  },
  mounted() {
    this.fetchBillDetailRecords();
  },
  watch: {
    "user.userId"(newValue, oldValue) {
      if (newValue && newValue !== oldValue) {
        this.currentPage = 1;
        this.fetchBillDetailRecords();
      }
    },
    "user.meterCode"(newValue, oldValue) {
      if (newValue && newValue !== oldValue) {
        this.currentPage = 1;
        this.fetchBillDetailRecords();
      }
    },
    "searchParams.timeType"() {
      this.searchParams.createTime = "";
      this.searchParams.dateRange = null;
    }
  },
  methods: {
    buildQueryParams() {
      let params = {
        userId: this.user.userId,
        meterCode: this.user.meterCode,
        companyId: this.user.companyId
      };

      if (this.searchParams.timeType === "custom") {
        if (this.searchParams.dateRange && this.searchParams.dateRange.length === 2) {
          params.createTime = `${this.searchParams.dateRange[0]} 00:00:00`;
          params.endTime = `${this.searchParams.dateRange[1]} 23:59:59`;
          params.timeType = 4;
        }
      } else if (this.searchParams.createTime && this.searchParams.timeType) {
        let start = "";
        let end = "";
        let timeTypeValue = null;
        switch (this.searchParams.timeType) {
          case "year":
            // 选年份：起始当年1月1日，结束当年12月31日23:59:59
            start = `${this.searchParams.createTime}-01-01 00:00:00`;
            end = `${this.searchParams.createTime}-12-31 23:59:59`;
            timeTypeValue = 1;
            break;
          case "month":
            // 选月份：起始当月1号，次月1号前一秒
            const [y, m] = this.searchParams.createTime.split("-");
            const nextMonth = Number(m) + 1;
            if (nextMonth === 13) {
              start = `${y}-12-01 00:00:00`;
              end = `${Number(y) + 1}-01-01 00:00:00`;
            } else {
              start = `${y}-${String(nextMonth - 1).padStart(2, '0')}-01 00:00:00`;
              end = `${y}-${String(nextMonth).padStart(2, '0')}-01 00:00:00`;
            }
            timeTypeValue = 2;
            break;
          case "day":
            // 选单日：当天0点 ~ 当天23:59:59
            start = `${this.searchParams.createTime} 00:00:00`;
            end = `${this.searchParams.createTime} 23:59:59`;
            timeTypeValue = 3;
            break;
        }
        if (timeTypeValue) {
          params.timeType = timeTypeValue;
          params.createTime = start;
          params.endTime = end;
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
    async fetchBillDetailRecords(isPageChange = false) {
      if (!this.user.userId || !this.user.meterCode || this.isLoading) {
        return;
      }

      this.isLoading = true;
      this.loading = true;

      try {
        const params = this.buildQueryParams();
        const queryString = this.buildQueryString(params);
        // 替换为后端扣费详情接口
        const url = `/chargeDetail/list/${this.currentPage}${queryString}`;
        const response = await service.get(url);

        if (response.code === 200) {
          const records = response.data.dataList || [];
          records.map((item, index) => {
            item.theId = this.pageSize * (response.data.currentPages - 1) + index + 1;
            // 格式化日期
            if(item.createTime) item.createTime = item.createTime.substring(0,10);
            return item;
          });

          this.list = records;
          this.total = response.data.totalElements || 0;
          // 获取汇总水费、污水处理费
          if (!isPageChange){
            await this.fetchSumData();
          }
        } else {
          ElMessage.error(response.msg);
        }
      } catch (error) {
        console.error("获取扣费详情记录失败", error);
        ElMessage.error("获取扣费详情记录失败");
      } finally {
        this.loading = false;
        this.isLoading = false;
      }
    },
    handleSearch() {
      if (this.searchParams.timeType === "custom") {
        if (!this.searchParams.dateRange || this.searchParams.dateRange.length !== 2) {
          ElMessage.warning("请选择时间范围");
          return;
        }
      } else if (!this.searchParams.createTime && this.searchParams.timeType !== "") {
        ElMessage.warning("请选择时间");
        return;
      }
      this.currentPage = 1;
      this.fetchBillDetailRecords();
    },
    handleClear() {
      this.searchParams = {
        timeType: "day",
        createTime: "",
        dateRange: null
      };
      this.currentPage = 1;
      this.fetchBillDetailRecords();
    },
    handleRefresh() {
      this.handleClear();
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchBillDetailRecords(true);
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

    // 导出接口待对接
    async exportExcel() {
      try {
        const params = this.buildQueryParams();
        const queryStr = this.buildQueryString(params);
        console.log('导出参数', params)
        // 使用全局service携带token与/api前缀，统一项目请求规范
        const res = await service.get(`/chargeDetail/export${queryStr}`, {
          responseType: "blob"
        });

        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        if (blob.size === 0) {
          ElMessage.warning("当前筛选条件无导出数据");
          return;
        }

        // 创建下载链接
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `${this.user.userName || "用户"}_扣费明细记录.xlsx`;
        document.body.appendChild(link);
        link.click();
        // 释放资源
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        ElMessage.success("导出成功");
      } catch (error) {
        console.error("扣费明细表导出失败：", error);
        ElMessage.error("导出失败：" + (error.response?.data?.message || error.message));
      }
    },
    // 请求后端全局扣费汇总接口
    async fetchSumData() {
      try {
        const params = this.buildQueryParams();
        const queryStr = this.buildQueryString(params);
        const res = await service.get(`/chargeDetail/sum${queryStr}`);
        if (res.code === 200 && res.data) {
          const sumData = res.data;
          // 赋值底部汇总行
          this.totalSummaryRow = [
            {
              theId: "统计总额",
              userId: "",
              userName: "",
              startRead: "",
              endRead: "",
              waterUse: Number(sumData.totalWaterUse || 0).toFixed(2),
              waterFee: Number(sumData.totalWaterFee || 0).toFixed(2),
              sewageFee: Number(sumData.totalSewageFee || 0).toFixed(2),
              minFee: Number(sumData.totalMinFee || 0).toFixed(2),
              createTime: ""
            }
          ];
        }
      } catch (err) {
        console.error("获取扣费汇总失败", err);
        // 报错不阻断列表展示，重置汇总为0
        this.totalSummaryRow = [
          {
            theId: "统计总额",
            userId: "",
            userName: "",
            startRead: "",
            endRead: "",
            waterUse: "0.00",
            waterFee: "0.00",
            sewageFee: "0.00",
            minFee: "0.00",
            createTime: ""
          }
        ];
      }
    },
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

.total-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: #f7fbf8;
  border: 1px solid #d9efe2;
  border-radius: 6px;
  margin-left: auto;
  margin-right: auto;
}

.total-summary .summary-label {
  font-size: 20px;
  letter-spacing: 2px;
  color: #5a5a5a;
}

.total-summary .summary-value {
  font-size: 22px;
  color: #f56c6c;
  font-weight: bold;
}

.search-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto; /* 核心：自动挤到最右侧 */
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

.table-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.table-scroll {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
/* 汇总行样式：绿色底色白色加粗文字 */
:deep(.summary-row) {
  height: 50px !important;
  background-color: #46B97E !important;
}
:deep(.summary-row td) {
  font-weight: bold;
  color: #ffffff;
  font-size: 21px;
  text-align: center;
}
</style>
