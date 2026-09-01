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
            style="width:100%"
          ></el-date-picker>
        </div>
      </div>
      <div class="buttons" >
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
          style="width: 100%; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
          border
          :header-cell-style="{ height:'45px', background: '#46B97E', color: '#FFFFFF' }"
          :row-style="{ height: '50px' }"
          :row-class-name="rowClassName"
          v-loading="isLoading"
        >
          <el-table-column prop="regionName" label="区域" align="center" min-width="80"/>
          <el-table-column prop="priceName" label="价格类型" align="center" min-width="180"/>
          <el-table-column prop="shouldReadUser" label="应抄" align="center" min-width="80"/>
          <el-table-column prop="realReadUser" label="实抄" align="center" min-width="80"/>
          <el-table-column prop="readRate" label="抄表率" align="center" min-width="90">
            <template #default="scope">
              {{ scope.row.readRate != null ? (scope.row.readRate * 100).toFixed(2) + '%' : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="currentWater" label="本月水量" align="center" min-width="100" />
          <el-table-column prop="lastYearWater" label="同期水量" align="center" min-width="100"/>
          <el-table-column label="水量对比" align="center">
            <el-table-column prop="waterDiff" align="center" min-width="100"/>
            <el-table-column align="center" min-width="40">
              <template #default="scope">
                <span v-if="Number(scope.row.waterDiff) > 0" style="color:#67c23a;font-size:20px;">↑</span>
                <span v-else-if="Number(scope.row.waterDiff) < 0" style="color:#f56c6c;font-size:20px;">↓</span>
                <span v-else>−</span>
              </template>
            </el-table-column>
          </el-table-column>
          <el-table-column prop="currentTotalFee" label="本期金额" align="center" min-width="100"/>
          <el-table-column prop="lastYearTotalFee" label="同期金额" align="center" min-width="100"/>
          <el-table-column label="金额对比" align="center">
            <el-table-column prop="feeDiff" align="center" min-width="100"/>
            <el-table-column align="center" min-width="40">
              <template #default="scope">
                <span v-if="Number(scope.row.feeDiff) > 0" style="color:#67c23a;font-size:20px;">↑</span>
                <span v-else-if="Number(scope.row.feeDiff) < 0" style="color:#f56c6c;font-size:20px;">↓</span>
                <span v-else>−</span>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </div>
      <el-table
        :data="[totalSummaryRow]"
        border
        style="width:100%;margin-top:-1px;"
        :show-header="false"
        row-class-name="summary-row"
      >
        <el-table-column label="区域" align="center" min-width="80" fixed="left">
          <template #default>总计</template>
        </el-table-column>
        <el-table-column label="价格类型" align="center" min-width="180"/>
        <el-table-column prop="shouldReadUser" label="应抄" align="center" min-width="80"/>
        <el-table-column prop="realReadUser" label="实抄" align="center" min-width="80"/>
        <el-table-column prop="readRate" label="抄表率" align="center" min-width="90"/>
        <el-table-column prop="currentWater" label="本月水量" align="center" min-width="100" />
        <el-table-column prop="lastYearWater" label="同期水量" align="center" min-width="100"/>
        <el-table-column label="水量对比" align="center">
          <el-table-column prop="waterDiff" align="center" min-width="100"/>
          <el-table-column align="center" min-width="40">
            <template #default="scope">
              <span v-if="Number(scope.row.waterDiff) > 0" style="color:#67c23a;font-size:20px;">↑</span>
              <span v-else-if="Number(scope.row.waterDiff) < 0" style="color:#f56c6c;font-size:20px;">↓</span>
            </template>
          </el-table-column>
        </el-table-column>
        <el-table-column prop="currentTotalFee" label="本期金额" align="center" min-width="100"/>
        <el-table-column prop="lastYearTotalFee" label="同期金额" align="center" min-width="100"/>
        <el-table-column label="金额对比" align="center">
          <el-table-column prop="feeDiff" align="center" min-width="100"/>
          <el-table-column align="center" min-width="40">
            <template #default="scope">
              <span v-if="Number(scope.row.feeDiff) > 0" style="color:#67c23a;font-size:20px;">↑</span>
              <span v-else-if="Number(scope.row.feeDiff) < 0" style="color:#f56c6c;font-size:20px;">↓</span>
            </template>
          </el-table-column>
        </el-table-column>
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
      this.search()
    }
  },
  methods: {
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
        const res = await service.post(`/meterSummaryReport/export`, this.params,{
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
        const res = await service.post(`/meterSummaryReport/query`, this.params,{
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
            this.regionList = allRegions;
          }else{
            this.regionList = allRegions.filter(r=>
              (r.regionName && r.regionName.includes('普表')) || r.regionType ===3
            )
          }
          if(this.regionList.length ===0){
            ElMessage.warning('该水厂下暂无普表区域')
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
  font-size: 20px;
  text-align: center;
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
:deep(.el-table__header tr:nth-child(2)) {
  display: none !important;
}
/* 让第一行的父单元格自动撑开合并2列宽度 */
:deep(.el-table__header tr:first-child th[colspan="2"]) {
  colspan:2;
  text-align: center;
}
:deep(.summary-subtotal) {
  font-weight: bold !important;
}
:deep(.summary-subtotal td) {
  border-bottom: 2px solid #d7d8d8 !important;
}
</style>
