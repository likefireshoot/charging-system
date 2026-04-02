<template>
  <div class="baobiao-container">
    <div class="search-box">
      <div class="search-content">
        <div class="search-input" style="margin-left: 10px" v-if="companyId === 1">
          <span>所属水厂</span>
          <el-select class="big-font-el-select" v-model="params.company" clearable placeholder="请选择所属水厂">
            <el-option v-for="item in companyList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>区域</span>
          <el-select class="big-font-el-select" v-model="params.region" clearable filterable placeholder="请选择区域">
            <el-option v-for="item in quyu_data" :key="item.id" :label="item.label" :value="item.label"></el-option>
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 20px">
          <span>时间范围</span>
          <el-date-picker
            v-model="params.monthRange"
            type="monthrange"
            range-separator="至"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            style="flex-grow: 0; width: 100%; height: 35px"
            format="YYYY-MM"
            value-format="YYYY-MM"
          />
        </div>
        <div class="search-input" style="margin-left: 20px">
          <span>收费人</span>
          <el-select v-model="params.rechargeUser" clearable filterable placeholder="请选择收费人">
            <el-option v-for="item in staffNameOptions" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </div>
      </div>
      <div class="buttons">
        <div class="sercah-btn" @click="getTradeData">
          <img src="@/assets/baobiao/icon6.png" alt="" style="margin-left: 10px" />
          <span style="font-size: 20px; margin-left: 15%">搜索</span>
        </div>
        <div class="clear-btn" @click="clear">
          <img src="@/assets/baobiao/icon5.png" alt="" style="margin-left: 10px" />
          <span style="font-size: 20px; margin-left: 15%; color: #5a5a5a">清空</span>
        </div>
      </div>
    </div>
    <div class="baobiao-info">
      <div class="baobiao-list">
        <div class="total-info">
          <div class="detail-info">
            <span>当前范围交易总额</span>
            <div class="message">
              <span style="font-size: 24px; margin-bottom: 20px; font-family: 'Microsoft YaHei'; font-weight: bold">{{ trade_data.totalMoney }}</span>
              <span style="margin-bottom: 20px">元</span>
            </div>
            <span>交易笔数</span>
            <div class="message">
              <span style="font-size: 24px; margin-bottom: 20px">{{ trade_data.totalNumber }}</span>
              <span style="margin-bottom: 20px; font-family: 'Microsoft YaHei'">笔</span>
            </div>
          </div>
          <img src="@/assets/baobiao/icon1.png" alt="" style="width: 60px; height: 60px; margin-right: 60px" />
        </div>
        <div class="cash-info">
          <div class="cashdetail-info">
            <span>当前范围现金交易总额</span>
            <div class="message">
              <span style="font-size: 24px; margin-bottom: 20px; font-family: 'Microsoft YaHei'; font-weight: bold">{{ trade_data.cashMoney }}</span>
              <span style="margin-bottom: 20px">元</span>
            </div>
            <span>交易笔数</span>
            <div class="message">
              <span style="font-size: 24px; margin-bottom: 20px">{{ trade_data.cashNumber }}</span>
              <span style="margin-bottom: 20px; font-family: 'Microsoft YaHei'">笔</span>
            </div>
          </div>
          <img src="@/assets/baobiao/icon2.png" alt="" style="width: 60px; height: 60px; margin-right: 60px" />
        </div>
        <div class="weichat-info">
          <div class="weichatdetail-info">
            <span>当前范围微信支付总额</span>
            <div class="message">
              <span style="font-size: 24px; margin-bottom: 20px; font-family: 'Microsoft YaHei'; font-weight: bold">{{ trade_data.weChatMoney }}</span>
              <span style="margin-bottom: 20px; font-family: 'Microsoft YaHei'">元</span>
            </div>
            <span>交易笔数</span>
            <div class="message">
              <span style="font-size: 24px; margin-bottom: 20px">{{ trade_data.weChatNumber }}</span>
              <span style="margin-bottom: 20px">笔</span>
            </div>
          </div>
          <img src="@/assets/baobiao/icon4.png" alt="" style="width: 60px; height: 60px; margin-right: 60px" />
        </div>
        <div class="alipay-info">
          <div class="alipaydetail-info">
            <span>当前范围支付宝交易总额</span>
            <div class="message">
              <span style="font-size: 24px; margin-bottom: 20px; font-family: 'Microsoft YaHei'; font-weight: bold">{{ trade_data.alipayMoney }}</span>
              <span style="margin-bottom: 20px">元</span>
            </div>
            <span>交易笔数</span>
            <div class="message">
              <span style="font-size: 24px; margin-bottom: 20px">{{ trade_data.alipayNumber }}</span>
              <span style="margin-bottom: 20px; font-family: 'Microsoft YaHei'">笔</span>
            </div>
          </div>
          <img src="@/assets/baobiao/icon3.png" alt="" style="width: 60px; height: 60px; margin-right: 60px" />
        </div>
      </div>
      <div class="baobiao-chart">
        <div class="year-report">
          <div class="year-report-title">
            <span style="font-size: 20px; margin-top: 10px; margin-bottom: 5px">
              收费统计（{{ monthRangeText }}）
              <a href="javascript:;" style="font-size: 20px; margin-left: 0; color: #000" @click="exportChartExcel(yearchart, '收费统计')">(导出)</a>
            </span>
            <div class="flex-container">
              <div style="width: 4px; height: 4px; background-color: #46b87d; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #90d5b2; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #c7ead7; margin-right: 5px"></div>
              <div style="width: 100%; height: 1px; background-color: #e9e9e9"></div>
            </div>
            <div class="year-report-chart" id="year"></div>
          </div>
        </div>
        <div class="year-huanbi">
          <div class="year-huanbi-title">
            <span style="font-size: 20px; margin-top: 10px; margin-bottom: 5px">
              收费同比统计（{{ monthRangeText }}）
              <a href="javascript:;" style="font-size: 20px; margin-left: 0; color: #000" @click="exportChartExcel(yearhuanbichart, '收费同比统计')">(导出)</a>
            </span>
            <div class="flex-container">
              <div style="width: 4px; height: 4px; background-color: #46b87d; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #90d5b2; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #c7ead7; margin-right: 5px"></div>
              <div style="width: 100%; height: 1px; background-color: #e9e9e9"></div>
            </div>
            <div class="year-huanbi-chart" id="year-huanbi"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import { markRaw } from "vue";
import service from "@/api/request";
import { ElMessage } from "element-plus";
import { exportChartExcel } from "@/api/otherapi/other.js";

const pad = (value) => String(value).padStart(2, "0");

const createMonthDate = (year, month) => new Date(year, month - 1, 1);

const parseMonth = (value) => {
  if (!value) {
    return null;
  }
  const [year, month] = value.split("-").map(Number);
  return createMonthDate(year, month);
};

const formatMonth = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

const addYearsToMonth = (value, years) => {
  const date = parseMonth(value);
  if (!date) {
    return "";
  }
  date.setFullYear(date.getFullYear() + years);
  return formatMonth(date);
};

const getCurrentYearMonthRange = () => {
  const now = new Date();
  return [`${now.getFullYear()}-01`, `${now.getFullYear()}-${pad(now.getMonth() + 1)}`];
};

const createTradeData = () => ({
  totalMoney: "0",
  totalNumber: "0",
  cashMoney: "0",
  cashNumber: "0",
  weChatMoney: "0",
  weChatNumber: "0",
  alipayMoney: "0",
  alipayNumber: "0",
});

const normalizeList = (list) => (Array.isArray(list) ? list : []);

const toAmountList = (list) => list.map((item) => Number(item.totalMoney || 0));

const toMonthAxis = (list) => list.map((item) => (item.reportTimeStart || "").slice(0, 7));

export default {
  data() {
    return {
      params: {
        region: "",
        monthRange: getCurrentYearMonthRange(),
        company: null,
        rechargeUser: "",
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      companyList: [],
      quyu_data: [],
      staffNameOptions: [],
      trade_data: createTradeData(),
      yearchart: null,
      yearchart_option: {
        grid: {
          left: "6%",
          right: "5%",
          top: "9%",
          bottom: "13%",
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: [],
        },
        yAxis: {
          type: "value",
          splitLine: {
            show: true,
            lineStyle: {
              type: "dashed",
              color: "#ccc",
            },
          },
        },
        tooltip: {
          trigger: "item",
          formatter(params) {
            return `${params.name}: ${params.value}`;
          },
        },
        series: [
          {
            data: [],
            type: "line",
            smooth: true,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(75,187,129, 0.8)" },
                { offset: 1, color: "rgba(75,187,129, 0.1)" },
              ]),
            },
            symbol: "circle",
            symbolSize: 8,
            itemStyle: {
              color: "#fff",
              borderColor: "#4BBB81",
              borderWidth: 3,
            },
            lineStyle: {
              color: "rgba(75,187,129, 1)",
            },
          },
        ],
        label: {
          show: true,
          position: "top",
          color: "#333",
          fontSize: 12,
        },
      },
      yearchartResizeObserver: null,
      yearhuanbichart: null,
      yearhuanbichart_option: {
        legend: {
          data: [],
          right: 10,
          top: 0,
        },
        grid: {
          left: "6%",
          right: "5%",
          top: "13%",
          bottom: "13%",
        },
        xAxis: {
          type: "category",
          data: [],
        },
        yAxis: {
          type: "value",
          splitLine: {
            show: true,
            lineStyle: {
              type: "dashed",
              color: "#ccc",
            },
          },
        },
        series: [
          {
            name: "",
            data: [],
            type: "bar",
            barWidth: "25%",
            itemStyle: {
              color: "#46B97E",
              borderRadius: [5, 5, 5, 5],
            },
            label: {
              show: true,
              position: "top",
              color: "#575757",
              fontSize: 10,
            },
          },
          {
            name: "",
            data: [],
            type: "bar",
            barWidth: "25%",
            itemStyle: {
              color: "#F3D04E",
              borderRadius: [5, 5, 5, 5],
            },
            label: {
              show: true,
              position: "top",
              color: "#575757",
              fontSize: 10,
            },
          },
        ],
      },
      yearhuanbichartResizeObserver: null,
    };
  },
  computed: {
    monthRangeText() {
      const [startMonth, endMonth] = this.params.monthRange || [];
      return startMonth && endMonth ? `${startMonth} ~ ${endMonth}` : "";
    },
  },
  watch: {
    "params.company"() {
      this.params.region = "";
      this.getRegionData();
    },
  },
  mounted() {
    this.getCompanyList();
    this.getRegionData();
    this.getStaffNames();
    this.getTradeData();
  },
  beforeUnmount() {
    this.disposeCharts();
  },
  methods: {
    exportChartExcel,
    debounce(func, delay) {
      let timer = null;
      return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timer);
        timer = setTimeout(() => {
          func.apply(context, args);
        }, delay);
      };
    },
    getEffectiveCompanyId() {
      if (this.companyId === 1) {
        return this.params.company || "";
      }
      return this.companyId;
    },
    getStaffNames() {
      service
        .get("/staff/getStaffNames")
        .then((response) => {
          if (response.code === 200) {
            this.staffNameOptions = [...new Set((response.data || []).filter(Boolean))];
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch(() => {
          ElMessage.error("获取收费人列表失败");
        });
    },
    yearChart() {
      const chartDom = document.getElementById("year");
      if (!chartDom) {
        return;
      }
      this.yearchart = markRaw(echarts.init(chartDom));
      this.yearchart.setOption(this.yearchart_option);
      this.yearchartResizeObserver = new ResizeObserver(
        this.debounce(() => {
          if (this.yearchart) {
            this.yearchart.resize();
          }
        }, 200)
      );
      this.yearchartResizeObserver.observe(chartDom);
    },
    yearHuanbiChart() {
      const chartDom = document.getElementById("year-huanbi");
      if (!chartDom) {
        return;
      }
      this.yearhuanbichart = markRaw(echarts.init(chartDom));
      this.yearhuanbichart.setOption(this.yearhuanbichart_option);
      this.yearhuanbichartResizeObserver = new ResizeObserver(
        this.debounce(() => {
          if (this.yearhuanbichart) {
            this.yearhuanbichart.resize();
          }
        }, 200)
      );
      this.yearhuanbichartResizeObserver.observe(chartDom);
    },
    disposeCharts() {
      if (this.yearchartResizeObserver) {
        this.yearchartResizeObserver.disconnect();
        this.yearchartResizeObserver = null;
      }
      if (this.yearchart) {
        this.yearchart.dispose();
        this.yearchart = null;
      }
      if (this.yearhuanbichartResizeObserver) {
        this.yearhuanbichartResizeObserver.disconnect();
        this.yearhuanbichartResizeObserver = null;
      }
      if (this.yearhuanbichart) {
        this.yearhuanbichart.dispose();
        this.yearhuanbichart = null;
      }
    },
    renderCharts() {
      this.disposeCharts();
      this.$nextTick(() => {
        this.yearChart();
        this.yearHuanbiChart();
      });
    },
    getCompanyList() {
      service
        .get("/getAllUnblockCompany")
        .then((response) => {
          if (response.code === 200) {
            this.companyList = response.data.map((item) => ({
              id: item.companyId,
              name: item.companyName,
            }));
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    getRegionData() {
      const url = this.companyId === 1 ? (this.params.company ? `/getRegion?companyId=${this.params.company}` : "/getRegion") : `/getRegion?companyId=${this.companyId}`;
      service
        .get(url)
        .then((response) => {
          if (response.code === 200) {
            this.quyu_data = response.data.map((item) => ({
              id: item.regionId,
              value: item.regionId,
              label: item.regionName,
            }));
          }
        })
        .catch(() => {
          ElMessage.error("获取区域数据失败");
        });
    },
    getTradeData() {
      const [startMonth, endMonth] = this.params.monthRange || [];
      if (!startMonth || !endMonth) {
        ElMessage.warning("请选择时间范围");
        return;
      }
      const query = new URLSearchParams({
        region: this.params.region || "",
        startTime: `${startMonth}-01`,
        endTime: `${endMonth}-01`,
        companyId: this.getEffectiveCompanyId(),
        rechargeUser: this.params.rechargeUser || "",
      }).toString();
      service
        .get(`/yearReportV2?${query}`)
        .then((response) => {
          if (response.code !== 200) {
            ElMessage.error(response.msg);
            return;
          }

          const currentList = normalizeList(response.data.currentSingularReport);
          const tongbiList = normalizeList(response.data.tsingularReports);
          const currentLabel = `${startMonth} ~ ${endMonth}`;
          const tongbiLabel = `${addYearsToMonth(startMonth, -1)} ~ ${addYearsToMonth(endMonth, -1)}`;

          this.trade_data = response.data.currentDurationReport || createTradeData();

          this.yearchart_option.xAxis.data = toMonthAxis(currentList);
          this.yearchart_option.series[0].data = toAmountList(currentList);

          this.yearhuanbichart_option.xAxis.data = toMonthAxis(currentList);
          this.yearhuanbichart_option.legend.data = [tongbiLabel, currentLabel];
          this.yearhuanbichart_option.series[0].name = tongbiLabel;
          this.yearhuanbichart_option.series[0].data = toAmountList(tongbiList);
          this.yearhuanbichart_option.series[1].name = currentLabel;
          this.yearhuanbichart_option.series[1].data = toAmountList(currentList);

          this.renderCharts();
        })
        .catch((error) => {
          console.error(error);
        });
    },
    clear() {
      this.params.region = "";
      this.params.monthRange = getCurrentYearMonthRange();
      this.params.company = null;
      this.params.rechargeUser = "";
      this.getRegionData();
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
  --el-text-color-primary: #46b97e;
}

:deep(.el-select .el-select__wrapper) {
  height: 35px;
}

:deep(.el-select-dropdown__item.selected) {
  color: #46b97e;
}

:deep(.el-pagination) {
  --el-color-primary: #46b97e;
}

.baobiao-container {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  width: 100%;
  height: 98%;
  padding: 0 20px;
}

.baobiao-container > * {
  width: 99.3%;
}

.search-box {
  margin-top: 15px;
  margin-bottom: 20px;
  width: 100%;
  min-height: 98px;
  height: auto;
  padding: 12px 0;
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
  width: calc(100% - 240px);
  min-height: 100%;
}

.search-input {
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 18%;
  min-width: 180px;
  height: auto;
  margin-right: 20px;
  margin-bottom: 10px;
}

.search-input > span {
  font-size: 20px;
  margin-bottom: 5px;
}

.buttons {
  display: flex;
  width: 240px;
  height: 100%;
  align-items: center;
  margin-right: 30px;
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

.baobiao-info {
  width: 100%;
  height: calc(100% - 98px);
  display: flex;
}

.baobiao-list {
  width: 340px;
  height: 100%;
  margin-right: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.total-info,
.cash-info,
.weichat-info,
.alipay-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #46b97e;
  border: 1px solid #e9e9e9;
  border-radius: 8px;
  width: 100%;
  height: 23%;
}

.cash-info,
.weichat-info,
.alipay-info {
  background-color: #fff;
}

.detail-info,
.cashdetail-info,
.weichatdetail-info,
.alipaydetail-info {
  display: flex;
  flex-direction: column;
  margin-left: 20px;
}

.detail-info > span {
  font-size: 22px;
  color: #fff;
}

.cashdetail-info > span,
.weichatdetail-info > span,
.alipaydetail-info > span {
  font-size: 22px;
  color: #000;
}

.detail-info > .message > span {
  color: #fff;
}

.cashdetail-info > .message > span,
.weichatdetail-info > .message > span,
.alipaydetail-info > .message > span {
  color: #000;
}

.baobiao-chart {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  height: 100%;
  flex-grow: 1;
}

.year-report,
.year-huanbi,
.year-tongbi {
  background-color: #fff;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  height: 48%;
  display: flex;
  flex-direction: column;
  padding: 0 10px;
}

.year-report-title,
.year-huanbi-title,
.year-tongbi-title {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.flex-container {
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 5px;
}

.year-report-chart,
.year-huanbi-chart,
.year-tongbi-chart {
  height: 100%;
  width: 100%;
  margin-bottom: 10px;
}
</style>
