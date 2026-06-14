<template>
  <div class="shouye">
    <div class="container1">
      <div class="shebei-status">
        <span style="font-size: 25px; margin-top: 10px; margin-bottom: 5px">设备状态</span>
        <div class="flex-container">
          <div style="width: 4px; height: 4px; background-color: #46b87d; margin-right: 5px"></div>
          <div style="width: 4px; height: 4px; background-color: #90d5b2; margin-right: 5px"></div>
          <div style="width: 4px; height: 4px; background-color: #c7ead7; margin-right: 5px"></div>
          <div style="width: 100%; height: 1px; background-color: #e9e9e9"></div>
        </div>
        <div class="shebei-status-chart">
          <div class="shebei-status-bingtu" id="bingtu"></div>
          <div class="shebei-status-num">
            <div class="normal-num">
              <div style="width: 25px; height: 3px; background-color: #46b97e"></div>
              <span style="font-size: 20px">正常表数</span>
              <div>
                <span style="font-size: 18px; font-family: 'Microsoft YaHei'; font-weight: bold">{{ shebeiStatus.normal }}</span>
                <span style="margin-left: 5px">-{{ shebeiStatus.normal_percent }}</span>
              </div>
            </div>
            <div class="abnormal-num">
              <div style="width: 25px; height: 3px; background-color: #f3d04e"></div>
              <span style="font-size: 20px">异常表数</span>
              <div>
                <span style="font-size: 18px; font-family: 'Microsoft YaHei'; font-weight: bold">{{ shebeiStatus.abnormal }}</span>
                <span style="margin-left: 5px">-{{ shebeiStatus.abnormal_percent }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="week-report">
        <div class="week-report-title">
          <span style="font-size: 22px; margin-top: 10px; margin-bottom: 5px"
            >近7天缴费总额

            <a href="javascript:;" style="font-size: 22px; margin-left: 0px; color: #46b97e" @click="exportChartExcel(weekchart, '近7天缴费总额')">(导出)</a>
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
    <div class="container2">
      <div class="shebei-warning" style="width: 320px">
        <span style="font-size: 25px; margin-top: 10px; margin-bottom: 5px">设备预警</span>
        <div class="flex-container">
          <div style="width: 4px; height: 4px; background-color: #46b87d; margin-right: 5px"></div>
          <div style="width: 4px; height: 4px; background-color: #90d5b2; margin-right: 5px"></div>
          <div style="width: 4px; height: 4px; background-color: #c7ead7; margin-right: 5px"></div>
          <div style="width: 100%; height: 1px; background-color: #e9e9e9"></div>
        </div>
        <div class="shebei-warning-list">
          <div class="shebei-warning-item">
            <img src="@/assets/shouye/icon1.png" @click="toWarnPath('欠费用户')" alt="" />
            <div class="shebei-warning-item-text">
              <span style="font-size: 22px">欠费用户</span>
              <span style="font-size: 22px; font-family: 'Microsoft YaHei'; font-weight: bold; margin-top: 5px">{{ shebeiWarning.qianfeiUser }}</span>
            </div>
          </div>
          <div class="shebei-warning-item">
            <img src="@/assets/shouye/icon2.png" @click="toWarnPath('水表0用量用户')" alt="" />
            <div class="shebei-warning-item-text">
              <span style="font-size: 22px">水表0用量用户</span>
              <span style="font-size: 22px; font-family: 'Microsoft YaHei'; font-weight: bold; margin-top: 5px">{{ shebeiWarning.zerouserL }}</span>
            </div>
          </div>
          <div class="shebei-warning-item">
            <img src="@/assets/shouye/icon3.png" @click="toWarnPath('水表大用量用户')" alt="" />
            <div class="shebei-warning-item-text">
              <span style="font-size: 22px">大用量异常用户</span>
              <span style="font-size: 22px; font-family: 'Microsoft YaHei'; font-weight: bold; margin-top: 5px">{{ shebeiWarning.dayongliang }}</span>
            </div>
          </div>
          <div class="shebei-warning-item">
            <img src="@/assets/shouye/icon4.png" @click="toWarnPath('数据长时间未上报')" alt="" />
            <div class="shebei-warning-item-text">
              <span style="font-size: 22px">数据持续未上报</span>
              <span style="font-size: 22px; font-family: 'Microsoft YaHei'; font-weight: bold; margin-top: 5px">{{ shebeiWarning.weishangbao }}</span>
            </div>
          </div>
          <div class="shebei-warning-item">
            <img src="@/assets/shouye/icon5.png" @click="toWarnPath('设备异常')" alt="" />
            <div class="shebei-warning-item-text">
              <span style="font-size: 22px">设备异常</span>
              <span style="font-size: 22px; font-family: 'Microsoft YaHei'; font-weight: bold; margin-top: 5px">{{ shebeiWarning.shebeiyichang }}</span>
            </div>
          </div>
           <div class="shebei-warning-item">
            <img src="@/assets/shouye/icon8.png" @click="toWarnPath('关阀状态读数增加')" alt="" />
            <div class="shebei-warning-item-text">
              <span style="font-size: 22px">关阀状态读数增加</span>
              <span style="font-size: 22px; font-family: 'Microsoft YaHei'; font-weight: bold; margin-top: 5px">{{ shebeiWarning.abnormalWaterCount }}</span>
              <span style="font-size: 17px; color: #999;">(漏水用户数，非告警数)</span>
            </div>
          </div>
        </div>
      </div>
      <div class="month-year-report">
        <div class="month-report">
          <span style="font-size: 22px; margin-top: 10px; margin-bottom: 5px"
            >本月缴费情况

            <!-- <a href="javascript:;" style="font-size: 14px; margin-left: 20px;color: #1a73e8;" @click="exportChartExcel(monthchart,'图表数据')">导出PNG</a> -->
            <a href="javascript:;" style="font-size: 22px; margin-left: 0px; color: #46b97e" @click="exportChartExcel(monthchart, '本月缴费情况')">(导出)</a>
          </span>
          <div class="flex-container">
            <div style="width: 4px; height: 4px; background-color: #46b87d; margin-right: 5px"></div>
            <div style="width: 4px; height: 4px; background-color: #90d5b2; margin-right: 5px"></div>
            <div style="width: 4px; height: 4px; background-color: #c7ead7; margin-right: 5px"></div>
            <div style="width: 100%; height: 1px; background-color: #e9e9e9"></div>
          </div>
          <div class="month-report-chart" id="month"></div>
        </div>
        <div class="year-report">
          <span style="font-size: 22px; margin-top: 10px; margin-bottom: 5px"
            >本年度结算总额情况
            <!-- <a href="javascript:;" style="font-size: 14px; margin-left: 20px;color: #1a73e8;" @click="exportChartExcel(yearchart,'图表数据')">导出PNG</a> -->
            <a href="javascript:;" style="font-size: 22px; margin-left: 0px; color: #46b97e" @click="exportChartExcel(yearchart, '本年度结算总额情况')">(导出)</a>
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
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import { markRaw } from "vue";
import service from "@/api/request";
import { ElMessage } from "element-plus";
import { useWarningStore } from "@/store/warningStore.js";
import { exportChartExcel } from "@/api/otherapi/other.js";
export default {
  data() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return {
      params: {
        record_time: `${year}-${month}-${day}`,
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      token: JSON.parse(sessionStorage.getItem("userData")).token,
      total_num: 0,
      shebeiStatus: {
        normal: 0,
        abnormal: 0,
        normal_percent: "0%",
        abnormal_percent: "0%",
      },
      bingtuchart: null,
      bingtuchart_option: {
        tooltip: {
          trigger: "item",
          // 自定义提示框内容格式
          formatter: function (params) {
            return `${params.name}: ${params.value}`;
          },
        },
        series: [
          {
            name: "Access From",
            type: "pie",
            radius: ["50%", "80%"],
            avoidLabelOverlap: false,
            // 配置中央固定显示的标签
            label: {
              show: true,
              position: "center",
              formatter: () => {
                // 使用富文本样式标记
                return `{text|总表数}\n{number|${this.total_num}}`;
              },
              rich: {
                text: {
                  fontSize: 16, // “总表数” 的字体大小
                  color: "#333",
                  fontWeight: "normal",
                  lineheight: 16, // 标签的行高
                },
                number: {
                  fontSize: 18, // 具体数值的字体大小，设置得更大
                  color: "#333",
                  fontfamily: "Microsoft YaHei",
                  fontWeight: "bold", // 可以设置加粗让其更凸显
                },
              },
              fontSize: 16,
              fontWeight: "normal",
              color: "#333",
            },
            // 配置鼠标悬浮时扇区的样式
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              }
            },
            labelLine: {
              show: false,
            },
            itemStyle: {
              color: function (params) {
                // 根据数据项的索引设置不同的颜色
                if (params.dataIndex === 0) {
                  return "#46b97e"; // 正常表数的颜色
                } else {
                  return "#f3d04e"; // 异常表数的颜色
                }
              },
            },
            data: [
              { value: 0, name: "正常表数" },
              { value: 0, name: "异常表数" },
            ],
          },
        ],
      },
      bingtuResizeObserver: null,
      weekchart: null,
      weekchart_option: {
        grid: {
          left: "6%",
          right: "5%",
          top: "8%",
          bottom: "10%",
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: [],
          axisLabel: {
            fontSize: 18,       // 设置 X 轴字体大小
            color: "#666",      // 可选：设置字体颜色
            fontWeight: "normal" // 可选：设置是否加粗
          }
        },
        yAxis: {
          type: "value",
          axisLabel: {
            fontSize: 16,       // 设置 Y 轴字体大小
            color: "#666"
          },
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
          fontSize: 20,
          // ⭐ 核心逻辑：判断是否为第一个点, 如果是, 向右顶开
          formatter: function (params) {
            if (params.dataIndex === 0) {
              // 给第一个点加一个特殊的富文本样式标签 'first'
              return '{first|' + params.value + '}';
            }
            return params.value;
          },
          rich: {
            first: {
              fontSize: 20,
              padding: [0, 0, 0, 40], // ⭐ 关键：通过 padding-left (第四个值) 将文字向右顶开
              color: "#333"           // 保持颜色一致
            }
          }
        },
      },
      weekchartResizeObserver: null,
      monthchart: null,
      monthchart_option: {
        grid: {
          left: "6%",
          right: "5%",
          top: "8%",
          bottom: "10%",
        },
        xAxis: {
          type: "category",
          axisLabel: {
            fontSize: 18,       // 设置 X 轴字体大小
            color: "#666"
          },
          // [底部留白百分比, 顶部留白百分比]
          boundaryGap: false,
          data: ["缴费总额", "现金总额", "微信总额", "支付宝总额"],
        },
        yAxis: {
          type: "value",
          axisLabel: {
            fontSize: 16,       // 设置 Y 轴字体大小
            color: "#666",
          },
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
                { offset: 0, color: "rgba(243,213,99, 0.8)" },
                { offset: 1, color: "rgba(243,213,99, 0.1)" },
              ]),
            },
            symbol: "circle", // 设置点的形状为圆形
            symbolSize: 8, // 设置圆圈的大小
            itemStyle: {
              color: "#fff", // 设置点的填充颜色为白色（空心效果）
              borderColor: "#F5D86E", // 设置点的边框颜色
              borderWidth: 3, // 设置点的边框宽度
            },
            lineStyle: {
              color: "rgba(243,213,99, 1)", // 设置曲线的颜色，这里使用了和面积渐变起始色相同的颜色并设置不透明度为 1
            },
          },
        ],
        // ⭐⭐⭐⭐ 关键：启用静态 label ⭐⭐⭐⭐
        label: {
          show: true,
          position: "top",
          color: "#333",
          fontSize: 20,
          // ⭐ 核心逻辑：判断是否为第一个点, 如果是, 向右顶开
          formatter: function (params) {
            if (params.dataIndex === 0) {
              // 给第一个点加一个特殊的富文本样式标签 'first'
              return '{first|' + params.value + '}';
            }
            return params.value;
          },
          rich: {
            first: {
              fontSize: 20,
              padding: [0, 0, 0, 80], // ⭐ 关键：通过 padding-left (第四个值) 将文字向右顶开
              color: "#333"           // 保持颜色一致
            }
          }
        },
      },
      monthchartResizeObserver: null,
      yearchart: null,
      yearchart_option: {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          formatter: function (params) {
            let tooltipStr = params[0].name;
            params.forEach(function (param) {
              tooltipStr += ": " + param.value + "元";
            });
            return tooltipStr;
          },
        },
        grid: {
          left: "6%",
          right: "5%",
          top: "8%",
          bottom: "20%",
        },
        xAxis: [
          {
            type: "category",
            data: ["01月", "02月", "03月", "04月", "05月", "06月", "07月", "08月", "09月", "10月", "11月", "12月"],
            axisLabel: {
              fontSize: 18,       // 设置 X 轴字体大小
              color: "#666"
            },
            axisTick: {
              alignWithLabel: true,
            },
          },
        ],
        yAxis: [
          {
            type: "value",
            axisLabel: {
              fontSize: 16,       // 设置 y 轴字体大小
              color: "#666"
            },
          },
        ],
        series: [
          {
            name: "Direct",
            type: "bar",
            barWidth: "60%",
            itemStyle: {
              color: "#46B97E",
              borderRadius: [5, 5, 5, 5], // 分别对应上左、上右、下右、下左的圆角弧度，这里设置为5px
            },
            data: [],
          },
        ],
        // ⭐⭐⭐⭐ 关键：启用静态 label ⭐⭐⭐⭐
        label: {
          show: true,
          position: "top",
          color: "#333",
          fontSize: 20,
        },
      },
      yearchartResizeObserver: null,
      shebeiWarning: {
        qianfeiUser: 0,
        zerouserL: 0,
        dayongliang: 0,
        weishangbao: 0,
        shebeiyichang: 0,
        currentMonthNewUserCount:0,
        abnormalWaterCount: 0
        
      },
    };
  },
  async mounted() {
    await this.getTotal();
    this.bingtuChart();

    this.getWeekData();
    this.getMonthData();
    this.getYearData();
    this.getWaringNum();
    // this.getWaringData("欠费用户", (num) => {
    //   this.shebeiWarning.qianfeiUser = num;
    // });
    // this.getWaringData("水表0用量用户", (num) => {
    //   this.shebeiWarning.zerouserL = num;
    // });
    // this.getWaringData("大用量异常用户", (num) => {
    //   this.shebeiWarning.dayongliang = num;
    // });
    // this.getWaringData("数据持续未上报", (num) => {
    //   this.shebeiWarning.weishangbao = num;
    // });
    // this.getWaringData("设备异常", (num) => {
    //   this.shebeiWarning.shebeiyichang = num;
    // });
  },
  methods: {
    exportChartExcel,
    toWarnPath(val) {
      this.$router.push({ path: "/warningManage", query: { warningType: val } });
    },
    // 计算占比的方法
    calculatePercentages() {
      if (this.total_num > 0) {
        this.shebeiStatus.normal_percent = ((this.shebeiStatus.normal / this.total_num) * 100).toFixed(2) + "%";
        this.shebeiStatus.abnormal_percent = ((this.shebeiStatus.abnormal / this.total_num) * 100).toFixed(2) + "%";
      } else {
        this.shebeiStatus.normal_percent = "0%";
        this.shebeiStatus.abnormal_percent = "0%";
      }
    },
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
    // 使用防抖函数来包装 resize 操作
    bingtuChart() {
      this.bingtuchart = markRaw(echarts.init(document.getElementById("bingtu")));
      this.bingtuchart_option.series[0].data[0].value = this.shebeiStatus.normal;
      this.bingtuchart_option.series[0].data[1].value = this.shebeiStatus.abnormal;
      this.bingtuchart.setOption(this.bingtuchart_option);

      // 创建 ResizeObserver 实例来监听 weekshouyi div 大小变化
      this.bingtuResizeObserver = new ResizeObserver(
        this.debounce(() => {
          this.bingtuchart.resize(); // 当大小变化时，调用 resize 来调整图表的尺寸
        }, 200)
      ); // 200 毫秒的防抖延时

      // 开始监听 weekshouyi div 的大小变化
      this.bingtuResizeObserver.observe(document.getElementById("bingtu"));
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
    monthChart() {
      this.monthchart = markRaw(echarts.init(document.getElementById("month")));
      this.monthchart.setOption(this.monthchart_option);

      // 创建 ResizeObserver 实例来监听 weekshouyi div 大小变化
      this.monthchartResizeObserver = new ResizeObserver(
        this.debounce(() => {
          this.monthchart.resize(); // 当大小变化时，调用 resize 来调整图表的尺寸
        }, 200)
      ); // 200 毫秒的防抖延时

      // 开始监听 weekshouyi div 的大小变化
      this.monthchartResizeObserver.observe(document.getElementById("month"));
    },
    yearChart() {
      this.yearchart = markRaw(echarts.init(document.getElementById("year")));
      this.yearchart.setOption(this.yearchart_option);

      // 创建 ResizeObserver 实例来监听 weekshouyi div 大小变化
      this.yearchartResizeObserver = new ResizeObserver(
        this.debounce(() => {
          this.yearchart.resize(); // 当大小变化时，调用 resize 来调整图表的尺寸
        }, 200)
      ); // 200 毫秒的防抖延时

      // 开始监听 weekshouyi div 的大小变化
      this.yearchartResizeObserver.observe(document.getElementById("year"));
    },

    beforeUnmount() {
      if (this.bingtuResizeObserver) {
        this.bingtuResizeObserver.disconnect();
      }
      if (this.bingtuchart) {
        this.bingtuchart.dispose(); // 销毁 ECharts 实例
      }
      if (this.weekchartResizeObserver) {
        this.weekchartResizeObserver.disconnect();
      }
      if (this.weekchart) {
        this.weekchart.dispose(); // 销毁 ECharts 实例
      }
      if (this.monthchartResizeObserver) {
        this.monthchartResizeObserverchartResizeObserver.disconnect();
      }
      if (this.monthchartchart) {
        this.monthchart.dispose(); // 销毁 ECharts 实例
      }
      if (this.yearchartResizeObserver) {
        this.yearchartResizeObserver.disconnect();
      }
      if (this.yearchart) {
        this.yearchart.dispose(); // 销毁 ECharts 实例
      }
    },
    //获取图表数据
    getWeekData() {
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
      let params = { companyId: "" };
      if (this.companyId === 1) {
        params.companyId = ""; // 所属水厂ID
      } else {
        params.companyId = this.companyId; // 所属水厂ID
      }
      service
        .get(`/weekReport?startTime=${formattedStartTime}&endTime=${this.params.record_time}&region=&companyId=${params.companyId}`, {
          headers: {
            Authorization: this.token,
          },
        })
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
            // 更新 series.data
            this.weekchart_option.series[0].data = totalMoneys;
            // 更新图表
            //this.beforeUnmount();
            this.weekChart();
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    getMonthData() {
      let month = this.params.record_time.slice(0, 7) + "-01";
      let params = { companyId: "" };
      if (this.companyId === 1) {
        params.companyId = ""; // 所属水厂ID
      } else {
        params.companyId = this.companyId; // 所属水厂ID
      }
      service
        .get(`/monthReport?month=${month}&region=&companyId=${params.companyId}`, {
          headers: {
            Authorization: this.token,
          },
        })
        .then((response) => {
          if (response.code === 200) {
            let trade_data = response.data.currentDurationReport;
            this.monthchart_option.series[0].data = [trade_data.totalMoney, trade_data.cashMoney, trade_data.weChatMoney, trade_data.alipayMoney];
            this.monthChart();
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    getYearData() {
      let year = this.params.record_time.slice(0, 4) + "-01-01";
      let params = { companyId: "" };
      if (this.companyId === 1) {
        params.companyId = ""; // 所属水厂ID
      } else {
        params.companyId = this.companyId; // 所属水厂ID
      }
      service
        .get(`/yearReport?year=${year}&region=&companyId=${params.companyId}`, {
          headers: {
            Authorization: this.token,
          },
        })
        .then((response) => {
          if (response.code === 200) {
            const totalMoneys = response.data.currentSingularReport.map((item) => {
              return item.totalMoney;
            });
            this.yearchart_option.series[0].data = totalMoneys;
            this.yearChart();
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    goToDetail(type) {
      const warningStore = useWarningStore();
      warningStore.setWarningType(type);
      this.$router.push({ name: "warningManage" });
    },
    getWaringNum() {
      let params = { companyId: "" };
      if (this.companyId === 1) {
        params.companyId = ""; // 所属水厂ID
      } else {
        params.companyId = this.companyId; // 所属水厂ID
      }
      service
        .get(`/warning/getIndexWarningInfo?companyId=${params.companyId}`)
        .then((response) => {
          if (response.code === 200) {
            this.shebeiWarning.qianfeiUser = response.data.arrearsUserCount;
            this.shebeiWarning.zerouserL = response.data.zeroUsageCount;
            this.shebeiWarning.dayongliang = response.data.largeUsageCount;
            this.shebeiWarning.weishangbao = response.data.longTimeUnReportCount;
            this.shebeiWarning.shebeiyichang = response.data.errCount;
            this.shebeiWarning.currentMonthNewUserCount = response.data.currentMonthNewUserCount
            this.shebeiWarning.abnormalWaterCount = response.data.abnormalWaterCount
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    getWaringData(type, callback) {
      let num = 0;
      let params = { pageNo: 1, pageSize: 10, warningType: type };
      if (this.companyId === 1) {
        params.companyId = ""; // 所属水厂ID
      } else {
        params.companyId = this.companyId; // 所属水厂ID
      }

      // 从sessionStorage获取token
      let token = "";
      const userData = sessionStorage.getItem("userData");
      if (userData) {
        try {
          token = JSON.parse(userData).token;
        } catch (e) {
          console.error("解析userData失败", e);
        }
      }
      service
        .post("/warning/queryWarning", params, {
          headers: {
            Authorization: token,
            token: token,
          },
        })
        .then((response) => {
          if (response.code === 200) {
            num = response.data.total;
            if (callback) {
              callback(num);
            }
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    //获取表统计数据
    async getTotal() {
      let params = { companyId: "" };
      if (this.companyId === 1) {
        params.companyId = ""; // 所属水厂ID
      } else {
        params.companyId = this.companyId; // 所属水厂ID
      }
      service
        .get(`/GetExceptionDeviceNum?companyId=${params.companyId}`, {
          headers: {
            Authorization: this.token,
          },
        })
        .then((res) => {
          if (res.code === 200) {
            this.shebeiStatus.normal = res.data.normalDeviceNum;
            this.shebeiStatus.abnormal = res.data.exceptionDeviceNum;
            // 计算总表数
            this.total_num = this.shebeiStatus.normal + this.shebeiStatus.abnormal;
            this.calculatePercentages();
            this.bingtuChart();
          }
        });
    },
  },
};
</script>

<style scoped>
.shouye {
  display: flex;
  flex-direction: column;
  height: 97%;
  flex-grow: 1;
  width: 100%; /* 确保宽度为100% */
  max-width: 100%; /* 防止超出父容器 */
  margin-left: 20px;
  box-sizing: border-box; /* 包含 padding 和 border 在宽度计算内 */
  overflow-x: hidden; /* 防止横向滚动 */
  overflow-y: auto; /* 允许纵向滚动 */
}

.container1 {
  height: 30%;
  display: flex;
  align-items: center;
  margin-right: 1%;
  margin-top: 1%;
  margin-bottom: 1%;
  min-width: 0; /* 允许 flex 子元素正确收缩 */
  box-sizing: border-box;
}

.container2 {
  height: 67%;
  display: flex;
  align-items: center;
  margin-right: 1%;
  min-width: 0; /* 允许 flex 子元素正确收缩 */
  box-sizing: border-box;
}

.shebei-status,
.week-report,
.shebei-warning {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  padding: 0 10px;
}

.shebei-status {
  width: 320px !important;
  margin-right: 20px;
}

.flex-container {
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 5px;
}

.shebei-status-chart {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  margin-bottom: 10px;
}

.shebei-status-bingtu {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 65%;
  height: 100%;
  margin-right: 10px;
}

.shebei-status-num {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 35%;
  margin-left: 10px;
}

.normal-num {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.normal-num > * {
  margin-bottom: 5px;
}

.abnormal-num {
  display: flex;
  flex-direction: column;
}

.abnormal-num > * {
  margin-bottom: 5px;
}

.week-report {
  flex: 1; /* 使用 flex: 1 替代 flex-grow: 1，更完整 */
  min-width: 0; /* 允许 flex 子元素正确收缩 */
  padding: 0 10px;
  margin-right: 0px;
  box-sizing: border-box;
}

.week-report-title {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.shebei-warning {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  height: 100%;
  width: 320px !important;
  margin-right: 20px;
}

.shebei-warning-list {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /* 使子元素在垂直方向上均匀分布 */
  width: 100%;
  height: 90%;
  margin-left: 5%;
}

.shebei-warning-item {
  display: flex;
  align-items: center;
  /* width: 305px; */
  width: 100%;
  height: 16.5%;
  margin: 0;
}

.shebei-warning-item img {
  width: 60px;
  height: 60px;
}

/* .shebei-warning-item-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 15%;
  cursor: pointer;
} */

.shebei-warning-item-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 15%;
}

.month-year-report {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1; /* 使用 flex: 1 替代 flex-grow: 1 */
  min-width: 0; /* 允许 flex 子元素正确收缩 */
  height: 100%;
  box-sizing: border-box;
}

.month-report,
.year-report {
  background-color: #fff;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  height: 50%;
  display: flex;
  flex-direction: column;
  padding: 0 10px;
}

.month-report {
  margin-bottom: 20px;
}

.week-report-chart,
.month-report-chart,
.year-report-chart {
  height: 100%;
  width: 100%;
  margin-bottom: 10px;
}
</style>
