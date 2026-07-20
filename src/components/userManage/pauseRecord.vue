<template>
  <div class="recharge-record-dialog" v-if="pause_record_dialogFormVisible">
    <div class="recharge-record-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon7.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 20px">停户记录</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleRechargeRecordDialogClose">
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
            <span>区域</span>
            <el-select v-model="params.region" clearable filterable placeholder="区域">
              <el-option v-for="item in quyu_data" :key="item.id" :label="item.label" :value="item.label"> </el-option>
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
          <div class="search-input" >
            <span>地址</span>
            <el-input v-model="params.userAddr" placeholder="请输入..." />
          </div>
          <div class="search-input">
            <span>表号</span>
            <el-input v-model="params.meterCode" placeholder="请输入..." />
          </div>
          <div class="search-input" >
            <span>电话</span>
            <el-input v-model="params.userPhone" placeholder="请输入..." />
          </div>
          <div class="search-input">
            <span>厂商</span>
            <el-select class="big-font-el-select" v-model="params.meterVendor" clearable placeholder="请选择">
              <el-option label="圣鑫" value="圣鑫"></el-option>
              <el-option label="旧圣鑫" value="旧圣鑫"></el-option>
              <el-option label="太阳能" value="太阳能"></el-option>
              <el-option label="信驰" value="信驰"></el-option>
              <el-option label="旧信驰" value="旧信驰"></el-option>
              <el-option label="旧信驰KF01" value="旧信驰KF01"></el-option>
              <el-option label="4G信驰" value="4G信驰"></el-option>
              <el-option label="集万讯" value="集万讯"></el-option>
              <el-option label="千宝通" value="千宝通"></el-option>
            </el-select>
          </div>
          <div class="search-input">
            <span>阀门</span>
            <el-select class="big-font-el-select" v-model="params.valveStatus">
              <el-option label="开阀" value="开阀"></el-option>
              <el-option label="关阀" value="关阀"></el-option>
              <el-option label="故障" value="故障"></el-option>
            </el-select>
          </div>
<!--          <div class="search-input" style="width: 25%; margin-right: 10px">-->
<!--            <span>时间</span>-->
<!--            <div class="time-input">-->
<!--              <el-date-picker-->
<!--                v-model="params.dateRange"-->
<!--                type="daterange"-->
<!--                range-separator="至"-->
<!--                start-placeholder="开始日期"-->
<!--                end-placeholder="结束日期"-->
<!--                style="flex-grow: 1; width: 100%; height: 35px"-->
<!--                format="YYYY-MM-DD"-->
<!--                value-format="YYYY-MM-DD"-->
<!--              />-->
<!--            </div>-->
<!--          </div>-->
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
              <el-table-column label="序号" width="73" align="center" fixed="left" #default="scope">
                {{ scope.$index + 1 + (currentPage - 1) * pageSize }}
              </el-table-column>
              <el-table-column property="userId" label="用户号" min-width="80" align="center" fixed="left"></el-table-column>
              <el-table-column property="userName" label="用户名" min-width="80" align="center"></el-table-column>
              <el-table-column property="meterCode" label="表号" min-width="80" align="center" />
              <el-table-column property="balance" label="余额" min-width="70" align="center"></el-table-column>
              <el-table-column property="newReading" label="读数" min-width="70" align="center" />
              <el-table-column property="valveStatus" label="阀门" min-width="50" align="center" />
              <el-table-column property="battery" label="电量" min-width="50" align="center" />
              <el-table-column property="updateTime" label="抄表时间" min-width="100" align="center"></el-table-column>
              <el-table-column property="meterVendor" label="厂商" min-width="70" align="center" />
              <el-table-column property="priceName" label="价格" min-width="90" align="center"></el-table-column>
              <el-table-column property="smsConfigName" label="短信" min-width="105" align="center"></el-table-column>
              <el-table-column property="companyName" label="水厂" width="120" align="center" />
              <el-table-column property="userAddr" label="地址" min-width="85" align="center" />
              <el-table-column property="regionName" label="区域" min-width="70" align="center" />
              <el-table-column property="phone" label="联系电话" min-width="80" align="center" />
              <el-table-column property="pauseTime" label="暂停时间" min-width="100" align="center"></el-table-column>
              <el-table-column label="操作" min-width="100" align="center" fixed="right">
                <template #default="scope">
                  <el-button type="success" size="middle" @click="openStartDialog(scope.row)">恢复用户</el-button>
                </template>
              </el-table-column>
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

  <el-dialog v-model="startDialogVisible" title="恢复用户确认" width="600" :lock-scroll="false">
    <div style="font-size: 20px; text-align: center; line-height: 2; padding: 10px 0;">
      确定要将用户【{{ currentRow.userName }}】恢复使用吗？恢复后将开始收取保底费并下达水表开阀命令
    </div>
    <template #footer>
      <div style="display: flex; justify-content: center; gap: 20px;">
        <el-button @click="startDialogVisible = false">取消</el-button>
        <el-button @click="handleStartUser" style="background-color: #45ba7e; color: #fff" :loading="loading" :disabled="loading">确认恢复</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import service from "@/api/request";
import { ElMessage } from "element-plus";

export default {
  props: {
    pause_record_dialogFormVisible: {
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
        userName: "",
        userId: "",
        imei: "",
        meterCode: "",
        meterType: "",
        meterVendor: "",
        battery: "",
        valveStatus: "",
        companyId: null,
        userPhone: "",
        userAddr: "",
        order: 0,
        isPause: 1, // 固定筛选暂停用户
        region: "",
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
      token: JSON.parse(sessionStorage.getItem("userData")).token,
      companyList: [],
      quyu_data: [],

      startDialogVisible: false,
      currentRow: {},
      isloading: false,
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
  watch: {
    "params.companyId"() {
      this.params.region = ""
      this.getRegionData();
    }
  },
  mounted() {
    this.getCompanyList();
    this.getRegionData();
    this.search();
  },
  methods: {
    // 修复：正确同步水厂ID，原代码读取params.company不存在
    syncCompanyIdParam() {
      if (this.companyId === 1) {
        // 多水厂账号，使用选择的水厂
        this.params.companyId = this.params.companyId || null;
      } else {
        // 单水厂固定全局ID
        this.params.companyId = this.companyId;
      }
    },
    // 拼接url参数
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
    // 过滤空参数
    filterNonEmptyParams(params) {
      const filteredParams = {};
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          const value = params[key];
          // 跳过空值、null、undefined
          if (value === "" || value === null || value === undefined) continue;
          // 排除空对象
          if (typeof value === "object" && Object.keys(value).length === 0) continue;
          filteredParams[key] = value;
        }
      }
      // 强制携带isPause=0，不会被过滤
      filteredParams.isPause = 1;
      return filteredParams;
    },
    // 核心查询
    async queryList(page = this.currentPage || 1, options = {}) {
      console.log("进入queryList，page：", page, "force：", options.force);
      if (this.loading && !options.force) {
        console.log("正在加载，阻断请求");
        return;
      }
      const requestSeq = ++this.listRequestSeq;
      this.loading = true;
      try {
        this.syncCompanyIdParam();
        const nonEmptyParams = this.filterNonEmptyParams(this.params);
        if (this.params.region) {
          nonEmptyParams.region = this.params.region;
        }
        const url = `/userManage/userCharge/showUserMeters/${page}${this.buildQueryString(nonEmptyParams)}`;
        console.log("最终请求地址：", url, "请求参数：", nonEmptyParams);
        const response = await service.get(url, {
          headers: {
            Authorization: this.token,
          },
        });
        if (requestSeq !== this.listRequestSeq) return;
        if (response.code === 200) {
          this.list = response.data.userInfoData || [];
          this.list.forEach((item, idx) => {
            // 生成表格序号
            item.theId = this.pageSize * (page - 1) + idx + 1;
            item.updateTime = item.updateTime ? item.updateTime.replace("T", " ") : "-";
          });
          this.total = response.data.totalElements || 0;
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
    // 获取区域，返回Promise
    getRegionData() {
      return new Promise((resolve) => {
        let url = "";
        if (this.companyId === 1) {
          url = this.params.companyId ? `/getRegion?companyId=${this.params.companyId}` : `/getRegion`;
        } else {
          url = `/getRegion?companyId=${this.companyId}`;
        }
        service.get(url, {
          headers: { Authorization: this.token }
        }).then((response) => {
          if (response.code === 200) {
            this.quyu_data = response.data.map(item => ({
              id: item.regionId,
              value: item.regionId,
              label: item.regionName,
            }));
          }
          resolve();
        }).catch(() => {
          ElMessage.error("获取区域数据失败");
          resolve();
        });
      });
    },
    // 关闭弹窗
    handleRechargeRecordDialogClose() {
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
    // 清空条件
    clear(isSearch) {
      this.params = {
        userName: "",
        userId: "",
        imei: "",
        meterCode: "",
        meterType: "",
        meterVendor: "",
        battery: "",
        valveStatus: "",
        companyId: null,
        userPhone: "",
        userAddr: "",
        order: 0,
        isPause: 1
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
    },
// 执行恢复水表接口，
    async handleStartUser() {
      this.isloading = true;
      try {
        const form = {
          imei: this.currentRow.imei,
          staffId: JSON.parse(sessionStorage.getItem("userData")).staffId
        };
        const res = await service.post("/userManage/userCharge/resumeMeter", form);
        if (res.code === 200) {
          ElMessage.success("操作成功，用户已恢复");
          this.startDialogVisible = false;
          // 恢复后刷新列表
          this.search();
        } else {
          ElMessage.error(res.msg || "恢复失败");
        }
      } catch (err) {
        console.error("恢复接口报错：", err);
        ElMessage.error("恢复请求异常，请稍后重试");
      } finally {
        this.isloading = false;
      }
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
