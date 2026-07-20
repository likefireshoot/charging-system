<template>
  <div class="transaction-table-container">
    <div class="search-bar">
      <div class="search-input-item">
        <span>充值类型</span>
        <el-select v-model="transactionData.rechargeType" placeholder="全部" style="width: 130px; font-size: 18px;" @change="handleTimeTypeChange">
          <el-option label="全部" value="" />
          <el-option label="现金" value="现金" />
          <el-option label="微信支付" value="微信支付" />
          <el-option label="免费赠送" value="免费赠送" />
        </el-select>
      </div>
      <div class="search-input-item">
        <span>时间</span>
        <div class="time-input">
          <el-select v-model="transactionData.timeType" placeholder="请选择" style="width: 100px; font-size: 18px;" @change="handleTimeTypeChange">
            <el-option label="年" value="year" />
            <el-option label="月" value="month" />
            <el-option label="日" value="day" />
            <el-option label="自定义" value="custom" />
          </el-select>
          <el-date-picker
            v-if="transactionData.timeType === 'year'"
            v-model="transactionData.createTime"
            type="year"
            placeholder="选择年份"
            value-format="YYYY"
            style="width: 180px; font-size: 18px;"
          />
          <el-date-picker
            v-else-if="transactionData.timeType === 'month'"
            v-model="transactionData.createTime"
            type="month"
            placeholder="选择月份"
            value-format="YYYY-MM"
            style="width: 180px; font-size: 18px;"
          />
          <el-date-picker
            v-else-if="transactionData.timeType === 'day'"
            v-model="transactionData.createTime"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 200px; font-size: 18px;"
          />
          <el-date-picker
            v-else-if="transactionData.timeType === 'custom'"
            v-model="transactionData.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 300px; font-size: 18px;"
          />
        </div>
      </div>
      <div class="search-buttons">
        <div class="search-btn" @click="handleSearch">
          <img src="@/assets/yonghu/icon16.png" alt="" />
          <span>搜索</span>
        </div>
        <div class="clear-btn" @click="handleClear">
          <img src="@/assets/yonghu/icon4.png" alt="" />
          <span>清空</span>
        </div>
      </div>
    </div>

    <div class="tool-bar">
      <div class="tool-btn" :class="{ 'disabled-btn': multipleSelection.length !== 1 }" @click="multipleSelection.length === 1 && handleReceipt()">
        <img src="@/assets/yonghu/icon26.png" alt="" />
        <span>开收据</span>
      </div>
      <div class="tool-btn" style="margin-right: 10px; width: 130px" :class="{ 'disabled-btn': multipleSelection.length !== 1 }" @click="multipleSelection.length === 1 && openCancelDialog()">
        <img src="@/assets/yonghu/icon27.png" alt="" style="margin-left: 7px" />
        <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">撤销充值</span>
      </div>
      <div class="export-out-btn" style="margin-right: 10px; width: 130px" :class="{ 'btn-disabled': !canWechatRefund }" @click="canWechatRefund && handleWechatRefund()">
        <img src="@/assets/yonghu/icon1.3.png" alt="" style="margin-left: 7px" />
        <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">微信退款</span>
      </div>
      <div class="tool-btn" @click="downloadTemplate" v-if="staffPermissionIds.includes(53)">
        <img src="@/assets/yonghu/icon1.png" alt="" />
        <span>历史数据导⼊模版下载</span>
      </div>
      <div class="tool-btn" @click="triggerFileInput" v-if="staffPermissionIds.includes(53)">
        <img src="@/assets/yonghu/icon2.png" alt="" />
        <span>历史数据导⼊</span>
        <input ref="fileInput" type="file" accept=".xls,.xlsx" style="display: none" @change="handleImport" />
      </div>
      <div class="tool-btn" @click="exportExcel">
        <img src="@/assets/yonghu/icon1.3.png" alt="" />
        <span>导出</span>
      </div>
      <div class="refresh-btn" @click="handleRefresh">
        <img src="@/assets/yonghu/icon15.png" alt="" />
      </div>
    </div>

    <div class="table-wrapper">
      <el-table
        ref="multipleTableRef"
        :data="list"
        border
        v-loading="loading"
        style="width: 100%"
        :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
        :row-style="{ height: '50px' }"
        height="100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" fixed="left" />
        <el-table-column property="userId" label="用户号" min-width="120" align="center" fixed="left" />
        <el-table-column property="userName" label="用户名称" min-width="120" align="center" />
        <el-table-column property="regionName" label="所属区域" min-width="120" align="center" />
<!--        <el-table-column property="userPhone" label="联系电话" min-width="130" align="center" />-->
        <el-table-column label="表号" min-width="190" align="center">
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
<!--        <el-table-column property="meterType" label="水表类型" min-width="100" align="center" />-->
<!--        <el-table-column property="payerPhone" label="缴费人手机号" min-width="140" align="center" />-->
        <el-table-column property="rechargeType" label="交易方式" min-width="90" align="center" />
        <el-table-column property="rechargeAmount" label="交易金额" min-width="110" align="center">
          <template #default="scope">{{ scope.row.rechargeAmount }} 元</template>
        </el-table-column>
        <el-table-column property="oldBalance" label="充值前余额/元" min-width="120" align="center">
          <template #default="scope">{{ scope.row.oldBalance }} 元</template>
        </el-table-column>
        <el-table-column property="newBalance" label="充值后余额/元" min-width="120" align="center">
          <template #default="scope">{{ scope.row.newBalance }} 元</template>
        </el-table-column>
        <el-table-column property="createTime" label="交易时间" min-width="170" align="center" />
        <el-table-column property="rechargeUser" label="收费人" min-width="100" align="center" />
        <el-table-column property="status" label="微信是否已退费" min-width="90" align="center">
          <template #default="{ row }">
            <span v-if="row.rechargeType === '微信支付'" class="refund-status-badge" :class="row.status === 2 ? 'refunded' : 'not-refunded'">
              {{ row.status === 2 ? '是' : '否' }}
            </span>
            <span v-else style="color: #b0b3bb;">-</span>
          </template>
        </el-table-column>
        <el-table-column property="hasShouju" label="是否开收据" min-width="90" align="center">
          <template #default="{ row }">
            <span class="receipt-badge" :class="row.hasShouju ? 'receipt-yes' : 'receipt-no'">
              {{ row.hasShouju ? '是' : '否' }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        layout="total, prev, pager, next, jumper"
        :page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
      />
    </div>

  </div>

  <!-- 撤销充值确认弹窗（和充值确认弹窗样式统一） -->
  <el-dialog
    v-model="cancelDialogVisible"
    title="撤销充值确认"
    width="480px"
    :close-on-click-modal="false"
    custom-class="print-confirm-dialog"
    :lock-scroll="false"
  >
    <div class="confirm-text" style="font-size: 20px; text-align: center; padding: 20px 0; line-height: 2;">
      {{ cancelTipText }}
    </div>
    <template #footer>
      <div style="display: flex; justify-content: center; gap: 20px;">
        <el-button type="success" @click="handleCancelRecharge" size="large">确认撤销</el-button>
        <el-button @click="cancelDialogVisible = false" size="large">取消</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 微信未退款强制撤销警告弹窗 -->
  <el-dialog
    v-model="forceCancelDialogVisible"
    width="580px"
    :close-on-click-modal="false"
    custom-class="force-cancel-dialog"
    :lock-scroll="false"
    :show-close="false"
  >
    <template #header>
      <div class="force-cancel-header">
        <el-icon size="28" color="#E6A23C"><WarningFilled /></el-icon>
        <span class="force-cancel-title">操作警告</span>
      </div>
    </template>
    <div class="force-cancel-content">
      <div class="force-cancel-alert">
        <div class="alert-icon">
          <el-icon size="48" color="#E6A23C"><WarningFilled /></el-icon>
        </div>
        <div class="alert-main">
          <p class="alert-title">该记录为<strong class="highlight-red">微信支付</strong>且<strong class="highlight-red">未退款</strong></p>
          <p class="alert-desc">请先进行微信退款后再撤销充值，以保证账目一致。</p>
        </div>
      </div>
      <div class="force-cancel-info">
        <div class="info-title">交易详情</div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">用户名称</span>
            <span class="info-value">{{ forceCancelRow?.userName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">充值金额</span>
            <span class="info-value amount-highlight">{{ forceCancelRow?.rechargeAmount || '0' }} 元</span>
          </div>
          <div class="info-item">
            <span class="info-label">充值时间</span>
            <span class="info-value">{{ forceCancelRow?.createTime || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">交易方式</span>
            <span class="info-value wechat-tag">微信支付</span>
          </div>
        </div>
      </div>
      <div class="force-cancel-notice">
        <el-icon size="20" color="#E6A23C"><WarningFilled /></el-icon>
        <span>注意：撤销后该笔交易的微信退款通道将永久关闭，请确认已通过现金方式完成退款。</span>
      </div>
      <div class="force-cancel-checkbox">
        <el-checkbox v-model="forceCancelChecked" size="large">
          <span class="checkbox-text">我已知晓撤销后本笔交易无法再通过微信退款</span>
        </el-checkbox>
      </div>
    </div>
    <template #footer>
      <div class="force-cancel-footer">
        <el-button
          type="danger"
          :disabled="!forceCancelChecked"
          @click="confirmForceCancel"
          size="large"
        >
          仍要撤销，已现金退款
        </el-button>
        <el-button @click="forceCancelDialogVisible = false" size="large">知道了</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { ElMessage } from "element-plus";
import { WarningFilled } from "@element-plus/icons-vue";
import service from "@/api/request";
import axios from "axios";

export default {
  name: "TransactionTable",
  props: {
    user: {
      type: Object,
      default: () => ({})
    },
    userMeters: {
      type: Array,
      default: () => []
    }
  },
  emits: ["close"],
  computed: {
    meterStatusMap() {
      const map = {};
      (this.userMeters || []).forEach(m => {
        map[m.meterCode] = m.status;
      });
      return map;
    },
    canWechatRefund() {
      const selected = this.multipleSelection;
      if (!selected || selected.length === 0) {
        return false;
      }
      return selected.every(row =>
        row.rechargeType === '微信支付' &&
        !row.hasShouju &&
        row.status == 1
      );
    }
  },
  data() {
    return {
      loading: false,
      isLoading: false,
      list: [],
      multipleSelection: [],
      total: 0,
      currentPage: 1,
      pageSize: 30,
      staffPermissionIds: JSON.parse(sessionStorage.getItem("userData") || "{}").staffPermissionIds || [],
      token: JSON.parse(sessionStorage.getItem("userData") || "{}").token || "",
      transactionData: {
        timeType: "day",
        createTime: "",
        dateRange: null,
        userId: "",
        companyId: "",
        rechargeType: "" // 新增充值类型筛选
      },
      startData: {
        userId: "",
        companyId: "",
        rechargeType: "" // 基础默认查询也带上
      },
      // 新增撤销弹窗相关
      cancelDialogVisible: false,
      cancelTipText: "",
      cancelRowInfo: {}, // 存储当前要撤销的单行数据

      // 微信未退款强制撤销警告弹窗
      forceCancelDialogVisible: false,
      forceCancelChecked: false,
      forceCancelRow: null,

      // 微信退款防重
      refunding: false,
    };
  },
  mounted() {
    this.initData();
    this.fetchTransactionRecords();
  },
  methods: {
    // 撤销充值 - 打开确认弹窗
    openCancelDialog() {
      if (this.multipleSelection.length === 0) {
        ElMessage.warning("请至少选择一条记录");
        return;
      }
      const row = this.multipleSelection[0];
      this.cancelRowInfo = row;
      this.cancelTipText = `确认撤销用户【${row.userName}】${row.createTime}充值的 ${row.rechargeAmount} 元记录吗？`;
      this.cancelDialogVisible = true;
    },
    // 撤销充值
    handleCancelRecharge() {
      if (this.multipleSelection.length === 0) {
        ElMessage.warning("请至少选择一条记录");
        return;
      }
      const row = this.multipleSelection[0];
      if (row.rechargeType === '微信支付' && row.status == 1) {
        this.cancelDialogVisible = false;
        this.forceCancelRow = row;
        this.forceCancelChecked = false;
        this.forceCancelDialogVisible = true;
        return;
      }
      this.doCancelRecharge(this.multipleSelection[0].recordId);
    },
    confirmForceCancel() {
      const row = this.forceCancelRow;
      if (!row) return;
      this.forceCancelDialogVisible = false;
      this.doCancelRecharge(row.recordId);
    },
    doCancelRecharge(id) {
      const userInfo = JSON.parse(sessionStorage.getItem("userData") || "{}");
      const cancelStaffId = userInfo.staffId;
      if (!cancelStaffId) {
        ElMessage.error("获取当前操作员信息失败，请重新登录");
        return;
      }
      let url = `/userManage/userCharge/cancelRecharge/${id}?cancelStaffId=${cancelStaffId}`;
      axios
        .post(`${url}`)
        .then((response) => {
          if (response.data.code === 200) {
            ElMessage.success("撤销成功");
            this.cancelDialogVisible = false;
            this.handleRefresh();
          } else {
            ElMessage.error(response.data.msg);
          }
        })
        .catch((error) => {
          console.error("撤销失败:", error);
          ElMessage.error("撤销失败: " + error.message);
        });
    },

    // 导出模板
    downloadTemplate() {
      axios({
        url: "/import/importRechargeTemplate",
        method: "GET",
        responseType: "blob",
        headers: {
          Authorization: this.token
        }
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error("下载失败: " + response.statusText);
          }

          const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = "历史充值数据导⼊模版下载.xlsx";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(link.href);
        })
        .catch((error) => {
          console.error("下载失败:", error);
          ElMessage.error("下载失败: " + error.message);
        });
    },

    // 触发文件选择
    triggerFileInput() {
      this.$refs.fileInput.value = "";
      this.$refs.fileInput.click();
    },

// 导入文件
    async handleImport() {
      const fileInput = this.$refs.fileInput;
      const file = fileInput.files[0];

      if (!file) {
        ElMessage.warning("请选择要上传的文件");
        return;
      }

      const allowedTypes = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
      if (!allowedTypes.includes(file.type)) {
        ElMessage.warning("仅支持上传 .xls 或 .xlsx 文件");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("companyId", this.user.companyId);

      try {
        const response = await service.post("/import/importRechargeRecord", formData, { responseType: "blob" });
        const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

        if (blob.size === 0) {
          ElMessage.success("导入成功");
          fileInput.value = "";
          this.handleRefresh();
          return;
        }

        ElMessage.warning("部分数据导入失败，等待下载失败列表");
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = "充值记录导入失败列表.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
        fileInput.value = "";
        this.handleRefresh();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "未知错误";
        ElMessage.error("导入失败: " + errorMessage);
        console.error("上传失败:", error);
      }
    },

    initData() {
      this.transactionData.userId = this.user.userId;
      this.transactionData.companyId = this.user.companyId;
      this.transactionData.timeType = "day";
      this.transactionData.createTime = "";
      this.transactionData.dateRange = null;
      this.startData.userId = this.user.userId;
      this.startData.companyId = this.user.companyId;
      this.startData.rechargeType = "";
    },

    handleTimeTypeChange() {
      this.transactionData.createTime = "";
      this.transactionData.dateRange = null;
    },

    buildQueryParams(useSearchData = false) {
      const baseParams = useSearchData ? this.transactionData : this.startData;
      const params = {
        userId: baseParams.userId,
        companyId: baseParams.companyId
      };

      // 新增：充值类型参数
      if (baseParams.rechargeType) {
        params.rechargeType = baseParams.rechargeType;
      }

      if (baseParams.timeType === "custom") {
        if (baseParams.dateRange && baseParams.dateRange.length === 2) {
          params.createTime = `${baseParams.dateRange[0]} 00:00:00`;
          params.endTime = `${baseParams.dateRange[1]} 23:59:59`;
        }
      } else if (baseParams.createTime && baseParams.timeType) {
        let formattedTime = "";
        let timeTypeValue = null;

        switch (baseParams.timeType) {
          case "year":
            formattedTime = `${baseParams.createTime}-01-01 00:00:00`;
            timeTypeValue = 1;
            break;
          case "month":
            formattedTime = `${baseParams.createTime}-01 00:00:00`;
            timeTypeValue = 2;
            break;
          case "day":
            formattedTime = `${baseParams.createTime} 00:00:00`;
            timeTypeValue = 3;
            break;
        }

        if (timeTypeValue) {
          params.timeType = timeTypeValue;
          params.createTime = formattedTime;
        }
      }

      return this.filterNonEmptyParams(params);
    },
    isCurrentMeter(row) {
      return String(row?.meterCode ?? "") === String(this.user?.meterCode ?? "");
    },
    buildQueryString(params) {
      let queryString = "";
      for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
          const value = params[key];
          if (queryString) {
            queryString += `&${key}=${encodeURIComponent(value)}`;
          } else {
            queryString += `?${key}=${encodeURIComponent(value)}`;
          }
        }
      }
      return queryString;
    },
    async fetchTransactionRecords() {
      if (this.isLoading) return;

      this.isLoading = true;
      this.loading = true;

      try {
        const params = this.buildQueryParams(false);
        const queryString = this.buildQueryString(params);
        const url = `/userManage/userCharge/showSingleRechargeMeterRecords/${this.currentPage}${queryString}`;

        console.log('请求URL:', url);
        const response = await service.get(url);

        if (response.code === 200) {
          const records = response.data.userSingleRechargeRecordData || [];
          records.forEach((item, index) => {
            item.theId = this.pageSize * (response.data.currentPages - 1) + index + 1;
          });

          this.list = records.map(item => ({
            ...item,
            createTime: item.createTime ? item.createTime.replace("T", " ") : ""
          }));

          this.total = response.data.totalElements || 0;
          console.log('交易记录数据:', this.list, '总数:', this.total);

          if (this.list.length > 0) {
            console.log('========== 调试信息 ==========');
            console.log('第一条记录的完整字段:', Object.keys(this.list[0]));
            console.log('hasShouju 字段值:', this.list[0].hasShouju);
            console.log('status 字段值:', this.list[0].status);
            console.log('rechargeType 字段值:', this.list[0].rechargeType);
            console.log('recordId 字段值:', this.list[0].recordId);

            const firstRow = this.list[0];
            const canRefund = firstRow.rechargeType === '微信支付' &&
                             !firstRow.hasShouju &&
                             firstRow.status == 1;
            console.log('第一条记录是否可退款:', canRefund);
            console.log('==============================');
          }
        } else {
          ElMessage.error(response.msg);
        }
      } catch (error) {
        console.error("获取交易记录失败", error);
        ElMessage.error("获取交易记录失败");
      } finally {
        this.loading = false;
        this.isLoading = false;
      }
    },
    async fetchWithSearch() {
      if (this.isLoading) return;

      this.isLoading = true;
      this.loading = true;

      try {
        const params = this.buildQueryParams(true);

        if (this.transactionData.timeType === "custom") {
          if (!this.transactionData.dateRange || this.transactionData.dateRange.length !== 2) {
            ElMessage.warning("请选择时间范围");
            this.isLoading = false;
            this.loading = false;
            return;
          }
        } else if (!this.transactionData.createTime && this.transactionData.timeType) {
          ElMessage.warning("请选择时间");
          this.isLoading = false;
          this.loading = false;
          return;
        }

        const queryString = this.buildQueryString(params);
        const url = `/userManage/userCharge/showSingleRechargeMeterRecords/${this.currentPage}${queryString}`;

        console.log('搜索URL:', url);
        const response = await service.get(url);

        if (response.code === 200) {
          const records = response.data.userSingleRechargeRecordData || [];
          records.forEach((item, index) => {
            item.theId = this.pageSize * (response.data.currentPages - 1) + index + 1;
          });

          this.list = records.map(item => ({
            ...item,
            createTime: item.createTime ? item.createTime.replace("T", " ") : ""
          }));

          this.total = response.data.totalElements || 0;
          console.log('搜索结果:', this.list, '总数:', this.total);
        } else {
          ElMessage.error(response.msg);
        }
      } catch (error) {
        console.error("搜索交易记录失败", error);
        ElMessage.error("搜索交易记录失败");
      } finally {
        this.loading = false;
        this.isLoading = false;
      }
    },
    handleSearch() {
      let hasValidTime = true;

      // 判断是否选中了充值类型（包含“全部”）
      const hasRechargeFilter = this.transactionData.rechargeType !== null && this.transactionData.rechargeType !== undefined;

      if (this.transactionData.timeType === "custom") {
        if (!this.transactionData.dateRange || this.transactionData.dateRange.length !== 2) {
          // ElMessage.warning("请选择时间范围");
          // return;
          hasValidTime = false
        }
      } else if (!this.transactionData.createTime && this.transactionData.timeType) {
        // ElMessage.warning("请选择时间");
        // return;
        hasValidTime = false
      }

      // 只有：既没有有效时间，也没有选择任何充值筛选（连全部都没选）才拦截
      if (!hasValidTime && !hasRechargeFilter) {
        ElMessage.warning("请选择充值类型或选择时间条件进行搜索");
        return;
      }

      this.currentPage = 1;
      // this.fetchWithSearch();

      if (hasValidTime) {
        // 时间合法：时间+充值类型一起查
        this.fetchWithSearch();
      } else {
        // 时间不满足校验：只使用充值类型查询
        const oldRechargeType = this.startData.rechargeType;
        this.startData.rechargeType = this.transactionData.rechargeType;
        this.fetchTransactionRecords();
        // 还原，不影响刷新/清空逻辑
        this.startData.rechargeType = oldRechargeType;
      }
    },
    handleClear() {
      this.transactionData.timeType = "day";
      this.transactionData.createTime = "";
      this.transactionData.dateRange = null;
      this.transactionData.rechargeType = ""; // 重置充值类型
      this.currentPage = 1;
      this.fetchTransactionRecords();
    },
    handleRefresh() {
      this.handleClear();
    },
    handlePageChange(page) {
      this.currentPage = page;
      if (this.transactionData.timeType === "custom") {
        if (this.transactionData.dateRange && this.transactionData.dateRange.length === 2) {
          this.fetchWithSearch();
        } else {
          this.fetchTransactionRecords();
        }
      } else if (this.transactionData.createTime && this.transactionData.timeType) {
        this.fetchWithSearch();
      } else {
        this.fetchTransactionRecords();
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    filterNonEmptyParams(params) {
      const filteredParams = {};
      for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
          const value = params[key];
          if (value === "" || value === null || value === undefined) {
            continue;
          }
          filteredParams[key] = value;
        }
      }
      return filteredParams;
    },
    async handleReceipt() {
      if (this.multipleSelection.length === 0) {
        ElMessage.warning("请至少选择一条记录");
        return;
      }

      const selected = this.multipleSelection[0];
      const params = {
        rechargeRecordId: selected.recordId,
        userId: selected.userId,
        date: selected.createTime.replace("T", " "),
        userName: selected.userName,
        userAddress: this.user.userAddr,
        operator: selected.rechargeUser || JSON.parse(sessionStorage.getItem("userData")).staffName,
        beforeAmount: selected.oldBalance,
        amount: selected.rechargeAmount,
        afterAmount: selected.newBalance
      };

      try {
        const response = await axios({
          url: "/userManage/userCharge/receipt",
          method: "POST",
          responseType: "blob",
          data: params
        });

        if (response.status !== 200) {
          throw new Error("导出失败: " + response.statusText);
        }

        const blob = new Blob([response.data], { type: "application/pdf" });
        if (blob.size === 0) {
          ElMessage.warning("内容为空，无法下载");
          return;
        }

        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `${selected.userName}-收据.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
        ElMessage.success("收据下载成功");
      } catch (error) {
        console.error("下载收据失败:", error);
        ElMessage.error("下载收据失败: " + error.message);
      }
    },
    buildExportParams() {
      const params = {
        userId: this.transactionData.userId,
        companyId: this.transactionData.companyId
      };

      // 导出同步带上充值类型筛选
      if (this.transactionData.rechargeType) {
        params.rechargeType = this.transactionData.rechargeType;
      }

      if (this.transactionData.timeType === "custom") {
        if (this.transactionData.dateRange && this.transactionData.dateRange.length === 2) {
          params.startDate = this.transactionData.dateRange[0];
          params.endDate = this.transactionData.dateRange[1];
        }
      } else if (this.transactionData.createTime && this.transactionData.timeType) {
        let formattedTime = "";
        let timeTypeValue = null;

        switch (this.transactionData.timeType) {
          case "year":
            formattedTime = `${this.transactionData.createTime}-01-01 00:00:00`;
            timeTypeValue = 1;
            break;
          case "month":
            formattedTime = `${this.transactionData.createTime}-01 00:00:00`;
            timeTypeValue = 2;
            break;
          case "day":
            formattedTime = `${this.transactionData.createTime} 00:00:00`;
            timeTypeValue = 3;
            break;
        }

        if (timeTypeValue) {
          params.timeType = timeTypeValue;
          params.createTime = formattedTime;
        }
      }

      return this.filterNonEmptyParams(params);
    },

    async exportExcel() {
      try {
        const params = this.buildExportParams();
        const response = await axios({
          url: "/userManage/userCharge/exportRechargeRecord",
          method: "GET",
          responseType: "blob",
          params: params
        });

        if (response.status !== 200) {
          throw new Error("导出失败: " + response.statusText);
        }

        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        if (blob.size === 0) {
          ElMessage.warning("内容为空，无法下载");
          return;
        }

        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `${this.user.userName || "用户"}_历史交易记录.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
        ElMessage.success("导出成功");
      } catch (error) {
        console.error("导出失败:", error);
        ElMessage.error("导出失败: " + error.message);
      }
    },
    handleWechatRefund() {
      if (this.refunding) return;
      const selectedRows = this.multipleSelection;

      if (!selectedRows || selectedRows.length === 0) {
        ElMessage.warning('请选择要退款的充值记录');
        return;
      }

      const refundableRecords = selectedRows.filter(row => {
        if (row.rechargeType !== '微信支付') {
          ElMessage.warning(`记录${row.recordId}不是微信支付，已跳过`);
          return false;
        }
        if (row.hasShouju) {
          ElMessage.warning(`记录${row.recordId}已开具收据，已跳过`);
          return false;
        }
        return true;
      });

      if (refundableRecords.length === 0) {
        ElMessage.warning('所选记录均不符合退款条件');
        return;
      }

      const recordIds = refundableRecords.map(row => row.recordId);

      this.$confirm(`确定要撤销这${recordIds.length}笔充值吗？将全额退款到原支付账户。`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.refunding = true;
        axios.post('/userManage/userCharge/batchRefundWeChatRecharge', recordIds)
          .then(res => {
            if (res.data.code === 200) {
              this.$message.success(res.data.msg || '退款申请已成功提交，等待微信处理');

              const resultData = res.data.data;
              let successCount = 0;
              let failCount = 0;
              let failMessages = [];

              for (const [id, status] of Object.entries(resultData)) {
                if (status === 'SUCCESS') {
                  successCount++;
                } else {
                  failCount++;
                  failMessages.push(`${id}: ${status.replace('FAILED: ', '')}`);
                }
              }

              if (failCount > 0) {
                this.$alert(
                  `成功: ${successCount}条\n失败: ${failCount}条\n\n失败详情:\n${failMessages.join('\n')}`,
                  '批量退款结果',
                  {
                    confirmButtonText: '确定',
                    type: failCount === recordIds.length ? 'error' : 'warning'
                  }
                );
              }

              if (successCount > 0) {
                this.$alert('微信退款已成功，请同步进行撤销充值操作，以保证账目一致。', '温馨提示', {
                  confirmButtonText: '知道了',
                  type: 'info'
                });
              }

              this.handleRefresh();
            } else {
              this.$message.error(res.data.msg || '退款失败');
            }
          })
          .catch(error => {
            console.error('批量退款异常:', error);
            this.$message.error('系统异常: ' + (error.message || '请稍后重试'));
          }).finally(() => {
            this.refunding = false;
          });
      }).catch(() => {
      });
    }
  },
  watch: {
    "user.userId"(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.initData();
        this.currentPage = 1;
        this.fetchTransactionRecords();
      }
    },
  }
};
</script>

<style scoped>
.transaction-table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
  flex-wrap: wrap;
  background: #ffffff;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9eef2;
}

.search-input-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-input-item > span {
  font-size: 18px;
  color: #606266;
  white-space: nowrap;
}

.time-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 时间选择器字体调大 */
.time-input :deep(.el-input__inner) {
  font-size: 18px;
  height: 40px;
  line-height: 40px;
}

.time-input :deep(.el-date-editor .el-input__inner) {
  font-size: 18px;
}

/* 下拉选项字体调大 */
.time-input :deep(.el-select-dropdown__item) {
  font-size: 18px;
}

.time-input :deep(.el-date-table td) {
  font-size: 18px;
}

.time-input :deep(.el-date-table td span) {
  font-size: 18px;
}

.time-input :deep(.el-month-table td .cell) {
  font-size: 18px;
}

.time-input :deep(.el-year-table td .cell) {
  font-size: 18px;
}

.search-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.search-btn, .clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 18px;
}

.search-btn {
  background-color: #46B97E;
  color: #fff;
}

.search-btn img {
  width: 18px;
  height: 18px;
}

.clear-btn {
  background-color: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
}

.clear-btn img {
  width: 18px;
  height: 18px;
}

.search-btn:hover {
  background-color: #3aa06b;
}

.clear-btn:hover {
  background-color: #f5f7fa;
}

.tool-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.tool-btn, .refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
  font-size: 18px;
  color: #606266;
}

.tool-btn img, .refresh-btn img {
  width: 18px;
  height: 18px;
}

.tool-btn:hover, .refresh-btn:hover {
  background-color: #f5f7fa;
  border-color: #46B97E;
}

.disabled-btn {
  opacity: 0.5;
  cursor: not-allowed !important;
  pointer-events: none;
}

.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed !important;
  pointer-events: none;
}

.meter-code-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  max-width: 100%;
}

.meter-code-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meter-status {
  flex-shrink: 0;
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 20px;
  border: 1px solid transparent;
  white-space: nowrap;
}

.meter-status.current {
  color: #2f9e63;
  background-color: #eef9f2;
  border-color: #bfe8d1;
}

.meter-status.history {
  color: #8a8f99;
  background-color: #f3f4f6;
  border-color: #dcdfe6;
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

/* 微信未退款强制撤销弹窗 */
.force-cancel-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.force-cancel-title {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
}

.force-cancel-content {
  padding: 10px 0;
}

.force-cancel-alert {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: #fef0f0;
  border-left: 5px solid #E6A23C;
  border-radius: 6px;
  margin-bottom: 20px;
}

.alert-icon {
  flex-shrink: 0;
}

.alert-main {
  flex: 1;
}

.alert-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 6px 0;
}

.alert-title .highlight-red {
  color: #F56C6C;
  font-size: 22px;
}

.alert-desc {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.force-cancel-info {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 16px 20px;
  margin-bottom: 16px;
}

.info-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 14px;
  color: #909399;
}

.info-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.amount-highlight {
  color: #F56C6C;
  font-size: 22px;
}

.wechat-tag {
  color: #07C160;
}

.force-cancel-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  background: #fdf6ec;
  border: 1px solid #faecd8;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 15px;
  color: #E6A23C;
  line-height: 1.6;
}

.force-cancel-checkbox {
  padding: 8px 0;
}

.checkbox-text {
  font-size: 17px;
  font-weight: 600;
  color: #303133;
}

.force-cancel-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
}

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

.refresh-btn {

}

.table-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.pagination-container :deep(.el-pagination) {
  font-size: 20px;
}

.pagination-container :deep(.el-pagination .btn-prev),
.pagination-container :deep(.el-pagination .btn-next) {
  min-width: 44px;
  height: 44px;
  line-height: 44px;
  font-size: 18px;
}

.pagination-container :deep(.el-pager li) {
  min-width: 44px;
  height: 44px;
  line-height: 44px;
  font-size: 18px;
  margin: 0 4px;
}

.pagination-container :deep(.el-pagination__total) {
  font-size: 18px;
  line-height: 44px;
  margin-right: 20px;
}

.pagination-container :deep(.el-pagination__jump) {
  font-size: 18px;
  line-height: 44px;
  margin-left: 20px;
}

.pagination-container :deep(.el-pagination__jump input) {
  height: 36px;
  line-height: 36px;
}
</style>