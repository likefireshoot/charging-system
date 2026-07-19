<template>
  <div class="transaction-table-container">
    <div class="search-bar">
      <div class="search-input-item">
        <span>退款方式</span>
        <el-select v-model="transactionData.rechargeType" placeholder="全部" style="width: 130px; font-size: 18px;" @change="handleTimeTypeChange">
          <el-option label="全部" value="" />
          <el-option label="现金" value="现金" />
          <el-option label="微信支付" value="微信支付" />
          <el-option label="免费赠送" value="免费赠送" />
          <el-option label="现金（销户退费）" value="现金（销户退费）" />
        </el-select>
      </div>
      <div class="search-input-item">
        <span>时间</span>
        <div class="time-input">
          <el-select v-model="transactionData.timeType" placeholder="请选择" style="width: 100px; font-size: 18px;" @change="handleTimeTypeChange">
            <el-option label="年" value="year" />
            <el-option label="月" value="month" />
            <el-option label="日" value="day" />
            <el-option label="自定义" value="custom" />
          </el-select>
          <el-date-picker
            v-if="transactionData.timeType === 'year'"
            v-model="transactionData.createTime"
            type="year"
            placeholder="选择年份"
            value-format="YYYY"
            style="width: 180px; font-size: 18px;"
          />
          <el-date-picker
            v-else-if="transactionData.timeType === 'month'"
            v-model="transactionData.createTime"
            type="month"
            placeholder="选择月份"
            value-format="YYYY-MM"
            style="width: 180px; font-size: 18px;"
          />
          <el-date-picker
            v-else-if="transactionData.timeType === 'day'"
            v-model="transactionData.createTime"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 200px; font-size: 18px;"
          />
          <el-date-picker
            v-else-if="transactionData.timeType === 'custom'"
            v-model="transactionData.dateRange"
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
        <el-table-column property="userId" label="用户号" min-width="100" align="center" fixed="left" />
        <el-table-column property="userName" label="用户名称" min-width="130" align="center" />
<!--        <el-table-column property="regionName" label="所属区域" min-width="120" align="center" />-->
<!--        <el-table-column property="userPhone" label="联系电话" min-width="130" align="center" />-->
<!--        <el-table-column label="表号" min-width="180" align="center">-->
<!--          <template #default="scope">-->
<!--            <div class="meter-code-cell">-->
<!--              <span class="meter-code-text">{{ scope.row.meterCode || "-" }}</span>-->
<!--              <span v-if="meterStatusMap[scope.row.meterCode] !== undefined"-->
<!--                    :class="['meter-status', meterStatusMap[scope.row.meterCode] === '0' ? 'current' : 'history']">-->
<!--                {{ meterStatusMap[scope.row.meterCode] === '0' ? '当前表' : '历史表' }}-->
<!--              </span>-->
<!--            </div>-->
<!--          </template>-->
<!--        </el-table-column>-->
        <el-table-column property="rechargeType" label="退款方式" min-width="100" align="center" />
        <el-table-column property="rechargeAmount" label="充值金额" min-width="110" align="center">
          <template #default="scope">{{ scope.row.rechargeAmount }} 元</template>
        </el-table-column>
        <el-table-column property="createTime" label="充值时间" min-width="150" align="center" />
        <el-table-column property="createCancelTime" label="撤销时间" min-width="150" align="center" />
<!--        <el-table-column property="oldBalance" label="充值前余额/元" min-width="120" align="center">-->
<!--          <template #default="scope">{{ scope.row.oldBalance }} 元</template>-->
<!--        </el-table-column>-->
<!--        <el-table-column property="newBalance" label="充值后余额/元" min-width="120" align="center">-->
<!--          <template #default="scope">{{ scope.row.newBalance }} 元</template>-->
<!--        </el-table-column>-->
        <el-table-column property="cancelOldBalance" label="撤销前余额" min-width="130" align="center">
          <template #default="scope">{{ scope.row.cancelOldBalance ?? "-" }} 元</template>
        </el-table-column>
        <el-table-column property="cancelNewBalance" label="撤销后余额" min-width="130" align="center">
          <template #default="scope">{{ scope.row.cancelNewBalance ?? "-" }} 元</template>
        </el-table-column>
        <el-table-column property="rechargeUser" label="充值员工" min-width="100" align="center" />
        <el-table-column property="cancelStaffName" label="撤销员工" min-width="100" align="center" />
<!--        <el-table-column property="meterType" label="水表类型" min-width="100" align="center" />-->
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
  name: "TransactionTable",
  props: {
    user: {
      type: Object,
      default: () => ({})
    },
    userMeters: {
      type: Array,
      default: () => []
    }
  },
  emits: ["close"],
  computed: {
    meterStatusMap() {
      const map = {};
      (this.userMeters || []).forEach(m => {
        map[m.meterCode] = m.status;
      });
      return map;
    }
  },
  data() {
    return {
      loading: false,
      list: [],
      multipleSelection: [],
      total: 0,
      currentPage: 1,
      pageSize: 30,
      // 删除 rechargeType
      transactionData: {
        timeType: "day",
        createTime: "",
        dateRange: null,
        userId: "",
        companyId: "",
        meterCode: "",
        rechargeType: ""
      }
    };
  },
  mounted() {
    this.initData();
    this.queryList();
  },
  methods: {
    async exportExcel() {
      try {
        const params = this.buildQueryParams();
        const queryStr = this.buildQueryStr(params);
        // 后端个人导出接口地址
        const url = `/userManage/userCharge/exportCancelRechargePersonal${queryStr}`;
        const res = await service.get(url, {
          responseType: "blob"
        });

        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        if (blob.size === 0) {
          ElMessage.warning("当前筛选条件无导出数据");
          return;
        }

        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `${this.user.userName || "用户"}_充值撤销记录.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        ElMessage.success("导出成功");
      } catch (error) {
        console.error("撤销充值记录导出失败：", error);
        ElMessage.error("导出失败：" + (error.response?.data?.message || error.message));
      }
    },
    initData() {
      this.transactionData.userId = this.user.userId;
      this.transactionData.companyId = this.user.companyId;
      this.transactionData.meterCode = this.user.meterCode;
      this.transactionData.timeType = "day";
      this.transactionData.createTime = "";
      this.transactionData.dateRange = null;
      this.transactionData.rechargeType = "";
    },

    handleTimeTypeChange() {
      this.transactionData.createTime = "";
      this.transactionData.dateRange = null;
    },

    // 组装查询参数（移除rechargeType分支）
    buildQueryParams() {
      const params = {
        userId: this.transactionData.userId,
        companyId: this.transactionData.companyId,
        meterCode: this.transactionData.meterCode
      };
      // 新增充值类型
      if (this.transactionData.rechargeType) {
        params.rechargeType = this.transactionData.rechargeType;
      }
      if (this.transactionData.timeType === "custom") {
        if (this.transactionData.dateRange && this.transactionData.dateRange.length === 2) {
          params.createTime = `${this.transactionData.dateRange[0]} 00:00:00`;
          params.endTime = `${this.transactionData.dateRange[1]} 23:59:59`;
          params.timeType = 4;
        }
      } else if (this.transactionData.createTime) {
        let start = "";
        let end = "";
        let timeTypeValue = null;
        switch (this.transactionData.timeType) {
          case "year":
            // 选年份：起始当年1月1日，结束当年12月31日23:59:59
            start = `${this.transactionData.createTime}-01-01 00:00:00`;
            end = `${this.transactionData.createTime}-12-31 23:59:59`;
            timeTypeValue = 1;
            break;
          case "month":
            // 选月份：起始当月1号，次月1号前一秒
            const [y, m] = this.transactionData.createTime.split("-");
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
            start = `${this.transactionData.createTime} 00:00:00`;
            end = `${this.transactionData.createTime} 23:59:59`;
            timeTypeValue = 3;
            break;
        }
        if (timeTypeValue) {
          params.timeType = timeTypeValue;
          params.createTime = start;
          params.endTime = end;
        }
      }
      return this.filterEmptyParams(params);
    },

    // 拼接url参数
    buildQueryStr(params) {
      let str = "";
      for (const key in params) {
        const val = params[key];
        str += str ? `&${key}=${encodeURIComponent(val)}` : `?${key}=${encodeURIComponent(val)}`;
      }
      return str;
    },

    // 统一查询列表
    async queryList() {
      if (this.loading) return;
      this.loading = true;
      try {
        const params = this.buildQueryParams();
        const queryStr = this.buildQueryStr(params);
        const url = `/userManage/userCharge/showSingleCancelRechargeMeterRecords/${this.currentPage}${queryStr}`;
        console.log("请求地址：", url);
        const res = await service.get(url);
        if (res.code === 200) {
          const arr = res.data.userSingleCancelRechargeRecordData || [];
          this.list = arr.map((item, idx) => {
            return {
              ...item,
              theId: this.pageSize * (res.data.currentPages - 1) + idx + 1,
              createTime: item.createTime ? item.createTime.replace("T", " ") : "",
              createCancelTime: item.createCancelTime ? item.createCancelTime.replace("T", " ") : ""
            };
          });
          this.total = res.data.totalElements || 0;
        } else {
          ElMessage.error(res.msg);
        }
      } catch (err) {
        console.error("查询撤销记录失败", err);
        ElMessage.error("查询撤销记录失败");
      } finally {
        this.loading = false;
      }
    },

    // 搜索按钮（删除充值类型判断逻辑）
    handleSearch() {
      let hasValidTime = true;
      const hasRechargeFilter = this.transactionData.rechargeType !== null && this.transactionData.rechargeType !== undefined;

      if (this.transactionData.timeType === "custom") {
        if (!this.transactionData.dateRange || this.transactionData.dateRange.length !== 2) {
          hasValidTime = false;
        }
      } else if (!this.transactionData.createTime) {
        hasValidTime = false;
      }
      // 既无时间也无充值类型才拦截
      if (!hasValidTime && !hasRechargeFilter) {
        ElMessage.warning("请选择充值类型或选择时间条件进行搜索");
        return;
      }
      this.currentPage = 1;
      this.queryList();
    },

    // 清空（删除充值类型重置）
    handleClear() {
      this.transactionData.timeType = "day";
      this.transactionData.createTime = "";
      this.transactionData.dateRange = null;
      this.currentPage = 1;
      this.transactionData.rechargeType = "";
      this.queryList();
    },

    handleRefresh() {
      this.handleClear();
    },

    // 分页切换
    handlePageChange(page) {
      this.currentPage = page;
      this.queryList();
    },

    handleSelectionChange(val) {
      this.multipleSelection = val;
    },

    // 过滤空参数
    filterEmptyParams(params) {
      const obj = {};
      for (const key in params) {
        const val = params[key];
        if (val !== "" && val !== null && val !== undefined) {
          obj[key] = val;
        }
      }
      return obj;
    }
  },
  watch: {
    "user.userId"(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.initData();
        this.currentPage = 1;
        this.queryList();
      }
    }
  }
};
</script>

<style scoped>
.transaction-table-container {
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

/* 时间选择器字体调大 */
.time-input :deep(.el-input__inner) {
  font-size: 18px;
  height: 40px;
  line-height: 40px;
}

.time-input :deep(.el-date-editor .el-input__inner) {
  font-size: 18px;
}

/* 下拉选项字体调大 */
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

.tool-btn, .refresh-btn,.export-btn {
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

.tool-btn img, .refresh-btn img, .export-btn img {
  width: 18px;
  height: 18px;
}

.tool-btn:hover, .refresh-btn:hover, .export-btn:hover {
  background-color: #f5f7fa;
  border-color: #46B97E;
}

.disabled-btn {
  opacity: 0.5;
  cursor: not-allowed !important;
  pointer-events: none;
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
