<template>
  <div class="two-fee-region-report">
    <div v-if="!isAllowed" class="not-allowed">
      <el-empty description="暂无权限查看该报表，如需要请与管理员联系"></el-empty>
    </div>

    <template v-else>
    <div class="page-header">
      <div class="header-left">
        <h2>月度两费区域实收报表</h2>
        <div class="header-meta">
          <el-tag :type="dataSourceMeta.type" effect="dark" size="large">{{ dataSourceMeta.label }}</el-tag>
          <span class="meta-item">{{ periodLabel || "未选择月份" }}</span>
        </div>
      </div>

      <div class="header-actions">
        <el-date-picker
          v-model="timeRange"
          type="month"
          value-format="YYYY-MM"
          placeholder="选择月份"
          :disabled-date="disabledDate"
          :clearable="false"
          style="width: 160px"
          @change="search"
        />
        <el-button :loading="loading" @click="refresh">
          <el-icon v-if="!loading"><Refresh /></el-icon>
          <span class="btn-text">刷新</span>
        </el-button>
        <el-tooltip :disabled="!exportDisabled" :content="exportTooltip" placement="bottom">
          <span class="export-btn-wrap">
            <el-button type="primary" :loading="exporting" :disabled="exportDisabled" @click="handleExport">
              <el-icon v-if="!exporting"><Download /></el-icon>
              <span class="btn-text">导出 Excel</span>
            </el-button>
          </span>
        </el-tooltip>
      </div>
    </div>

    <div v-if="loading && !rawData" class="skeleton-wrap">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="rect" class="skeleton-summary" />
          <el-row :gutter="16" class="region-grid">
            <el-col v-for="n in 3" :key="n" :xs="24" :sm="24" :md="12" :lg="8" class="region-col">
              <el-skeleton-item variant="rect" class="skeleton-card" />
            </el-col>
          </el-row>
        </template>
      </el-skeleton>
    </div>

    <template v-else>
      <div v-if="!hasAnyData" class="empty-wrap">
        <el-empty description="该月份暂无两费数据" />
      </div>

      <div v-else class="report-body" v-loading="loading" element-loading-text="加载中...">
        <section class="summary-card">
          <div class="summary-head">
            <span class="summary-title">公司合计</span>
            <span class="summary-period">{{ periodLabel }}</span>
          </div>

          <div class="summary-body">
            <div class="kpi-group">
              <div class="kpi kpi-primary">
                <span class="kpi-label">总代收</span>
                <span class="kpi-value" :class="moneyClass(total.totalAll)">
                  {{ formatMoney(total.totalAll) }}<em>元</em>
                </span>
                <span class="kpi-desc">充值扣款 + 预存扣款</span>
              </div>
              <div class="kpi">
                <span class="kpi-label">充值扣款（实收②）</span>
                <span class="kpi-value" :class="moneyClass(total.totalRecharge)">
                  {{ formatMoney(total.totalRecharge) }}<em>元</em>
                </span>
                <span class="kpi-desc">含往月欠费补交</span>
              </div>
              <div class="kpi">
                <span class="kpi-label">预存扣款（实收①）</span>
                <span class="kpi-value" :class="moneyClass(total.totalPrepaid)">
                  {{ formatMoney(total.totalPrepaid) }}<em>元</em>
                </span>
                <span class="kpi-desc">预存账户实时扣减</span>
              </div>
            </div>

            <div class="fee-summary">
              <div class="fee-summary-item">
                <span>水费合计</span>
                <b :class="moneyClass(total.waterFeeTotal)">{{ formatMoney(total.waterFeeTotal) }} 元</b>
              </div>
              <div class="fee-summary-item">
                <span>卫生费合计</span>
                <b :class="moneyClass(total.additionFeeTotal)">{{ formatMoney(total.additionFeeTotal) }} 元</b>
              </div>
              <div class="fee-summary-item">
                <span>污水费合计</span>
                <b :class="moneyClass(total.sewageFeeTotal)">{{ formatMoney(total.sewageFeeTotal) }} 元</b>
              </div>
            </div>
          </div>
        </section>

        <el-alert
          v-if="isNoRegionData"
          class="no-region-alert"
          type="warning"
          :closable="false"
          show-icon
          title="该月份无区域快照，仅展示公司合计"
          description="历史月份未保存区域维度快照。为避免用户迁区导致历史数字漂移，系统不会实时回算区域数据。"
        />

        <div v-if="hasRegionData && regionList.length > 6" class="region-toolbar">
          <span class="region-count">共 {{ regionList.length }} 个区域</span>
          <el-input v-model="filterKeyword" class="region-filter" clearable placeholder="按区域名称筛选">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <el-row v-if="hasRegionData" :gutter="16" class="region-grid">
          <el-col
            v-for="region in filteredRegions"
            :key="region.regionId"
            :xs="24"
            :sm="24"
            :md="12"
            :lg="8"
            class="region-col"
          >
            <el-card
              :class="['region-card', { 'is-unassigned': isUnassigned(region) }]"
              shadow="hover"
            >
              <template #header>
                <div class="region-card-head">
                  <div class="region-name-wrap">
                    <el-tooltip
                      v-if="isUnassigned(region)"
                      content="用户区域缺失、区域已停用、跨公司或非远传表区域等无法归属到具体区域的数据"
                      placement="top"
                    >
                      <span class="region-name is-unassigned-name">
                        <el-icon><WarningFilled /></el-icon>
                        {{ region.regionName || "未分配/其他" }}
                      </span>
                    </el-tooltip>
                    <span
                      v-else
                      class="region-name"
                      title="点击复制区域名称"
                      @click="copyRegionName(region)"
                    >{{ region.regionName }}</span>
                  </div>
                  <span class="region-total" :class="moneyClass(region.totalAll)">
                    {{ formatMoney(region.totalAll) }}<em>元</em>
                  </span>
                </div>
              </template>

              <div class="unit-hint">金额单位：元</div>
              <table class="fee-table">
                <thead>
                  <tr>
                    <th class="col-name">费用类型</th>
                    <th>充值扣款<small>实收②</small></th>
                    <th>预存扣款<small>实收①</small></th>
                    <th class="col-total">合计</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in feeRows(region)" :key="row.label">
                    <td class="col-name">{{ row.label }}</td>
                    <td class="num" :class="moneyClass(row.recharge)">{{ formatMoney(row.recharge) }}</td>
                    <td class="num" :class="moneyClass(row.prepaid)">{{ formatMoney(row.prepaid) }}</td>
                    <td class="num col-total" :class="moneyClass(row.total)">{{ formatMoney(row.total) }}</td>
                  </tr>
                  <tr class="total-row">
                    <td class="col-name">合计</td>
                    <td class="num" :class="moneyClass(region.totalRecharge)">{{ formatMoney(region.totalRecharge) }}</td>
                    <td class="num" :class="moneyClass(region.totalPrepaid)">{{ formatMoney(region.totalPrepaid) }}</td>
                    <td class="num col-total" :class="moneyClass(region.totalAll)">{{ formatMoney(region.totalAll) }}</td>
                  </tr>
                </tbody>
              </table>
            </el-card>
          </el-col>
        </el-row>

        <div v-if="hasRegionData && filteredRegions.length === 0" class="empty-wrap">
          <el-empty description="没有匹配的区域，请调整筛选关键字" :image-size="90" />
        </div>

        <el-empty
          v-if="!isNoRegionData && !hasRegionData"
          description="该月份暂无区域数据"
          :image-size="90"
        />
      </div>
    </template>
    </template>

    <div v-if="showTipDialog" class="tip-mask">
      <div class="tip-card">
        <div class="tip-card-head">
          <span class="tip-icon"><el-icon :size="45"><WarningFilled /></el-icon></span>
          <span class="tip-title">温馨提示</span>
        </div>
        <div class="tip-card-body">
          <p class="tip-desc">为保障数据准确，本报表仅支持查询 <b class="tip-highlight">{{ minSupportYear }}年{{ minSupportMonth }}月及以后</b> 的费用数据。</p>
          <p class="tip-desc">{{ minSupportYear }}年{{ minSupportMonth - 1 }}月及以前处于新旧系统切换期间，其数据格式与现行系统不一致，暂不支持在线查询 / 导出，敬请谅解。</p>
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

const DATA_SOURCE_META = {
  SNAPSHOT: { label: "月结快照", type: "info" },
  LIVE: { label: "当月实时", type: "success" },
  NO_REGION_DATA: { label: "仅公司合计", type: "warning" },
};

// 区域实收报表查看权限 id
const REGION_REPORT_PERMISSION_ID = 115;
// 95号水厂公司id
const COMPANY_95_ID = 95;
// 新系统上线时间：95号水厂2026年8月起数据接入，其余水厂2026年9月起，早于对应时间的数据不支持在线查询
const MIN_SUPPORT_YEAR = 2026;
const OTHER_PLANT_MIN_SUPPORT_MONTH = 9;
const COMPANY95_MIN_SUPPORT_MONTH = 8;

export default {
  name: "TwoFeeMonthlyRegionReport",
  data() {
    const userData = this.readUserData();
    return {
      timeRange: this.getCurrentMonth(),
      companyId: userData.companyId,
      staffPermissionIds: userData.staffPermissionIds,
      loading: true,
      exporting: false,
      showTipDialog: false,
      reportSeq: 0,
      rawData: null,
      filterKeyword: "",
    };
  },
  computed: {
    isAllowed() {
      return (this.staffPermissionIds || []).includes(REGION_REPORT_PERMISSION_ID) && !!this.companyId;
    },
    // 当前水厂支持查询的最早月份
    minSupportYear() {
      return MIN_SUPPORT_YEAR;
    },
    minSupportMonth() {
      return Number(this.companyId) === COMPANY_95_ID ? COMPANY95_MIN_SUPPORT_MONTH : OTHER_PLANT_MIN_SUPPORT_MONTH;
    },
    periodLabel() {
      if (!this.timeRange) return "";
      const [year, month] = this.timeRange.split("-");
      return year && month ? `${year}年${month}月` : this.timeRange;
    },
    dataSource() {
      return this.rawData?.dataSource || "";
    },
    dataSourceMeta() {
      return DATA_SOURCE_META[this.dataSource] || { label: "未知来源", type: "info" };
    },
    isNoRegionData() {
      return this.dataSource === "NO_REGION_DATA";
    },
    regionList() {
      const list = Array.isArray(this.rawData?.regionList) ? this.rawData.regionList : [];
      // 后端约定 regionId=0 在最后，这里兜底排序，避免"未分配"混在中间
      return [...list].sort((a, b) => (this.isUnassigned(a) ? 1 : 0) - (this.isUnassigned(b) ? 1 : 0));
    },
    total() {
      return this.rawData?.total || {};
    },
    hasRegionData() {
      return !this.isNoRegionData && this.regionList.length > 0;
    },
    filteredRegions() {
      const keyword = this.filterKeyword.trim();
      if (!keyword) return this.regionList;
      return this.regionList.filter((item) => (item.regionName || "").includes(keyword));
    },
    hasAnyData() {
      return !!this.rawData && (!!this.rawData.total || this.regionList.length > 0);
    },
    exportDisabled() {
      return this.isNoRegionData || !this.rawData;
    },
    exportTooltip() {
      if (this.isNoRegionData) return "该月份无区域快照，无法导出区域明细";
      if (!this.rawData) return "暂无数据可导出";
      return "";
    },
  },
  mounted() {
    if (this.isAllowed) {
      this.search();
    }
  },
  methods: {
    readUserData() {
      try {
        return JSON.parse(sessionStorage.getItem("userData")) || {};
      } catch (e) {
        return {};
      }
    },
    getCurrentMonth() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    },
    parseMonth() {
      if (!this.timeRange) {
        ElMessage.warning("请先选择统计月份");
        return null;
      }
      const [year, month] = this.timeRange.split("-");
      const reportYear = Number(year);
      const reportMonth = Number(month);
      if (!reportYear || !reportMonth) {
        ElMessage.warning("请先选择统计月份");
        return null;
      }
      // 早于当前水厂支持的最早月份，拒绝查询/导出并友好提示
      if (
        reportYear < this.minSupportYear ||
        (reportYear === this.minSupportYear && reportMonth < this.minSupportMonth)
      ) {
        this.showTipDialog = true;
        return null;
      }
      return { reportYear, reportMonth };
    },
    // 日期选择器：早于当前水厂支持的最早月份的选项置灰不可选
    disabledDate(date) {
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      return y < this.minSupportYear || (y === this.minSupportYear && m < this.minSupportMonth);
    },
    search() {
      if (!this.isAllowed) {
        return;
      }
      const valid = this.parseMonth();
      if (!valid) {
        this.loading = false;
        return;
      }
      this.fetchReport(valid);
    },
    isUnassigned(region) {
      return Number(region?.regionId) === 0;
    },
    refresh() {
      this.search();
    },
    fetchReport({ reportYear, reportMonth }) {
      const seq = ++this.reportSeq;
      this.loading = true;
      service
        .post("/twoFeeMonthlyRegionReport", {
          companyId: this.companyId,
          reportYear,
          reportMonth,
        })
        .then((res) => {
          if (seq !== this.reportSeq) return;
          if (res.code === 200) {
            this.rawData = res.data || null;
            this.filterKeyword = "";
          } else {
            ElMessage.error(res.msg || "查询失败");
          }
        })
        .catch((error) => {
          if (seq !== this.reportSeq) return;
          console.error(error);
          this.rawData = null;
          ElMessage.error("获取报表失败");
        })
        .finally(() => {
          if (seq === this.reportSeq) {
            this.loading = false;
          }
        });
    },
    feeRows(region) {
      return [
        {
          label: "水费",
          recharge: region.waterFeeRecharge,
          prepaid: region.waterFeePrepaid,
          total: region.waterFeeTotal,
        },
        {
          label: "卫生费",
          recharge: region.additionFeeRecharge,
          prepaid: region.additionFeePrepaid,
          total: region.additionFeeTotal,
        },
        {
          label: "污水费",
          recharge: region.sewageFeeRecharge,
          prepaid: region.sewageFeePrepaid,
          total: region.sewageFeeTotal,
        },
      ];
    },
    formatMoney(value) {
      return Number(value || 0).toLocaleString("zh-CN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    },
    moneyClass(value) {
      return Number(value) < 0 ? "is-negative" : "";
    },
    copyRegionName(region) {
      if (!region || this.isUnassigned(region) || !region.regionName) return;
      const name = region.regionName;
      const done = () => ElMessage.success("区域名称已复制");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(name).then(done).catch(() => this.fallbackCopy(name, done));
      } else {
        this.fallbackCopy(name, done);
      }
    },
    fallbackCopy(text, done) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        done();
      } catch (e) {
        ElMessage.error("复制失败");
      }
      textarea.remove();
    },
    getContentType(headers) {
      const value = headers?.["content-type"] || (headers?.get ? headers.get("content-type") : "");
      return String(value || "").toLowerCase();
    },
    isJsonContentType(contentType) {
      if (!contentType) return false;
      return (
        contentType.includes("application/json") ||
        contentType.includes("text/plain") ||
        contentType.includes("text/html")
      );
    },
    async readBlobMessage(blob) {
      if (!(blob instanceof Blob)) return "";
      try {
        const parsed = JSON.parse(await blob.text());
        return parsed?.msg || "";
      } catch (e) {
        return "";
      }
    },
    downloadBlob(blob) {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `月度两费区域实收报表（${this.timeRange}）.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    async handleExport() {
      if (!this.isAllowed || this.exportDisabled) return;
      const valid = this.parseMonth();
      if (!valid) return;
      this.exporting = true;
      try {
        const res = await service.post(
          "/exportTwoFeeMonthlyRegionReport",
          {
            companyId: this.companyId,
            reportYear: valid.reportYear,
            reportMonth: valid.reportMonth,
          },
          { responseType: "blob" }
        );
        await this.handleExportResponse(res);
      } catch (error) {
        const handled = await this.handleExportError(error);
        if (!handled) {
          console.error(error);
          ElMessage.error("导出失败");
        }
      } finally {
        this.exporting = false;
      }
    },
    async handleExportResponse(res) {
      const contentType = this.getContentType(res?.headers);
      const blob = res?.data;

      // 后端失败时可能返回 200 + JSON，必须先识别，避免下载损坏文件
      if (this.isJsonContentType(contentType)) {
        const msg = await this.readBlobMessage(blob);
        ElMessage.error(msg || "导出失败");
        return;
      }

      if (!(blob instanceof Blob) || blob.size === 0) {
        ElMessage.warning("导出内容为空，无法下载");
        return;
      }

      this.downloadBlob(blob);
      ElMessage.success("导出成功");
    },
    async handleExportError(error) {
      const response = error?.response;
      if (!response) return false;
      const contentType = this.getContentType(response.headers);
      if (!(response.data instanceof Blob)) return false;
      if (contentType && !this.isJsonContentType(contentType)) return false;
      const msg = await this.readBlobMessage(response.data);
      if (!msg) return false;
      ElMessage.error(msg);
      return true;
    },
  },
};
</script>

<style scoped>
.two-fee-region-report {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
  min-width: 94%;
  padding: 0 15px;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin: 5px 0 10px;
  padding: 14px 18px;
  width: 99.3%;
  box-sizing: border-box;
  border: 1px solid #e9e9e9;
  border-radius: 8px;
  background: #fff;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-header h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 600;
  color: #2b2b2b;
}

.header-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
}

.meta-item {
  font-size: 16px;
  color: #666;
}

.header-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.export-btn-wrap {
  display: inline-flex;
}

.btn-text {
  margin-left: 4px;
}

.report-body {
  flex: 1;
  min-height: 0;
  width: 99.3%;
  overflow-y: auto;
  padding-bottom: 16px;
  box-sizing: border-box;
}

.summary-card {
  margin-bottom: 14px;
  padding: 16px 20px;
  border: 1px solid #d5f0e3;
  border-radius: 10px;
  background: linear-gradient(135deg, #eaf9f1 0%, #f7fdf9 55%, #ffffff 100%);
  box-shadow: 0 2px 10px rgba(70, 185, 126, 0.08);
}

.summary-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 12px;
}

.summary-title {
  font-size: 20px;
  font-weight: 600;
  color: #2b2b2b;
}

.summary-title::before {
  content: "";
  display: inline-block;
  width: 4px;
  height: 18px;
  margin-right: 8px;
  border-radius: 2px;
  background: #46b97e;
  vertical-align: -3px;
}

.summary-period {
  font-size: 15px;
  color: #888;
}

.summary-body {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 18px 28px;
}

.kpi-group {
  flex: 1 1 560px;
  display: flex;
  gap: 14px;
}

.kpi {
  flex: 1;
  min-width: 150px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 16px;
  border: 1px solid #e6f5ee;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.75);
}

.kpi-primary {
  border-color: #bfe9d4;
  background: #fff;
  box-shadow: 0 2px 8px rgba(70, 185, 126, 0.12);
}

.kpi-label {
  font-size: 15px;
  color: #5a6a62;
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
  color: #1f2d27;
  font-variant-numeric: tabular-nums;
}

.kpi-value em {
  margin-left: 4px;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  color: #8a9a92;
}

.kpi-desc {
  font-size: 13px;
  color: #98a8a0;
}

.fee-summary {
  flex: 0 1 320px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 4px 0 4px 8px;
  border-left: 1px dashed #cfe9dd;
}

.fee-summary-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 15px;
  color: #5a6a62;
}

.fee-summary-item b {
  color: #1f2d27;
  font-variant-numeric: tabular-nums;
}

.no-region-alert {
  margin-bottom: 14px;
}

.region-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.region-count {
  font-size: 16px;
  color: #666;
}

.region-filter {
  width: 240px;
}

.region-grid {
  row-gap: 0;
}

.region-col {
  margin-bottom: 16px;
}

.region-card {
  border: 1px solid #e6f0eb;
  border-radius: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.region-card:hover {
  transform: translateY(-2px);
}

.region-card.is-unassigned {
  border: 2px solid #f0c36d;
  background: #fffbf0;
}

:deep(.region-card .el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid #edf5f1;
}

:deep(.region-card .el-card__body) {
  padding: 12px 16px 14px;
}

.region-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.region-name-wrap {
  display: flex;
  align-items: center;
  min-width: 0;
}

.region-name {
  overflow: hidden;
  font-size: 19px;
  font-weight: 600;
  color: #26332d;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
}

.region-name:hover {
  color: #46b97e;
}

.is-unassigned-name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #b07818;
  cursor: default;
}

.is-unassigned-name:hover {
  color: #b07818;
}

.region-total {
  flex-shrink: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f8a5b;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.region-total em {
  margin-left: 2px;
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  color: #8a9a92;
}

.unit-hint {
  margin-bottom: 4px;
  font-size: 12px;
  color: #9aa8a1;
  text-align: right;
}

.fee-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.fee-table th,
.fee-table td {
  padding: 8px 6px;
  font-size: 15px;
  text-align: center;
  border-bottom: 1px solid #eef4f1;
}

.fee-table th {
  font-weight: 600;
  color: #4b5a53;
  background: #f4faf7;
}

.fee-table th small {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  font-weight: 400;
  color: #95a39c;
}

.fee-table td.num {
  color: #2b3a33;
  font-variant-numeric: tabular-nums;
}

.fee-table .col-name {
  width: 22%;
  padding-left: 10px;
  font-weight: 500;
  color: #5a6a62;
  text-align: left;
}

.fee-table .col-total {
  font-weight: 600;
}

.fee-table tbody tr:last-child td {
  border-bottom: none;
}

.fee-table .total-row td {
  font-weight: 700;
  color: #1f2d27;
  background: #eaf9f1;
  border-top: 2px solid #46b97e;
}

.is-negative {
  color: #f56c6c !important;
}

.empty-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}

.skeleton-wrap {
  flex: 1;
  width: 99.3%;
  box-sizing: border-box;
}

.skeleton-summary {
  width: 100%;
  height: 130px;
  margin-bottom: 16px;
  border-radius: 10px;
}

.skeleton-card {
  width: 100%;
  height: 260px;
  border-radius: 10px;
}

:deep(.el-date-editor.el-input) {
  --el-color-primary: #46b97e;
}

:deep(.el-input__inner) {
  font-size: 16px !important;
}

:deep(.el-button) {
  font-size: 16px;
}

@media (min-width: 1600px) {
  .region-grid > .region-col {
    flex: 0 0 33.3333%;
    max-width: 33.3333%;
  }
}

@media (min-width: 1200px) and (max-width: 1599.98px) {
  .region-grid > .region-col {
    flex: 0 0 50%;
    max-width: 50%;
  }

  .fee-summary {
    flex-basis: 100%;
    flex-direction: row;
    justify-content: space-between;
    padding: 8px 0 0;
    border-top: 1px dashed #cfe9dd;
    border-left: none;
  }

  .fee-summary-item {
    flex-direction: column;
    gap: 2px;
  }
}

@media (max-width: 1199.98px) {
  .region-grid > .region-col {
    flex: 0 0 100%;
    max-width: 100%;
  }

  .fee-summary {
    flex-basis: 100%;
    flex-direction: row;
    justify-content: space-between;
    padding: 8px 0 0;
    border-top: 1px dashed #cfe9dd;
    border-left: none;
  }

  .fee-summary-item {
    flex-direction: column;
    gap: 2px;
  }
}

@media (max-width: 900px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: flex-start;
  }

  .kpi-group {
    flex-wrap: wrap;
  }
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
</style>
