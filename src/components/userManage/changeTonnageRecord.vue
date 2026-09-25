<template>
  <div class="recharge-record-dialog" v-if="changeTonnageRecord_dialogFormVisible">
    <div class="recharge-record-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon7.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 20px">吨数调整记录</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleChangeTonnageRecordDialogClose">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="recharge-record-content">
        <div class="serach-box">
          <div class="search-input" v-if="companyId === 1">
            <span>所属水厂</span>
            <el-select v-model="params.companyId" placeholder="请选择所属水厂">
              <el-option v-for="item in companyList" :key="item.id" :value="item.id" :label="item.name"></el-option>
            </el-select>
          </div>
          <div class="search-input" >
            <span>用户号</span>
            <el-input v-model="params.userId" placeholder="请输入..." />
          </div>
          <div class="search-input" >
            <span>用户名</span>
            <el-input v-model="params.userName" placeholder="请输入..." />
          </div>
          <div class="search-input">
            <span>表号</span>
            <el-input v-model="params.meterCode" placeholder="请输入..." />
          </div>
          <div class="search-input" >
            <span>员工名称</span>
            <el-input v-model="params.staffName" placeholder="请输入..." />
          </div>
          <div class="search-input" style="width: 25%; margin-right: 10px">
            <span>时间</span>
            <div class="time-input">
              <el-date-picker
                v-model="params.dateRange"
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
              v-loading="loading"
            >
              <el-table-column type="selection" :selectable="selectable" min-width="20" align="center" fixed="left" />
              <el-table-column label="序号" min-width="75" align="center" fixed="left" #default="scope">
                {{ scope.$index + 1 + (currentPage - 1) * pageSize }}
              </el-table-column>
              <el-table-column property="userId" label="用户号" min-width="100" align="center" fixed="left" />
              <el-table-column property="userName" label="用户名" min-width="100" align="center" />
              <el-table-column property="meterCode" label="表号" min-width="120" align="center" />
              <el-table-column property="beforeVal" label="调整前吨数" min-width="130" align="center" />
              <el-table-column property="afterVal" label="调整后吨数" min-width="130" align="center" />
              <el-table-column label="调整时间" min-width="150" align="center">
                <template #default="scope">
                  {{ formatTime(scope.row.adjustTime) }}
                </template>
              </el-table-column>
              <el-table-column property="staffName" label="调整人" min-width="100" align="center" />
              <el-table-column property="adjustReason" label="调整原因" min-width="200" align="center" />
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

export default {
  props: {
    changeTonnageRecord_dialogFormVisible: {
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
      params: {
        operationId: 63,
        userName: "",
        userId: "",
        meterCode: "",
        staffName: "",
        startTime: "",
        endTime: "",
        pageNum: 1,
        pageSize: 30,
        companyId: null,
        dateRange: [],
      },
      loading: false,
      listRequestSeq: 0,
      list: [],
      multipleSelection: [],
      total: 0,
      currentPage: 1,
      pageSize: 30,
      // 全局水厂ID、token
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      staffPermissionIds: JSON.parse(sessionStorage.getItem("userData")).staffPermissionIds,
      token: JSON.parse(sessionStorage.getItem("userData")).token,
      companyList: [],
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
    this.getCompanyList();
    this.search();
  },
  methods: {
    formatTime(val) {
      if (!val) return "-";
      let str = val.replace("T", " ").split("+")[0];
      return str.split(".")[0];
    },
    syncCompanyIdParam() {
      if (this.companyId === 1) {
        // 多水厂账号，使用选择的水厂
        this.params.companyId = this.params.companyId || this.companyId;
      } else {
        // 单水厂固定全局ID
        this.params.companyId = this.companyId;
      }
    },

    async queryList(page = this.currentPage || 1, options = {}) {
      console.log("进入queryList，page：", page, "force：", options.force);
      if (this.loading && !options.force) {
        console.log("正在加载，阻断请求");
        return;
      }
      const requestSeq = ++this.listRequestSeq;
      this.loading = true;
      // 水厂ID同步【保留原有逻辑】
      this.syncCompanyIdParam();
      // 日期范围拆分
      if(this.params.dateRange && this.params.dateRange.length ===2){
        this.params.startTime = this.params.dateRange[0] + " 00:00:00";
        this.params.endTime = this.params.dateRange[1] + " 23:59:59";
      }else{
        this.params.startTime = "";
        this.params.endTime = "";
      }
      this.params.pageNum = page;
      const reqBody = {
        operationId: this.params.operationId,
        userId: this.params.userId || null,
        userName: this.params.userName,
        meterCode: this.params.meterCode,
        staffName: this.params.staffName,
        startTime: this.params.startTime,
        endTime: this.params.endTime,
        pageNum: this.params.pageNum,
        pageSize: this.params.pageSize,
        companyId: this.params.companyId
      };
      try {
        const response = await service.post("/log/adjustRecordPage", reqBody, {
          headers: {
            Authorization: this.token,
          },
        });
        if (requestSeq !== this.listRequestSeq) return;
        if (response.code === 200) {
          const pageData = response.data;
          this.list = pageData.records || [];
          this.list.forEach((item, idx) => {
            item.theId = this.pageSize * (page - 1) + idx + 1;
          });
          this.total = pageData.total || 0;
          console.log("请求成功，返回数据条数：", this.list.length);
        } else {
          ElMessage.error(response.msg || "查询失败");
        }
      } catch (error) {
        if (requestSeq !== this.listRequestSeq) return;
        console.error("请求异常：", error);
        const errorMessage = error.response?.data?.msg || "网络请求发生错误";
        ElMessage.error(errorMessage);
      } finally {
        if (requestSeq === this.listRequestSeq) {
          this.loading = false;
        }
      }
    },
    // 获取水厂列表，返回Promise实现串行等待
    getCompanyList() {
      return new Promise((resolve) => {
        service.get("/getAllUnblockCompany", {
          headers: { Authorization: this.token }
        }).then((response) => {
          if (response.code === 200) {
            this.companyList = response.data.map(item => ({
              id: item.companyId,
              name: item.companyName
            }));
          } else {
            ElMessage.error(response.msg);
          }
          resolve();
        }).catch(err => {
          console.error("获取水厂失败", err);
          resolve();
        });
      });
    },
    // 关闭弹窗
    handleChangeTonnageRecordDialogClose() {
      this.$emit("close");
    },
    // 多选框选中事件
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 分页切换
    handlePageChange(page) {
      if (this.loading) return;
      this.currentPage = page;
      this.queryList(page);
    },
    // 搜索按钮
    search() {
      this.currentPage = 1;
      this.queryList(1, { force: true });
    },
    clear(isSearch) {
      const keepCompanyId = this.params.companyId;
      this.params = {
        operationId: 63,
        userName: "",
        userId: "",
        meterCode: "",
        staffName: "",
        startTime: "",
        endTime: "",
        dateRange: [],
        pageNum: 1,
        pageSize: 30,
        companyId: keepCompanyId
      };
      this.currentPage = 1;
      this.quyu_selected = null;
      this.multipleSelection = [];
      if (typeof isSearch != "number" || isNaN(isSearch)) {
        this.queryList(1, { force: true });
      }
    },
    // 刷新
    reflush() {
      this.clear(1);
      this.queryList(this.currentPage, { force: true });
    },
    selectable() {
      return true;
    },

    // 打开恢复弹窗，缓存当前行数据
    openStartDialog(row) {
      this.currentRow = row;
      this.startDialogVisible = true;
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
