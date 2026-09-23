<template>
  <div class="bill-table-container">
    <div class="search-bar">
      <div class="search-input-item">
        <span>时间</span>
        <div class="time-input">
          <el-select v-model="searchParams.timeType" placeholder="请选择" style="width: 100px; font-size: 18px;">
            <el-option label="年" value="year" />
            <el-option label="月" value="month" />
            <el-option label="日" value="day" />
            <el-option label="自定义" value="custom" />
          </el-select>
          <el-date-picker
              v-if="searchParams.timeType === 'year'"
              v-model="searchParams.createTime"
              type="year"
              placeholder="选择年份"
              value-format="YYYY"
              style="width: 180px; font-size: 18px;"
          />
          <el-date-picker
              v-else-if="searchParams.timeType === 'month'"
              v-model="searchParams.createTime"
              type="month"
              placeholder="选择月份"
              value-format="YYYY-MM"
              style="width: 180px; font-size: 18px;"
          />
          <el-date-picker
              v-else-if="searchParams.timeType === 'day'"
              v-model="searchParams.createTime"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 200px; font-size: 18px;"
          />
          <el-date-picker
              v-else-if="searchParams.timeType === 'custom'"
              v-model="searchParams.dateRange"
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
<!--      <div class="total-summary">-->
<!--        <span class="summary-label">水费汇总</span>-->
<!--        <span class="summary-value">{{ waterTotal }} 元</span>-->
<!--        <span class="summary-label" style="margin-left:20px">污水处理费汇总</span>-->
<!--        <span class="summary-value">{{ sewageTotal }} 元</span>-->
<!--      </div>-->
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
      <div class="export-btn" @click="downloadTemplate" v-if="staffPermissionIds.includes(54)">
        <img src="@/assets/yonghu/icon1.png" alt="" />
        <span>扣费记录导⼊模版</span>
      </div>
      <div class="export-btn" @click="triggerFileInput" v-if="staffPermissionIds.includes(54)">
        <img src="@/assets/yonghu/icon2.png" alt="" />
        <span>扣费记录导⼊</span>
        <input ref="fileInput" type="file" accept=".xls,.xlsx" style="display: none" @change="handleImport" />
      </div>
      <div class="export-btn" @click="exportExcel">
        <img src="@/assets/yonghu/icon1.3.png" alt="" />
        <span>导出</span>
      </div>
      <div class="export-btn"  @click="openAddDialog">
        <img src="@/assets/yuangong/icon6.png" alt="" />
        <span>调账-记录添加</span>
      </div>
      <el-tooltip content="至少选择一条记录" placement="top" :disabled="multipleSelection.length > 0">
        <div class="export-btn" :class="{ 'disabled-btn-tip': multipleSelection.length === 0 }" @click="multipleSelection.length > 0 && openDeleteDialog()">
          <img src="@/assets/yonghu/icon4.png" alt="" />
          <span>调账-记录删除</span>
        </div>
      </el-tooltip>
      <div class="refresh-btn" @click="handleRefresh">
        <img src="@/assets/yonghu/icon15.png" alt="" />
      </div>
    </div>

    <div class="table-wrapper">
      <div class="table-scroll">
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
        <el-table-column type="selection" min-width="50" align="center" fixed="left" />
<!--        <el-table-column property="theId" label="序号" width="70" align="center" fixed="left" />-->
        <el-table-column property="userId" label="用户号" min-width="100" align="center" />
        <el-table-column property="userName" label="用户名" min-width="120" align="center" />
        <el-table-column property="userAddr" label="地址" min-width="120" align="center" />
        <el-table-column property="startRead" label="起码" min-width="100" align="center" />
        <el-table-column property="endRead" label="止码" min-width="100" align="center" />
        <el-table-column property="waterUse" label="结算量" min-width="100" align="center">
          <template #default="scope">{{ scope.row.waterUse }}</template>
        </el-table-column>
        <el-table-column property="chargeAmount" label="扣费" min-width="100" align="center"></el-table-column>
        <el-table-column property="waterFee" min-width="140" align="center" v-if="user.companyId !== 95">
          <template #header>扣费组成1:<br>水费</template>
          <template #default="scope">{{ scope.row.waterFee }}</template>
        </el-table-column>
        <el-table-column property="sewageFee" min-width="140" align="center" v-if="user.companyId !== 95">
          <template #header>扣费组成2:<br>污水处理费</template>
          <template #default="scope">{{ scope.row.sewageFee }}</template>
        </el-table-column>
        <el-table-column property="minFee" min-width="140" align="center" v-if="user.companyId !== 95">
          <template #header>扣费组成3:<br>保底消费</template>
          <template #default="scope">{{ scope.row.minFee }}</template>
        </el-table-column>
        <el-table-column property="createTime" label="算费日期" min-width="140" align="center" />
      </el-table>
    </div>
      <!-- 底部固定汇总行，无表头，紧贴表格下方 -->
      <el-table
        :data="totalSummaryRow"
        border
        style="width:100%;margin-top:-1px;"
        :show-header="false"
        row-class-name="summary-row"
      >
        <el-table-column property="theId" min-width="150" align="center" fixed="left" />
<!--        <el-table-column property="userId" min-width="100" align="center" />-->
        <el-table-column property="userName" min-width="120" align="center" />
        <el-table-column property="userAddr" min-width="120" align="center" />
        <el-table-column property="startRead" min-width="100" align="center" />
        <el-table-column property="endRead" min-width="100" align="center" />
        <el-table-column property="waterUse" min-width="100" align="center" />
        <el-table-column property="totalChargeAmount" min-width="100" align="center"></el-table-column>
        <el-table-column property="waterFee" min-width="140" align="center" v-if="user.companyId !== 95"/>
        <el-table-column property="sewageFee" min-width="140" align="center" v-if="user.companyId !== 95"/>
        <el-table-column property="minFee" min-width="140" align="center" v-if="user.companyId !== 95"/>
        <el-table-column property="createTime" min-width="140" align="center" />
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

  <!-- 调账-记录删除确认弹窗 -->
  <el-dialog
    v-model="deleteDialogVisible"
    title="调账-记录删除"
    width="640"
    :close-on-click-modal="false"
    :lock-scroll="false"
    append-to-body
  >
    <div class="delete-warning">
      <div class="delete-warning-icon">
        <el-icon><WarningFilled /></el-icon>
      </div>
      <div>
        <p class="delete-warning-title">即将删除 {{ deleteTargets.length }} 条扣费记录</p>
        <p class="delete-warning-desc">删除后数据将不可恢复，请仔细核对下方记录后再决定是否继续。</p>
      </div>
    </div>

    <div class="record-list-wrap">
      <el-table :data="deleteTargets" border size="small" max-height="280" class="record-list-table">
        <el-table-column label="序号" width="70" align="center">
          <template #default="{ $index }">{{ $index + 1 }}</template>
        </el-table-column>
        <el-table-column prop="waterUse" label="结算量" align="center" />
        <el-table-column prop="chargeAmount" label="扣费" align="center" />
        <el-table-column prop="createTime" label="时间" align="center" min-width="150" />
      </el-table>
    </div>

    <template #footer>
      <div class="delete-footer">
        <el-checkbox v-model="acknowledgeDelete">我已知晓删除后不可恢复</el-checkbox>
        <div class="delete-footer-btns">
          <el-button @click="closeDeleteDialog">取消</el-button>
          <el-button type="danger" :disabled="!acknowledgeDelete" :loading="deleting" @click="confirmDelete">确认删除</el-button>
        </div>
      </div>
    </template>
  </el-dialog>

  <!-- 调账-记录添加弹窗 -->
  <div class="recharge-dialog" v-if="addDialogVisible">
    <div class="change-balance-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon20.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 20px">调账-记录添加</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="closeAddDialog">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="recharge-content">
        <div class="recharge-input">
          <span>用户号</span>
          <el-input :value="user.userId" :disabled="true"></el-input>
        </div>
        <div class="recharge-input">
          <span>用户名</span>
          <el-input :value="user.userName" :disabled="true"></el-input>
        </div>
        <div class="recharge-input">
          <span>地址</span>
          <el-input :value="user.userAddr" :disabled="true"></el-input>
        </div>
        <div class="recharge-input">
          <span>起码</span>
          <el-input v-model="addForm.startRead" placeholder="请输入起码"></el-input>
        </div>
        <div class="recharge-input">
          <span>止码</span>
          <el-input v-model="addForm.endRead" placeholder="请输入止码"></el-input>
        </div>
<!--        <div class="recharge-input">-->
<!--          <span>阀门</span>-->
<!--          <el-select v-model="addForm.valveStatus" placeholder="请选择" style="width:100%">-->
<!--            <el-option label="开阀" value="开阀"/>-->
<!--            <el-option label="关阀" value="关阀"/>-->
<!--            <el-option label="故障" value="故障"/>-->
<!--          </el-select>-->
<!--        </div>-->
        <div class="recharge-input">
          <span>原金额</span>
          <el-input v-model="addForm.oldBalance" placeholder="请输入原金额" @input="onWaterInput"></el-input>
        </div>
        <div class="recharge-input">
          <span>扣费金额</span>
          <el-input v-model="addForm.chargeAmount" placeholder="请输入扣费金额" @input="onWaterInput"></el-input>
        </div>
        <div class="recharge-input" v-if="user.companyId !== 95">
          <span>水费</span>
          <el-input v-model="addForm.waterFee" placeholder="请输入水费"></el-input>
        </div>
        <div class="recharge-input" v-if="user.companyId !== 95">
          <span>污水处理费</span>
          <el-input v-model="addForm.sewageFee" placeholder="请输入污水处理费"></el-input>
        </div>
        <div class="recharge-input" v-if="user.companyId !== 95">
          <span>保底消费</span>
          <el-input v-model="addForm.minFee" placeholder="请输入保底消费"></el-input>
        </div>
        <div class="recharge-input">
          <span>余额</span>
          <el-input v-model="addForm.newBalance" placeholder="请输入余额"></el-input>
        </div>
        <div class="recharge-input">
          <span>算费日期</span>
          <el-date-picker
            v-model="addForm.createTime"
            type="datetime"
            placeholder="选择抄表时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width:100%"
          ></el-date-picker>
        </div>
        <div class="recharge-input">
          <span>扣费类型</span>
          <el-select v-model="addForm.typeStr" placeholder="请选择" style="width:100%">
            <el-option label="抄表扣费" value="抄表扣费"/>
            <el-option label="保底扣费" value="保底扣费"/>
          </el-select>
        </div>
      </div>
      <div class="btn">
        <div class="confirm-btn" @click="confirmAdd" :class="{loading:adding}">
          <el-icon style="margin-left: 5%"><Check /></el-icon>
          <span style="font-size: 20px; margin-left: 15%">确认</span>
        </div>
        <div class="cancel-btn" @click="closeAddDialog">
          <el-icon style="margin-left: 5%; color: #45ba7e"><Close /></el-icon>
          <span style="font-size: 20px; margin-left: 15%; color: #5a5a5a">取消</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessage } from "element-plus";
import service from "@/api/request";
import axios from "axios";

export default {
  name: "BillDetailTable",
  props: {
    user: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  emits: [],
  data() {
    return {
      loading: false,
      isLoading: false,
      list: [],
      total: 0,
      currentPage: 1,
      pageSize: 30,
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId, // 公司ID
      staffPermissionIds: JSON.parse(sessionStorage.getItem("userData") || "{}").staffPermissionIds || [],
      token: JSON.parse(sessionStorage.getItem("userData") || "{}").token || "",
      // 汇总金额
      // waterTotal: 0,  // 总水费
      // sewageTotal: 0, // 总污水费
      searchParams: {
        timeType: "day",
        createTime: "",
        dateRange: null
      },

      // 新增底部汇总行
      totalSummaryRow: [
        {
          theId: "统计总额",
          userId: "",
          userName: "",
          startRead: "",
          endRead: "",
          waterUse: "0",
          totalChargeAmount: "0.00",
          waterFee: "0.00",
          sewageFee: "0.00",
          minFee: "0.00",
          createTime: ""
        }
      ],

      // 表格勾选与调账-记录删除弹窗
      multipleSelection: [],
      deleteDialogVisible: false,
      deleteTargets: [],
      acknowledgeDelete: false,
      deleting: false,

      addDialogVisible: false,
      adding: false,
      addForm: {
        startRead: null,
        endRead: null,
        waterUse: null,
        // valveStatus: "",
        oldBalance: null,
        chargeAmount: null,
        newBalance: null,
        waterFee: null,
        sewageFee: null,
        minFee: null,
        typeStr: "",
        createTime: "",
      }
    };
  },
  mounted() {
    this.fetchBillDetailRecords();
  },
  watch: {
    "user.userId"(newValue, oldValue) {
      if (newValue && newValue !== oldValue) {
        this.currentPage = 1;
        this.fetchBillDetailRecords();
      }
    },
    "user.meterCode"(newValue, oldValue) {
      if (newValue && newValue !== oldValue) {
        this.currentPage = 1;
        this.fetchBillDetailRecords();
      }
    },
    "searchParams.timeType"() {
      this.searchParams.createTime = "";
      this.searchParams.dateRange = null;
    }
  },
  methods: {
    // 导出模板
    downloadTemplate() {
      // 水厂ID为95走简化模板，否则走标准模板
      const templateUrl = this.companyId === 95
        ? "/import/importChargeTemplateSimple"
        : "/import/importChargeTemplate";
      axios({
        url: templateUrl,
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
          link.download = "扣费记录导⼊模版.xlsx";
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

      const url = this.companyId === 95
        ? "/import/importChargeRecordSimple"
        : "/import/importChargeRecord";

      try {
        const response = await service.post(url, formData, { responseType: "blob" });
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
        link.download = "扣费记录导入失败列表.xlsx";
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
    buildQueryParams() {
      let params = {
        userId: this.user.userId,
        meterCode: this.user.meterCode,
        companyId: this.user.companyId
      };

      if (this.searchParams.timeType === "custom") {
        if (this.searchParams.dateRange && this.searchParams.dateRange.length === 2) {
          params.createTime = `${this.searchParams.dateRange[0]} 00:00:00`;
          params.endTime = `${this.searchParams.dateRange[1]} 23:59:59`;
          params.timeType = 4;
        }
      } else if (this.searchParams.createTime && this.searchParams.timeType) {
        let start = "";
        let end = "";
        let timeTypeValue = null;
        switch (this.searchParams.timeType) {
          case "year":
            // 选年份：起始当年1月1日，结束当年12月31日23:59:59
            start = `${this.searchParams.createTime}-01-01 00:00:00`;
            end = `${this.searchParams.createTime}-12-31 23:59:59`;
            timeTypeValue = 1;
            break;
          case "month":
            // 选月份：起始当月1号，次月1号前一秒
            const [y, m] = this.searchParams.createTime.split("-");
            const nextMonth = Number(m) + 1;
            if (nextMonth === 13) {
              start = `${y}-12-01 00:00:00`;
              end = `${Number(y) + 1}-01-01 00:00:00`;
            } else {
              start = `${y}-${String(nextMonth - 1).padStart(2, '0')}-01 00:00:00`;
              end = `${y}-${String(nextMonth).padStart(2, '0')}-01 00:00:00`;
            }
            timeTypeValue = 2;
            break;
          case "day":
            // 选单日：当天0点 ~ 当天23:59:59
            start = `${this.searchParams.createTime} 00:00:00`;
            end = `${this.searchParams.createTime} 23:59:59`;
            timeTypeValue = 3;
            break;
        }
        if (timeTypeValue) {
          params.timeType = timeTypeValue;
          params.createTime = start;
          params.endTime = end;
        }
      }

      return this.filterNonEmptyParams(params);
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
    async fetchBillDetailRecords(isPageChange = false) {
      if (!this.user.userId || !this.user.meterCode || this.isLoading) {
        return;
      }

      this.isLoading = true;
      this.loading = true;

      try {
        const params = this.buildQueryParams();
        const queryString = this.buildQueryString(params);
        // 替换为后端扣费详情接口
        const url = `/chargeDetail/list/${this.currentPage}${queryString}`;
        const response = await service.get(url);

        if (response.code === 200) {
          const records = response.data.dataList || [];
          records.map((item, index) => {
            item.theId = this.pageSize * (response.data.currentPages - 1) + index + 1;
            // 格式化日期
            if(item.createTime) item.createTime = item.createTime.substring(0,10);
            return item;
          });

          this.list = records;
          this.total = response.data.totalElements || 0;
          // 获取汇总水费、污水处理费
          if (!isPageChange){
            await this.fetchSumData();
          }
        } else {
          ElMessage.error(response.msg);
        }
      } catch (error) {
        console.error("获取扣费详情记录失败", error);
        ElMessage.error("获取扣费详情记录失败");
      } finally {
        this.loading = false;
        this.isLoading = false;
      }
    },
    handleSearch() {
      if (this.searchParams.timeType === "custom") {
        if (!this.searchParams.dateRange || this.searchParams.dateRange.length !== 2) {
          ElMessage.warning("请选择时间范围");
          return;
        }
      } else if (!this.searchParams.createTime && this.searchParams.timeType !== "") {
        ElMessage.warning("请选择时间");
        return;
      }
      this.currentPage = 1;
      this.fetchBillDetailRecords();
    },
    handleClear() {
      this.searchParams = {
        timeType: "day",
        createTime: "",
        dateRange: null
      };
      this.currentPage = 1;
      this.fetchBillDetailRecords();
    },
    handleRefresh() {
      this.handleClear();
    },
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchBillDetailRecords(true);
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

    // 导出接口待对接
    async exportExcel() {
      try {
        const params = this.buildQueryParams();
        const queryStr = this.buildQueryString(params);
        console.log('导出参数', params)
        // 使用全局service携带token与/api前缀，统一项目请求规范
        const res = await service.get(`/chargeDetail/export${queryStr}`, {
          responseType: "blob"
        });

        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        if (blob.size === 0) {
          ElMessage.warning("当前筛选条件无导出数据");
          return;
        }

        // 创建下载链接
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = `${this.user.userName || "用户"}_扣费明细记录.xlsx`;
        document.body.appendChild(link);
        link.click();
        // 释放资源
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        ElMessage.success("导出成功");
      } catch (error) {
        console.error("扣费明细表导出失败：", error);
        ElMessage.error("导出失败：" + (error.response?.data?.message || error.message));
      }
    },
    // 请求后端全局扣费汇总接口
    async fetchSumData() {
      try {
        const params = this.buildQueryParams();
        const queryStr = this.buildQueryString(params);
        const res = await service.get(`/chargeDetail/sum${queryStr}`);
        if (res.code === 200 && res.data) {
          const sumData = res.data;
          // 赋值底部汇总行
          this.totalSummaryRow = [
            {
              theId: "统计总额",
              userId: "",
              userName: "",
              startRead: "",
              endRead: "",
              waterUse: sumData.totalWaterUse || 0,
              totalChargeAmount: sumData.totalChargeAmount || 0,
              waterFee: sumData.totalWaterFee || 0,
              sewageFee: sumData.totalSewageFee || 0,
              minFee: sumData.totalMinFee || 0,
              createTime: ""
            }
          ];
        }
      } catch (err) {
        console.error("获取扣费汇总失败", err);
        // 报错不阻断列表展示，重置汇总为0
        this.totalSummaryRow = [
          {
            theId: "统计总额",
            userId: "",
            userName: "",
            startRead: "",
            endRead: "",
            waterUse: "0.00",
            waterFee: "0.00",
            sewageFee: "0.00",
            minFee: "0.00",
            createTime: ""
          }
        ];
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    openDeleteDialog() {
      if (this.multipleSelection.length === 0) return;
      this.deleteTargets = this.multipleSelection.map(item => ({ ...item }));
      this.acknowledgeDelete = false;
      this.deleting = false;
      this.deleteDialogVisible = true;
    },
    closeDeleteDialog() {
      this.deleteDialogVisible = false;
      this.deleteTargets = [];
      this.acknowledgeDelete = false;
    },
    async confirmDelete() {
      if (!this.acknowledgeDelete || this.deleting) return;
      const chargeRecordIdList = this.deleteTargets
        .map(item => item.chargeRecordId)
        .filter(id => id !== undefined && id !== null && id !== "");
      if (chargeRecordIdList.length === 0) {
        ElMessage.warning("所选记录缺少记录ID，无法删除");
        return;
      }
      this.deleting = true;
      try {
        const response = await service.post("/chargeDetail/delChargeRecord", { chargeRecordIdList });
        if (response.code === 200) {
          ElMessage.success(`已删除 ${chargeRecordIdList.length} 条记录`);
          this.closeDeleteDialog();
          if (this.$refs.multipleTableRef) {
            this.$refs.multipleTableRef.clearSelection();
          }
          this.handleRefresh();
        } else if (response.code === -1) {
          ElMessage.error(response.msg || "删除失败");
        }
      } catch (error) {
        ElMessage.error("删除失败，请稍后重试");
      } finally {
        this.deleting = false;
      }
    },
    openAddDialog() {
      if(!this.user || !this.user.userId){
        ElMessage.warning("用户信息缺失，无法新增记录");
        return;
      }
      this.addDialogVisible = true;
    },
    closeAddDialog() {
      this.addDialogVisible = false;
      // 清空表单
      this.addForm = {
        startRead: null,
        endRead: null,
        waterUse: null,
        // valveStatus: "",
        oldBalance: null,
        chargeAmount: null,
        newBalance: null,
        waterFee: null,
        sewageFee: null,
        minFee: null,
        typeStr: "",
        createTime: "",
      };
      if(this.$refs.addFormRef){
        this.$refs.addFormRef.clearValidate();
      }
    },
    async confirmAdd() {
      if(this.adding) return;
      // 读取数值
      const oldBalance = Number(this.addForm.oldBalance);
      const newBalance = Number(this.addForm.newBalance);
      const chargeAmount = Number(this.addForm.chargeAmount);
      const startRead = Number(this.addForm.startRead);
      const endRead = Number(this.addForm.endRead);
      let waterFee = 0;
      let sewageFee = 0;
      let minFee = 0;
      if (this.user.companyId !== 95) {
        waterFee = Number(this.addForm.waterFee);
        sewageFee = Number(this.addForm.sewageFee);
        minFee = Number(this.addForm.minFee);
      }

      // 校验表单
      if (isNaN(oldBalance)) {
        ElMessage.warning("请输入正确的原金额");
        return;
      }
      if (isNaN(chargeAmount)) {
        ElMessage.warning("请输入正确的扣费金额");
        return;
      }
      if (isNaN(newBalance)) {
        ElMessage.warning("请输入正确的余额");
        return;
      }
      if (this.addForm.startRead === '' || isNaN(startRead) || !Number.isInteger(startRead)) {
        ElMessage.warning("起码必须为整数");
        return;
      }
      if (this.addForm.endRead === '' || isNaN(endRead) || !Number.isInteger(endRead)) {
        ElMessage.warning("止码必须为整数");
        return;
      }
      if (!this.addForm.createTime) {
        ElMessage.warning("请选择算费时间");
        return;
      }
      // if (!this.addForm.valveStatus) {
      //   ElMessage.warning("请选择阀门状态");
      //   return;
      // }
      this.adding = true;
      try {
        const reqData = {
          userId: this.user.userId,
          meterCode: this.user.meterCode,
          companyId: this.user.companyId,
          oldBalance: oldBalance,
          chargeAmount: chargeAmount,
          newBalance: newBalance,
          startRead: startRead,
          endRead: endRead,
          waterFee: waterFee,
          sewageFee: sewageFee,
          minFee: minFee,
          createTime: this.addForm.createTime,
          // valveStatus: this.addForm.valveStatus,
          typeStr: this.addForm.typeStr
        };

        const res = await service.post("/import/addSingleChargeRecord", reqData);
        if(res.code === 200){
          ElMessage.success("添加成功");
          this.closeAddDialog();
          this.handleRefresh();
        }else{
          ElMessage.error(res.msg || "添加失败");
        }

        this.closeAddDialog();
        this.handleRefresh();
      } catch (err) {
        ElMessage.error("添加失败");
        console.error(err);
      } finally {
        this.adding = false;
      }
    },
    onWaterInput() {
      if (this.addForm.oldBalance === null || this.addForm.chargeAmount === null) {
        return;
      }
      // 任意一个不是有效数字，直接return，不自动计算
      if (isNaN(this.addForm.oldBalance) || isNaN(this.addForm.chargeAmount)) {
        ElMessage.warning('请在原金额/扣费金额输入框输入有效的数字');
        return;
      }
      const oldBalance = Number(this.addForm.oldBalance);
      const chargeAmount = Number(this.addForm.chargeAmount);

      this.addForm.newBalance = Number(((oldBalance * 100 - chargeAmount * 100) / 100).toFixed(2));
    }
  }
};
</script>

<style scoped>
.bill-table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
  flex-wrap: wrap;
  background: #ffffff;
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9eef2;
}

.search-input-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input-item > span {
  font-size: 18px;
  color: #606266;
  white-space: nowrap;
}

.time-input {
  display: flex;
  align-items: center;
}

.time-input :deep(.el-input__inner) {
  font-size: 18px;
}
.time-input :deep(.el-date-editor .el-input__inner) {
  font-size: 18px;
}
.time-input :deep(.el-input__inner::placeholder) {
  font-size: 18px;
}
.time-input :deep(.el-range-input__inner) {
  font-size: 18px;
}
.time-input :deep(.el-range-input__inner::placeholder) {
  font-size: 18px;
}
.time-input :deep(.el-select-dropdown__item) {
  font-size: 18px;
}

.search-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.search-btn, .clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 18px;
  height: auto;
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
  gap: 10px;
  margin-bottom: 8px;
}

.export-btn, .refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 4px;
  cursor: pointer;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
  font-size: 18px;
  color: #606266;
}

.export-btn img, .refresh-btn img {
  width: 18px;
  height: 18px;
}

.export-btn:hover, .refresh-btn:hover {
  background-color: #f5f7fa;
  border-color: #46B97E;
}

.table-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.pagination-container {
  margin-top: 5px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
}

.table-wrapper {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.table-scroll {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
/* 汇总行样式：绿色底色白色加粗文字 */
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

.disabled-btn {
  opacity: 0.5;
  cursor: not-allowed !important;
  pointer-events: none;
}

/* 调账类按钮禁用态：保留鼠标事件，保证悬浮时能显示「至少选择一条记录」提示 */
.disabled-btn-tip {
  opacity: 0.5;
  cursor: not-allowed !important;
}

.delete-warning {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fff7f7;
  border: 1px solid #fbe2e2;
  border-radius: 6px;
  margin-bottom: 14px;
}

.delete-warning-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #fde2e2;
  color: #f56c6c;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-warning-icon .el-icon {
  font-size: 22px;
}

.delete-warning-title {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
  margin: 0 0 4px;
}

.delete-warning-desc {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.record-list-wrap {
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

/* 记录列表隐藏滚动条，仍可鼠标滚动查看 */
.record-list-wrap :deep(.el-scrollbar__bar) {
  display: none;
}

.delete-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.delete-footer :deep(.el-checkbox__label) {
  font-size: 14px;
  color: #606266;
}

.recharge-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.change-balance-dialog-content {
  width: 95%;
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

.recharge-content {
  width: 98%;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 15px;
  margin-bottom: 5px;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: 10px;
  overflow-y: auto;
}

.recharge-input {
  display: flex;
  justify-content: center;
  flex-direction: column;
  flex: 1;
  min-width: 60px;
  height: 75px;
  margin-right: 3px;
}

.recharge-input > span {
  font-size: 20px;
  color: #747374;
  margin-bottom: 5px;
}

.recharge-input > .el-input {
  height: 35px;
  width: 100%;
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

.btn {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 15px;
  margin-bottom: 15px;
}

.confirm-btn, .cancel-btn {
  height: 42px;
  width: 110px;
  cursor: pointer;
  border: 1px solid #f2f2f2;
  border-radius: 5px;
  display: flex;
  align-items: center;
}

.confirm-btn {
  background-color: #45ba7e;
  margin-right: 15px;
  color: #fff;
}

.cancel-btn {
  background-color: #fff;
  margin-right: 3%;
}
.recharge-input :deep(.el-input__inner.is-disabled) {
  background-color: #f5f7fa;
  color: #909399;
}
</style>
