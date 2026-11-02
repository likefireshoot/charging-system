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
            <el-table-column prop="normalCount" label="正常" align="center" min-width="90">
              <template #default="scope">
                <span class="link-num" @click="openStatusDialog(scope.row, '正常', '审核通过')">{{ scope.row.normalCount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="noChangeCount" label="表数未动" align="center" min-width="100">
              <template #default="scope">
                <span class="link-num" @click="openStatusDialog(scope.row, '表数未动', '审核通过')">{{ scope.row.noChangeCount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="endNotReachCount" label="止码未到" align="center" min-width="100">
              <template #default="scope">
                <span class="link-num" @click="openStatusDialog(scope.row, '止码未到', '审核通过')">{{ scope.row.endNotReachCount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="readTotalCount" label="合计" align="center" min-width="100"/>
          </el-table-column>

          <el-table-column label="异常抄表" align="center">
            <el-table-column prop="meterUnclearCount" label="表不清" align="center" min-width="90">
              <template #default="scope">
                <span class="link-num" @click="openStatusDialog(scope.row, '表不清', '审核通过')">{{ scope.row.meterUnclearCount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="meterBrokenCount" label="表破" align="center" min-width="90">
              <template #default="scope">
                <span class="link-num" @click="openStatusDialog(scope.row, '表破', '审核通过')">{{ scope.row.meterBrokenCount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="meterBuriedCount" label="表埋" align="center" min-width="90">
              <template #default="scope">
                <span class="link-num" @click="openStatusDialog(scope.row, '表埋', '审核通过')">{{ scope.row.meterBuriedCount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="tempRemoveCount" label="暂拆" align="center" min-width="90">
              <template #default="scope">
                <span class="link-num" @click="openStatusDialog(scope.row, '暂拆', '审核通过')">{{ scope.row.tempRemoveCount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="otherCount" label="其它" align="center" min-width="90">
              <template #default="scope">
                <span class="link-num" @click="openStatusDialog(scope.row, '其他', '审核通过')">{{ scope.row.otherCount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="noOneHomeCount" label="无人在家" align="center" min-width="100">
              <template #default="scope">
                <span class="link-num" @click="openStatusDialog(scope.row, '无人在家', '审核通过')">{{ scope.row.noOneHomeCount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="unreadTotalCount" label="合计" align="center" min-width="100"/>
          </el-table-column>
          </el-table-column>
          <el-table-column prop="cacheReadCount" label="已抄表未审核" align="center" min-width="100">
            <template #header>已抄表<br>未审核</template>
            <template #default="scope">
              <span class="link-num" @click="openStatusDialog(scope.row, '已抄表未审核', '待审核')">{{ scope.row.cacheReadCount }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="noReadCount" label="未抄表" align="center" min-width="100">
            <template #default="scope">
                <span class="link-num" @click="scope.row.noReadCount > 0 && openStatusDialog(scope.row, '未抄表')">{{ scope.row.noReadCount }}</span>
            </template>
          </el-table-column>

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

  <!-- 未抄表明细弹窗 -->
  <div class="noread-record-dialog" v-if="noread_dialogVisible">
    <div class="noread-record-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon7.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 20px">抄表情况明细</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleNoReadDialogClose">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="noread-record-content">
        <div class="serach-box">
          <div class="noread-input" >
            <span>区域</span>
            <el-select v-model="noreadParams.regionId" clearable placeholder="选择区域" @change="handleRegionChange">
              <el-option v-for="item in noreadRegionList" :key="item.regionId" :label="item.regionName" :value="item.regionId"></el-option>
            </el-select>
          </div>
          <div class="noread-input" >
            <span>表册</span>
            <el-select v-model="noreadParams.codeBookId" clearable filterable placeholder="选择表册" @change="noreadSearch" :disabled="!noreadParams.regionId">
              <el-option v-for="item in codeBookList" :key="item.codeBookId" :label="item.codeBookName" :value="item.codeBookId"></el-option>
            </el-select>
          </div>
          <div class="noread-input" >
            <span>抄表状态</span>
            <el-select v-model="noreadParams.reportStatus" clearable placeholder="选择抄表状态" @change="handleReportStatusChange">
              <el-option label="正常" value="正常"></el-option>
              <el-option label="表数未动" value="表数未动" />
              <el-option label="止码未到" value="止码未到" />
              <el-option label="表不清" value="表不清" />
              <el-option label="表破" value="表破" />
              <el-option label="表埋" value="表埋" />
              <el-option label="暂拆" value="暂拆" />
              <el-option label="其他" value="其他" />
              <el-option label="无人在家" value="无人在家" />
              <el-option label="未抄表" value="未抄表" />
            </el-select>
          </div>
<!--          <div class="noread-input" >-->
<!--            <span>审核状态</span>-->
<!--            <el-select v-model="noreadParams.processStatus" clearable placeholder="选择审核状态" @change="noreadSearch">-->
<!--              <el-option label="待审核" value="0"></el-option>-->
<!--              <el-option label="审核通过" value="1" />-->
<!--              <el-option label="已拒绝" value="2" />-->
<!--            </el-select>-->
<!--          </div>-->
          <div class="noread-input" >
            <span>用户号</span>
            <el-input v-model="noreadParams.userId" placeholder="请输入用户号" />
          </div>
          <div class="noread-input" >
            <span>用户名</span>
            <el-input v-model="noreadParams.userName" placeholder="请输入用户名" />
          </div>
          <div class="noread-input" >
            <span>地址</span>
            <el-input v-model="noreadParams.userAddr" placeholder="请输入地址" />
          </div>
          <div class="noread-buttons">
            <div class="noread-sercah-btn" @click="noreadSearch">
              <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: 8px" />
              <span style="font-size: 20px; margin-left: 8%">搜索</span>
            </div>
<!--            <div class="noread-clear-btn" @click="noreadClear">-->
<!--              <img src="@/assets/yonghu/icon4.png" alt="" style="margin-left: 8px" />-->
<!--              <span style="font-size: 20px; margin-left: 8%; color: #5a5a5a">清空</span>-->
<!--            </div>-->
          </div>
        </div>
        <div class="noread-record-list">
          <div class="command-buttons">
            <div class="export-out-btn" @click="exportExcel">
              <img src="@/assets/yonghu/icon1.3.png" alt="" />
              <span style="margin-left: 6px; color: #5a5a5a">导出</span>
            </div>
            <div class="reflush" @click="noreadReflush">
              <img src="@/assets/yonghu/icon15.png" alt="" />
            </div>
          </div>
          <div class="noread-record-table">
            <el-table
                :data="noreadList"
                row-key="id"
                style="width: auto; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
                border
                :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
                v-loading="noreadLoading"
                id="noread-record-table"
            >
              <el-table-column label="序号" width="90" align="center" fixed="left" #default="scope">
                {{ scope.$index + 1 + (noreadCurrentPage - 1) * noreadPageSize }}
              </el-table-column>
              <el-table-column prop="userId" label="用户号" min-width="90" align="center" fixed="left"/>
              <el-table-column prop="userName" label="用户名" min-width="100" align="center"/>
              <el-table-column prop="userAddr" label="地址" min-width="180" align="center"/>
              <el-table-column prop="reportStatus" label="抄表状态" min-width="90" align="center">
                <template #default="{ row }">
                <span
                    class="status-badge"
                    :class="{
                    'badge-success': row.reportStatus === '正常',
                    'badge-warning': row.reportStatus && row.reportStatus !== '正常',
                    'badge-info': !row.reportStatus
                  }"
                >
                  {{ row.reportStatus || '-' }}
                </span>
                </template>
              </el-table-column>
              <el-table-column prop="processStatus" label="处理状态" min-width="90" align="center">
                <template #default="{ row }">
                  <span
                      class="status-badge"
                      :class="{
                      'badge-warning': row.processStatus === '待审核',
                      'badge-success': row.processStatus === '审核通过',
                      'badge-info': row.processStatus === '无数据' || !row.processStatus
                    }"
                  >
                    {{ row.processStatus || '-' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="startReading" label="起码" min-width="80" align="center">
                <template #default="{ row }">
                  <span>{{ row.startReading ? row.startReading : '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="endReading" label="止码" min-width="80" align="center">
                <template #default="{ row }">
                  <span>{{ row.endReading ? row.endReading : '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="deltaWater" label="用水量" min-width="80" align="center">
                <template #default="{ row }">
                  <span>{{ row.deltaWater ? row.deltaWater : '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="feeThisTime" label="扣费" min-width="80" align="center">
                <template #default="{ row }">
                  <span>{{ row.feeThisTime ? row.feeThisTime : '-' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="抄表时间" min-width="120" align="center">
                <template #default="scope">
                  {{ scope.row.createTime ? scope.row.createTime.replace('T', ' ') : '-' }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <div class="noread-page-box">
          <div class="demo-pagination-block">
            <el-pagination
                v-model:current-page="noreadCurrentPage"
                v-model:page-size="noreadPageSize"
                :page-sizes="[10, 20, 30]"
                layout="total, prev, pager, next, jumper"
                :total="noreadTotal"
                @current-change="handleNoReadPageChange"
            />
          </div>
        </div>
      </div>
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

      // 未抄表用户信息弹窗参数
      noread_dialogVisible: false,
      noreadLoading: false,
      noreadList: [],
      noreadTotal: 0,
      noreadCurrentPage: 1,
      noreadPageSize: 30,
      noreadRegionList: [],
      codeBookList: [],
      noreadParams: {
        companyId: null,
        regionId: null,
        codeBookId: null,
        reportStatus: null,
        processStatus: null,
        userId: "",
        userName: "",
        userAddr: "",
        reportMonth: ""
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
      const lastDay = new Date(y, m, 0).getDate();
      this.params.endTime = `${y}-${m}-${lastDay}`;
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
        this.tableData = [];
        this.totalSummaryRow = {};
      } finally {
        this.isLoading = false;
      }
    },
    // 打开明细弹窗，带入点击行的区域id + 当前报表月份
    openStatusDialog(row, statusName, processStatusVal) {
      // 数字是0的时候不点开
      const numMap = {
        '正常': row.normalCount,
        '表数未动': row.noChangeCount,
        '止码未到': row.endNotReachCount,
        '表不清': row.meterUnclearCount,
        '表破': row.meterBrokenCount,
        '表埋': row.meterBuriedCount,
        '暂拆': row.tempRemoveCount,
        '其他': row.otherCount,
        '无人在家': row.noOneHomeCount,
        '已抄表未审核': row.cacheReadCount,
        '未抄表': row.noReadCount
      }
      if(statusName && numMap[statusName] === 0){
        ElMessage.warning('该状态暂无数据')
        return
      }
      this.noreadParams.regionId = row.regionId;
      this.noreadParams.reportStatus = statusName;
      this.noreadParams.processStatus = processStatusVal;
      this.noreadParams.reportMonth = this.timeRange;
      if(this.companyId !== 1){
        this.noreadParams.companyId = this.companyId
      }else{
        this.noreadParams.companyId = this.params.companyId
      }
      this.noread_dialogVisible = true;
      this.getNoreadRegionList();
      this.getBookList();
      this.noreadSearch();
    },
    // 关闭弹窗
    handleNoReadDialogClose() {
      this.noread_dialogVisible = false;
      this.noreadList = [];
      this.codeBookList = [];
      this.noreadParams = {
        companyId: this.noreadParams.companyId,
        regionId: null,
        codeBookId: null,
        reportStatus: null,
        processStatus: null,
        userId: "",
        userName: "",
        userAddr: "",
        reportMonth: this.timeRange
      }
      this.noreadCurrentPage = 1;
      this.noreadTotal = 0;
    },
    // 获取弹窗区域下拉
    async getNoreadRegionList() {
      if (!this.noreadParams.companyId) {
        this.noreadRegionList = [];
        this.codeBookList = []
        return;
      }
      try {
        const res = await service.get(`/getRegion?companyId=${this.noreadParams.companyId}`);
        if (res.code === 200) {
          const allRegions = res.data || [];
          // 洪湖峰口（companyId=95）：放行全部区域，不做普表筛选
          // 原因：洪湖峰口业务场景特殊，所有区域类型均需在区域抄表报表中可选
          if (this.noreadParams.companyId === 95) {
            this.noreadRegionList = allRegions;
          } else {
            // 其他水厂：仅筛选普表区域（名称含"普表"历史兼容，或 regionType === 3）
            this.noreadRegionList = allRegions.filter(region =>
                (region.regionName && region.regionName.includes('普表')) || region.regionType === 3
            );
          }
          if (this.noreadRegionList.length === 0) {
            ElMessage.warning('该水厂下暂无普表区域');
          }
        } else {
          ElMessage.error(res.msg || '获取区域列表失败');
          this.noreadRegionList = [];
        }
      } catch (error) {
        console.error('获取区域列表错误:', error);
        ElMessage.error('网络请求失败');
        this.noreadRegionList = [];
      }
    },
    // 获取表册下拉
    async getBookList () {
      this.codeBookList = [];
      if (!this.noreadParams.regionId) return;
      try {
        const res = await service.get(`/getCodeBookByRegion?companyId=${this.noreadParams.companyId}&regionId=${this.noreadParams.regionId}`);
        if (res.code === 200) {
          this.codeBookList = res.data || [];
        } else {
          ElMessage.error(res.msg || '获取表册列表失败');
            this.codeBookList = [];
        }
      } catch (error) {
        console.error('获取表册列表错误:', error);
        ElMessage.error('网络请求失败');
        this.codeBookList = [];
      }
    },
    async handleRegionChange() {
      this.noreadParams.codeBookId = null;
      await this.getBookList();
      this.noreadSearch();
    },
    // 弹窗搜索
    noreadSearch() {
      this.noreadCurrentPage = 1;
      this.fetchNoreadList();
    },
// 弹窗清空条件
    noreadClear() {
      this.noreadParams = {
        companyId: this.noreadParams.companyId,
        regionId: null,
        codeBookId: null,
        reportStatus: null,
        processStatus: null,
        userId: "",
        userName: "",
        userAddr: "",
        reportMonth: this.timeRange
      }
      this.noreadCurrentPage = 1;
      this.noreadTotal = 0;
      this.noreadList = [];
      // this.fetchNoreadList();
    },
    noreadReflush() {
      this.noreadSearch();
    },
    handleNoReadPageChange(page) {
      this.noreadCurrentPage = page;
      this.fetchNoreadList();
    },
    // 请求未抄表明细接口（重点：url改成你后端真实接口）
    async fetchNoreadList() {
      if (!this.noreadParams.regionId){
        ElMessage.warning('请选择区域');
        return ;
      }
      this.noreadLoading = true;
      try {
        const [y, m] = this.noreadParams.reportMonth.split('-')
        const start = `${this.noreadParams.reportMonth}-01T00:00:00`
        const lastDay = new Date(y, m, 0).getDate()
        const end = `${this.noreadParams.reportMonth}-${lastDay}T23:59:59`

        const p = {
          companyId: this.noreadParams.companyId,
          regionId: this.noreadParams.regionId,
          codeBookId: this.noreadParams.codeBookId,
          startTime: start,
          endTime: end,
          userId: this.noreadParams.userId,
          userName: this.noreadParams.userName,
          userAddr: this.noreadParams.userAddr,
          reportStatus: this.noreadParams.reportStatus,
          processStatus: this.noreadParams.processStatus,
          page: this.noreadCurrentPage,
          pageSize: this.noreadPageSize
        }
        // 这里替换成后端未抄表明细接口地址
        const res = await service.get("/manual/charge/regionMeterDetailReport", {params:p})
        if(res.code === 200) {
          this.noreadList = res.data.list || []
          this.noreadTotal = res.data.total || 0
        }else{
          ElMessage.error(res.msg || "查询明细失败")
        }
      } catch (e) {
        console.error(e)
        ElMessage.error("查询异常")
      } finally {
        this.noreadLoading = false
      }
    },
    async exportExcel() {
      // 参数校验
      if (!this.noreadParams.companyId) {
        ElMessage.warning('缺少水厂信息，无法导出');
        return;
      }
      if (!this.noreadParams.reportMonth) {
        ElMessage.warning('缺少月份信息，无法导出');
        return;
      }
      let token = '';
      const userData = sessionStorage.getItem("userData");
      if (userData) {
        try {
          token = JSON.parse(userData).token;
        } catch (e) {}
      }
      try {
        const [y, m] = this.noreadParams.reportMonth.split('-')
        const start = `${this.noreadParams.reportMonth}-01T00:00:00`
        const lastDay = new Date(y, m, 0).getDate()
        const end = `${this.noreadParams.reportMonth}-${lastDay}T23:59:59`

        const res = await service.get(`/manual/charge/exportRegionMeterDetailReport`, {
          params: {
            companyId: this.noreadParams.companyId,
            regionId: this.noreadParams.regionId,
            codeBookId: this.noreadParams.codeBookId,
            startTime: start,
            endTime: end,
            userId: this.noreadParams.userId,
            userName: this.noreadParams.userName,
            userAddr: this.noreadParams.userAddr,
            reportStatus: this.noreadParams.reportStatus,
            processStatus: this.noreadParams.processStatus,
          },
          responseType: "blob",
          headers: { Authorization: token, token: token }
        });
        const blob = new Blob([res.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        // 文件名，可自行修改
        a.download = `${this.noreadParams.reportMonth}未抄表明细.xlsx`;
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
    handleReportStatusChange(val) {
      if (val === '未抄表') {
        this.noreadParams.processStatus = null
      } else if (val === '已抄表未审核') {
        this.noreadParams.processStatus = '待审核'
      } else {
        this.noreadParams.processStatus = '审核通过'
      }
      this.noreadSearch()
    }
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
.noread-record-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}
.noread-record-dialog-content {
  width: 94%;
  max-width: 2100px;
  height: 98%;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.noread-record-content {
  width: 100%;
  height: 100%;
  border-radius: 5px;
  margin-top: 0px;
  margin-bottom: 5px;
  display: flex;
  background: none;
  flex-direction: column;
  align-items: center;
  flex-wrap: nowrap;
  padding: 1%;
  overflow-y: auto;
}
.noread-record-content > .serach-box {
  background-color: #fff;
  border-radius: 5px;
  width: 96%;
  height: 100px;
  margin-top: 5px;
  margin-bottom: 5px;
  padding: 0 10px;
  display: flex;
  align-items: center;
}
.noread-input {
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 10%;
  margin-right: 20px;
}
.noread-input > span {
  font-size: 18px;
  margin-bottom: 5px;
}
.noread-buttons {
  display: flex;
  width: 120px;
  height: 100%;
  margin-left: auto;
  align-items: center;
}
.noread-buttons > * {
  width: 120px;
  margin-right: 30px;
}
.noread-sercah-btn,
.noread-clear-btn {
  display: flex;
  align-items: center;
  height: 32px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  color: #fff;
}
.noread-sercah-btn {
  background-color: #45ba7e;
}
.noread-clear-btn {
  background-color: #fff;
  border: 2px solid #f2f2f2;
}
.noread-record-content > .noread-record-list {
  width: 96%;
  background-color: #fff;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
  padding: 0 10px;
  margin-bottom: 10px;
}
.noread-record-table {
  width: 100%;
  height: 100vh;
  margin-top: 5px;
  overflow-y: auto;
}
.title {
  width: 100%;
  background-color: #fff;
  border-radius: 5px 5px 0 0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  height: 45px;
  line-height: 45px;
  text-align: center;
  display: flex;
  justify-content: space-between;
}
.noread-page-box {
  width: 100%;
  height: 65px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: static;
  margin-top: 5px;
}
.status-badge {
  display: inline-block;
  font-size: 20px;
  line-height: 1;
  padding: 5px 12px;
  border-radius: 4px;
  border: 1px solid transparent;
  white-space: nowrap;
  vertical-align: middle;
}

.status-badge.badge-success {
  color: #67c23a;
  background-color: #f0f9eb;
  border-color: #e1f3d8;
}

.status-badge.badge-warning {
  color: #e6a23c;
  background-color: #fdf6ec;
  border-color: #faecd8;
}

.status-badge.badge-info {
  color: #909399;
  background-color: #f4f4f5;
  border-color: #e9e9e9;
}
.command-buttons > * {
  margin-right: 10px;
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
:deep(.link-num) {
  color: #46b97e;
  cursor: pointer;
}
</style>