<template>
  <div class="abnormal-container">
    <!-- 搜索栏 -->
    <div class="search-box">
      <div class="search-content">
        <div class="search-input" v-if="companyId === 1" style="margin-left: 10px">
          <span>所属水厂</span>
          <el-select class="big-font-el-select" v-model="params.companyId" placeholder="请选择所属水厂" clearable>
            <el-option v-for="item in companyList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>扣费类型</span>
          <el-select class="big-font-el-select" v-model="params.type" placeholder="请选择扣费类型">
            <el-option label="抄表扣费" :value="0"></el-option>
            <el-option label="保底扣费" :value="1"></el-option>
            <el-option label="其他扣费" :value="2"></el-option>
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>扣费金额下限(元)</span>
          <el-input-number v-model="params.thresholdMin" :precision="2" :min="0" :step="10" placeholder="请输入金额下限" style="width: 100%" />
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>扣费金额上限(元)</span>
          <el-input-number v-model="params.thresholdMax" :precision="2" :min="0" :step="10" placeholder="请输入金额上限" style="width: 100%" />
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>统计时间</span>
          <el-date-picker
            v-model="params.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 320px; font-size: 18px;"
          />
        </div>
      </div>
      <div class="buttons">
        <div class="sercah-btn" @click="handleSearch" style="margin-left: -20px">
          <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: -12px" />
          <span style="font-size: 20px; margin-left: 1%">开始统计</span>
        </div>
        <div class="clear-btn" @click="clearParams">
          <img src="@/assets/jiage/icon4.png" alt="" style="margin-left: 0px" />
          <span style="font-size: 20px; margin-left: 1%; color: #5a5a5a">重置</span>
        </div>
      </div>
    </div>

    <div class="abnormal-info">
      <div class="report-title">
        <h2>大额扣费审计（{{ params.dateRange && params.dateRange[0] ? params.dateRange[0] : '' }} - {{ params.dateRange && params.dateRange[1] ? params.dateRange[1] : '' }}）</h2>
      </div>

      <!-- 功能键预留区 -->
      <div class="command-box">
        <div class="export-btn" style="margin-left: 10px" @click="handleExport">
          <img src="@/assets/yonghu/icon1.3.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">导出</span>
        </div>
        <div class="reflush" style="margin-left: 10px" @click="handleSearch">
          <img src="@/assets/yonghu/icon15.png" alt="" />
        </div>
      </div>

      <div class="abnormal-table">
        <el-table
          :data="tableData"
          border
          v-loading="loading"
          style="width: 100%; height: 100%"
          :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
          :row-style="{ height: '50px' }"
        >
          <el-table-column label="序号" width="80" align="center">
            <template #default="scope">
              {{ (params.pageNum - 1) * params.pageSize + scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column property="userId" label="用户ID" min-width="100" align="center" />
          <el-table-column property="userName" label="用户名" min-width="120" align="center" />
          <el-table-column property="meterCode" label="表号" min-width="140" align="center" />
          <el-table-column property="type" label="业务类型" min-width="120" align="center">
            <template #default="scope">
              {{ { 0: '抄表扣费', 1: '保底扣费', 2: '其他扣费' }[scope.row.type] || '-' }}
            </template>
          </el-table-column>
          <el-table-column property="oldBalance" label="扣费前余额(元)" min-width="140" align="center" />
          <el-table-column property="chargeAmount" label="扣费金额(元)" min-width="140" align="center" />
          <el-table-column property="newBalance" label="扣费后余额(元)" min-width="140" align="center" />
          <el-table-column property="companyName" label="所属水厂" min-width="140" align="center" />
          <el-table-column property="createTime" label="本次扣费时间" min-width="180" align="center" />
          <el-table-column property="lastChargeTime" label="上次扣费时间" min-width="180" align="center">
            <template #default="scope">
              {{ scope.row.lastChargeTime || '-' }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination
            v-model:current-page="params.pageNum"
            v-model:page-size="params.pageSize"
            :page-sizes="[20, 40, 60, 100]"
            layout="total, prev, pager, next, jumper"
            :total="totalNum"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import service from "@/api/request";
import { ElMessage, ElLoading } from "element-plus";

export default {
  name: "AbnormalChargeReport",
  data() {
    const getMonthRange = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      };
      return [formatDate(firstDay), formatDate(lastDay)];
    };

    return {
      params: {
        companyId: null,
        type: 0,
        thresholdMin: 5,
        thresholdMax: null,
        dateRange: getMonthRange(),
        pageNum: 1,
        pageSize: 40,
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      companyList: [],
      loading: false,
      tableData: [],
      totalNum: 0,
    };
  },
  mounted() {
    this.getCompanyList().catch(() => {});
  },
  methods: {
    handlePageChange(page) {
      this.params.pageNum = page;
      this.fetchData();
    },
    handleSizeChange(size) {
      this.params.pageSize = size;
      this.params.pageNum = 1;
      this.fetchData();
    },
    async getCompanyList() {
      try {
        const response = await service.get("/getAllUnblockCompany");
        if (response.code === 200) {
          this.companyList = response.data.map((item) => ({
            id: item.companyId,
            name: item.companyName,
          }));
        }
      } catch (error) {
        console.error("获取水厂列表失败", error);
      }
    },
    handleSearch() {
      if (!this.params.thresholdMin || this.params.thresholdMin <= 0) {
        ElMessage.warning("请输入有效的扣费金额下限");
        return;
      }
      if (!this.params.dateRange || this.params.dateRange.length !== 2) {
        ElMessage.warning("请选择统计时间");
        return;
      }
      this.params.pageNum = 1;
      this.fetchData();
    },
    async handleExport() {
      if (!this.params.dateRange || this.params.dateRange.length !== 2) {
        ElMessage.warning("请选择统计时间");
        return;
      }
      const loading = ElLoading.service({
        fullscreen: true,
        text: "正在分析生成，请稍后...",
        background: "rgba(0, 0, 0, 0.3)",
        customClass: "export-loading",
      });
      try {
        const body = {
          type: this.params.type,
          thresholdMin: this.params.thresholdMin,
          startTime: this.params.dateRange[0] + " 00:00:00",
          endTime: this.params.dateRange[1] + " 23:59:59",
        };
        if (this.params.thresholdMax != null) {
          body.thresholdMax = this.params.thresholdMax;
        }
        if (this.companyId === 1 && this.params.companyId) {
          body.companyId = this.params.companyId;
        } else if (this.companyId !== 1) {
          body.companyId = this.companyId;
        }
        const response = await service.post("/exportAbnormalChargeReport", body, { responseType: "blob" });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.download = "大额扣费审计.xlsx";
        link.click();
        window.URL.revokeObjectURL(url);
        ElMessage.success("导出成功");
      } catch (error) {
        ElMessage.error("导出失败");
      } finally {
        loading.close();
      }
    },
    async fetchData() {
      this.loading = true;
      try {
        const body = {
          type: this.params.type,
          thresholdMin: this.params.thresholdMin,
          startTime: this.params.dateRange[0] + " 00:00:00",
          endTime: this.params.dateRange[1] + " 23:59:59",
          pageNum: this.params.pageNum,
          pageSize: this.params.pageSize,
        };
        if (this.params.thresholdMax != null) {
          body.thresholdMax = this.params.thresholdMax;
        }
        if (this.companyId === 1 && this.params.companyId) {
          body.companyId = this.params.companyId;
        } else if (this.companyId !== 1) {
          body.companyId = this.companyId;
        }
        const response = await service.post("/abnormalChargeReport", body);
        if (response.code === 200) {
          this.tableData = response.data.records || [];
          this.totalNum = response.data.total || 0;
        } else {
          ElMessage.error(response.msg || "查询失败");
        }
      } catch (error) {
        ElMessage.error("数据查询异常");
      } finally {
        this.loading = false;
      }
    },
    clearParams() {
      const getMonthRange = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const formatDate = (date) => {
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, "0");
          const d = String(date.getDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        };
        return [formatDate(firstDay), formatDate(lastDay)];
      };
      this.params = {
        companyId: null,
        type: 0,
        thresholdMin: null,
        thresholdMax: null,
        dateRange: getMonthRange(),
        pageNum: 1,
        pageSize: this.params.pageSize,
      };
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

:deep(.el-input) {
  --el-color-primary: #46b97e;
}

:deep(.el-select) {
  --el-color-primary: #46b97e;
}

:deep(.el-select .el-select__wrapper) {
  height: 35px;
}

:deep(.el-input-number .el-input__inner) {
  height: 35px;
  font-size: 18px;
}

:deep(.el-date-editor .el-input__inner) {
  height: 35px;
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

:deep(.el-pagination .el-select .el-input) {
  font-size: 16px;
}

.abnormal-container {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  width: 100%;
  height: 98%;
  padding: 0 20px;
  box-sizing: border-box;
}

.search-box {
  margin-top: 15px;
  margin-bottom: 20px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  background-color: #fff;
  padding: 15px 20px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.search-content {
  display: flex;
  flex: 0 1 auto;      /* 改为不强制占满 */
  flex-wrap: wrap;
  gap: 10px 20px;
  align-items: center;
  /* 移除 flex: 1 */
}

.search-input {
  display: flex;
  justify-content: center;
  flex-direction: column;
  flex: 1;
  min-width: 180px;
  max-width: 280px;
}

.search-input > span {
  font-size: 18px;
  margin-bottom: 4px;
  white-space: nowrap;
}

.buttons {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: auto;   /* 新增 */
  gap: 15px;
}

.sercah-btn,
.clear-btn {
  display: flex;
  align-items: center;
  height: 38px;
  padding: 0 18px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
  white-space: nowrap;
}

.sercah-btn {
  background-color: #45ba7e;
  color: #fff;
}

.clear-btn {
  background-color: #fff;
  border: 2px solid #f2f2f2;
  color: #5a5a5a;
}

.sercah-btn img,
.clear-btn img {
  margin-right: 8px;
}

.abnormal-info {
  width: 100%;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  background-color: #fff;
  position: relative;
}

.report-title {
  text-align: center;
  margin-top: 15px;
  margin-bottom: -5px;
  flex-shrink: 0;
}

.report-title h2 {
  font-size: 26px;
  color: #333;
  margin: 0;
  font-weight: 600;
}

.command-box {
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  margin-top: 3px;
  margin-bottom: 15px;
  flex-shrink: 0;
  padding-left: 10px;
}

.command-box > * {
  margin-right: 20px;
}

.export-btn {
  display: flex;
  align-items: center;
  width: 90px;
  height: 32px;
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
  width: 35px;
  height: 32px;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 20px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
}

.abnormal-table {
  width: 100%;
  height: calc(100% - 190px);
  padding: 0 10px;
  box-sizing: border-box;
  overflow: hidden;
}

.page-box {
  height: 65px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 0;
  padding: 5px 0;
}
</style>

<style>
.export-loading .el-loading-text {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}
.export-loading .el-loading-spinner .path {
  stroke: #45ba7e;
}
</style>
