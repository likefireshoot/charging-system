<template>
  <div class="baobiao-container">
    <div class="search-box">
      <div class="search-content">
        <div class="search-input" style="margin-left: 10px; margin-left: 10px" v-if="companyId === 1">
          <span>所属水厂</span>
          <el-select  class="big-font-el-select" v-model="params.company" placeholder="请选择所属水厂">
            <el-option v-for="item in companyList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 10px; margin-left: 10px">
          <span>区域</span>
          <el-select class="big-font-el-select" v-model="params.region">
            <el-option v-for="item in quyu_data" :key="item.id" :label="item.label" :value="item.label"> </el-option>
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 20px; width: 320px">
          <span>时间范围</span>
          <el-date-picker
            v-model="params.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="flex-grow: 0; width: 100%; height: 35px"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </div>
        <div class="search-input" style="margin-left: 20px">
          <span>开户审批人</span>
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
            <span>开户总数</span>
            <div class="message">
              <span style="font-size: 24px; margin-bottom: 20px; font-family: 'Microsoft YaHei'; font-weight: bold">{{ totalaccount }}</span>
              <span style="margin-bottom: 20px">户</span>
            </div>
          </div>
          <img src="@/assets/menu/icon4.png" alt="" style="width: 60px; height: 60px; margin-right: 60px" />
        </div>
      </div>
      <div class="week-report">
        <div class="week-report-title">
          <span style="font-size: 22px; margin-top: 10px; margin-bottom: 5px">用户报表统计（{{ dateRangeText }}）
              <a href="javascript:;" style="font-size: 22px; margin-left: 0px;color: #46b97e;" @click="exportChartExcel(weekchart,'用户报表统计')">(导出)</a>

          </span>
          <div class="flex-container">
            <div style="width: 4px; height: 4px; background-color: #46b87d; margin-right: 5px"></div>
            <div style="width: 4px; height: 4px; background-color: #90d5b2; margin-right: 5px"></div>
            <div style="width: 4px; height: 4px; background-color: #c7ead7; margin-right: 5px"></div>
            <div style="width: 100%; height: 1px; background-color: #e9e9e9"></div>
          </div>
          <div class="week-report-chart" id="week"></div>
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
import {exportChartExcel} from "@/api/otherapi/other.js";

const pad = (num) => num.toString().padStart(2, '0');

const formatDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const createDate = (year, month, day) => new Date(year, month - 1, day);

const getCurrentMonthRange = () => {
  const now = new Date();
  const before = new Date(now);
  before.setDate(now.getDate() - 30); // 30天前

  const format = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  return [format(before), format(now)];
};

export default {
  data() {
    const now = new Date();
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    return {
      params: {
        region: "",
        dateRange: getCurrentMonthRange(),
        company: null,
        rechargeUser: "",
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      companyList: [],
      quyu_data: [],
      staffNameOptions: [],
      totalaccount: 0,
      trade_data: {}, // 新增：存储接口返回的完整数据
      weekchart: null,
      weekchart_option: {
        grid: {
          left: "6%",
          right: "5%",
          top: "8%",
          bottom: "8%",
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
          formatter: function (params) {
            return params.name + ": " + params.value + "户";
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
        }
      },
      weekchartResizeObserver: null,
    };
  },
  computed: {
    dateRangeText() {
      const [startTime, endTime] = this.params.dateRange || [];
      return startTime && endTime ? `${startTime} ~ ${endTime}` : "";
    },
  },
  watch: {
    "params.company"() {
      this.params.region = "";
      this.getRegionData();
    },

    // 数据变化时自动渲染图表
    trade_data(){
      this.renderChart()
    }
  },
  mounted() {
    this.getCompanyList();
    this.getRegionData();
    this.getStaffNames();
    this.getTradeData();
    this.weekChart();
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
    weekChart() {
      this.$nextTick(() => {
        const el = document.getElementById("week");
        if (!el) return;
        this.weekchart = markRaw(echarts.init(el));
        this.weekchart.setOption(this.weekchart_option);

        this.weekchartResizeObserver = new ResizeObserver(
          this.debounce(() => {
            this.weekchart?.resize();
          }, 200)
        );
        this.weekchartResizeObserver.observe(el);
      })
    },
    beforeUnmount() {
      if (this.weekchartResizeObserver) {
        this.weekchartResizeObserver.disconnect();
      }
      if (this.weekchart) {
        this.weekchart.dispose();
      }
    },
    getCompanyList() {
      service
        .get("/getAllUnblockCompany")
        .then((response) => {
          if (response.code === 200) {
            this.companyList = response.data.map((item) => {
              return {
                id: item.companyId,
                name: item.companyName,
              };
            });
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    getRegionData() {
      let url = "";
      if (this.companyId === 1) {
        if (this.params.company) {
          url = `/getRegion?companyId=${this.params.company}`;
        } else {
          url = `/getRegion`;
        }
      } else {
        url = `/getRegion?companyId=${this.companyId}`;
      }
      service
        .get(`${url}`)
        .then((response) => {
          if (response.code === 200) {
            this.quyu_data = response.data.map((item) => {
              return {
                id: item.regionId,
                value: item.regionId,
                label: item.regionName,
              };
            });
          }
        })
        .catch((error) => {
          console.error(error);
        });
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
    getTradeData() {
      let params = { companyId: "" };
      if (this.companyId === 1) {
        if (this.params.company) {
          params.companyId = this.params.company; // 所属水厂ID
        }
      } else {
        params.companyId = this.companyId; // 所属水厂ID
      }
      const [startTime, endTime] = this.params.dateRange || [];
      // if (!startTime || !endTime) {
      //   ElMessage.warning("请选择时间范围");
      //   return;
      // }
      const query = {
        regionName: this.params.region || "",
        startDate: startTime,
        endDate: endTime,
        companyId: params.companyId ?? "",
        approver1: this.params.rechargeUser || "",
      };
      service
        .post(`/userOpenReport`, query)
        .then((response) => {
          if (response.code === 200) {
            this.totalaccount = response.data.totalCount
            this.trade_data = response.data;
            this.renderChart();
          } else {
            ElMessage.error("查询失败");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    // 渲染图表
    renderChart() {
      // 安全校验：图表实例和数据都存在才执行
      if (!this.weekchart || !this.trade_data || !this.trade_data.items) return;

      // 从 items 中提取横坐标（日期）和纵坐标（数量）
      const xData = this.trade_data.items.map(item => item.date);
      const yData = this.trade_data.items.map(item => item.count);

      // 更新图表配置，渲染数据
      this.weekchart.setOption({
        xAxis: {
          data: xData
        },
        series: [
          {
            data: yData
          }
        ]
      });
    },
    clear() {
      this.params.region = "";
      this.params.dateRange = getCurrentMonthRange();
      this.params.company = null;
      this.params.rechargeUser = "";
      this.getTradeData()
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
  padding: 0px 20px;
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
  justify-content: flex-start;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
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
  border-radius: 5px;
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

.week-report {
  height: 100%;
  padding: 0px 10px;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  background-color: #fff;
  flex-grow: 1;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
}

.week-report-title {
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

.week-report-chart {
  height: 100%;
  width: 100%;
  margin-bottom: 10px;
}
</style>
