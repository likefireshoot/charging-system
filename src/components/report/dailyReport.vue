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
        <div class="search-input" style="margin-left: 20px">
          <span>时间</span>
          <el-date-picker v-model="params.record_time" type="date" placeholder="选择日期" style="flex-grow: 0; width: 100%; height: 35px" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
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
            <span>当日交易总额</span>
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
            <span>当日现金交易总金额</span>
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
            <span>当日微信支付交易总金额</span>
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
            <span>当日支付宝支付交易总金额</span>
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
      <div class="week-report">
        <div class="week-report-title">
          <span style="font-size: 22px; margin-top: 10px; margin-bottom: 5px">收费日报表统计（{{ params.record_time }}）
              <a href="javascript:;" style="font-size: 22px; margin-left: 0px;color: #46b97e;" @click="exportYearChartPNG(weekchart,'收费日报表统计')">(导出)</a>

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
import {exportYearChartPNG} from "@/api/otherapi/other.js";
export default {
  data() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return {
      params: {
        region: "",
        record_time: `${year}-${month}-${day}`,
        company: null,
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      companyList: [],
      quyu_data: [],
      trade_data: {},
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
              type: "dashed", // 设置 x 轴背景网格线为虚线
              color: "#ccc", // 可以根据需要调整虚线颜色
            },
          },
        },
        tooltip: {
          trigger: "item",
          formatter: function (params) {
            return params.name + ": " + params.value + "元";
          },
        },
        series: [
          {
            data: [],
            type: "line",
            // 设置曲线为光滑曲线
            smooth: true,
            areaStyle: {
              // 使用线性渐变来设置面积的颜色
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(75,187,129, 0.8)" },
                { offset: 1, color: "rgba(75,187,129, 0.1)" },
              ]),
            },
            symbol: "circle", // 设置点的形状为圆形
            symbolSize: 8, // 设置圆圈的大小
            itemStyle: {
              color: "#fff", // 设置点的填充颜色为白色（空心效果）
              borderColor: "#4BBB81", // 设置点的边框颜色
              borderWidth: 3, // 设置点的边框宽度
            },
            lineStyle: {
              color: "rgba(75,187,129, 1)", // 设置曲线的颜色，这里使用了和面积渐变起始色相同的颜色并设置不透明度为 1
            },
          },
        ],
        // ⭐⭐⭐⭐ 关键：启用静态 label ⭐⭐⭐⭐
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
  watch: {
    "params.company"() {
      this.params.region = "";
      this.getRegionData();
    },
  },
  mounted() {
    this.getCompanyList();
    this.getRegionData();
    this.getTradeData();
  },
  methods: {
    exportYearChartPNG,
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
      this.weekchart = markRaw(echarts.init(document.getElementById("week")));
      this.weekchart.setOption(this.weekchart_option);

      // 创建 ResizeObserver 实例来监听 weekshouyi div 大小变化
      this.weekchartResizeObserver = new ResizeObserver(
        this.debounce(() => {
          this.weekchart.resize(); // 当大小变化时，调用 resize 来调整图表的尺寸
        }, 200)
      ); // 200 毫秒的防抖延时

      // 开始监听 weekshouyi div 的大小变化
      this.weekchartResizeObserver.observe(document.getElementById("week"));
    },
    beforeUnmount() {
      if (this.weekchartResizeObserver) {
        this.weekchartResizeObserver.disconnect();
      }
      if (this.weekchart) {
        this.weekchart.dispose(); // 销毁 ECharts 实例
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
          url = `/getRegion?companyId=${this.params.company}`; // 所属水厂ID
        } else {
          url = `/getRegion`; // 所属水厂ID
        }
      } else {
        url = `/getRegion?companyId=${this.companyId}`; // 所属水厂ID
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
            console.log(this.quyu_data);
          }
        })
        .catch((error) => {
          ElMessage.error("获取区域数据失败");
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
      console.log(this.companyId);
      console.log(this.params);
      service
        .get(`/dayReport?record_time=${this.params.record_time}&region=${this.params.region}&companyId=${params.companyId}`)
        .then((response) => {
          if (response.code === 200) {
            this.trade_data = response.data;
            console.log(this.params);
            console.log(this.trade_data);
            console.log(response.data);
            this.getWeekTradeData();
          } else {
            ElMessage.error("请选择查询的日期");
          }
        })
        .catch((error) => {
          ElMessage.error("请选择查询的日期");
        });
    },
    getWeekTradeData() {
      //计算开始时间
      const endTime = new Date(this.params.record_time);
      const startTime = new Date(endTime);
      startTime.setDate(startTime.getDate() - 6);

      // 格式化日期
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const formattedStartTime = formatDate(startTime);
      const region = this.params.region;
      let params = { companyId: "" };
      if (this.companyId === 1) {
        if (this.params.company) {
          params.companyId = this.params.company; // 所属水厂ID
        }
      } else {
        params.companyId = this.companyId; // 所属水厂ID
      }
      service
        .get(`/weekReport?startTime=${formattedStartTime}&endTime=${this.params.record_time}&region=${region}&companyId=${params.companyId}`)
        .then((response) => {
          if (response.code === 200) {
            // 提取 reportTimeStart 数据
            const reportTimeStarts = response.data.currentSingularReport.map((item) => {
              return item.reportTimeStart;
            });
            // 更新 xAxis.data
            this.weekchart_option.xAxis.data = reportTimeStarts;
            //提取营业总额
            const totalMoneys = response.data.currentSingularReport.map((item) => {
              return item.totalMoney;
            });
            console.log(response.data);
            console.log(response.data.currentSingularReport);
            // 更新 series.data
            this.weekchart_option.series[0].data = totalMoneys;
            // 更新图表
            this.beforeUnmount();
            this.weekChart();
          } else {
            ElMessage.error("请选择查询的日期");
          }
        })
        .catch((error) => {
          ElMessage.error("请选择查询的日期");
        });
    },
    clear() {
      this.params.region = "";
      this.params.record_time = "";
      this.params.company = null;
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
  height: 98px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  background-color: #fff;
}

.search-content {
  display: flex;
  width: 95%;
  height: 100%;
}

.search-input {
  display: flex;
  justify-content: flex-start;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 25%;
  height: 100%;
  margin-right: 20px;
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
