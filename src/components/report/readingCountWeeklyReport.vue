<template>
  <div class="baobiao-container">
    <div class="search-box">
      <div class="search-content">
        <!-- <div class="search-input" style="margin-left: 10px; margin-left: 10px">
          <span>选择报表</span>
          <el-select v-model="currentReportTye">
            <el-option v-for="item in selectReportTypeList" :key="item.key" :label="item.label" :value="item.key">
            </el-option>
          </el-select>
        </div> -->
        <div class="search-input" style="margin-left: 10px; margin-left: 10px" v-if="companyId === 1">
          <span>所属水厂</span>
          <el-select v-model="params.company" placeholder="请选择所属水厂">
            <el-option v-for="item in companyList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 10px; margin-left: 10px">
          <span>区域</span>
          <el-select v-model="params.region">
            <el-option v-for="item in quyu_data" :key="item.id" :label="item.label" :value="item.label"> </el-option>
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 20px; width: 50%">
          <span>时间</span>
          <div class="time-input">
            <el-date-picker v-model="params.startTime" type="date" placeholder="选择日期"
              style="flex-grow: 0; width: 150px; flex-basis: auto; margin-right: 5px; height: 35px" format="YYYY-MM-DD"
              value-format="YYYY-MM-DD" />
            <span>至</span>
            <el-date-picker v-model="params.endTime" type="date" placeholder="选择日期"
              style="flex-grow: 0; width: 150px; flex-basis: auto; height: 35px" format="YYYY-MM-DD"
              value-format="YYYY-MM-DD" />
          </div>
        </div>
      </div>
      <div class="buttons">
        <div class="sercah-btn" @click="getTradeData">
          <img src="@/assets/baobiao/icon6.png" alt="" style="margin-left: 10px" />
          <span style="font-size: 16px; margin-left: 15%">搜索</span>
        </div>
        <div class="clear-btn" @click="clear">
          <img src="@/assets/baobiao/icon5.png" alt="" style="margin-left: 10px" />
          <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">清空</span>
        </div>
      </div>
    </div>
    <div class="baobiao-info">
      <div class="baobiao-chart">
        <div class="week-report">
          <div class="week-report-title">
            <span style="font-size: 16px; margin-top: 10px; margin-bottom: 5px">{{ currentName }}周报表统计（{{ params.startTime }}至{{
              params.endTime }}）

              <a href="javascript:;" style="font-size: 14px; margin-left: 0px;color: #000;"
                @click="exportYearChartPNG(weekchart, currentName+'周报表')">(导出)</a>


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
        <div class="week-huanbi">
          <div class="week-huanbi-title">
            <span style="font-size: 16px; margin-top: 10px; margin-bottom: 5px">{{ currentName }}周报表统计环比（{{ params.startTime }}至{{
              params.endTime }}）

              <a href="javascript:;" style="font-size: 14px; margin-left: 0px;color: #000;"
                 @click="exportYearChartPNG(weekhuanbichart, currentName+'周报表统计环比')">(导出)</a>


            </span>
            <div class="flex-container">
              <div style="width: 4px; height: 4px; background-color: #46b87d; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #90d5b2; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #c7ead7; margin-right: 5px"></div>
              <div style="width: 100%; height: 1px; background-color: #e9e9e9"></div>
            </div>
            <div class="week-huanbi-chart" id="week-huanbi"></div>
          </div>
        </div>
        <div class="week-tongbi">
          <div class="week-tongbi-title">
            <span style="font-size: 16px; margin-top: 10px; margin-bottom: 5px">{{ currentName }}周报表统计同比（{{ params.startTime }}至{{
              params.endTime }}）


              <a href="javascript:;" style="font-size: 14px; margin-left: 0px;color: #000;"
                @click="exportYearChartPNG(weektongbichart, currentName+'周报表统计同比')">(导出)</a>


            </span>
            <div class="flex-container">
              <div style="width: 4px; height: 4px; background-color: #46b87d; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #90d5b2; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #c7ead7; margin-right: 5px"></div>
              <div style="width: 100%; height: 1px; background-color: #e9e9e9"></div>
            </div>
            <div class="week-tongbi-chart" id="week-tongbi"></div>
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
import { exportYearChartPNG } from "@/api/otherapi/other.js";
export default {
  data() {
    const now = new Date();
    const endYear = now.getFullYear();
    const endMonth = String(now.getMonth() + 1).padStart(2, "0");
    const endDay = String(now.getDate()).padStart(2, "0");
    const endDate = `${endYear}-${endMonth}-${endDay}`;
    const startDateObj = new Date(now);
    startDateObj.setDate(now.getDate() - 6);
    const startYear = startDateObj.getFullYear();
    const startMonth = String(startDateObj.getMonth() + 1).padStart(2, "0");
    const startDay = String(startDateObj.getDate()).padStart(2, "0");
    const startDate = `${startYear}-${startMonth}-${startDay}`;
    return {
      params: {
        region: "",
        startTime: startDate,
        endTime: endDate,
        company: null,
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      companyList: [],
      quyu_data: [],
      weekchart: null,
      weekchart_option: {
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
      weekchartResizeObserver: null,
      weekhuanbichart: null,
      weekhuanbichart_option: {
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
            },
          },
        ],
      },
      weekhuanbichartResizeObserver: null,
      weektongbichart: null,
      weektongbichart_option: {
        legend: {
          data: [],
          right: 10,
          top: 0,
        },
        grid: {
          left: "6%",
          right: "5%",
          top: "25%",
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
            },
          },
        ],
      },
      weektongbichartResizeObserver: null,
      selectReportTypeList: [
        {
          "label": "用水记录报表",
          "key": 1
        },
        {
          "label": "扣费记录报表",
          "key": 2
        }
      ],
      currentReportTye: 1,
      currentName: "用水",
      currentUnit: "吨"
    };
  },
  mounted() {
    this.getCompanyList();
    this.getRegionData();
    this.getTradeData();
  },
  watch: {
    // 监听 endTime 变化，更新 startTime 为其前 7 天，并确保 endTime 不超过当前时间
    "params.endTime": function (newEndTime) {
      if (newEndTime) {
        const endDateObj = new Date(newEndTime);
        const now = new Date();
        const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (endDateObj > currentDate) {
          this.params.endTime = currentDate.toISOString().split("T")[0];
          endDateObj.setTime(currentDate.getTime());
        }

        const startDateObj = new Date(endDateObj);
        startDateObj.setDate(endDateObj.getDate() - 6);
        this.params.startTime = startDateObj.toISOString().split("T")[0];
      }
    },
    // 监听 startTime 变化，更新 endTime 为其后 7 天，并确保不超过当前时间
    "params.startTime": function (newStartTime) {
      if (newStartTime) {
        const startDateObj = new Date(newStartTime);
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(startDateObj.getDate() + 6);

        const now = new Date();
        const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (endDateObj > currentDate) {
          // 如果计算出的 endTime 超过当前时间，将 endTime 设为当前时间，并调整 startTime
          this.params.endTime = currentDate.toISOString().split("T")[0];
          const newStartDateObj = new Date(currentDate);
          newStartDateObj.setDate(currentDate.getDate() - 6);
          this.params.startTime = newStartDateObj.toISOString().split("T")[0];
        } else {
          this.params.endTime = endDateObj.toISOString().split("T")[0];
        }
      }
    },
    "params.company"() {
      this.params.region = "";
      this.getRegionData();
    },
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
    weekHuanbiChart() {
      this.weekhuanbichart = markRaw(echarts.init(document.getElementById("week-huanbi")));
      this.weekhuanbichart.setOption(this.weekhuanbichart_option);

      // 创建 ResizeObserver 实例来监听 weekshouyi div 大小变化
      this.weekhuanbichartResizeObserver = new ResizeObserver(
        this.debounce(() => {
          this.weekhuanbichart.resize(); // 当大小变化时，调用 resize 来调整图表的尺寸
        }, 200)
      ); // 200 毫秒的防抖延时

      // 开始监听 weekshouyi div 的大小变化
      this.weekhuanbichartResizeObserver.observe(document.getElementById("week-huanbi"));
    },
    weekTongbiChart() {
      this.weektongbichart = markRaw(echarts.init(document.getElementById("week-tongbi")));
      this.weektongbichart.setOption(this.weektongbichart_option);

      // 创建 ResizeObserver 实例来监听 weekshouyi div 大小变化
      this.weektongbichartResizeObserver = new ResizeObserver(
        this.debounce(() => {
          this.weektongbichart.resize(); // 当大小变化时，调用 resize 来调整图表的尺寸
        }, 200)
      ); // 200 毫秒的防抖延时

      // 开始监听 weekshouyi div 的大小变化
      this.weektongbichartResizeObserver.observe(document.getElementById("week-tongbi"));
    },
    beforeUnmount() {
      if (this.weekchartResizeObserver) {
        this.weekchartResizeObserver.disconnect();
      }
      if (this.weekchart) {
        this.weekchart.dispose(); // 销毁 ECharts 实例
      }
      if (this.weekhuanbichartResizeObserver) {
        this.weekhuanbichartResizeObserver.disconnect();
      }
      if (this.weekhuanbichart) {
        this.weekhuanbichart.dispose(); // 销毁 ECharts 实例
      }
      if (this.weektongbichartResizeObserver) {
        this.weektongbichartResizeObserver.disconnect();
      }
      if (this.weektongbichart) {
        this.weektongbichart.dispose(); // 销毁 ECharts 实例
      }
    },
    getCompanyList() {
      service
        .get("/getAllCompany")
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
      console.log(this.params);
      let queryParams = {
        regionName: this.params.region,
        companyId: params.companyId,
        endDate: this.params.endTime,
        startDate: this.params.startTime,
      };
      let path = "/waterWeekReport";
      if (this.currentReportTye == 1) {
        path = "/waterWeekReport";
      } else if (this.currentReportTye == 2) {
        path = "/chargeWeekReport";
      }
      service
        .post(path, queryParams)
        .then((response) => {
          if (response.code === 200) {
            //获取横坐标
            const reportTimeStarts = response.data.wdrList.map((item) => {
              return item.date;
            });
            const hReportTime = response.data.hreports.map((item) => {
              return item.date;
            });
            // 用于存储拼接后的结果
            const combinedDates = [];

            // 遍历 reportTimeStarts 数组
            for (let i = 0; i < reportTimeStarts.length; i++) {
              // 提取 reportTimeStarts 中当前日期的月和日
              const endDate = reportTimeStarts[i];
              const endMonthDay = endDate.slice(5, 10);

              // 提取 hReportTime 中对应日期的月和日
              const startDate = hReportTime[i];
              const startMonthDay = startDate.slice(5, 10);

              // 拼接成所需的格式
              const combined = `${startMonthDay}/${endMonthDay}`;
              combinedDates.push(combined);
            }
            this.weekchart_option.xAxis.data = reportTimeStarts;
            this.weekhuanbichart_option.xAxis.data = combinedDates;
            this.weektongbichart_option.xAxis.data = reportTimeStarts.map((item) => {
              return item.slice(5, 10);
            });

            // 获取图例数据（同比）
            const firstItem = response.data.wdrList[0].date;
            if (firstItem) {
              const year = firstItem.slice(0, 4);
              const lastYear = parseInt(year) - 1;

              const result = {
                one: `${lastYear}年`,
                two: `${year}年`,
              };

              this.weektongbichart_option.series[0].name = result.one;
              this.weektongbichart_option.series[1].name = result.two;
              this.weektongbichart_option.legend.data = [result.one, result.two];
            }

            //计算本周的总额
            const totalMoneys = response.data.wdrList.map((item) => {
              return item.usage;
            });
            this.weekchart_option.series[0].data = totalMoneys;
            this.weekhuanbichart_option.series[1].data = totalMoneys;
            this.weektongbichart_option.series[1].data = totalMoneys;

            //计算环比数值
            const huanbimoneys = response.data.hreports.map((item) => {
              return item.usage;
            });
            this.weekhuanbichart_option.series[0].data = huanbimoneys;

            //计算同比数值
            const tongbimoneys = response.data.treports.map((item) => {
              return item.usage;
            });
            this.weektongbichart_option.series[0].data = tongbimoneys;
            //生成图像
            this.beforeUnmount();
            this.weekChart();
            this.weekHuanbiChart();
            this.weekTongbiChart();
            this.renewType();
          } else {
            ElMessage.error("请选择所查询的时间范围");
          }
        })
        .catch((error) => {
          ElMessage.error("请选择所查询的时间范围");
        });
    },
    clear() {
      this.params.startTime = "";
      this.params.endTime = "";
      this.params.region = "";
      this.params.company = null;
    },
    renewType() {
      if (this.currentReportTye == 1) {//跟新标签
        this.currentName = "用水"
        this.currentUnit = "吨"
      } else if (this.currentReportTye == 2) {
        this.currentName = "扣费"
        this.currentUnit = "元"
      }
    }
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

.baobiao-container>* {
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
  justify-content: center;
  /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 25%;
  height: 100%;
  margin-right: 20px;
}

.search-input>span {
  font-size: 14px;
  margin-bottom: 5px;
}

.time-input {
  display: flex;
}

.time-input>span {
  font-size: 14px;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 100%;
  margin-right: 5px;
}

.buttons {
  display: flex;
  width: 240px;
  height: 100%;
  align-items: center;
  margin-right: 30px;
}

.buttons>* {
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

.detail-info>span {
  font-size: 16px;
  color: #fff;
}

.cashdetail-info>span,
.weichatdetail-info>span,
.alipaydetail-info>span {
  font-size: 16px;
  color: #000;
}

.detail-info>.message>span {
  color: #fff;
}

.cashdetail-info>.message>span,
.weichatdetail-info>.message>span,
.alipaydetail-info>.message>span {
  color: #000;
}

.baobiao-chart {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  height: 100%;
  flex-grow: 1;
}

.week-report,
.week-huanbi,
.week-tongbi {
  background-color: #fff;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  height: 32%;
  display: flex;
  flex-direction: column;
  padding: 0 10px;
}

.week-report-title,
.week-huanbi-title,
.week-tongbi-title {
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

.week-report-chart,
.week-huanbi-chart,
.week-tongbi-chart {
  height: 100%;
  width: 100%;
  margin-bottom: 10px;
}
</style>
