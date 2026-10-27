<template>
  <div class="yuangong-container">
    <div class="search-box">
      <div class="search-content">
        <div class="search-input" v-if="companyId === 1">
          <span>所属水厂</span>
          <el-select v-model="params.companyId" placeholder="请选择所属水厂" @change="handleCompanyChange">
            <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </div>
        <div class="search-input">
          <span>区域</span>
          <el-select
            v-model="params.regionId"
            placeholder="选择区域"
            clearable
            @change="search"
            :disabled="!params.companyId"
            filterable
            :filter-method="filterRegion"
            style="width:100%"
          >
            <el-option v-for="item in regionList" :key="item.regionId" :label="item.regionName" :value="item.regionId"/>
          </el-select>
        </div>
        <div class="search-input">
          <span>价格类型</span>
          <el-select v-model="params.priceId" clearable placeholder="请选择价格类型" :disabled="!params.companyId">
            <el-option v-for="item in priceOptionList" :key="item.priceId" :value="item.priceId" :label="item.priceName"></el-option>
          </el-select>
        </div>
        <div class="search-input">
          <span>时间</span>
          <el-date-picker
            v-model="timeRange"
            type="month"
            placeholder="选择月份"
            value-format="YYYY-MM"
            :disabled-date="disabledDate"
            style="width:100%"
          ></el-date-picker>
        </div>
      </div>
      <div class="buttons" >
        <div class="sercah-btn" @click="search">
          <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: 10px" />
          <span style="margin-left: 10%">查询</span>
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
            ref="reportTable"
          :data="tableData"
          style="width: 100%; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
          border
          :header-cell-style="{ height:'45px', background: '#46B97E', color: '#FFFFFF' }"
          :row-style="{ height: '50px' }"
          :row-class-name="rowClassName"
          v-loading="isLoading"
        >
          <el-table-column prop="regionName" label="区域" align="center" min-width="70"/>
          <el-table-column prop="priceName" label="价格类型" align="center" min-width="100"/>
          <el-table-column prop="shouldReadUser" label="应抄" align="center" min-width="67.5"/>
          <el-table-column prop="realReadUser" label="实抄" align="center" min-width="67.5"/>
          <el-table-column prop="readRate" label="抄表率" align="center" min-width="90">
            <template #default="scope">
              {{ scope.row.readRate != null ? (scope.row.readRate * 100).toFixed(2) + '%' : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="currentWater" label="本月水量" align="center" min-width="90" />
          <el-table-column prop="lastYearWater" label="同期水量" align="center" min-width="90"/>
          <el-table-column label="水量对比" align="center" label-class-name="water-compare-parent">
            <el-table-column prop="waterDiff" align="center" min-width="80" label-class-name="water-compare-child"/>
            <el-table-column align="center" min-width="30" class-name="arrow-col" label-class-name="water-compare-child">
              <template #default="scope">
                <span v-if="Number(scope.row.waterDiff) > 0" style="color:#67c23a;font-size:20px;">↑</span>
                <span v-else-if="Number(scope.row.waterDiff) < 0" style="color:#f56c6c;font-size:20px;">↓</span>
                <span v-else>−</span>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column prop="currentTotalFee" label="本期金额" align="center" min-width="100"/>
          <el-table-column prop="additionFee" label="卫生费" align="center" min-width="100"/>
          <el-table-column prop="sewageFee" label="污水费" align="center" min-width="100"/>
          <el-table-column prop="lastYearTotalFee" label="同期金额" align="center" min-width="100"/>
          <el-table-column label="金额对比" align="center" label-class-name="fee-compare-parent">
            <el-table-column prop="feeDiff" align="center" min-width="100" label-class-name="fee-compare-child"/>
            <el-table-column align="center" min-width="30" class-name="arrow-col" label-class-name="fee-compare-child">
              <template #default="scope">
                <span v-if="Number(scope.row.feeDiff) > 0" style="color:#67c23a;font-size:18px;">↑</span>
                <span v-else-if="Number(scope.row.feeDiff) < 0" style="color:#f56c6c;font-size:18px;">↓</span>
                <span v-else>−</span>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="底数户" align="center" v-if="this.params.companyId === 95">
          <el-table-column v-if="this.params.companyId === 95" prop="ton0Count" label="0吨" align="center" min-width="60"/>
          <el-table-column v-if="this.params.companyId === 95" prop="ton1Count" label="1吨" align="center" min-width="55"/>
          <el-table-column v-if="this.params.companyId === 95" prop="ton2Count" label="2吨" align="center" min-width="55" />
          <el-table-column v-if="this.params.companyId === 95" prop="ton3Count" label="3吨" align="center" min-width="55"/>
          <el-table-column v-if="this.params.companyId === 95" prop="ton4Count" label="4吨" align="center" min-width="55"/>
          </el-table-column>
          <el-table-column v-if="this.params.companyId === 95" prop="fourTonSubtotal" label="小计" align="center" min-width="60"/>
        </el-table>
      </div>
      <el-table
        :data="[totalSummaryRow]"
        border
        style="width:100%;margin-top:-1px;"
        :show-header="false"
        row-class-name="summary-row"
      >
        <el-table-column label="区域" align="center" min-width="70">
          <template #default>总计</template>
        </el-table-column>
        <el-table-column label="价格类型" align="center" min-width="100"/>
        <el-table-column prop="shouldReadUser" label="应抄" align="center" min-width="67.5"/>
        <el-table-column prop="realReadUser" label="实抄" align="center" min-width="67.5"/>
        <el-table-column prop="readRate" label="抄表率" align="center" min-width="90">
          <template #default="scope">
            {{ scope.row.readRate != null ? (scope.row.readRate * 100).toFixed(2) + '%' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="currentWater" label="本月水量" align="center" min-width="90" />
        <el-table-column prop="lastYearWater" label="同期水量" align="center" min-width="90"/>
        <el-table-column label="水量对比" align="center">
          <el-table-column prop="waterDiff" align="center" min-width="80"/>
          <el-table-column align="center" min-width="30" class-name="arrow-col">
            <template #default="scope">
              <span v-if="Number(scope.row.waterDiff) > 0" style="color:#67c23a;font-size:20px;">↑</span>
              <span v-else-if="Number(scope.row.waterDiff) < 0" style="color:#f56c6c;font-size:20px;">↓</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column prop="currentTotalFee" label="本期金额" align="center" min-width="100"/>
        <el-table-column prop="additionFee" label="卫生费" align="center" min-width="100"/>
        <el-table-column prop="sewageFee" label="污水费" align="center" min-width="100"/>
        <el-table-column prop="lastYearTotalFee" label="同期金额" align="center" min-width="100"/>
        <el-table-column label="金额对比" align="center">
          <el-table-column prop="feeDiff" align="center" min-width="100"/>
          <el-table-column align="center" min-width="30" class-name="arrow-col">
            <template #default="scope">
              <span v-if="Number(scope.row.feeDiff) > 0" style="color:#67c23a;font-size:20px;">↑</span>
              <span v-else-if="Number(scope.row.feeDiff) < 0" style="color:#f56c6c;font-size:20px;">↓</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column v-if="this.params.companyId === 95" prop="ton0Count" label="0吨" align="center" min-width="60"/>
        <el-table-column v-if="this.params.companyId === 95" prop="ton1Count" label="1吨" align="center" min-width="55"/>
        <el-table-column v-if="this.params.companyId === 95" prop="ton2Count" label="2吨" align="center" min-width="55" />
        <el-table-column v-if="this.params.companyId === 95" prop="ton3Count" label="3吨" align="center" min-width="55"/>
        <el-table-column v-if="this.params.companyId === 95" prop="ton4Count" label="4吨" align="center" min-width="55"/>
        <el-table-column v-if="this.params.companyId === 95" prop="fourTonSubtotal" label="小计" align="center" min-width="60"/>
      </el-table>
    </div>
  </div>
</template>

<script>
import service from "@/api/request";
import { ElMessage } from "element-plus";
import yearlyReport from "@/components/report/yearlyReport.vue";

export default {
  data() {
    return {
      timeRange: this.getCurMonthStr(),
      pageTitle: "自来水公司月账务汇总",
      params: {
        companyId: null,
        reportYear: null,
        reportMonth: null,
        regionId: null,
        priceId: null,
      },
      reportMakerName: JSON.parse(sessionStorage.getItem("userData")).staffName,
      reportMakeDate: this.getTodayStr(),
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      companyList: [],
      regionList:[],
      tableData: [],
      isLoading: false,
      totalSummaryRow: {
        shouldReadUser:0,
        realReadUser:0,
        readRate:0,
        currentWater:0,
        lastYearWater:0,
        waterDiff:0,
        currentTotalFee:0,
        lastYearTotalFee:0,
        feeDiff:0
      },
      priceOptionList: [],
    };
  },
  mounted() {
    this.getCompanyList();
    if(this.companyId !== 1){
      this.params.companyId = this.companyId
      this.handleCompanyChange(this.companyId)
      // this.search()
    }
    // 页面首次挂载后，主动合并表头
    this.$nextTick(() => {
      this.mergeCompareHeaders();
    });
  },
  updated() {
    this.$nextTick(() => {
      this.mergeCompareHeaders();
    });
  },
  methods: {
    mergeCompareHeaders() {
      this.$nextTick(() => {
        const root = this.$refs.reportTable?.$el;
        if (!root) return;

        const thead = root.querySelector(
            '.el-table__header-wrapper thead'
        );
        if (!thead) return;

        const mergeGroup = (parentClass, childClass) => {
          const parent = thead.querySelector(
              `th.${parentClass}`
          );

          if (!parent) {
            console.warn(`未找到父表头：${parentClass}`);
            return;
          }

          // 找到当前父表头所在行
          const parentRow = parent.parentElement;
          if (!parentRow) return;

          // 找到父表头的下一行
          const childRow = parentRow.nextElementSibling;
          if (!childRow) {
            console.warn(`未找到子表头行：${childClass}`);
            return;
          }

          // 只从第二行寻找该组的两个子表头
          const children = Array.from(
              childRow.querySelectorAll(`th.${childClass}`)
          );

          if (children.length !== 2) {
            console.warn(
                `${childClass} 应有两个子表头，实际找到 ${children.length} 个`,
                children
            );
            return;
          }

          // 父表头横跨两列、纵跨两行
          parent.setAttribute('colspan', '2');
          parent.setAttribute('rowspan', '2');

          // 删除第二行的两个子表头
          children.forEach((child) => child.remove());
        };

        mergeGroup(
            'water-compare-parent',
            'water-compare-child'
        );

        mergeGroup(
            'fee-compare-parent',
            'fee-compare-child'
        );
      });
    },
    getTodayStr(){
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth()+1).padStart(2,'0');
      const d = String(now.getDate()).padStart(2,'0');
      return `${y}-${m}-${d}`;
    },
    getCurMonthStr(){
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth()+1).padStart(2,'0');
      return `${y}-${m}`;
    },
    // 定制需求（监利新沟）：companyId 为 93 时，只显示 2026-09 及以后的统计数据
    disabledDate(time) {
      if (this.companyId !== 93) return false;
      return time.getFullYear() < 2026 || (time.getFullYear() === 2026 && time.getMonth() < 8);
    },
    async getCompanyList() {
      await service
        .get("/getAllCompany")
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
    // 获取价格下拉列表
    async getPriceOptionList() {
      this.priceOptionList = [];
      this.params.priceId = null
      try {
        const reqParams = {
          pageNo: 1,
          pageSize: 9999999,
        };
        if (this.companyId === 1 && this.params.companyId) {
          reqParams.companyId = this.params.companyId;
        } else if (this.companyId !== 1) {
          reqParams.companyId = this.companyId;
        }else{
          ElMessage.error("获取价格类型失败");
          return ;
        }
        const res = await service.post("/price/queryPriceMg", reqParams);
        if (res.code === 200) {
          this.priceOptionList = res.data.records.map(item => ({
            priceId: item.priceId,
            priceName: item.priceName
          }));
        } else {
          ElMessage.error(res.msg || "加载价格列表失败");
        }
      } catch (err) {
        console.error("获取价格下拉失败", err);
        ElMessage.error("获取价格类型失败");
      }
    },
    search() {
      if (!this.timeRange) {
        ElMessage.warning("请选择月份");
        return;
      }
      const [year, month] = this.timeRange.split("-");
      this.params.reportYear = year;
      this.params.reportMonth = Number(month);
      this.pageTitle = `自来水公司${year}-${month}月账务汇总`;
      if (this.companyId === 1) {
        this.params.companyId = this.params.companyId || 1;
      } else {
        this.params.companyId = this.companyId;
      }
      this.fetchReport();
    },
    clear() {
      this.params.companyId = null;
      this.params.reportYear = null;
      this.params.reportMonth = null;
      this.params.regionId = null;
      this.params.priceId = null;
      this.timeRange = this.getCurMonthStr();
      this.tableData = [];
      this.totalSummaryRow = {
        shouldReadUser:0,
        realReadUser:0,
        readRate:0,
        currentWater:0,
        lastYearWater:0,
        waterDiff:0,
        currentTotalFee:0,
        lastYearTotalFee:0,
        feeDiff:0
      };
      if (this.companyId !== 1){
        this.search()
      }
    },
    async handleExport() {
      if (this.params.companyId === null){
        this.params.companyId = this.companyId;
      }
      if ( !this.params.reportYear || !this.params.reportMonth) {
        ElMessage.warning("请先选择时间，再执行导出");
        return;
      }
      let token = "";
      const userData = sessionStorage.getItem("userData");
      if (userData) {
        try {
          token = JSON.parse(userData).token;
        } catch (e) {}
      }
      try {
        const exportUrl = this.params.companyId === 95 ? '/meterUnionReport/export' : '/meterSummaryReport/export';
        const res = await service.post(exportUrl, this.params,{
          responseType: "blob",
          headers: { Authorization: token, token: token }
        });
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
      }
    },
    async fetchReport() {
      this.isLoading = true;
      let token = "";
      const userData = sessionStorage.getItem("userData");
      if (userData) {
        try {
          token = JSON.parse(userData).token;
        } catch (e) {}
      }
      if (this.params.companyId === null){
        this.params.companyId = this.companyId;
      }
      try {
        const queryUrl = this.params.companyId === 95 ? '/meterUnionReport/query' : '/meterSummaryReport/query';
        const res = await service.post(queryUrl, this.params,{
          headers: { Authorization: token, token: token },
        });
        if(res.code===200){
          // 按区域分组 + 插入小计行
          this.tableData = this.buildDisplayData(
            res.data.itemList || [],
            res.data.regionSummaryList || []
          );
          this.totalSummaryRow = res.data.totalSummary || {};
        }
      } catch (err) {
        ElMessage.error("获取报表失败");
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },
    async handleCompanyChange(companyId){
      if(!companyId){
        this.regionList = [];
        this.params.regionId = null;
        this.priceOptionList = [];
        this.params.priceId = null;
        return;
      }
      try{
        const res = await service.get(`/getRegion?companyId=${companyId}`);
        if(res.code===200){
          const allRegions = res.data||[];
          if(companyId ===95){
            this.regionList = allRegions.filter(r=> r.regionType ===1)
          }else{
            this.regionList = allRegions;
          }
          if(this.regionList.length ===0){
            ElMessage.warning(companyId ===95 ? '该水厂下暂无远传表区域' : '该水厂下暂无区域')
          }
          await this.getPriceOptionList();
        }else{
          this.regionList = [];
        }
      }catch(e){
        console.error(e);
        this.regionList = [];
      }
      this.params.regionId = null;
    },
    filterRegion(){},
    // 把明细按区域聚到一起，每个区域末尾插入小计行
    buildDisplayData(itemList, regionSummaryList) {
      const display = [];
      const itemMap = {};
      itemList.forEach(item => {
        const key = String(item.regionId);
        if (!itemMap[key]) itemMap[key] = [];
        itemMap[key].push({ ...item });
      });
      const handled = new Set();
      regionSummaryList.forEach(sum => {
        const rid = String(sum.regionId);
        handled.add(rid);
        const items = itemMap[rid] || [];
        items.forEach(d => {
          display.push(d);
        });
        display.push({
          ...sum,
          regionName: sum.regionName,
          priceName: '小计',
          isSummary: true,
        });
      });
      Object.keys(itemMap).forEach(rid => {
        if (!handled.has(rid)) {
          itemMap[rid].forEach(d => {
            display.push(d);
          });
        }
      });
      return display;
    },
    rowClassName({ row }) {
      return row.isSummary ? 'summary-subtotal' : '';
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

:deep(.el-table__header th) {
  font-size: 18px;
}

:deep(.el-table__body td) {
  font-size: 18px;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #45bb81;
  border-color: #45bb81;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner::after) {
  border-color: #fff;
}

:deep(.el-input) {
  --el-color-primary: #46b97e;
}

:deep(.el-select .el-select__wrapper) {
  height: 35px;
}

:deep(.el-select) {
  --el-color-primary: #46b97e;
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

.yuangong-table,
.page-box {
  width: 100%;
  display: flex;
  align-items: center;
}

.yuangong-table {
  height: calc(100% - 120px);
  margin-top: 8px;
  justify-content: center;
}

.page-box {
  height: 40px;
  position: absolute;
  bottom: 0;
  justify-content: space-between;
}
.page-left{
  padding-left: 10px;
  flex-shrink:0;
  color:#444;
}
.page-right{
  padding-right: 15px;
  flex-shrink:0;
  color:#444;
}
.demo-pagination-block{
  flex:1;
  display:flex;
  justify-content:center;
}
.report-title {
  display: flex;
  text-align: center;
  margin-top: 10px;
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
/* 汇总行样式：绿色底色+白色加粗文字，和表头风格统一 */
:deep(.summary-row) {
  height: 50px !important;
  background-color: #46B97E !important;
}
:deep(.summary-row td) {
  font-weight: bold;
  color: #ffffff;
  font-size: 18px;
  text-align: center;
}
:deep(.arrow-col .cell) {
  padding: 0;
}
</style>

<style scoped>
:deep(.el-input__inner) {
  font-size: 16px !important;
}

:deep(.el-select__wrapper .el-select__placeholder) {
  font-size: 16px !important;
}

:deep(.el-select__wrapper .el-select__selected-item) {
  font-size: 16px !important;
}
</style>

<style scoped>
:deep(.el-table__header th.hide-sub-header .cell) {
  visibility: hidden !important;
  font-size: 0 !important;
  padding: 0 !important;
}
:deep(.summary-subtotal) {
  font-weight: bold !important;
}
:deep(.summary-subtotal td) {
  border-bottom: 2px solid #d7d8d8 !important;
}
</style>