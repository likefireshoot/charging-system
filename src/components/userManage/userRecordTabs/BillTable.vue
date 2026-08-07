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
        <span >时间</span>
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
      <div class="total-summary">
        <span class="summary-label">消费额汇总</span>
        <span class="summary-value">{{ totalMoney }} 元</span>
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
      <div class="export-btn" @click="downloadTemplate" v-if="staffPermissionIds.includes(54)">
        <img src="@/assets/yonghu/icon1.png" alt="" />
        <span>历史数据导⼊模版下载</span>
      </div>
      <div class="export-btn" @click="triggerFileInput" v-if="staffPermissionIds.includes(54)">
        <img src="@/assets/yonghu/icon2.png" alt="" />
        <span>历史数据导⼊</span>
        <input ref="fileInput" type="file" accept=".xls,.xlsx" style="display: none" @change="handleImport" />
      </div>
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
        <el-table-column type="selection" min-width="50" align="center" fixed="left" />
        <el-table-column property="userId" label="用户号" min-width="120" align="center" />
        <el-table-column property="userName" label="用户名" min-width="140" align="center" />
        <el-table-column property="startRead" label="起码" min-width="100" align="center" />
        <el-table-column property="endRead" label="止码" min-width="100" align="center" />
        <el-table-column property="waterUse" label="用水量" min-width="100" align="center">
          <template #default="scope">{{ scope.row.waterUse }}</template>
        </el-table-column>
        <el-table-column property="chargeAmount" label="扣费" min-width="110" align="center">
          <template #default="scope">{{ scope.row.chargeAmount }}</template>
        </el-table-column>
<!--        <el-table-column property="meterCode" label="表号" min-width="160" align="center" />-->
        <el-table-column property="oldBalance" label="原金额" min-width="110" align="center">
          <template #default="scope">{{ scope.row.oldBalance }}</template>
        </el-table-column>
        <el-table-column property="newBalance" label="余额" min-width="110" align="center">
          <template #default="scope">{{ scope.row.newBalance }}</template>
        </el-table-column>
        <el-table-column property="createTime" label="扣费时间" min-width="180" align="center" />
        <el-table-column label="扣费类型" min-width="120" align="center">
          <template #default="scope">
            <span>{{ formatChargeType(scope.row.type) }}</span>
          </template>
        </el-table-column>
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
        <el-table-column property="userId" min-width="170" align="center" />
        <el-table-column property="userName" min-width="140" align="center" />
        <el-table-column property="startRead" min-width="100" align="center" />
        <el-table-column property="endRead" min-width="100" align="center" />
        <el-table-column property="totalWaterUse" min-width="100" align="center" />
        <el-table-column property="totalChargeAmount" min-width="110" align="center" />
        <el-table-column property="oldBalance" min-width="110" align="center"/>
        <el-table-column property="newBalance" min-width="110" align="center" />
        <el-table-column property="createTime" min-width="180" align="center" />
        <el-table-column property="type" min-width="120" align="center"/>
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
      staffPermissionIds: JSON.parse(sessionStorage.getItem("userData") || "{}").staffPermissionIds || [],
      token: JSON.parse(sessionStorage.getItem("userData") || "{}").token || "",
      totalMoney: 0,
      searchParams: {
        // chargeType: "", // 扣费类型 - 暂时注释
        timeType: "day",
        createTime: "",
        dateRange: null
      },
      // 新增底部汇总行
      totalSummaryRow: [
        {
          userId: "汇总",
          userName: "",
          startRead: "",
          endRead: "",
          totalWaterUse: 0,
          totalChargeAmount: 0,
          oldBalance: "",
          newBalance: "",
          createTime: "",
          type: ""
        }
      ],
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
    },
    "user.meterCode"(newValue, oldValue) {
      if (newValue && newValue !== oldValue) {
        this.currentPage = 1;
        this.fetchBillRecords();
      }
    },
    "searchParams.timeType"() {
      this.searchParams.createTime = "";
      this.searchParams.dateRange = null;
    }
  },
  methods: {
    // 导出模板
    downloadTemplate() {
      axios({
        url: "/import/importChargeTemplate",
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
          link.download = "历史扣费数据导⼊模版下载.xlsx";
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

    // 触发文件选择
    triggerFileInput() {
      this.$refs.fileInput.value = "";
      this.$refs.fileInput.click();
    },

// 导入文件
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
        const response = await service.post("/import/importChargeRecord", formData, { responseType: "blob" });
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
        link.download = "扣费记录导入失败列表.xlsx";
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

    buildQueryParams() {
      let params = {
        userId: this.user.userId,
        meterCode: this.user.meterCode,
        companyId: this.user.companyId
      };

      // 扣费类型筛选 - 暂时注释
      // if (this.searchParams.chargeType !== "") {
      //   params.type = this.searchParams.chargeType;
      // }

      if (this.searchParams.timeType === "custom") {
        if (this.searchParams.dateRange && this.searchParams.dateRange.length === 2) {
          params.createTime = `${this.searchParams.dateRange[0]} 00:00:00`;
          params.endTime = `${this.searchParams.dateRange[1]} 23:59:59`;
        }
      } else if (this.searchParams.createTime && this.searchParams.timeType) {
        let formattedTime = "";
        let endTimeVal = "";
        let timeTypeValue = null;

        switch (this.searchParams.timeType) {
          case "year":
            formattedTime = `${this.searchParams.createTime}-01-01 00:00:00`;
            endTimeVal = `${this.searchParams.createTime}-12-31 23:59:59`;
            timeTypeValue = 1;
            break;
          case "month":
            formattedTime = `${this.searchParams.createTime}-01 00:00:00`;
            const [y, m] = this.searchParams.createTime.split("-");
            const nextMonth = Number(m) + 1;
            if(nextMonth > 12){
              endTimeVal = `${Number(y)+1}-01-01 00:00:00`;
            }else{
              endTimeVal = `${y}-${String(nextMonth).padStart(2,'0')}-01 00:00:00`;
            }
            timeTypeValue = 2;
            break;
          case "day":
            formattedTime = `${this.searchParams.createTime} 00:00:00`;
            endTimeVal = `${this.searchParams.createTime} 23:59:59`;
            timeTypeValue = 3;
            break;
        }

        if (timeTypeValue) {
          params.timeType = timeTypeValue;
          params.createTime = formattedTime;
          params.endTime = endTimeVal;
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
          await this.fetchSumData();
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
          this.totalMoney = response.data || 0;
          this.$emit("update-total-money", response.data || 0);
        }
      } catch (error) {
        console.error("获取扣费总额失败", error);
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
      this.fetchBillRecords();
    },
    handleClear() {
      this.searchParams = {
        // chargeType: "", // 扣费类型 - 暂时注释
        timeType: "day",
        createTime: "",
        dateRange: null
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
    },
    async fetchSumData() {
      if (!this.user.userId || !this.user.meterCode) return;
      try {
        const params = this.buildQueryParams();
        const queryString = this.buildQueryString(params);
        const url = `/charge/sum${queryString}`;
        const res = await service.get(url);
        if(res.code === 200){
          const d = res.data;
          this.totalSummaryRow[0].totalWaterUse = d.totalWaterUse;
          this.totalSummaryRow[0].totalChargeAmount = d.totalChargeAmount;
        }
      }catch (e){
        console.error("获取汇总行失败",e);
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
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
  background: #ffffff;
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9eef2;
}

.search-input-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input-item > span {
  font-size: 18px;
  color: #606266;
  white-space: nowrap;
}

.time-input {
  display: flex;
  align-items: center;
}

.time-input :deep(.el-input__inner) {
  font-size: 18px;
}
.time-input :deep(.el-date-editor .el-input__inner) {
  font-size: 18px;
}
.time-input :deep(.el-input__inner::placeholder) {
  font-size: 18px;
}
.time-input :deep(.el-range-input__inner) {
  font-size: 18px;
}
.time-input :deep(.el-range-input__inner::placeholder) {
  font-size: 18px;
}
.time-input :deep(.el-select-dropdown__item) {
  font-size: 18px;
}

.total-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 16px;
  background: #f7fbf8;
  border: 1px solid #d9efe2;
  border-radius: 6px;
  margin-left: auto;
  margin-right: auto;
}

.total-summary .summary-label {
  font-size: 18px;
  letter-spacing: 2px;  /* 调大字间距 */
  color: #5a5a5a;
}

.total-summary .summary-value {
  font-size: 20px;
  color: #f56c6c;
  font-weight: bold;
}

.search-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-btn, .clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 18px;
  height: auto;
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
  gap: 10px;
  margin-bottom: 8px;
}

.export-btn, .refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 4px;
  cursor: pointer;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
  font-size: 18px;
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
  margin-top: 5px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
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
  font-size: 20px;
  text-align: center;
}
</style>
