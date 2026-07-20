<template>
  <div class="recharge-record-dialog" v-if="recharge_cancel_record_dialogFormVisible">
    <div class="recharge-record-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon7.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 20px">充值撤销记录</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleRechargeRecordDialogClose">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="recharge-record-content">
        <div class="serach-box">
          <div class="search-input" style="width: 15%; margin-right: 10px">
            <span>用户号</span>
            <el-input v-model="transactionData.userId" placeholder="请输入..." />
          </div>
          <div class="search-input" style="width: 18%; margin-right: 10px">
            <span>表号</span>
            <el-input v-model="transactionData.meterCode" placeholder="请输入..." />
          </div>
          <div class="search-input" style="width: 18%; margin-right: 10px">
            <span>收费类型</span>
            <el-select v-model="transactionData.rechargeType" placeholder="请选择收费类型">
              <el-option label="现金" value="现金"></el-option>
              <el-option label="微信支付" value="微信支付"></el-option>
              <el-option label="免费赠送" value="免费赠送"></el-option>
            </el-select>
          </div>
          <div class="search-input" style="width: 25%; margin-right: 10px">
            <span>时间</span>
            <div class="time-input">
              <el-date-picker
                v-model="transactionData.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="flex-grow: 1; width: 100%; height: 35px"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </div>
          </div>
          <div class="buttons" style="margin-left: 5%; margin-right: 10px">
            <div class="sercah-btn" @click="search">
              <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: 8px" />
              <span style="font-size: 20px; margin-left: 8%">搜索</span>
            </div>
            <div class="clear-btn" @click="clear">
              <img src="@/assets/yonghu/icon4.png" alt="" style="margin-left: 8px" />
              <span style="font-size: 20px; margin-left: 8%; color: #5a5a5a">清空</span>
            </div>
          </div>
        </div>
        <div class="recharge-record-list">
          <div class="command-buttons">
            <div class="reflush" style="margin-left: 10px" @click="reflush">
              <img src="@/assets/yonghu/icon15.png" alt="" />
            </div>
          </div>
          <div class="recharge-record-table">
            <el-table
              ref="multipleTableRef"
              :data="list"
              row-key="theId"
              style="width: auto; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
              :max-height="tableMaxHeight"
              border
              :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
              @selection-change="handleSelectionChange"
              id="recharge-record-table"
              class="table"
            >
              <el-table-column type="selection" width="50" align="center" fixed="left" />
              <el-table-column property="userId" label="用户号" min-width="120" align="center" fixed="left" />
              <el-table-column property="userName" label="用户名称" min-width="140" align="center" />
              <el-table-column property="regionName" label="所属区域" min-width="120" align="center" />
              <el-table-column property="userPhone" label="联系电话" min-width="130" align="center" />
              <el-table-column label="表号" min-width="180" align="center">
                <template #default="scope">
                  <div class="meter-code-cell">
                    <span class="meter-code-text">{{ scope.row.meterCode || "-" }}</span>
                    <span v-if="meterStatusMap[scope.row.meterCode] !== undefined"
                          :class="['meter-status', meterStatusMap[scope.row.meterCode] === '0' ? 'current' : 'history']">
                {{ meterStatusMap[scope.row.meterCode] === '0' ? '当前表' : '历史表' }}
              </span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column property="rechargeType" label="充值方式" min-width="100" align="center" />
              <el-table-column property="rechargeAmount" label="充值金额" min-width="110" align="center">
                <template #default="scope">{{ scope.row.rechargeAmount }} 元</template>
              </el-table-column>
              <el-table-column property="createTime" label="充值时间" min-width="170" align="center" />
              <el-table-column property="createCancelTime" label="撤销时间" min-width="170" align="center" />
              <el-table-column property="cancelStaffName" label="撤销员工" min-width="100" align="center" />
              <el-table-column property="rechargeUser" label="充值员工" min-width="100" align="center" />
              <el-table-column property="oldBalance" label="充值前余额/元" min-width="120" align="center">
                <template #default="scope">{{ scope.row.oldBalance }} 元</template>
              </el-table-column>
              <el-table-column property="newBalance" label="充值后余额/元" min-width="120" align="center">
                <template #default="scope">{{ scope.row.newBalance }} 元</template>
              </el-table-column>
              <el-table-column property="cancelOldBalance" label="撤销前余额/元" min-width="130" align="center">
                <template #default="scope">{{ scope.row.cancelOldBalance ?? "-" }} 元</template>
              </el-table-column>
              <el-table-column property="cancelNewBalance" label="撤销后余额/元" min-width="130" align="center">
                <template #default="scope">{{ scope.row.cancelNewBalance ?? "-" }} 元</template>
              </el-table-column>
              <el-table-column property="meterType" label="水表类型" min-width="100" align="center" />
            </el-table>
          </div>

        </div>
        <div class="page-box">
          <div class="demo-pagination-block">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 15]" layout="total,  prev, pager, next, jumper" :total="total"
                           @current-change="handlePageChange"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import service from "@/api/request";
import { ElMessage } from "element-plus";
import axios from "axios";

export default {
  props: {
    recharge_cancel_record_dialogFormVisible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
    user: {
      type: Object,
      default: () => ({})
    },
    userMeters: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // 原有搜索条件不变，仅改名transactionData
      transactionData: {
        dateRange: [],
        meterCode: "",
        userId: "",
        rechargeType: "",
      },
      loading: false,
      list: [], // 对应上方list，替换原tableData
      multipleSelection: [],
      total: 0,
      currentPage: 1,
      pageSize: 30,
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
    };
  },
  computed: {
    tableMaxHeight() {
      return "auto";
    },
    meterStatusMap() {
      const map = {};
      (this.userMeters || []).forEach(m => {
        map[m.meterCode] = m.status;
      });
      return map;
    }
  },
  mounted() {
    this.queryList();
  },
  methods: {
    handleRechargeRecordDialogClose() {
      this.$emit("close");
    },
    selectable() {
      return true;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handlePageChange(page) {
      if (this.loading) return;
      this.currentPage = page;
      this.queryList(page);
    },

    // 组装查询参数（兼容你现有dateRange拆分为startDate/endDate）
    buildQueryParams() {
      const params = {
        ...this.transactionData,
        companyId: this.companyId
      };
      // 拆分日期区间
      if (this.transactionData.dateRange && this.transactionData.dateRange.length === 2) {
        params.createTime = `${this.transactionData.dateRange[0]} 00:00:00`;
        params.endTime = `${this.transactionData.dateRange[1]} 23:59:59`;
      }
      return this.filterEmptyParams(params);
    },

    // 拼接url参数
    buildQueryStr(params) {
      let str = "";
      for (const key in params) {
        const val = params[key];
        str += str ? `&${key}=${encodeURIComponent(val)}` : `?${key}=${encodeURIComponent(val)}`;
      }
      return str;
    },

    // 核心查询方法，对齐上方接口 /showSingleCancelRechargeMeterRecords
    async queryList(page = this.currentPage) {
      if (this.loading) return;
      this.loading = true;
      try {
        const params = this.buildQueryParams();
        const queryStr = this.buildQueryStr(params);
        // 统一接口地址（单人撤销记录）
        const url = `/userManage/userCharge/showSingleCancelRechargeMeterRecords/${page}${queryStr}`;
        console.log("请求地址：", url);
        const res = await service.get(url);
        if (res.code === 200) {
          const arr = res.data.userSingleCancelRechargeRecordData || [];
          // 格式化时间、生成序号theId，和上方完全一致
          this.list = arr.map((item, idx) => {
            return {
              ...item,
              theId: this.pageSize * (res.data.currentPages - 1) + idx + 1,
              createTime: item.createTime ? item.createTime.replace("T", " ") : "",
              createCancelTime: item.createCancelTime ? item.createCancelTime.replace("T", " ") : ""
            };
          });
          this.total = res.data.totalElements || 0;
        } else {
          ElMessage.error(res.msg);
        }
      } catch (err) {
        console.error("查询撤销记录失败", err);
        ElMessage.error("查询撤销记录失败");
      } finally {
        this.loading = false;
      }
    },

    // 搜索按钮
    search() {
      // 仅校验：至少有一个条件
      const hasDate = this.transactionData.dateRange && this.transactionData.dateRange.length === 2;
      const hasOther = !!this.transactionData.userId || !!this.transactionData.meterCode || !!this.transactionData.rechargeType;
      if (!hasDate && !hasOther) {
        ElMessage.warning("请输入查询条件");
        return;
      }
      this.currentPage = 1;
      this.queryList();
    },

    // 清空
    clear(isSearch) {
      this.transactionData.dateRange = [];
      this.transactionData.meterCode = "";
      this.transactionData.userId = "";
      this.transactionData.rechargeType = "";
      this.currentPage = 1;
      if (typeof isSearch != "number" || isNaN(isSearch)) {
        this.queryList();
      }
    },

    // 刷新按钮
    reflush() {
      this.clear(1);
      if (this.currentPage !== 1) {
        this.currentPage = 1;
        return;
      }
      this.queryList();
    },

    // 过滤空参数
    filterEmptyParams(params) {
      const obj = {};
      for (const key in params) {
        const val = params[key];
        if (val !== "" && val !== null && val !== undefined) {
          obj[key] = val;
        }
      }
      return obj;
    }
  },
};
</script>

<style scoped>
.recharge-record-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.recharge-record-dialog-content {
  width: 94%;
  max-width: 2100px;
  //max-height: 96vh;
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

.recharge-record-content {
  width: 100%;
  //min-height: 72vh;
  //max-height: calc(88vh - 45px);
  height: 100%;
  background-color: #fff;
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

.serach-box {
  margin-top: 15px;
  margin-bottom: 20px;
  height: 100px;
  display: flex;
  align-items: center;
}

.recharge-record-content > .serach-box {
  background-color: #fff;
  border-radius: 5px;
  width: 96%;
  height: 100px;
  margin-top: 5px;
  margin-bottom: 5px;
  padding: 0 10px;
}

.search-input {
  display: flex;
  justify-content: flex-start;
  justify-content: center;
  flex-direction: column;
  width: 14%;
  margin-right: 20px;
}

.search-input > span {
  font-size: 18px;
  margin-bottom: 5px;
}

.search-input > .el-input {
  height: 35px;
}

.time-input {
  display: flex;
  width: 100%;
}

.time-input > * {
  width: 50%;
  margin-right: 20px;
}

.recharge-record-content > .recharge-record-list {
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

.recharge-record-table {
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

.buttons {
  display: flex;
  width: 240px;
  height: 100%;
  margin-left: 15%;
  align-items: center;
}

.buttons > * {
  width: 120px;
  margin-right: 30px;
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
}
.clear-btn {
  background-color: #fff;
  border: 2px solid #f2f2f2;
}

.command-buttons {
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  margin-top: 10px;
  margin-bottom: 5px;
}

.summary-box {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 12px;
  margin-bottom: 8px;
}

.summary-item {
  border: 1px solid #d9efe2;
  background-color: #f7fbf8;
  border-radius: 5px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-label {
  color: #5a5a5a;
}

.summary-value {
  color: #2d8f63;
  font-weight: 600;
}

.export-in-btn,
.export-out-btn {
  display: flex;
  align-items: center;
  width: 90px;
  height: 32px;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 20px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
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

.page-box {
  width: 100%;
  height: 65px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: static;
  margin-top: 5px;
}

/* 打印对话框样式 */
.print-dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.print-icon {
  margin: 20px 0;
}

.print-message {
  text-align: center;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 15px;
}

/* 添加自动下载复选框样式 */
.auto-download-checkbox {
  width: 100%;
  text-align: center;
}

/* 是否开收据 徽章样式 */
.receipt-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.receipt-yes {
  color: #1b7a4a;
  background: #d4f0de;
  border: 2px solid #46b97e;
}

.receipt-no {
  color: #b0b3bb;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  font-weight: 400;
  font-size: 12px;
  padding: 2px 10px;
}

.refund-status-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.refunded {
  color: #1b7a4a;
  background: #d4f0de;
  border: 2px solid #46b97e;
}

.not-refunded {
  color: #b0b3bb;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  font-weight: 400;
  font-size: 12px;
  padding: 2px 10px;
}
</style>

<style>
/* 全局样式，用于自定义 Dialog 样式 */
.print-confirm-dialog .el-dialog__header {
  background-color: #f5f7fa;
  padding: 15px 20px;
  border-bottom: 1px solid #e4e7ed;
}

.print-confirm-dialog .el-dialog__title {
  font-size: 20px;
  color: #333;
}

.print-confirm-dialog .el-dialog__body {
  padding: 0;
}

.print-confirm-dialog .el-dialog__footer {
  padding: 15px 20px;
  border-top: 1px solid #e4e7ed;
}
</style>
