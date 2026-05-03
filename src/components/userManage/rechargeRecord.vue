<template>
  <div class="recharge-record-dialog" v-if="recharge_record_dialogFormVisible">
    <div class="recharge-record-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon7.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 20px">充值记录</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleRechargeRecordDialogClose">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="recharge-record-content">
        <div class="serach-box">
          <div class="search-input" style="width: 15%; margin-right: 10px" v-if="companyId === 1">
            <span>所属水厂</span>
            <el-select v-model="rechargeRecordeData.companyId" placeholder="请选择所属水厂">
              <el-option v-for="item in companyList" :key="item.id" :value="item.id" :label="item.name"></el-option>
            </el-select>
          </div>
          <div class="search-input" style="width: 18%; margin-right: 10px">
            <span>区域</span>
            <el-select v-model="rechargeRecordeData.region" clearable filterable placeholder="区域">
              <el-option v-for="item in quyu_data" :key="item.id" :label="item.label" :value="item.label"> </el-option>
            </el-select>
          </div>
          <div class="search-input" style="width: 15%; margin-right: 10px">
            <span>用户号</span>
            <el-input v-model="rechargeRecordeData.userId" placeholder="请输入..." />
          </div>
          <div class="search-input" style="width: 15%; margin-right: 10px">
            <span>用户名称</span>
            <el-input v-model="rechargeRecordeData.userName" placeholder="请输入..." />
          </div>
          <div class="search-input" style="width: 18%; margin-right: 10px">
            <span>表号</span>
            <el-input v-model="rechargeRecordeData.meterCode" placeholder="请输入..." />
          </div>
          <div class="search-input" style="width: 15%; margin-right: 10px">
            <span>收费人</span>
            <el-select v-model="rechargeRecordeData.rechargeUser" clearable filterable placeholder="请选择收费人">
              <el-option v-for="item in staffNameOptions" :key="item" :label="item" :value="item"></el-option>
            </el-select>
          </div>
          <div class="search-input" style="width: 18%; margin-right: 10px">
            <span>收费类型</span>
            <el-select v-model="rechargeRecordeData.rechargeType" placeholder="请选择收费类型">
              <el-option label="现金" value="现金"></el-option>
              <el-option label="微信支付" value="微信支付"></el-option>
              <el-option label="支付宝支付" value="支付宝支付"></el-option>
            </el-select>
          </div>
          <div class="search-input" style="width: 25%; margin-right: 10px">
            <span>时间</span>
            <div class="time-input">
              <el-date-picker
                v-model="rechargeRecordeData.dateRange"
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
            <div class="export-out-btn" style="margin-right: 10px; width: 110px" :class="{ 'btn-single-only-disabled': multipleSelection.length !== 1 }" @click="multipleSelection.length === 1 && receipt()">
              <img src="@/assets/yonghu/icon26.png" alt="" style="margin-left: 7px" />
              <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">开收据</span>
            </div>
            <div class="export-out-btn" style="margin-right: 10px; width: 130px" :class="{ 'btn-single-only-disabled': multipleSelection.length !== 1 }" @click="multipleSelection.length === 1 && reset()">
              <img src="@/assets/yonghu/icon27.png" alt="" style="margin-left: 7px" />
              <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">撤销充值</span>
            </div>
            <div class="export-out-btn" style="margin-right: 10px" @click="exportExcel">
              <img src="@/assets/yonghu/icon2.png" alt="" style="margin-left: 7px" />
              <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">导出</span>
            </div>
            <div class="reflush" style="margin-left: 10px" @click="reflush">
              <img src="@/assets/yonghu/icon15.png" alt="" />
            </div>
          </div>
          <div class="recharge-record-table">
            <el-table
              ref="multipleTableRef"
              :data="tableData"
              row-key="theId"
              style="width: auto; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
              :max-height="tableMaxHeight"
              border
              :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
              @selection-change="handleSelectionChange"
              id="recharge-record-table"
              class="table"
              v-loading="isLoading"
            >
              <el-table-column type="selection" :selectable="selectable" min-width="40" align="center" fixed="left" />
              <el-table-column property="userId" label="用户号" min-width="50" align="center" fixed="left" />
              <el-table-column property="userName" label="用户名称" min-width="70" align="center" />
              <el-table-column property="userAddr" label="用户地址" min-width="100" align="center" />
              <el-table-column property="regionName" label="所属区域" min-width="100" align="center" />
              <el-table-column property="userPhone" label="联系电话" min-width="100" align="center" />
              <el-table-column property="meterCode" label="表号" min-width="100" align="center" />
              <el-table-column property="payerPhone" label="缴费人手机号" min-width="100" align="center" />
              <el-table-column property="rechargeUser" label="收费人" min-width="80" align="center" />
              <el-table-column property="rechargeType" label="交易方式" min-width="100" align="center" />
              <el-table-column property="rechargeAmount" label="充值金额/元" min-width="100" align="center" />
              <el-table-column property="oldBalance" label="充值前余额/元" min-width="100" align="center" />
              <el-table-column property="newBalance" label="充值后余额/元" min-width="100" align="center" />
              <el-table-column property="createTime" label="充值时间" min-width="100" align="center" />
            </el-table>
          </div>
          <div class="summary-box">
            <div class="summary-item">
              <span class="summary-label">微信总金额</span>
              <span class="summary-value">{{ rechargeSummary.weChatTotalAmount }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">支付宝总金额</span>
              <span class="summary-value">{{ rechargeSummary.alipayTotalAmount }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">现金总金额</span>
              <span class="summary-value">{{ rechargeSummary.cashTotalAmount }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">全部总金额</span>
              <span class="summary-value">{{ rechargeSummary.totalAmount }}</span>
            </div>
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

  <!-- 打印确认对话框 -->
  <el-dialog
    v-model="printDialogVisible"
    title="打印收据"
    width="500px"
    :close-on-click-modal="false"
    :show-close="false"
    custom-class="print-confirm-dialog"
    :lock-scroll="false"
  >
    <div class="print-dialog-content">
      <div class="print-icon">
        <el-icon size="80" color="#46B97E"><Printer /></el-icon>
      </div>
      <div class="print-message">
        <p style="font-size: 22px; color: #333; margin: 20px 0;">收据已生成！</p>
        <p style="font-size: 20px; color: #666;">是否立即打印收据？</p>
      </div>

      <!-- 添加自动下载勾选框 -->
      <div class="auto-download-checkbox" style="margin: 20px 0 10px 0;">
        <el-checkbox v-model="autoDownload" size="large">
          <span style="font-size: 16px; color: #666;">自动下载PDF文件</span>
        </el-checkbox>
        <div style="font-size: 12px; color: #999; margin-top: 5px;">
          勾选后，打印时将自动保存PDF文件到本地
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleSkipPrint" style="width: 100px; font-size: 16px;">仅下载PDF</el-button>
        <el-button type="success" @click="handleConfirmPrint" style="width: 100px; font-size: 16px;">立即打印</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 隐藏的 PDF 容器，用于打印 -->
  <div id="print-container" style="position: absolute; left: -9999px; top: 0;"></div>
</template>

<script>
import service from "@/api/request";
import { ElMessage } from "element-plus";
import axios from "axios";

export default {
  props: {
    recharge_record_dialogFormVisible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      rechargeRecordeData: {
        region: "",
        startDate: "",
        endDate: "",
        dateRange: [],
        userName: "",
        meterCode: "",
        imei: "",
        companyId: null,
        userId: "",
        rechargeUser: "",
        rechargeType: "",
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      rechargeRecordTableData: [],
      tableData: [],
      currentPage: 1,
      pageSize: 30,
      total: 0,
      multipleSelection: [],
      companyList: [],
      quyu_data: [],
      staffNameOptions: [],
      rechargeSummary: {
        weChatTotalAmount: "0",
        alipayTotalAmount: "0",
        cashTotalAmount: "0",
        totalAmount: "0",
      },
      // ****** 锁
      isLoading: false,
      printDialogVisible: false,
      receiptPDFBlob: null,
      receiptData: null,
      autoDownload: false,
    };
  },
  computed: {
    tableMaxHeight() {
      return "auto";
    },
  },
  watch: {
    "rechargeRecordeData.companyId"() {
      this.rechargeRecordeData.region = "";
      this.getRegionData();
    },
  },
  mounted() {
    this.getRechargeRecordData();
    this.getCompanyList();
    this.getRegionData();
    this.getStaffNames();
  },
  methods: {
    // ****** 手动处理分页变化，避免 watch 循环 ******
    handlePageChange(page) {
      if (this.isLoading) return;
      this.currentPage = page;
      this.fetchRechargeRecordData(page);
    },

    selectable() {
      return true; // 目前允许所有行选择，你可以加上你的业务逻辑
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleRechargeRecordDialogClose() {
      this.$emit("close");
    },
    getCompanyList() {
      service
        .get("/getAllUnblockCompany")
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
        if (this.rechargeRecordeData.companyId) {
          url = `/getRegion?companyId=${this.rechargeRecordeData.companyId}`;
        } else {
          url = `/getRegion`;
        }
      } else {
        url = `/getRegion?companyId=${this.companyId}`;
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
          }
        })
        .catch((error) => {
          ElMessage.error("获取区域数据失败");
        });
    },
    getStaffNames() {
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
    getEffectiveCompanyId() {
      if (this.companyId === 1) {
        return this.rechargeRecordeData.companyId || "";
      }
      return this.companyId;
    },
    buildRechargeRecordParams() {
      return {
        ...this.rechargeRecordeData,
        companyId: this.getEffectiveCompanyId(),
      };
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
    handleRechargeRecordResponse(response) {
      const records = response.data.userRechargeRecordData || [];
      records.forEach((item, index) => {
        item.theId = this.pageSize * (response.data.currentPages - 1) + index + 1;
        if (item.createTime) {
          item.createTime = item.createTime.replace("T", " ");
        }
      });
      this.rechargeRecordTableData = [];
      this.tableData = records;
      this.total = response.data.totalElements;
      this.rechargeSummary = {
        weChatTotalAmount: response.data.weChatTotalAmount ?? "0",
        alipayTotalAmount: response.data.alipayTotalAmount ?? "0",
        cashTotalAmount: response.data.cashTotalAmount ?? "0",
        totalAmount: response.data.totalAmount ?? "0",
      };
    },
    fetchRechargeRecordData(page = this.currentPage) {
      if (this.isLoading) return
      this.isLoading = true
      const params = this.filterNonEmptyParams(this.buildRechargeRecordParams());
      const queryString = this.buildQueryString(params);
      service
        .get(`/userManage/userCharge/showRechargeMeterRecordsV2/${page}${queryString}`)
        .then((response) => {
          if (response.code === 200) {
            this.handleRechargeRecordResponse(response);
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          console.log(error);
        }).finally(()=>{
        this.isLoading = false
      });
    },
    getRechargeRecordData() {
      this.fetchRechargeRecordData(this.currentPage);
    },
    reflush() {
      this.clear(1);
      if (this.currentPage !== 1) {
        this.currentPage = 1;
        return;
      }
      this.fetchRechargeRecordData(1);
    },
    clear(isSearch) {
      this.rechargeRecordeData.region = "";
      this.rechargeRecordeData.startDate = "";
      this.rechargeRecordeData.endDate = "";
      this.rechargeRecordeData.dateRange = [];
      this.rechargeRecordeData.userName = "";
      this.rechargeRecordeData.meterCode = "";
      this.rechargeRecordeData.imei = "";
      this.rechargeRecordeData.companyId = null;
      this.rechargeRecordeData.userId = "";
      this.rechargeRecordeData.rechargeUser = "";
      this.rechargeRecordeData.rechargeType = "";
      this.rechargeSummary = {
        weChatTotalAmount: "0",
        alipayTotalAmount: "0",
        cashTotalAmount: "0",
        totalAmount: "0",
      };
      if (typeof isSearch != 'number' || isNaN(isSearch)) {
        this.currentPage = 1;
        this.search();
      }
    },
    // 过滤掉值为空的参数
    filterNonEmptyParams(params) {
      const filteredParams = {};

      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          const value = params[key];

          // 时间范围：拆分为后端需要的 startDate / endDate
          if (key === "dateRange") {
            if (Array.isArray(value) && value.length === 2) {
              if (value[0]) {
                filteredParams.startDate = value[0];
              }
              if (value[1]) {
                filteredParams.endDate = value[1];
              }
            }
            continue;
          }

          // 跳过无效值
          if (value === "" || value === null || value === undefined) {
            continue;
          }
          filteredParams[key] = value;
        }
      }

      return filteredParams;
    },

    search() {
      if (this.currentPage !== 1) {
        this.currentPage = 1;
        return;
      }
      this.fetchRechargeRecordData(1);
    },
    // 触发文件输入框点击
    triggerFileInput() {
      this.$refs.fileInput.value = "";
      this.$refs.fileInput.click();
    },
    // 处理文件上传
    async exportIn() {
      const fileInput = this.$refs.fileInput;
      const file = fileInput.files[0];

      if (!file) {
        ElMessage.warning("请选择要上传的文件");
        return;
      }

      // 文件类型验证
      const allowedTypes = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
      if (!allowedTypes.includes(file.type)) {
        ElMessage.warning("仅支持上传 .xls 或 .xlsx 文件");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await service.post("/userManage/userCharge/importMeterRechargeList", formData);
        ElMessage.success("导入成功");
        fileInput.value = ""; // 清空文件输入框
        this.reflush();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "未知错误";
        ElMessage.error("导入失败: " + errorMessage);
        console.error("上传失败:", error);
      }
    },
    receipt() {
      let params = {
        userId: "",
        date: "",
        userName: "",
        userAddress: "",
        operator: "",
        beforeAmount: 0,
        amount: 0,
        afterAmount: 0,
      };
      if (this.multipleSelection.length === 0) {
        ElMessage.warning("请至少选择一条记录");
        return;
      } else {
        params.rechargeRecordId = this.multipleSelection[0].rechargeRecordId;
        params.userId = this.multipleSelection[0].userId;
        params.date = this.multipleSelection[0].createTime.replace("T", " ");
        params.userName = this.multipleSelection[0].userName;
        params.userAddress = this.multipleSelection[0].userAddr;
        params.operator = this.multipleSelection[0].rechargeUser || JSON.parse(sessionStorage.getItem("userData")).staffName;
        params.beforeAmount = this.multipleSelection[0].oldBalance;
        params.amount = this.multipleSelection[0].rechargeAmount;
        params.afterAmount = this.multipleSelection[0].newBalance;

        // 保存收据数据并显示打印确认对话框
        this.receiptData = params;
        this.printDialogVisible = true;
      }
    },
    handleSkipPrint() {
      this.printDialogVisible = false;
      this.autoDownload = false;

      // 保存数据副本
      const receiptDataCopy = this.receiptData;
      const autoDownloadEnabled = this.autoDownload;

      // 清空数据和关闭弹窗
      this.receiptData = null;

      // 执行下载
      if (receiptDataCopy) {
        this.downloadReceiptOnly(receiptDataCopy);
        ElMessage.info("PDF文件已自动下载");
      } else {
        ElMessage.info("已取消操作");
      }
    },
    handleConfirmPrint() {
      this.printDialogVisible = false;
      this.printAndDownloadReceipt();
    },
    downloadReceiptOnly(receiptData) {
      console.log("自动下载收据参数:", receiptData);

      axios({
        url: "/userManage/userCharge/receipt",
        method: "POST",
        responseType: "blob",
        data: receiptData,
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error("导出失败：" + response.statusText);
          }

          const blob = new Blob([response.data], { type: "application/pdf" });
          if (blob.size === 0) {
            ElMessage.warning("内容为空，无法下载");
            return;
          }

          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = receiptData.userName + "-充值收据.pdf";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(link.href);
        })
        .catch((error) => {
          console.error("下载失败:", error);
          ElMessage.error("下载失败：" + error.message);
        });
    },
    printAndDownloadReceipt() {
      console.log("收据参数:", this.receiptData);

      axios({
        url: "/userManage/userCharge/receipt",
        method: "POST",
        responseType: "blob",
        data: this.receiptData,
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error("导出失败：" + response.statusText);
          }

          const blob = new Blob([response.data], { type: "application/pdf" });
          if (blob.size === 0) {
            ElMessage.warning("内容为空，无法下载");
            return;
          }

          this.receiptPDFBlob = blob;

          // 根据 autoDownload 决定是否下载
          if (this.autoDownload) {
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = this.receiptData.userName + "-充值收据.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(link.href);
          }

          // 在新窗口打开 PDF 并触发打印
          const pdfUrl = window.URL.createObjectURL(blob);
          const printWindow = window.open(pdfUrl, '_blank');
          if (printWindow) {
            printWindow.onload = () => {
              setTimeout(() => {
                printWindow.print();
              }, 500);
            };
          }

          ElMessage.success("正在打印收据..." + (this.autoDownload ? " PDF文件已自动下载" : ""));
        })
        .catch((error) => {
          console.error("导出失败:", error);
          ElMessage.error("导出失败：" + error.message);
        }).finally(() => {
        this.autoDownload=false;
      });
    },
    reset() {
      if (this.multipleSelection.length === 0) {
        ElMessage.warning("请至少选择一条记录");
        return;
      }
      let id = this.multipleSelection[0].rechargeRecordId;
      let url = `/userManage/userCharge/cancelRecharge/${id}`;
      axios
        .post(`${url}`)
        .then((response) => {
          if (response.data.code === 200) {
            ElMessage.success("撤销成功");
            this.reflush();
          } else {
            ElMessage.error(response.data.msg);
          }
        })
        .catch((error) => {
          console.error("撤销失败:", error);
          ElMessage.error("撤销失败: " + error.message);
        });
    },
    exportExcel() {
      const exportParams = this.buildRechargeRecordParams();
      const params = this.filterNonEmptyParams(exportParams);
      axios({
        url: "/userManage/userCharge/exportRechargeRecord",
        method: "GET",
        responseType: "blob",
        params,
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error("导出失败: " + response.statusText);
          }

          // 获取 Blob 对象
          const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

          if (blob.size === 0) {
            ElMessage.warning("内容为空，无法下载");
            return;
          }

          // 创建一个链接元素
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob); // 创建 Blob URL
          link.download = "用户充值记录.xlsx"; // 设置下载文件名
          document.body.appendChild(link);
          link.click(); // 触发下载
          document.body.removeChild(link); // 移除链接元素
          window.URL.revokeObjectURL(link.href); // 释放 Blob URL
        })
        .catch((error) => {
          console.error("导出失败:", error);
          ElMessage.error("导出失败: " + error.message);
        });
    },
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
  height: 90vh;
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

.btn-single-only-disabled {
  opacity: 0.5;
  cursor: not-allowed !important;
  pointer-events: none;
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
