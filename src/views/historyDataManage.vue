<template>
  <div class="yuangong-container">
    <div class="search-box">
      <div class="search-content">
        <div class="search-input" style="margin-left: 20px">
          <span>历史数据日期</span>
          <el-date-picker v-model="params.queryDate" type="date" placeholder="选择日期" style="flex-grow: 0; width: 100%; height: 35px" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
        </div>
      </div>
      <div class="buttons" >
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
      <div class="yuangong-table">
        <el-table
            ref="multipleTableRef"
            :data="historyData"
            style="width: auto; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
            border
            :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
            id="yuangong-table"
            v-loading="isLoading"
        >
          <el-table-column label="序号" :width="indexWidth" align="center" fixed="left" #default="scope">
            {{ scope.$index + 1 + (params.page - 1) * params.pageSize }}
          </el-table-column>
          <el-table-column property="meterCode" label="表号" :width="meterCodeWidth" align="center" />
          <el-table-column property="userName" label="用户名" :width="userNameWidth" align="center" />
          <el-table-column property="userNo" label="用户号" :width="userIdWidth" align="center" />
          <el-table-column property="rechargeStatus" label="缴费记录" :width="rechargeRecordWidth" align="center" />
          <el-table-column property="chargeStatus" label="扣费记录" :width="chargeRecordWidth" align="center" />
          <el-table-column property="meterReportStatus" label="抄表记录" :width="chaobiaoRecordWidth" align="center" />
         </el-table>
      </div>
      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination v-model:current-page="params.page" v-model:page-size="params.pageSize" :page-sizes="[5, 10, 15]" layout="total,  prev, pager, next, jumper" :total="total"
                         @current-change="handlePageChange"/>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import service from "@/api/request";
import { ElMessage } from "element-plus";
import axios from "axios";
import { editCompanyStatus } from "@/api/otherapi/other.js";
export default {
  data() {
    return {
      // 搜索条件
      params: {
        page: 1,
        pageSize: 50,
        queryDate: '2026-03-10',
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId, // 所属水厂ID

      // 表格数据
      historyData: [],
      multipleSelection: [],

      total: null,

      // 每列实际宽度
      indexWidth: 0,
      meterCodeWidth: 0,
      userNameWidth: 0,
      userIdWidth: 0,
      rechargeRecordWidth: 0,
      chargeRecordWidth: 0,
      chaobiaoRecordWidth: 0,

      // 父容器元素
      parentContainer: null,
      // ResizeObserver 实例
      resizeObserver: null,

      // ****** 锁
      isLoading: false,

    };
  },
  watch: {

  },
  computed: {
    // 每列的百分比宽度
    columnPercentages() {
      return {
        index: 8,
        meterCode: 16,
        userName: 13,
        userId: 16,
        rechargeRecord: 15,
        chargeRecord: 15,
        chaobiaoRecord: 15,
      };
    },
  },
  mounted() {
    // 获取父容器元素
    this.parentContainer = document.querySelector(".yuangong-table");
    // 初始化列宽
    this.calculateColumnWidths();

    // 创建 ResizeObserver 实例并监听父容器宽度变化
    this.resizeObserver = new ResizeObserver(this.calculateColumnWidths);
    if (this.parentContainer) {
      this.resizeObserver.observe(this.parentContainer);
    }
    this.getHistoryData();
    this.userData = sessionStorage.getItem("userData");
    console.log(this.userData);
  },
  beforeUnmount() {
    // 组件卸载时取消监听
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  methods: {

    // ****** 手动处理分页变化，避免 watch 循环 ******
    handlePageChange(page) {
      if (this.isLoading) return;
      // this.isLoading = true;
      this.params.page = page;
      this.getHistoryData();
    },

    // 计算列宽的函数
    calculateColumnWidths() {
      if (this.parentContainer) {
        const parentWidth = this.parentContainer.offsetWidth;
        this.indexWidth = (this.columnPercentages.index / 100) * parentWidth;
        this.meterCodeWidth = (this.columnPercentages.meterCode / 100) * parentWidth;
        this.userNameWidth = (this.columnPercentages.userName / 100) * parentWidth;
        this.userIdWidth = (this.columnPercentages.userId / 100) * parentWidth;
        this.rechargeRecordWidth = (this.columnPercentages.rechargeRecord / 100) * parentWidth;
        this.chargeRecordWidth = (this.columnPercentages.chargeRecord / 100) * parentWidth;
        this.chaobiaoRecordWidth = (this.columnPercentages.chaobiaoRecord / 100) * parentWidth;
      }
    },
    getHistoryData() {
      if (this.isLoading) return
      this.isLoading = true

      let token = "";
      const userData = sessionStorage.getItem("userData");
      if (userData) {
        try {
          token = JSON.parse(userData).token;
        } catch (e) {
          console.error("解析userData失败", e);
        }
      }
      // 拼接查询参数，追加companyId
      const reqParams = {
        ...this.params,
        companyId: this.companyId
      };
      service
          .post("/historyData/listMissingMeter", reqParams, {
            headers: {
              Authorization: token,
              token: token,
            },
          })
          .then((response) => {
            if (response.code === 200) {
              this.total = response.data.total;
              this.historyData = response.data.records || [];
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          }).finally(()=>{
        this.isLoading = false
      });
    },
    search() {
      this.params.page = 1;
      this.getHistoryData();
    },
    clear(isSearch) {
      this.params.queryDate = '2026-03-10';
      if (typeof isSearch != 'number' || isNaN(isSearch)) {
        this.params.page = 1;
        this.getHistoryData();
      }
    },
    reflush() {
      this.clear(1);
      let token = "";
      const userData = sessionStorage.getItem("userData");
      if (userData) {
        try {
          token = JSON.parse(userData).token;
        } catch (e) {
          console.error("解析userData失败", e);
        }
      }
      const reqParams = {
        ...this.params,
        companyId: this.companyId
      };
      service
          .post("/historyData/listMissingMeter", reqParams, {
            headers: {
              Authorization: token,
              token: token,
            },
          })
          .then((response) => {
            if (response.code === 200) {
              this.total = response.data.total;
              this.params.page = 1;
              this.historyData = response.data.records || [];
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          });
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

/* 修改勾选框选中时的背景颜色和边框颜色 */
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
}

/* 修改分页整体字号（包括“共 x 条”） */
:deep(.el-pagination) {
  font-size: 16px;
}

/* 修改页码数字按钮的大小 */
:deep(.el-pagination .el-pager li) {
  font-size: 16px;
  min-width: 35px; /* 数字变大后，按钮也要相应加宽 */
  height: 35px;
  line-height: 35px;
}

/* 如果有下拉选择每页条数，修改其内部文字 */
:deep(.el-pagination .el-select .el-input) {
  font-size: 16px;
}

:deep(.el-tree) {
  --el-fill-color-light: #46b97e;
  --el-fill-color-blank: #e8f3ed;
  --el-text-color-primary: #fff;
}

:deep(.el-tree-node__content) {
  height: 40px;
  line-height: 40px;
  border-radius: 5px;
  margin: 0 10px;
}

/* 设置鼠标滑过选项时的字体颜色 */
:deep(.el-tree-node__content:hover) {
  color: #fff;
}

.yuangong-container {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  width: 100%;
  height: 98%;
  padding: 0px 20px;
}

.search-box {
  margin-top: 15px;
  margin-bottom: 20px;
  width: 100%;
  height: 112px;
  display: flex;
  align-items: center;
  justify-content: space-around; /* 每个元素两侧的间隔相等 */
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  background-color: #fff;
}

.search-content {
  display: flex;
  width: 75%;
  height: 100%;
}

.search-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 25%;
  height: 100%;
  margin-right: 20px;
}

.search-input > span {
  font-size: 18px;
  margin-bottom: 5px;
}

.time-input {
  display: flex;
}

.time-input > span {
  font-size: 18px;
  margin-bottom: 5px;
  align-self: center;
  margin-left: 5px;
  margin-right: 5px;
}

.buttons {
  display: flex;
  width: 260px;
  height: 100%;
  align-items: center;
  margin-left: 100px;
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
  height: calc(100% - 150px);
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

.command-box > * {
  margin-right: 20px;
}

.yuangong-table,
.page-box {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.yuangong-table {
  margin-top: 15px;
  height: calc(98% - 60px);
}

.page-box {
  height: 65px;
  position: absolute;
  bottom: 0;
}

</style>
