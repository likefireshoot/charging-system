<template>
  <div
    class="yuangong-container"
    v-loading="exporting"
    element-loading-text="正在生成报表，为确保数据准确，统计过程需要一点时间，请耐心等待……"
    element-loading-custom-class="export-loading"
  >
    <!-- 本报表按权限(101)控制展示 -->
    <div v-if="!isAllowed" class="not-allowed">
      <el-empty description="暂无权限查看该报表，如需要请与管理员联系"></el-empty>
    </div>

    <template v-else>
      <!-- 搜索栏 -->
      <div class="search-box">
        <div class="search-content">
          <div class="search-input">
            <span>统计月份</span>
            <el-date-picker
              v-model="timeRange"
              type="month"
              placeholder="选择月份"
              value-format="YYYY-MM"
              style="width:100%"
            ></el-date-picker>
          </div>
        </div>
        <div class="buttons">
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
        <div class="report-title">
          <div class="export-out-btn" @click="handleExport">
            <img src="@/assets/yonghu/icon1.3.png" alt="" />
            <span style="margin-left: 6px; color: #5a5a5a">导出</span>
          </div>
          <div class="title-text">
            <h2>{{ pageTitle }}</h2>
          </div>
        </div>
        <div class="yuangong-table">
          <el-table
            :data="tableData"
            style="width: 100%; border: 1px solid #e9e9e9"
            border
            :header-cell-style="{ height: '66px', background: '#46B97E', color: '#FFFFFF', fontWeight: 'bold', fontSize: '23px' }"
            :row-style="{ height: '56px' }"
            :cell-style="{ fontSize: '23px', textAlign: 'center' }"
            v-loading="loading"
          >
            <el-table-column prop="label" label="费用类型" align="center" min-width="150" />
            <el-table-column prop="recharge" label="实收扣款" align="center" min-width="120">
              <template #default="scope">{{ scope.row.recharge || 0 }}</template>
            </el-table-column>
            <el-table-column prop="prepaid" label="预存扣款" align="center" min-width="120">
              <template #default="scope">{{ scope.row.prepaid || 0 }}</template>
            </el-table-column>
            <el-table-column prop="total" label="合计金额" align="center" min-width="120">
              <template #default="scope">{{ scope.row.total || 0 }}</template>
            </el-table-column>
          </el-table>
        </div>
        <!-- 底部合计行 -->
        <el-table
          :data="[totalRow]"
          border
          style="width: 100%; margin-top: -1px"
          :show-header="false"
          row-class-name="summary-row"
          :cell-style="{ fontSize: '23px', textAlign: 'center' }"
        >
          <el-table-column prop="label" align="center" min-width="150" />
          <el-table-column prop="recharge" align="center" min-width="120">
            <template #default>{{ totalRow.recharge || 0 }}</template>
          </el-table-column>
          <el-table-column prop="prepaid" align="center" min-width="120">
            <template #default>{{ totalRow.prepaid || 0 }}</template>
          </el-table-column>
          <el-table-column prop="total" align="center" min-width="120">
            <template #default>{{ totalRow.total || 0 }}</template>
          </el-table-column>
        </el-table>
      </div>
    </template>

    <!-- 温馨提示弹窗 -->
    <div v-if="showTipDialog" class="tip-mask">
      <div class="tip-card">
        <div class="tip-card-head">
          <span class="tip-icon"><el-icon :size="45"><WarningFilled /></el-icon></span>
          <span class="tip-title">温馨提示</span>
        </div>
        <div class="tip-card-body">
          <p class="tip-desc">为保障数据准确，本报表仅支持查询 <b class="tip-highlight">2026年8月及以后</b> 的费用数据。</p>
          <p class="tip-desc">2026年7月及以前处于新旧系统切换期间，其数据格式与现行系统不一致，暂不支持在线查询 / 导出，敬请谅解。</p>
        </div>
        <div class="tip-card-foot">
          <div class="tip-confirm" @click="showTipDialog = false">我知道了</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import service from "@/api/request";
import { ElMessage } from "element-plus";

// 月实收报表查看权限 id
const TWO_FEE_REPORT_PERMISSION_ID = 101;
// 新系统上线时间：2026年8月起数据接入，早于该时间的数据不支持在线查询
const MIN_SUPPORT_YEAR = 2026;
const MIN_SUPPORT_MONTH = 8;

export default {
  name: "TwoFeeMonthlyReport",
  data() {
    return {
      timeRange: this.getCurrentMonth(),
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      staffPermissionIds: JSON.parse(sessionStorage.getItem("userData")).staffPermissionIds,
      loading: false,
      exporting: false,
      showTipDialog: false,
      reportSeq: 0,
      reportData: null,
      pageTitle: this.buildTitle(),
    };
  },
  computed: {
    isAllowed() {
      return (this.staffPermissionIds || []).includes(TWO_FEE_REPORT_PERMISSION_ID) && !!this.companyId;
    },
    // 3 行 × 3 列 矩阵（不含底部合计）
    tableData() {
      const d = this.reportData || {};
      return [
        { label: "水费", recharge: d.waterFeeRecharge, prepaid: d.waterFeePrepaid, total: d.waterFeeTotal },
        { label: "代收卫生费", recharge: d.additionFeeRecharge, prepaid: d.additionFeePrepaid, total: d.additionFeeTotal },
        { label: "代收污水处理费", recharge: d.sewageFeeRecharge, prepaid: d.sewageFeePrepaid, total: d.sewageFeeTotal },
      ];
    },
    // 底部合计行
    totalRow() {
      const d = this.reportData || {};
      return { label: "合计", recharge: d.totalRecharge, prepaid: d.totalPrepaid, total: d.totalAll };
    },
  },
  mounted() {
    if (this.isAllowed) {
      this.search();
    }
  },
  methods: {
    getCurrentMonth() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    },
    buildTitle(monthStr) {
      const value = monthStr || this.getCurrentMonth();
      const [year, month] = value.split("-");
      const base = "月实收报表";
      return year && month ? `${base}（${year}年${month}月）` : base;
    },
    // 月份前置校验：2026年7月及以前拒绝查询/导出，友好提示
    validateMonth() {
      if (!this.timeRange) {
        ElMessage.warning("请先选择统计月份");
        return "";
      }
      const [year, month] = this.timeRange.split("-");
      const reportYear = Number(year);
      const reportMonth = Number(month);
      if (reportYear < MIN_SUPPORT_YEAR || (reportYear === MIN_SUPPORT_YEAR && reportMonth < MIN_SUPPORT_MONTH)) {
        this.showTipDialog = true;
        return "";
      }
      return { reportYear, reportMonth };
    },
    search() {
      if (!this.isAllowed) {
        return;
      }
      const valid = this.validateMonth();
      if (!valid) {
        return;
      }
      this.pageTitle = this.buildTitle(this.timeRange);
      this.fetchReport(valid.reportYear, valid.reportMonth);
    },
    fetchReport(reportYear, reportMonth) {
      // 请求序号：多次快速搜索时，只有最后一次发起的请求才允许更新数据/结束loading
      const seq = ++this.reportSeq;
      this.loading = true;
      service
        .post("/twoFeeMonthlyReport", {
          companyId: this.companyId,
          reportYear,
          reportMonth,
        })
        .then((response) => {
          if (seq !== this.reportSeq) {
            return;
          }
          if (response.code === 200) {
            this.reportData = response.data || {};
          } else {
            ElMessage.error(response.msg || "查询失败");
          }
        })
        .catch((error) => {
          if (seq !== this.reportSeq) {
            return;
          }
          console.error(error);
          ElMessage.error("获取报表失败");
        })
        .finally(() => {
          if (seq === this.reportSeq) {
            this.loading = false;
          }
        });
    },
    async handleExport() {
      if (!this.isAllowed) {
        return;
      }
      const valid = this.validateMonth();
      if (!valid) {
        return;
      }
      this.exporting = true;
      let token = "";
      const userData = sessionStorage.getItem("userData");
      if (userData) {
        try {
          token = JSON.parse(userData).token;
        } catch (e) {}
      }
      try {
        const res = await service.post(
          "/exportTwoFeeMonthlyReport",
          {
            companyId: this.companyId,
            reportYear: valid.reportYear,
            reportMonth: valid.reportMonth,
          },
          {
            responseType: "blob",
            headers: { Authorization: token, token: token },
          }
        );
        const blob = new Blob([res.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `${this.pageTitle}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        ElMessage.success("导出成功");
      } catch (err) {
        ElMessage.error("导出失败");
        console.error(err);
      } finally {
        this.exporting = false;
      }
    },
    clear() {
      this.timeRange = this.getCurrentMonth();
      this.pageTitle = this.buildTitle();
      this.search();
    },
  },
};
</script>

<style scoped>
:deep(.el-input) {
  --el-color-primary: #46b97e;
}

:deep(.el-select) {
  --el-color-primary: #46b97e;
}

:deep(.el-select .el-select__wrapper) {
  height: 35px;
}

:deep(.el-input__inner) {
  font-size: 16px !important;
}

:deep(.el-date-editor .el-input__wrapper) {
  height: 35px;
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
  min-width: 180px;
  margin-right: 10px;
  height: 100%;
}

.search-input > span {
  font-size: 18px;
  margin-bottom: 5px;
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

.export-out-btn {
  display: flex;
  align-items: center;
  width: 70px;
  height: 32px;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 18px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
  padding: 0 8px;
}

.export-out-btn:hover {
  border-color: #45ba7e;
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

.report-title {
  display: flex;
  text-align: center;
  margin-top: 10px;
  margin-bottom: 12px;
  width: 100%;
}

.report-title h2 {
  font-size: 30px;
  color: #333;
  margin: 0;
  font-weight: 600;
}

.title-text {
  width: calc(100% - 70px);
}

.yuangong-table {
  width: 100%;
  flex-shrink: 0;
}

/* 隔行变色 */
:deep(.el-table__body tr:nth-child(odd)) {
  background-color: #edf8f2;
}

:deep(.el-table__body tr:nth-child(even)) {
  background-color: #ffffff;
}

:deep(.el-table__body tr:hover > td) {
  background-color: #fbf2cb !important;
}

/* 汇总行样式：绿色底色 + 白色加粗文字，与表头风格统一 */
:deep(.summary-row) {
  height: 58px !important;
  background-color: #46b97e !important;
}

:deep(.summary-row td) {
  font-weight: bold;
  color: #ffffff;
  font-size: 23px;
  text-align: center;
}

.not-allowed {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 温馨提示弹窗：固定定位遮罩，不改动 body，避免页面横向收缩 */
.tip-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
}

.tip-card {
  width: 735px;
  max-width: 94vw;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.24);
  padding: 33px 36px 30px;
  box-sizing: border-box;
}

.tip-card-head {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.tip-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 63px;
  height: 63px;
  border-radius: 50%;
  background: #fdf6ec;
  margin-right: 16px;
  color: #e6a23c;
}

.tip-title {
  font-size: 36px;
  font-weight: 600;
  color: #333;
}

.tip-card-body {
  padding-left: 80px;
}

.tip-desc {
  margin: 0 0 16px;
  font-size: 24px;
  line-height: 1.7;
  color: #555;
  text-align: left;
}

.tip-desc:last-child {
  margin-bottom: 0;
}

.tip-highlight {
  color: #e6a23c;
  font-weight: 600;
}

.tip-card-foot {
  margin-top: 30px;
  padding-left: 80px;
  text-align: right;
}

.tip-confirm {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 195px;
  height: 60px;
  padding: 0 36px;
  border-radius: 10px;
  font-size: 24px;
  color: #fff;
  background-color: #46b97e;
  cursor: pointer;
  transition: background-color 0.2s;
}

.tip-confirm:hover {
  background-color: #3aa86e;
}

/* 导出加载提示文字：放大为默认(14px)的1.5倍，其余样式保持默认 */
:deep(.export-loading .el-loading-text) {
  font-size: 21px;
}
</style>