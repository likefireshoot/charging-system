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
            v-model="params.region"
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
          v-loading="isLoading"
        >
          <el-table-column label="序号" min-width="60" align="center" fixed="left" #default="scope">
            {{ scope.$index + 1 }}
          </el-table-column>
          <el-table-column prop="regionName" label="区域" align="center" min-width="130"/>
          <el-table-column prop="counterAmount" label="现金" align="center" min-width="100"/>
          <el-table-column prop="miniProgramAmount" label="微信小程序" align="center" min-width="100"/>
          <el-table-column prop="lifePayAmount" label="生活缴费" align="center" min-width="100"/>
<!--          <el-table-column prop="freeGiftAmount" label="免费赠送" align="center" min-width="100"/>-->
          <el-table-column prop="tradeCount" label="交易笔数" align="center" min-width="100"/>
          <el-table-column prop="totalReceiveAmount" label="实收合计" align="center" min-width="100"/>
          <el-table-column prop="periodChargeAmount" label="当月扣款" align="center" min-width="100"/>
        </el-table>
      </div>
      <el-table
        :data="[totalSummaryRow]"
        border
        style="width:100%;margin-top:-1px;"
        :show-header="false"
        row-class-name="summary-row"
      >
        <el-table-column label="序号" min-width="190" align="center" fixed="left">
          <template #default>合计</template>
        </el-table-column>
        <el-table-column prop="counterAmount" label="现金" align="center" min-width="100"/>
        <el-table-column prop="miniProgramAmount" label="微信小程序" align="center" min-width="100"/>
        <el-table-column prop="lifePayAmount" label="生活缴费" align="center" min-width="100"/>
<!--        <el-table-column prop="freeGiftAmount" label="免费赠送" align="center" min-width="100"/>-->
        <el-table-column prop="tradeCount" label="交易笔数" align="center" min-width="100"/>
        <el-table-column prop="totalReceiveAmount" label="实收合计" align="center" min-width="100"/>
        <el-table-column prop="periodChargeAmount" label="当月扣款" align="center" min-width="100"/>
      </el-table>
    </div>
  </div>
</template>

<script>
import service from "@/api/request";
import { ElMessage } from "element-plus";

export default {
  data() {
    return {
      timeRange: this.getCurMonthStr(),
      pageTitle: "月回收报表",
      params: {
        companyId: null,
        startTime: null,
        endTime: null,
        region: null,
      },
      reportMakerName: JSON.parse(sessionStorage.getItem("userData")).staffName,
      reportMakeDate: this.getTodayStr(),
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      companyList: [],
      regionList:[],
      tableData: [],
      isLoading: false,
      totalSummaryRow: {
        counterAmount: 0,
        miniProgramAmount: 0,
        lifePayAmount: 0,
        freeGiftAmount: 0,
        tradeCount: 0,
        totalReceiveAmount: 0,
        periodChargeAmount: 0
      },
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
    search() {
      if (!this.timeRange) {
        ElMessage.warning("请选择月份");
        return;
      }
      const y = this.timeRange.split("-")[0];
      const m = this.timeRange.split("-")[1];
      this.params.startTime = `${this.timeRange}-01`;
      const lastDay = new Date(Number(y), Number(m), 0).getDate();
      this.params.endTime = `${y}-${m}-${String(lastDay)}`;
      this.pageTitle = `${y}${m}月回收报表`;
      if (this.companyId === 1) {
        this.params.companyId = this.params.companyId || 1;
      } else {
        this.params.companyId = this.companyId;
      }
      this.fetchReport();
    },
    clear() {
      this.params.companyId = null;
      this.params.startTime = null;
      this.params.endTime = null;
      this.params.region = null;
      this.timeRange = this.getCurMonthStr();
      this.tableData = [];
      this.totalSummaryRow = {
        counterAmount: 0,
        miniProgramAmount: 0,
        lifePayAmount: 0,
        freeGiftAmount: 0,
        tradeCount: 0,
        totalReceiveAmount: 0,
        periodChargeAmount: 0
      };
      if (this.companyId !== 1){
        this.search()
      }
    },
    async handleExport() {
      if (this.params.companyId === null){
        this.params.companyId = this.companyId;
      }
      if ( !this.params.startTime || !this.params.endTime) {
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
      const reqData = {
        companyId: this.params.companyId,
        startDate: this.params.startTime,
        endDate: this.params.endTime,
        regionId: this.params.region,
      };
      try {
        const res = await service.post(`/exportTimeRangeRecycleReport`, reqData,{
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
      const reqData = {
        companyId: this.params.companyId,
        startDate: this.params.startTime,
        endDate: this.params.endTime,
        regionId: this.params.region,
      };
      try {
        const res = await service.post(`/timeRangeRecycleReport`, reqData,{
          headers: { Authorization: token, token: token },
        });
        if(res.code===200){
          const list = res.data || [];

          // ① 列表：剔除合计行
          this.tableData = list.filter(item => item.regionName !== '合计');

          // ② 单独合计行：把后端返回的合计行字段映射给 totalSummaryRow
          const summaryRow = list.find(item => item.regionName === '合计');
          if(summaryRow){
            this.totalSummaryRow = {
              counterAmount: summaryRow.counterAmount,
              miniProgramAmount: summaryRow.miniProgramAmount,
              lifePayAmount: summaryRow.lifePayAmount,
              freeGiftAmount: summaryRow.freeGiftAmount,
              tradeCount: summaryRow.tradeCount,
              totalReceiveAmount: summaryRow.totalReceiveAmount,
              periodChargeAmount: summaryRow.periodChargeAmount
            };
          }
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
        this.params.region = null;
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
        }else{
          this.regionList = [];
        }
      }catch(e){
        console.error(e);
        this.regionList = [];
      }
      this.params.region = null;
    },
    filterRegion(){},
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