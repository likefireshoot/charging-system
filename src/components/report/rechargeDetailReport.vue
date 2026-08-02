<template>
  <div class="baobiao-container">
    <!-- 搜索栏 -->
    <div class="search-box">
      <div class="search-content">
        <div class="search-input" v-if="companyId === 1">
          <span>所属水厂</span>
          <el-select class="big-font-el-select" v-model="params.company" placeholder="请选择所属水厂" @change="handleCompanyChange">
            <el-option v-for="item in companyList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </div>
        <div class="search-input">
          <span>区域</span>
          <el-select class="big-font-el-select" v-model="params.region" clearable placeholder="全部区域">
            <el-option v-for="item in quyu_data" :key="item.id" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </div>
        <div class="search-input">
          <span>收费人</span>
          <el-select v-model="params.rechargeUser" clearable filterable placeholder="请选择收费人">
            <el-option v-for="item in staffNameOptions" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </div>
        <div class="search-input">
          <span>统计时间</span>
          <el-date-picker
              v-model="params.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 320px; font-size: 16px;"
          />
        </div>
      </div>
      <div class="buttons">
        <div class="sercah-btn" @click="fetchTotalData">
          <img src="@/assets/baobiao/icon6.png" alt="" style="margin-left: 10px"/>
          <span style="margin-left: 10%">搜索</span>
        </div>
        <div class="clear-btn" @click="clearParams">
          <img src="@/assets/baobiao/icon5.png" alt="" style="margin-left: 10px"/>
          <span style="margin-left: 10%; color: #5a5a5a">清空</span>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="report-title">
        <h2>收费明细统计报表（{{ params.dateRange[0] }} - {{ params.dateRange[1] }}）</h2>
      </div>
      <div class="export-bar">
        <div class="export-out-btn" style="margin-right: 10px" @click="handleExport">
          <img src="@/assets/yonghu/icon1.3.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">导出</span>
        </div>
      </div>
      <div class="total-table-wrapper" style="width: 95%; margin: 0 auto;display: flex; flex-direction: column">
        <div class="table-scroll">
          <el-table
              class="detail-table"
              :data="detailTableData"
              border
              v-loading="loading"
              style="width:100%"
              height="100%"
              :header-cell-style="{ height: '66px',background: '#46B97E', color: '#FFFFFF', fontWeight: 'bold', fontSize: '22px' }"
              :row-style="{ height: '50px' }"
              :cell-style="{ fontSize: '22px', textAlign: 'center' }"
          >
            <el-table-column property="businessDate" label="营业时间" align="center" />
            <el-table-column property="totalCount" label="交易笔数" align="center" />
            <el-table-column property="giveAmount" label="赠送金额（元）" align="center" />
            <el-table-column property="cashAmount" label="现金（元）" align="center" />
            <el-table-column property="wxAmount" label="微信支付（元）" align="center" />
            <el-table-column property="actualAmount" label="实收总金额（元）" align="center" />
          </el-table>
        </div>
        <!-- 底部单独汇总行表格，无表头，固定在下方 -->
        <el-table
            :data="totalTable"
            border
            style="width:100%;margin-top:-1px;"
            :show-header="false"
            :cell-style="{ fontSize: '22px', textAlign: 'center', fontWeight: 'bold'}"
            row-class-name="summary-row"
        >
          <el-table-column property="businessDate" align="center" />
          <el-table-column property="totalCount" align="center" />
          <el-table-column property="giveAmount" align="center" />
          <el-table-column property="cashAmount" align="center" />
          <el-table-column property="wxAmount" align="center" />
          <el-table-column property="actualAmount" align="center" />
        </el-table>

      </div>
      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination
              v-model:current-page="params.pageNum"
              v-model:page-size="params.pageSize"
              :page-sizes="[5, 10, 30]"
              layout="total, prev, pager, next, jumper"
              :total="totalNum"
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import service from "@/api/request";
import { ElMessage, ElLoading } from "element-plus";
export default {
  name: "BillDetailReport",
  data() {
    // 计算当月第一天和最后一天
    const getMonthRange = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const firstDay = new Date(year, month, 1);
      // const lastDay = new Date(year, month + 1, 0);
      const today = new Date();
      const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      };
      return [formatDate(firstDay), formatDate(today)];
    };

    return {
      // 搜索参数
      params: {
        region: null,
        dateRange: getMonthRange(),
        company: null,
        pageNum: 1,
        pageSize: 15,
        rechargeUser: null,
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      // 下拉数据源
      companyList: [],
      quyu_data: [],
      staffNameOptions: [],
      loading: false,
      // 【新增2行】明细数组、汇总行对象
      detailTableData: [],
      totalTable: [
        {
          businessDate: "统计总额",
          totalCount: 0,
          giveAmount: "0.00",
          cashAmount: "0.00",
          wxAmount: "0.00",
          actualAmount: "0.00"
        }
      ],
      totalNum: 0, // 总条数
    };
  },
  watch: {
    "params.company"() {
      this.params.region = null;
      this.getRegionData();
    },
  },
  mounted() {
    // 逐个捕获接口错误，单个接口失败不阻塞页面渲染
    this.getCompanyList().catch(() => {});
    this.getRegionData().catch(() => {});
    this.getStaffNames().catch(() => {});
    this.fetchTotalData().catch(() => {});
  },
  methods: {
    // 页码切换
    handlePageChange(page) {
      this.params.pageNum = page;
      this.fetchTotalData();
    },
// 每页条数切换
    handleSizeChange(size) {
      this.params.pageSize = size;
      this.params.pageNum = 1;
      this.fetchTotalData();
    },
    // 获取水厂列表
    async getCompanyList() {
      try {
        const response = await service.get("/getAllUnblockCompany");
        if (response.code === 200) {
          this.companyList = response.data.map((item) => ({
            id: item.companyId,
            name: item.companyName,
          }));
        } else {
          ElMessage.error(response.msg);
        }
      } catch (error) {
        console.error("获取水厂列表失败", error);
      }
    },

    // 获取区域下拉
    async getRegionData() {
      try {
        let url = "";
        if (this.companyId === 1) {
          url = this.params.company ? `/getRegion?companyId=${this.params.company}` : "/getRegion";
        } else {
          url = `/getRegion?companyId=${this.companyId}`;
        }
        const response = await service.get(url);
        if (response.code === 200) {
          this.quyu_data = response.data.map((item) => ({
            id: item.regionId,
            value: item.regionId,
            label: item.regionName,
          }));
        }
      } catch (err) {
        ElMessage.error("获取区域数据失败");
      }
    },

    // 获取收费人列表
    async getStaffNames() {
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

    handleCompanyChange() {
      this.params.region = null;
      this.getRegionData();
    },

    async fetchTotalData() {
      this.loading = true;
      this.detailTableData = [];
      try {
        const baseParams = new URLSearchParams();
        baseParams.append("companyId", this.params.company || this.companyId)
        baseParams.append("startDate", this.params.dateRange[0])
        baseParams.append("endDate", this.params.dateRange[1])
        if (this.params.region !== null) {
          baseParams.append("regionId", this.params.region);
        }
        if (this.params.rechargeUser !== null){
          baseParams.append("rechargeUser", this.params.rechargeUser);
        }
        const detailParams = new URLSearchParams(baseParams);
        detailParams.append('pageNum', this.params.pageNum);
        detailParams.append('pageSize', this.params.pageSize);
        const response = await service.get(`/rechargeDailyReport?${detailParams.toString()}`);
        const totalRes = await service.get(`/rechargeDailyTotal?${baseParams.toString()}`);
        if (response.code === 200) {
          this.detailTableData = response.data.records || [];
          this.totalNum = response.data.total || 0;
        } else {
          ElMessage.error(response.msg || "查询失败");
        }
        if (totalRes.code === 200) {
          const total = totalRes.data;
          this.totalTable = [
            {
              businessDate: "统计总额",
              totalCount: total.totalCount,
              giveAmount: Number(total.giveAmount).toFixed(2),
              cashAmount: Number(total.cashAmount).toFixed(2),
              wxAmount: Number(total.wxAmount).toFixed(2),
              actualAmount: Number(total.actualAmount).toFixed(2)
            }
          ];
        } else {
          ElMessage.error(totalRes.msg || "汇总数据查询失败");
        }
      } catch (err) {
        ElMessage.error("数据查询异常");
      } finally {
        this.loading = false;
      }
    },

    // 导出
    async handleExport() {
      const loading = ElLoading.service({
        fullscreen: true,
        text: "正在导出，请稍后...",
        background: "rgba(0, 0, 0, 0.3)",
        customClass: "export-loading",
      });
      try {
        const exportParams = {
          companyId: this.params.company || this.companyId,
          startDate: this.params.dateRange[0],
          endDate: this.params.dateRange[1],
        };
        if (this.params.region !== null) {
          exportParams.regionId = this.params.region;
        }
        if (this.params.rechargeUser !== null) {
          exportParams.rechargeUser = this.params.rechargeUser;
        }
        const response = await service.post("/exportRechargeDailyReport", null, {
          params: exportParams,
          responseType: "blob",
        });
        const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        if (blob.size === 0) {
          ElMessage.warning("内容为空，无法下载");
          return;
        }
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `收费明细统计报表（${this.params.dateRange[0]} - ${this.params.dateRange[1]}）.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
        ElMessage.success("导出成功");
      } catch (error) {
        console.error("导出失败:", error);
        ElMessage.error("导出失败");
      } finally {
        loading.close();
      }
    },

    // 重置搜索条件
    clearParams() {
      const getMonthRange = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1);
        // const lastDay = new Date(year, month + 1, 0);
        const today = new Date();
        const formatDate = (date) => {
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, "0");
          const d = String(date.getDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        };
        return [formatDate(firstDay), formatDate(today)];
      };
      this.params = {
        region: null,
        dateRange: getMonthRange(),
        company: null,
        pageNum: 1,
        pageSize: this.params.pageSize,
        rechargeUser: null,
      };
      this.fetchTotalData();
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

:deep(.el-date-editor .el-input__inner) {
  height: 35px;
}

.baobiao-container {
  display: flex;
  flex-direction: column;
  min-width: 94%;
  height: 100%;
  padding: 0 15px;
}

.search-box {
  margin-top: 5px;
  margin-bottom: 10px;
  width: 99.3%;
  height: 98px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  background-color: #fff;
  padding: 0 10px;
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
  margin-right: 0;
}

.export-bar {
  display: flex;
  align-items: center;
  width: 100%;
  padding-left: 2.5%;
  margin-bottom: 15px;
  margin-left: 15px;
}

.export-out-btn {
  display: flex;
  align-items: center;
  width: 85px;
  height: 32px;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 20px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
}

.export-out-btn:hover {
  border-color: #45ba7e;
}

.main-content {
  width: 99.3%;
  flex: 1;
  height: calc(100% - 120px);
  border: 1px solid #e9e9e9;
  background-color: #fff;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 10px;
}

.report-title {
  text-align: center;
  margin-top: 20px;
  margin-bottom: 10px;
}

.report-title h2 {
  font-size: 30px;
  color: #333;
  margin: 0;
  font-weight: 600;
}

.total-table-wrapper {
  width: 100%;
  flex:1;
  min-height:0;

  display:flex;
  flex-direction:column;

  align-items: center;
  justify-content: flex-start;

  overflow: hidden;
}

.table-scroll {

  width:100%;

  flex:1;
  min-height:0;

  overflow:hidden;

}

:deep(.summary-row) {
  height: 66px;
  background-color: #46B97E !important;
}
:deep(.summary-row td) {
  font-size: 22px;
  text-align: center;
  font-weight: bold;
  color: white;
}
/* 隔行变色 奇数行浅绿 */
:deep(.el-table__body tr:nth-child(odd)) {
  background-color: #edf8f2;
}
/* 偶数行白色 */
:deep(.el-table__body tr:nth-child(even)) {
  background-color: #ffffff;
}
/* 鼠标悬浮高亮 */
:deep(.el-table__body tr:hover > td) {
  background-color: #fbf2cb !important;
}
.page-box {
  flex-shrink: 0;
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: static;
  margin-top: 5px;
  font-size: 18px;
}
</style>

<style scoped>
:deep(.el-input__inner) {
  font-size: 16px !important;
  font-size: 16px !important;
}
:deep(.el-select__wrapper .el-select__placeholder) {
  font-size: 16px !important;
}
:deep(.el-select__wrapper .el-select__selected-item) {
  font-size: 16px !important;
}
</style>