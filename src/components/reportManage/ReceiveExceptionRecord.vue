<template>
  <div class="receive-exception-container">
    <div class="search-box">
      <div class="search-content">
        <div class="search-input" style="margin-left: 10px">
          <span>异常类型</span>
          <el-select v-model="currentExceptionType" placeholder="请选择异常类型" @change="handleExceptionTypeChange">
            <el-option label="读数异常" value="report" />
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>表号</span>
          <el-input v-model="params.meterCode" placeholder="请输入..." />
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>设备ID</span>
          <el-input v-model="params.deviceId" placeholder="请输入..." />
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>IMEI</span>
          <el-input v-model="params.imei" placeholder="请输入..." />
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>厂商</span>
          <el-select v-model="params.vendor" placeholder="请选择厂商" clearable>
            <el-option v-for="item in vendorOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </div>
        <div class="search-input search-time-input" style="margin-left: 10px">
          <span>时间</span>
          <div class="exception-time-range">
            <el-date-picker
                v-model="dateRange.startDate"
                type="date"
                placeholder="选择日期"
                style="width: 170px; height: 35px"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
            />
            <span class="time-range-separator">至</span>
            <el-date-picker
                v-model="dateRange.endDate"
                type="date"
                placeholder="选择日期"
                style="width: 170px; height: 35px"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
            />
          </div>
        </div>
      </div>
      <div class="buttons">
        <div class="sercah-btn" @click="search">
          <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 20px; margin-left: 15%">搜索</span>
        </div>
        <div class="clear-btn" @click="clear">
          <img src="@/assets/yuangong/icon4.png" alt="" style="margin-left: 10px" />
          <span style="font-size: 20px; margin-left: 15%; color: #5a5a5a">清空</span>
        </div>
      </div>
    </div>

    <div class="yuangong-info">
      <div class="command-box">
        <div class="reflush" style="margin-left: 10px" @click="reflush">
          <img src="@/assets/yonghu/icon15.png" alt="" />
        </div>
      </div>
      <div class="yuangong-table">
        <el-table
            :data="recordData"
            row-key="id"
            style="width: 100%; height: 100%; table-layout: fixed; overflow-y: auto"
            border
            :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
            id="receive-exception-table"
        >
          <el-table-column property="exceptionType" label="异常类型" min-width="120" align="center" fixed="left" />
          <el-table-column property="vendor" label="厂商" min-width="90" align="center" />
          <el-table-column property="receiveApi" label="接收入口" min-width="170" align="center" />
          <el-table-column property="meterCode" label="表号" min-width="130" align="center" />
          <el-table-column property="imei" label="IMEI" min-width="150" align="center" />
          <el-table-column property="deviceId" label="设备ID" min-width="160" align="center" />
          <el-table-column property="messageType" label="消息类型" min-width="120" align="center" />
          <el-table-column property="commandCode" label="命令码" min-width="100" align="center" />
          <el-table-column label="创建时间" min-width="170" align="center" #default="scope">
            <span v-if="scope.row.createTime">{{ formatDateTime(scope.row.createTime) }}</span>
            <span v-else>无</span>
          </el-table-column>
          <el-table-column property="remark" label="说明" min-width="220" align="center" show-overflow-tooltip />
          <el-table-column label="报文" min-width="140" align="center" fixed="right" #default="scope">
            <el-button type="primary" size="large" @click="showDetail(scope.row)">查看</el-button>
          </el-table-column>
        </el-table>
      </div>
      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination
              v-model:current-page="params.pageNo"
              v-model:page-size="params.pageSize"
              :page-sizes="[5, 10, 15]"
              layout="total,  prev, pager, next, jumper"
              :total="total"
              @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <el-dialog v-model="detailVisible" title="接收异常数据详情" width="70%">
      <div class="detail-section">
        <div class="detail-title">解析摘要</div>
        <pre>{{ activeRecord.parsedData || "无" }}</pre>
      </div>
      <div class="detail-section">
        <div class="detail-title">原始报文</div>
        <pre>{{ activeRecord.rawData || "无" }}</pre>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import service from "@/api/request";
import { ElMessage } from "element-plus";
import formatDateTime from "@/api/common/dateConvert.js";

const createDefaultParams = (exceptionType) => ({
  pageNo: 1,
  pageSize: 50,
  meterCode: null,
  deviceId: null,
  imei: null,
  vendor: null,
  exceptionType,
  startTime: null,
  endTime: null,
  order: 1,
});

export default {
  props: {
    exceptionType: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      params: createDefaultParams(this.exceptionType),
      currentExceptionType: this.exceptionType,
      recordData: [],
      total: 0,
      isLoading: false,
      dateRange: {
        startDate: null,
        endDate: null,
      },
      detailVisible: false,
      activeRecord: {},
      vendorOptions: ["信驰", "集万讯", "太阳能", "旧信驰", "旧信驰KF01", "圣鑫", "4G信驰", "旧圣鑫"],
    };
  },
  watch: {
    exceptionType(value) {
      this.currentExceptionType = value;
      this.clear();
      this.getRecordData();
    },
  },
  mounted() {
    this.getRecordData();
  },
  methods: {
    formatDateTime,
    getDefaultParams() {
      return createDefaultParams(this.exceptionType);
    },
    handleExceptionTypeChange(value) {
      this.$emit("change-exception-type", value);
    },
    syncDateParams() {
      this.params.startTime = this.dateRange.startDate ? `${this.dateRange.startDate} 00:00:00` : null;
      this.params.endTime = this.dateRange.endDate ? `${this.dateRange.endDate} 23:59:59` : null;
    },
    handlePageChange(page) {
      if (this.isLoading) return;
      this.params.pageNo = page;
      this.getRecordData();
    },
    getRecordData() {
      if (this.isLoading) return;
      this.isLoading = true;
      this.syncDateParams();
      service
          .post("/meterReceiveExceptionRecord/queryPage", this.params)
          .then((response) => {
            if (response.code === 200) {
              this.total = response.data.total;
              this.recordData = response.data.records;
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          })
          .finally(() => {
            this.isLoading = false;
          });
    },
    search() {
      this.params.pageNo = 1;
      this.syncDateParams();
      this.getRecordData();
    },
    clear() {
      this.params = this.getDefaultParams();
      this.dateRange = {
        startDate: null,
        endDate: null,
      };
    },
    reflush() {
      this.clear();
      this.getRecordData();
    },
    showDetail(row) {
      this.activeRecord = row || {};
      this.detailVisible = true;
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

:deep(.el-tag--large) {
  font-size: 18px !important;
  height: 40px;
  padding: 0 15px;
  border-radius: 8px;
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

.receive-exception-container {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: flex-start;
  width: 100%;
  height: 98%;
  min-height: 0;
}

.search-box {
  margin-top: 15px;
  margin-bottom: 20px;
  width: 100%;
  height: 112px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  background-color: #fff;
}

.search-content {
  display: flex;
  width: calc(100% - 280px);
  height: 100%;
}

.search-input {
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 14%;
  min-width: 180px;
  height: 100%;
  margin-right: 20px;
}

.search-input > span {
  font-size: 18px;
  margin-bottom: 5px;
}

.search-time-input {
  width: 390px;
  min-width: 390px;
}

.exception-time-range {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  width: 390px;
}

.time-range-separator {
  font-size: 18px;
  margin: 0 10px;
  white-space: nowrap;
}

.buttons {
  display: flex;
  width: 260px;
  height: 100%;
  align-items: center;
  padding-right: 30px;
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
  margin-right: 50px;
}

.clear-btn {
  background-color: #fff;
  border: 2px solid #f2f2f2;
  margin-right: 10px;
}

.yuangong-info {
  width: 100%;
  flex: 1;
  min-height: 0;
  margin-bottom: 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  background-color: #fff;
  position: relative;
}

.command-box {
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  margin-top: 15px;
  margin-bottom: 10px;
}

.reflush {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 32px;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 20px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
}

.yuangong-table,
.page-box {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.yuangong-table {
  flex: 1;
  min-height: 0;
  padding-bottom: 65px;
}

.page-box {
  height: 65px;
  position: absolute;
  bottom: 0;
  background-color: #fff;
  z-index: 2;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-title {
  color: #333;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.detail-section pre {
  max-height: 300px;
  overflow: auto;
  padding: 12px;
  border: 1px solid #e6e6e6;
  border-radius: 6px;
  background: #f8fbf9;
  color: #333;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
