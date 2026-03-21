<template>
  <div class="baobiao-container">
    <div class="search-box">
      <div class="search-content">
        <div class="search-input" style="margin-left: 20px; margin-left: 10px" v-if="companyId === 1">
          <span>所属水厂</span>
          <el-select class="big-font-el-select" v-model="params.company" placeholder="请选择所属水厂">
            <el-option v-for="item in companyList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 20px; margin-left: 10px">
          <span>区域</span>
          <el-select class="big-font-el-select" v-model="params.region">
            <el-option v-for="item in quyu_data" :key="item.id" :label="item.label" :value="item.label"> </el-option>
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 20px">
          <span>时间</span>
          <el-date-picker v-model="params.month" type="month" placeholder="选择月份" style="flex-grow: 0; width: 100%; height: 35px" format="YYYY-MM" value-format="YYYY-MM" />
        </div>
        <div class="search-input" style="margin-left: 20px">
          <span>收费人</span>
          <el-input v-model="params.rechargeUser" placeholder="请输入收费人" clearable />
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
            <span>本月交易总额</span>
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
            <span>本月现金交易总金额</span>
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
            <span>本月微信支付交易总金额</span>
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
            <span>本月支付宝支付交易总金额</span>
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
        <div class="month-report">
          <div class="month-report-title">
            <span style="font-size: 20px; margin-top: 10px; margin-bottom: 5px">收费月报表统计（{{ params.month }}）

               <a href="javascript:;" style="font-size: 20px; margin-left: 0px;color: #000;" @click="exportChartExcel(monthchart,'收费月报表统计')">(导出)</a>


            </span>
            <div class="flex-container">
              <div style="width: 4px; height: 4px; background-color: #46b87d; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #90d5b2; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #c7ead7; margin-right: 5px"></div>
              <div style="width: 100%; height: 1px; background-color: #e9e9e9"></div>
            </div>
            <div class="month-report-chart" id="month"></div>
          </div>
        </div>
        <div class="month-huanbi">
          <div class="month-huanbi-title">
            <span style="font-size: 20px; margin-top: 10px; margin-bottom: 5px">收费月报表统计环比（{{ params.month }}）
                  <a href="javascript:;" style="font-size: 20px; margin-left: 0px;color: #000;" @click="exportChartExcel(monthhuanbichart,'收费月报表统计环比')">(导出)</a>


            </span>
            <div class="flex-container">
              <div style="width: 4px; height: 4px; background-color: #46b87d; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #90d5b2; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #c7ead7; margin-right: 5px"></div>
              <div style="width: 100%; height: 1px; background-color: #e9e9e9"></div>
            </div>
            <div class="month-huanbi-chart" id="month-huanbi"></div>
          </div>
        </div>
        <div class="month-tongbi">
          <div class="month-tongbi-title">
            <span style="font-size: 20px; margin-top: 10px; margin-bottom: 5px">收费月报表统计同比（{{ params.month }}）

                 <a href="javascript:;" style="font-size: 20px; margin-left: 0px;color: #000;" @click="exportChartExcel(monthtongbichart,'收费月报表统计同比')">(导出)</a>

            </span>
            <div class="flex-container">
              <div style="width: 4px; height: 4px; background-color: #46b87d; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #90d5b2; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #c7ead7; margin-right: 5px"></div>
              <div style="width: 100%; height: 1px; background-color: #e9e9e9"></div>
            </div>
            <div class="month-tongbi-chart" id="month-tongbi"></div>
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
import {exportChartExcel} from "@/api/otherapi/other.js";
export default {
  data() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return {
      params: {
        region: "",
        month: `${year}年${month}月`,
        company: null,
        rechargeUser: "",
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      companyList: [],
      quyu_data: [],
      trade_data: {},
      monthchart: null,
      monthchart_option: {
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
              type: "dashed", // 设置 x 轴背景网格线为虚线
              color: "#ccc", // 可以根据需要调整虚线颜色
            },
          },
        },
        tooltip: {
          trigger: "item",
          formatter: function (params) {
            return params.name + ": " + params.value;
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
      monthchartResizeObserver: null,
      monthhuanbichart: null,
      monthhuanbichart_option: {
        legend: {
          data: [],
          right: 10,
          top: 0,
        },
        grid: {
          left: "6%",
          right: "5%",
          top: "15%",
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
              type: "dashed", // 设置 x 轴背景网格线为虚线
              color: "#ccc", // 可以根据需要调整虚线颜色
            },
          },
        },
        series: [
          {
            data: [],
            type: "bar",
            barWidth: "25%",
            itemStyle: {
              color: "#46B97E",
              borderRadius: [5, 5, 5, 5],
            },
            label: {
              show: true, // 显示标签
              position: "top", // 标签显示在柱形顶部
              color: "#575757", // 标签文字颜色
              fontSize: 10,
            },
          },
          {
            data: [],
            type: "bar",
            barWidth: "25%",
            itemStyle: {
              color: "#F3D04E",
              borderRadius: [5, 5, 5, 5],
            },
            label: {
              show: true, // 显示标签
              position: "top", // 标签显示在柱形顶部
              color: "#575757", // 标签文字颜色
              fontSize: 10,
            },
          },
        ],
        dataZoom: [
          {
            type: "slider",
            xAxisIndex: 0,
            show: true,
            start: 0,
            end: 50,
            height: 8, // 减小滚动条高度
            left: "10%",
            right: "10%",
            bottom: 0, // 调整滚动条距离底部的位置，给横坐标留出空间
            borderColor: "transparent", // 去除滚动条边框颜色
            fillerColor: "rgba(0, 0, 0, 0.05)", // 设置滚动条填充颜色并降低透明度
            backgroundColor: "rgba(0, 0, 0, 0.05)", // 设置滚动条背景颜色并降低透明度
            handleStyle: {
              color: "rgba(0, 0, 0, 0.4)", // 设置滚动条手柄颜色并降低透明度
              borderColor: "transparent", // 去除手柄边框颜色
            },
          },
        ],
      },
      monthhuanbichartResizeObserver: null,
      monthtongbichart: null,
      monthtongbichart_option: {
        legend: {
          data: [],
          right: 10,
          top: 0,
          // 设置图例为垂直布局
          //orient: "vertical",
        },
        grid: {
          left: "6%",
          right: "5%",
          top: "15%",
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
              type: "dashed", // 设置 x 轴背景网格线为虚线
              color: "#ccc", // 可以根据需要调整虚线颜色
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
              show: true, // 显示标签
              position: "top", // 标签显示在柱形顶部
              color: "#575757", // 标签文字颜色
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
              show: true, // 显示标签
              position: "top", // 标签显示在柱形顶部
              color: "#575757", // 标签文字颜色
              fontSize: 10,
            },
          },
        ],
        dataZoom: [
          {
            type: "slider",
            xAxisIndex: 0,
            show: true,
            start: 0,
            end: 50,
            height: 8, // 减小滚动条高度
            left: "10%",
            right: "10%",
            bottom: 0, // 调整滚动条距离底部的位置，给横坐标留出空间
            borderColor: "transparent", // 去除滚动条边框颜色
            fillerColor: "rgba(0, 0, 0, 0.05)", // 设置滚动条填充颜色并降低透明度
            backgroundColor: "rgba(0, 0, 0, 0.05)", // 设置滚动条背景颜色并降低透明度
            handleStyle: {
              color: "rgba(0, 0, 0, 0.4)", // 设置滚动条手柄颜色并降低透明度
              borderColor: "transparent", // 去除手柄边框颜色
            },
          },
        ],
      },
      monthtongbichartResizeObserver: null,
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
    monthChart() {
      this.monthchart = markRaw(echarts.init(document.getElementById("month")));
      this.monthchart.setOption(this.monthchart_option);

      // 创建 ResizeObserver 实例来监听 monthshouyi div 大小变化
      this.monthchartResizeObserver = new ResizeObserver(
        this.debounce(() => {
          this.monthchart.resize(); // 当大小变化时，调用 resize 来调整图表的尺寸
        }, 200)
      ); // 200 毫秒的防抖延时

      // 开始监听 monthshouyi div 的大小变化
      this.monthchartResizeObserver.observe(document.getElementById("month"));
    },
    monthHuanbiChart() {
      this.monthhuanbichart = markRaw(echarts.init(document.getElementById("month-huanbi")));
      this.monthhuanbichart.setOption(this.monthhuanbichart_option);

      // 创建 ResizeObserver 实例来监听 monthshouyi div 大小变化
      this.monthhuanbichartResizeObserver = new ResizeObserver(
        this.debounce(() => {
          this.monthhuanbichart.resize(); // 当大小变化时，调用 resize 来调整图表的尺寸
        }, 200)
      ); // 200 毫秒的防抖延时

      // 开始监听 monthshouyi div 的大小变化
      this.monthhuanbichartResizeObserver.observe(document.getElementById("month-huanbi"));
    },
    monthTongbiChart() {
      this.monthtongbichart = markRaw(echarts.init(document.getElementById("month-tongbi")));
      this.monthtongbichart.setOption(this.monthtongbichart_option);

      // 创建 ResizeObserver 实例来监听 monthshouyi div 大小变化
      this.monthtongbichartResizeObserver = new ResizeObserver(
        this.debounce(() => {
          this.monthtongbichart.resize(); // 当大小变化时，调用 resize 来调整图表的尺寸
        }, 200)
      ); // 200 毫秒的防抖延时

      // 开始监听 monthshouyi div 的大小变化
      this.monthtongbichartResizeObserver.observe(document.getElementById("month-tongbi"));
    },
    beforeUnmount() {
      if (this.monthchartResizeObserver) {
        this.monthchartResizeObserver.disconnect();
      }
      if (this.monthchart) {
        this.monthchart.dispose(); // 销毁 ECharts 实例
      }
      if (this.monthhuanbichartResizeObserver) {
        this.monthhuanbichartResizeObserver.disconnect();
      }
      if (this.monthhuanbichart) {
        this.monthhuanbichart.dispose(); // 销毁 ECharts 实例
      }
      if (this.monthtongbichartResizeObserver) {
        this.monthtongbichartResizeObserver.disconnect();
      }
      if (this.monthtongbichart) {
        this.monthtongbichart.dispose(); // 销毁 ECharts 实例
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
      const year = this.params.month.slice(0, 4);
      const month = this.params.month.slice(5, 7);
      let monthResult = year + "-" + month + "-01";
      let params = { companyId: "" };
      if (this.companyId === 1) {
        if (this.params.company) {
          params.companyId = this.params.company; // 所属水厂ID
        }
      } else {
        params.companyId = this.companyId; // 所属水厂ID
      }
      const query = new URLSearchParams({
        region: this.params.region || "",
        month: monthResult || "",
        companyId: params.companyId ?? "",
        rechargeUser: this.params.rechargeUser || "",
      }).toString();
      service.get(`/monthReport?${query}`).then((response) => {
        if (response.code === 200) {
          this.trade_data = response.data.currentDurationReport;
          //获取横坐标
          const reportTimeStarts = response.data.currentSingularReport.map((item) => {
            return item.reportTimeStart.slice(8, 10);
          });
          this.monthchart_option.xAxis.data = reportTimeStarts;
          this.monthhuanbichart_option.xAxis.data = reportTimeStarts;
          this.monthtongbichart_option.xAxis.data = reportTimeStarts;

          //获取图例（环比）
          const fristItem0 = response.data.currentSingularReport[0];
          if (fristItem0) {
            const year = fristItem0.reportTimeStart.slice(0, 4);
            const month = fristItem0.reportTimeStart.slice(5, 7);
            // 计算上一个月的月份
            let lastMonth;
            if (month === "01") {
              lastMonth = "12";
            } else {
              // 将 month 转换为数字进行减法运算，再转换回字符串并填充为两位数
              lastMonth = String(Number(month) - 1).padStart(2, "0");
            }
            // 计算上一个月对应的年份
            const lastYear = month === "01" ? String(Number(year) - 1) : year;
            const result = {
              one: `${lastYear}年${lastMonth}月`,
              two: `${year}年${month}月`,
            };
            this.monthhuanbichart_option.series[0].name = result.one;
            this.monthhuanbichart_option.series[1].name = result.two;
            this.monthhuanbichart_option.legend.data = [result.one, result.two];
          }

          // 获取图例数据（同比）
          const firstItem = response.data.currentSingularReport[0];
          if (firstItem) {
            const year = firstItem.reportTimeStart.slice(0, 4);
            const lastYear = parseInt(year) - 1;

            const result = {
              one: `${lastYear}年`,
              two: `${year}年`,
            };

            this.monthtongbichart_option.series[0].name = result.one;
            this.monthtongbichart_option.series[1].name = result.two;
            this.monthtongbichart_option.legend.data = [result.one, result.two];
          }

          //计算本周的总额
          const totalMoneys = response.data.currentSingularReport.map((item) => {
            return item.totalMoney;
          });
          this.monthchart_option.series[0].data = totalMoneys;
          this.monthhuanbichart_option.series[1].data = totalMoneys;
          this.monthtongbichart_option.series[1].data = totalMoneys;
          //计算环比数值
          const huanbimoneys = response.data.hreports.map((item) => {
            return item.totalMoney;
          });
          this.monthhuanbichart_option.series[0].data = huanbimoneys;
          //计算同比数值
          const tongbimoneys = response.data.tsingularReports.map((item) => {
            return item.totalMoney;
          });
          this.monthtongbichart_option.series[0].data = tongbimoneys;
          //更新图表
          this.beforeUnmount();
          this.monthChart();
          this.monthHuanbiChart();
          this.monthTongbiChart();
        }
      });
    },
    clear() {
      this.params.region = "";
      this.params.month = "";
      this.params.company = null;
      this.params.rechargeUser = "";
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

.baobiao-chart {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  height: 100%;
  flex-grow: 1;
}

.month-report,
.month-huanbi,
.month-tongbi {
  background-color: #fff;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  height: 32%;
  display: flex;
  flex-direction: column;
  padding: 0 10px;
}

.month-report-title,
.month-huanbi-title,
.month-tongbi-title {
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

.month-report-chart,
.month-huanbi-chart,
.month-tongbi-chart {
  height: calc(100% - 50px); /* 减去标题和装饰线的高度 */
  height: 100%;
  width: 100%;
  margin-bottom: 10px;
  overflow-x: auto;
  min-height: 200px; /* 新增：确保最小高度 */
}
</style>
