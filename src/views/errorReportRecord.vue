<template>
  <div class="yuangong-container">
    <div class="search-box">
      <div class="search-content">
        <div class="search-input" style="margin-left: 10px" v-if="companyId === 1">
          <span>所属水厂</span>
          <el-select v-model="params.company" placeholder="请选择所属水厂">
            <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>表号</span>
          <el-input v-model="params.meterCode" placeholder="请输入..." />
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>用户号</span>
          <el-input v-model="params.userId" placeholder="请输入..." />
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>选择状态</span>
          <el-select v-model="params.status" placeholder="选择状态">
            <el-option label="未处理" :value="0" />
            <el-option label="忽略" :value="1" />
            <el-option label="有效" :value="2" />
          </el-select>
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
        <!-- <div class="export-out-btn" style="margin-left: 10px" @click="exportExcel">
          <img src="@/assets/yonghu/icon1.3.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">导出</span>
        </div> -->
        <div class="reflush" style="margin-left: 10px" @click="reflush">
          <img src="@/assets/yonghu/icon15.png" alt="" />
        </div>
      </div>
      <div class="yuangong-table">
        <el-table
            ref="multipleTableRef"
            :data="ErrorRecordData"
            row-key="staffId"
            style="width: 100%; height: 100%; table-layout: fixed; overflow-y: auto"
            border
            :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
            @selection-change="handleSelectionChange"
            id="yuangong-table"
        >
          <!--
                    <el-table-column property="meterCode" :width="indexWidth" label="表号" />
                    <el-table-column property="userId" :width="indexWidth" label="用户号" />
                    <el-table-column property="readingCount" :width="indexWidth" label="读数" width="120" />
                    <el-table-column property="valveStatus" :width="indexWidth" label="阀门状态" width="100" />
                    <el-table-column property="battery" :width="indexWidth" label="电量" width="100" />
                    <el-table-column property="signalValue" :width="indexWidth" label="信号" width="80" /> -->
          <!-- <el-table-column type="selection" :selectable="selectable" :width="selectionWidth" align="center" /> -->
          <!-- <el-table-column label="序号" :width="indexWidth" align="center" fixed="left" #default="scope">
                        {{ scope.$index + 1 + (params.pageNo - 1) * params.pageSize }}
                    </el-table-column> -->
          <el-table-column property="userId" label="用户号" :width="workerNameWidth" align="center" />
          <el-table-column property="userName" label="用户名" :width="workerNameWidth" align="center" />
          <el-table-column property="meterCode" label="表号" :width="accountWidth" align="center" />
          <el-table-column property="valveStatus" label="阀门" :width="phoneWidth" align="center" />
          <el-table-column property="battery" label="电量" :width="companyWidth" align="center" />
          <el-table-column label="上次读数" :width="roleWidth" align="center" #default="scope">
            <div v-if="scope.row.prevReadingCount !== null && scope.row.prevReadingCount !== undefined">{{ scope.row.prevReadingCount }}<br /></div>
            <span v-else>无</span>
          </el-table-column>
          <el-table-column label="上次上报时间" :width="lastLoginTimeWidth" align="center" #default="scope">
            <div v-if="scope.row.prevCreateTime">
              {{ formatDateTime(scope.row.prevCreateTime) }}
            </div>
            <span v-else>无</span>
          </el-table-column>
          <el-table-column property="readingCount" label="本次读数" :width="roleWidth" align="center" />
          <el-table-column label="本次上报时间" :width="lastLoginTimeWidth" align="center">
            <template #header>
              <div class="sortable-header" @click="toggleSort('time')">
                <span>本次上报时间</span>
                <div class="sort-icons">
                  <div :class="['asc-icon', { active: isSortActive('time', 'asc') }]" />
                  <div :class="['desc-icon', { active: isSortActive('time', 'desc') }]" />
                </div>
              </div>
            </template>
            <template #default="scope">
              <div v-if="scope.row.createTime">
                {{ formatDateTime(scope.row.createTime) }}
              </div>
              <span v-else>无</span>
            </template>

          </el-table-column>
          <el-table-column label="操作" :width="lastLoginTimeWidth" align="center" #default="scope">
            <div v-if="scope.row.status === 0 || scope.row.status === null">
              <el-button type="danger" size="large" @click="edit(scope.row.id, 1)">忽略</el-button>

              <el-button type="success" size="large" @click="edit(scope.row.id, 2)">有效</el-button>
            </div>
            <div v-else>
              <el-tag type="info" size="large" v-if="scope.row.status === 1">忽略</el-tag>
              <el-tag type="success" size="large" v-else-if="scope.row.status === 2">有效</el-tag>
            </div>
          </el-table-column>
        </el-table>
      </div>
      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination v-model:current-page="params.pageNo" v-model:page-size="params.pageSize" :page-sizes="[5, 10, 15]" layout="total,  prev, pager, next, jumper" :total="total"
                         @current-change="handlePageChange"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import service from "@/api/request";
import { ElMessage } from "element-plus";
import formatDateTime from "@/api/common/dateConvert.js";
import axios from "axios";
export default {
  data() {
    return {
      params: {
        status: null,
        regionName: null,
        userId: null,
        meterCode: null,
        companyId: null, // 所属水厂ID
        pageNo: 1,
        pageSize: 50,
        order: 1
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId, // 所属水厂ID
      staffPermissionIds: JSON.parse(sessionStorage.getItem("userData")).staffPermissionIds,
      companyList: [],
      employeeData: [],
      multipleSelection: [],
      total: null,

      // ****** 记录筛选条件 ******
      sortField: "time",
      sortOrder: "desc",

      // 每列实际宽度
      selectionWidth: 0,
      indexWidth: 0,
      accountWidth: 0,
      workerNameWidth: 0,
      genderWidth: 0,
      addressWidth: 0,
      phoneWidth: 0,
      postWidth: 0,
      roleWidth: 0,
      //passwordWidth: 0,
      lastLoginTimeWidth: 0,
      companyWidth: 0,
      // 父容器元素
      parentContainer: null,
      // ResizeObserver 实例
      resizeObserver: null,

      //弹出框显示与否
      delete_dialogFormVisible: false,
      add_dialogFormVisible: false,
      edit_dialogFormVisible: false,
      addRegion_dialogFormVisible: false,
      deleteRegion_dialogFormVisible: false,

      //表格勾选行
      selection: [],
      userData: {
        id: null,
        username: null,
      },
      checkAll: false,
      indeterminate: false,
      regionList: [],
      flag: 0,
      ErrorRecordData: [],

      // ****** 锁
      isLoading: false
    };
  },
  watch: {
    // "params.pageNo": {
    //   handler() {
    //     this.getErrorReportRecordData();
    //   },
    // }
  },
  computed: {
    // 每列的百分比宽度
    columnPercentages() {
      return {
        selection: 5,
        index: 7,
        account: 13,
        worker_name: 12,
        company: 6,
        address: 14,
        phone: 6,
        post: 7,
        role: 8,
        //password: 10,
        last_login_time: 11,
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
    this.getCompanyList();
    this.getErrorReportRecordData();
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
      this.params.pageNo = page;
      this.getErrorReportRecordData();
    },

    // ****** 筛选点击逻辑 ******
    isSortActive(field, direction) {
      return this.sortField === field && this.sortOrder === direction;
    },
    toggleSort(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      } else {
        this.sortField = field;
        this.sortOrder = "asc";
      }
      this.params.order = this.getOrderValue(field, this.sortOrder);
      this.search();
    },
    getOrderValue(field, direction) {
      const orderMap = {
        time: {
          asc: 0,
          desc: 1,
        },
        userId: {
          asc: 2,
          desc: 3,
        },
      };
      return orderMap[field][direction];
    },

    edit(id, status) {
      service
          .post(`/meterReportErrorRecord/editErrorRecord?id=${id}&status=${status}`, {
            headers: {
              Authorization: this.token,
              token: this.token,
            },
          })
          .then((response) => {
            if (response.code === 200) {
              ElMessage.success("修改成功");
              this.getErrorReportRecordData();
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          });
    },
    formatDateTime,
    selectable() {
      return true; // 目前允许所有行选择，你可以加上你的业务逻辑
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleCheckAll(val) {
      this.indeterminate = false;
      if (val) {
        this.deleteRegion.regionIds = this.regionList.map((_) => _.id);
      } else {
        this.deleteRegion.regionIds = [];
      }
    },
    // 计算列宽的函数
    calculateColumnWidths() {
      if (this.parentContainer) {
        const parentWidth = this.parentContainer.offsetWidth;
        this.selectionWidth = (this.columnPercentages.selection / 100) * parentWidth;
        this.indexWidth = (this.columnPercentages.index / 100) * parentWidth;
        this.accountWidth = (this.columnPercentages.account / 100) * parentWidth;
        this.workerNameWidth = (this.columnPercentages.worker_name / 100) * parentWidth;
        this.companyWidth = (this.columnPercentages.company / 100) * parentWidth;
        this.addressWidth = (this.columnPercentages.address / 100) * parentWidth;
        this.phoneWidth = (this.columnPercentages.phone / 100) * parentWidth;
        this.postWidth = (this.columnPercentages.post / 100) * parentWidth;
        this.roleWidth = (this.columnPercentages.role / 100) * parentWidth;
        //this.passwordWidth = (this.columnPercentages.password / 100) * parentWidth;
        this.lastLoginTimeWidth = (this.columnPercentages.last_login_time / 100) * parentWidth;
      }
    },
    getRegionData() {
      let url = `/getRegion?companyId=${this.deleteRegion.companyId}`;
      service
          .get(`${url}`, {
            headers: {
              Authorization: this.token,
            },
          })
          .then((response) => {
            if (response.code === 200) {
              this.regionList = response.data.map((item) => {
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
    getErrorReportRecordData() {
      if(this.isLoading) return
      this.isLoading = true
      //this.params.companyId = this.params.company ? this.params.company : this.companyId;
      if (this.companyId === 1) {
        if (this.params.company) {
          this.params.companyId = this.params.company; // 所属水厂ID
        }
      } else {
        this.params.companyId = this.companyId; // 所属水厂ID
      }
      console.log(this.params);
      let token = "";
      const userData = sessionStorage.getItem("userData");
      if (userData) {
        try {
          token = JSON.parse(userData).token;
        } catch (e) {
          console.error("解析userData失败", e);
        }
      }
      service
          .post("/meterReportErrorRecord/queryErrorRecord", this.params, {
            headers: {
              Authorization: token,
              token: token,
            },
          })
          .then((response) => {
            if (response.code === 200) {
              this.total = response.data.total;
              this.ErrorRecordData = response.data.records;
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
      this.getErrorReportRecordData();
    },
    clear() {
      this.params = {
        status: null,
        regionName: null,
        userId: null,
        meterCode: null,
        companyId: null, // 所属水厂ID
        pageNo: 1,
        pageSize: 50,
        order: 1, // 默认时间降序
      };
    },
    reflush() {
      this.clear();
      this.getErrorReportRecordData();
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
/* 使用 :deep 穿透组件封装 */
:deep(.el-tag--large) {
  /* 1. 放大文字 */
  font-size: 18px !important;

  /* 2. 调整高度 (Element Plus 默认 large 大约是 32px) */
  height: 40px;

  /* 3. 调整左右内边距，让标签看起来不那么“瘦” */
  padding: 0 15px;

  /* 4. 如果你想让圆角也大一点 */
  border-radius: 8px;
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
  justify-content: space-between;
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
  justify-content: center;
  /* 确保子元素在父容器中垂直居中 */
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

.add-btn,
.delete-btn,
.edit-btn,
.export-in-btn,
.export-out-btn {
  display: flex;
  align-items: center;
  width: 80px;
  /* 设置按钮的宽度 */
  height: 32px;
  /* 设置按钮的高度 */
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
  /* 设置按钮的宽度 */
  height: 32px;
  /* 设置按钮的高度 */
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
  height: calc(98% - 110px);
}

.page-box {
  height: 65px;
  position: absolute;
  bottom: 0;
}

/* 删除弹出框 */
.add-dialog,
.delete-dialog,
.edit-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.add-dialog-content,
.delete-dialog-content,
.edit-dialog-content-1 {
  width: 50%;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.add-dialog-content {
  width: 35%;
}

.delete-dialog-content {
  width: 35%;
  height: 300px;
  margin-top: -150px;
}

.edit-dialog-content-1 {
  height: 420px;
  width: 60%;
  margin-top: -210px;
}

.title {
  width: 100%;
  background-color: #fff;
  border-radius: 5px 5px 0 0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  height: 45px;
  line-height: 40px;
  text-align: center;
  display: flex;
  justify-content: space-between;
}

.delete-content,
.edit-content-1 {
  width: 94%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
}

.delete-content {
  height: 150px;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 25px;
}

.edit-content-1 {
  width: 90%;
  height: 250px;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 15px;
  margin-bottom: 5px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: 1%;
}

.edit-input {
  display: flex;
  justify-content: center;
  /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 31%;
  height: 80px;
  margin-right: 3.5%;
}

.edit-input > span {
  font-size: 18px;
  margin-bottom: 5px;
}

.edit-input > .el-input {
  height: 35px;
  width: 100%;
}

.add-content {
  border: 1px solid #fff;
  background-color: #fff;
  border-radius: 5px;
  width: 90%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 20px;
  padding: 0 3%;
}

.add-input {
  display: flex;
  justify-content: center;
  /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 45%;
  height: 100%;
}

.add-input > span {
  font-size: 20px;
  margin-bottom: 5px;
  color: #575556;
}

.add-input > .el-input {
  height: 35px;
  width: 100%;
}

.btn {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 15px;
}

.confirm-btn,
.cancel-btn {
  height: 35px;
  width: 90px;
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
  margin-right: 5%;
}

</style>

<style lang="scss" scoped>
:deep(.el-tree) {
  .is-current {
    > .el-tree-node__content {
      background-color: var(--el-tree-node-hover-bg-color);
      color: white;
    }
  }
}

.sortable-header {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
}

.sort-icons {
  display: flex;
  flex-direction: column;
  margin-left: 10px;
}

.asc-icon {
  background-image: url("@/assets/yonghu/icon25.png");
  background-repeat: no-repeat;
  background-size: contain;
  width: 12px;
  height: 12px;
}

.asc-icon:hover {
  background-image: url("@/assets/yonghu/icon24.png");
  background-repeat: no-repeat;
  background-size: contain;
}

.asc-icon.active {
  background-image: url("@/assets/yonghu/icon24.png");
  background-repeat: no-repeat;
  background-size: contain;
}

.desc-icon {
  background-image: url("@/assets/yonghu/icon23.png");
  background-repeat: no-repeat;
  background-size: contain;
  width: 12px;
  height: 12px;
}

.desc-icon:hover {
  background-image: url("@/assets/yonghu/icon22.png");
  background-repeat: no-repeat;
  background-size: contain;
}

.desc-icon.active {
  background-image: url("@/assets/yonghu/icon22.png");
  background-repeat: no-repeat;
  background-size: contain;
}

</style>
