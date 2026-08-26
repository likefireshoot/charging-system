<template>
  <div class="yuangong-container">
    <div class="search-box">
      <div class="search-content">
        <div class="search-input" v-if="companyId === 1">
          <span>所属水厂</span>
          <el-select v-model="params.companyId" placeholder="请选择所属水厂">
            <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id"></el-option>
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
          <el-table-column label="序号" min-width="80" align="center" fixed="left" #default="scope">
            {{ scope.$index + 1 }}
          </el-table-column>
          <el-table-column prop="regionName" label="区域" align="center" min-width="130"/>
          <el-table-column prop="totalMeterCount" label="总户数" align="center" min-width="100"/>

          <el-table-column label="已审核" align="center">
          <el-table-column label="成功抄表" align="center">
            <el-table-column prop="normalCount" label="正常" align="center" min-width="90"/>
            <el-table-column prop="noChangeCount" label="表数未动" align="center" min-width="100"/>
            <el-table-column prop="endNotReachCount" label="止码未到" align="center" min-width="100"/>
            <el-table-column prop="readTotalCount" label="合计" align="center" min-width="100"/>
          </el-table-column>

          <el-table-column label="异常抄表" align="center">
            <el-table-column prop="meterUnclearCount" label="表不清" align="center" min-width="90"/>
            <el-table-column prop="meterBrokenCount" label="表破" align="center" min-width="90"/>
            <el-table-column prop="meterBuriedCount" label="表埋" align="center" min-width="90"/>
            <el-table-column prop="tempRemoveCount" label="暂拆" align="center" min-width="90"/>
            <el-table-column prop="otherCount" label="其它" align="center" min-width="90"/>
            <el-table-column prop="noOneHomeCount" label="无人在家" align="center" min-width="100"/>
            <el-table-column prop="unreadTotalCount" label="合计" align="center" min-width="100"/>
          </el-table-column>
          </el-table-column>
          <el-table-column prop="cacheReadCount" label="已抄表未审核" align="center" min-width="100">
            <template #header>已抄表<br>未审核</template>
          </el-table-column>
          <el-table-column prop="noReadCount" label="未抄表" align="center" min-width="100"/>
        </el-table>
      </div>
      <!-- 底部固定汇总行，无表头，紧贴表格下方 -->
      <el-table
        :data="[totalSummaryRow]"
        border
        style="width:100%;margin-top:-1px;"
        :show-header="false"
        row-class-name="summary-row"
      >
        <el-table-column label="序号" min-width="210" align="center" fixed="left">
          <template #default>合计</template>
        </el-table-column>
        <el-table-column label="总户数" min-width="100" align="center" prop="totalMeterSum" />
        <el-table-column label="正常" min-width="90" align="center" prop="normalSum" />
        <el-table-column label="表数未动" min-width="100" align="center" prop="noChangeSum" />
        <el-table-column label="止码未到" min-width="100" align="center" prop="endNotReachSum" />
        <el-table-column label="已抄合计" min-width="100" align="center" prop="readTotalSum" />
        <el-table-column label="表不清" min-width="90" align="center" prop="meterUnclearSum" />
        <el-table-column label="表破" min-width="90" align="center" prop="meterBrokenSum" />
        <el-table-column label="表埋" min-width="90" align="center" prop="meterBuriedSum" />
        <el-table-column label="暂拆" min-width="90" align="center" prop="tempRemoveSum" />
        <el-table-column label="其它" min-width="90" align="center" prop="otherSum" />
        <el-table-column label="无人在家" min-width="100" align="center" prop="noOneHomeSum" />
        <el-table-column label="未抄合计" min-width="100" align="center" prop="unreadTotalSum" />
        <el-table-column prop="cacheReadSum" label="已抄表未审核" align="center" min-width="100"/>
        <el-table-column prop="noReadSum" label="未抄表" align="center" min-width="100"/>
      </el-table>
<!--      <div class="page-box">-->
<!--        <div class="page-left">制表人：{{ reportMakerName }}</div>-->
<!--        <div class="demo-pagination-block">-->
<!--          <el-pagination v-model:current-page="params.pageNo" v-model:page-size="params.pageSize" :page-sizes="[5, 10, 15]" layout="total,  prev, pager, next, jumper" :total="total"-->
<!--                         @current-change="handlePageChange"/>-->
<!--        </div>-->
<!--        <div class="page-right">制表时间：{{ reportMakeDate }}</div>-->
<!--      </div>-->
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
      pageTitle: "城区抄表情况报表",
      params: {
        companyId: null,
        startTime: null,
        endTime: null,
      },
      reportMakerName: JSON.parse(sessionStorage.getItem("userData")).staffName,
      reportMakeDate: this.getTodayStr(),
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      companyList: [],
      tableData: [],
      total: 0,
      isLoading: false,
      totalSummaryRow: {
          totalMeterSum: 0,
          normalSum: 0,
          noChangeSum: 0,
          endNotReachSum: 0,
          readTotalSum: 0,
          meterUnclearSum: 0,
          meterBrokenSum: 0,
          meterBuriedSum: 0,
          tempRemoveSum: 0,
          otherSum: 0,
          noOneHomeSum: 0,
          unreadTotalSum: 0,
          readNoReviewTotal: 0,
          unReadTotal: 0,
          cacheReadSum: 0,
          noReadSum: 0
       },
    };
  },
  mounted() {
    this.getCompanyList();
    this.search();
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
    getCompanyList() {
      service
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
      const nextMonth = Number(m) + 1;
      if(nextMonth > 12){
        this.params.endTime = `${Number(y)+1}-01-01`
      }else{
        this.params.endTime = `${y}-${String(nextMonth).padStart(2,'0')}-01`
      }
      this.pageTitle = `${y}年${m}月城区抄表情况报表`;
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
      this.timeRange = this.getCurMonthStr();
      this.tableData = [];
      this.total = 0;
      this.search();
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
      try {
        const res = await service.get(`/manual/charge/regionMeterReport/export?companyId=${this.params.companyId}&startTime=${this.params.startTime}&endTime=${this.params.endTime}`, {
          responseType: "blob",
          headers: { Authorization: token, token: token }
        });
        const blob = new Blob([res.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        // 文件名：2026‑08月城区抄表情况报表.xlsx
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
        const res = await service.get(`/manual/charge/regionMeterReport?companyId=${this.params.companyId}&startTime=${this.params.startTime}&endTime=${this.params.endTime}`, {
          headers: { Authorization: token, token: token },
        });
        if(res.code===200){
          const {summary, detailList} = res.data;
          this.tableData = detailList || [];
          if(summary){
            this.totalSummaryRow = summary;
          }
        }
      } catch (err) {
        ElMessage.error("获取报表失败");
        console.error(err);
      } finally {
        this.isLoading = false;
      }
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