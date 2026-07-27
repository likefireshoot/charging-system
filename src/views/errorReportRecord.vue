<template>
  <div class="yuangong-container">
    <receive-exception-record
        v-if="recordType !== 'report'"
        :exception-type="recordType"
        @change-exception-type="recordType = $event"
    />
    <template v-else>
    <div class="search-box">
      <div class="search-content">
        <div class="search-input" style="margin-left: 10px">
          <span>异常类型</span>
          <el-select v-model="recordType" placeholder="请选择异常类型">
            <el-option label="读数异常" value="report" />
          </el-select>
        </div>
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
        <div class="search-input" style="margin-left: 10px">
          <span>厂商</span>
          <el-select v-model="params.meterVendor" placeholder="请选择厂商" clearable>
            <el-option label="信驰" value="信驰" />
            <el-option label="圣鑫" value="圣鑫" />
            <el-option label="旧信驰" value="旧信驰" />
            <el-option label="旧信驰KF01" value="旧信驰KF01" />
            <el-option label="旧圣鑫" value="旧圣鑫" />
            <el-option label="集万讯" value="集万讯" />
            <el-option label="千宝通" value="千宝通" />
            <el-option label="太阳能" value="太阳能" />
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>电量</span>
          <el-select v-model="params.battery" placeholder="请选择电量状态" clearable>
            <el-option label="正常" value="正常" />
            <el-option label="异常" value="异常" />
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>阀门</span>
          <el-select v-model="params.valveStatus" placeholder="请选择阀门状态" clearable>
            <el-option label="开阀" value="开阀" />
            <el-option label="关阀" value="关阀" />
            <el-option label="故障" value="故障" />
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
        <div class="export-out-btn" style="margin-left: 10px" @click="exportExcel">
          <img src="@/assets/yonghu/icon1.3.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">导出</span>
        </div>
        <div class="reflush" style="margin-left: 10px" @click="reflush">
          <img src="@/assets/yonghu/icon15.png" alt="" />
        </div>
      </div>
      <div class="yuangong-table">
        <el-table
            ref="multipleTableRef"
            :data="ErrorRecordData"
            row-key="staffId"
            style="width: 100%; height: 100%; table-layout: fixed; overflow-y: auto;"
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
          <el-table-column label="用户名" :width="companyWidth" align="center">
            <template #default="scope">
              <span @click="handleUserInfo(scope.row)"
                style="color: #46b97e; display: block; width: 100%; text-align: center; cursor: pointer">
                {{ scope.row.userName }}
              </span>
            </template>
          </el-table-column>
          <el-table-column property="meterCode" label="表号" :width="accountWidth" align="center" />
          <el-table-column property="companyName" label="所属水厂" :width="companyWidth" align="center" />
          <el-table-column property="meterVendor" label="厂商" :width="companyWidth" align="center" />
          <el-table-column property="valveStatus" label="阀门" :width="phoneWidth" align="center" />
          <el-table-column property="battery" label="电量" :width="companyWidth" align="center" />
          <el-table-column label="最近换表时间" :width="lastLoginTimeWidth" align="center">
            <template #default="scope">
              <div v-if="scope.row.factoryDate">
                {{ formatDateTime(scope.row.factoryDate) }}
              </div>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="上次读数" :width="roleWidth" align="center">
            <template #default="scope">
              <span @click="handlePrevReadingClick(scope.row)" style="color: #46b97e; cursor: pointer; display: block; width: 100%; text-align: center;">
                {{ scope.row.prevReadingCount !== null && scope.row.prevReadingCount !== undefined ? scope.row.prevReadingCount : '-' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="上次上报时间" :width="lastLoginTimeWidth" align="center" #default="scope">
            <div v-if="scope.row.prevCreateTime">
              {{ formatDateTime(scope.row.prevCreateTime) }}
            </div>
            <span v-else>-</span>
          </el-table-column>
          <el-table-column label="本次读数" :width="roleWidth" align="center">
            <template #default="scope">
              <span @click="handlePrevReadingClick(scope.row)" style="color: #46b97e; cursor: pointer; display: block; width: 100%; text-align: center;">
                {{ scope.row.readingCount !== null && scope.row.readingCount !== undefined ? scope.row.readingCount : '-' }}
              </span>
            </template>
          </el-table-column>
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
              <span v-else>-</span>
            </template>

          </el-table-column>
          <el-table-column label="操作" :width="operationWidth" align="center" #default="scope">
            <div v-if="scope.row._expired">
              <el-tag type="warning" size="large">已失效</el-tag>
            </div>
            <div v-else-if="scope.row.status === 0 || scope.row.status === null">
              <el-button type="danger" size="large" @click="showIgnoreDialog(scope.row)">忽略</el-button>

              <el-button type="success" size="large" @click="showValidDialog(scope.row)">有效</el-button>
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

    <!-- 忽略确认弹窗 -->
    <div class="confirm-dialog" v-if="confirmDialog.visible && confirmDialog.type === 'ignore'" @click.self="closeConfirmDialog">
      <div class="confirm-dialog-content">
        <div class="dialog-title">
          <span>忽略确认</span>
          <img src="@/assets/yonghu/icon4.png" alt="close" @click="closeConfirmDialog" class="dialog-close-icon" />
        </div>
        <div class="dialog-body">
          <p class="dialog-text">是否确认忽略此条异常上报？</p>
          <p class="dialog-subtext">该读数将被视为错误数据，不作计费依据。</p>
          <div class="dialog-info-row">
            <span>用户号：{{ confirmDialog.row.userId }}</span>
            <span>表号：{{ confirmDialog.row.meterCode }}</span>
          </div>
          <div class="dialog-info-row">
            <span>本次读数：{{ confirmDialog.row.readingCount }} 吨</span>
          </div>
        </div>
        <div class="dialog-footer">
          <div class="dialog-btn-cancel" @click="closeConfirmDialog">取消</div>
          <div class="dialog-btn-confirm-danger" @click="handleConfirm">确认忽略</div>
        </div>
      </div>
    </div>

    <!-- 有效确认弹窗 -->
    <div class="confirm-dialog" v-if="confirmDialog.visible && confirmDialog.type === 'valid'" @click.self="closeConfirmDialog">
      <div class="confirm-dialog-content confirm-dialog-content--valid">
        <div class="dialog-title">
          <span>有效确认</span>
          <img src="@/assets/yonghu/icon4.png" alt="close" @click="closeConfirmDialog" class="dialog-close-icon" />
        </div>
        <div class="dialog-body">
          <p class="dialog-text">确认此条上报为有效抄表记录？</p>
          <p class="dialog-subtext">本次上报所产生的水表倒转 / 读数回退为有效抄表记录，出于某些原因水表的确发生了倒转。</p>
          <div class="dialog-info-row">
            <span>用户号：{{ confirmDialog.row.userId }}</span>
            <span>表号：{{ confirmDialog.row.meterCode }}</span>
          </div>
          <div class="dialog-info-row">
            <span>上次读数：{{ confirmDialog.row.prevReadingCount != null ? confirmDialog.row.prevReadingCount : '-' }} 吨</span>
            <span>本次读数：{{ confirmDialog.row.readingCount }} 吨</span>
          </div>
          <p class="dialog-highlight">确认后将从 <strong>{{ confirmDialog.row.readingCount }}</strong> 吨开始重新计费。</p>
          <div class="dialog-checkbox-row">
            <el-checkbox v-model="confirmDialog.checked" class="confirm-checkbox">
              <span class="checkbox-text">我已明确该水表将从 <strong>{{ confirmDialog.row.readingCount }}</strong> 吨开始重新计费</span>
            </el-checkbox>
          </div>
        </div>
        <div class="dialog-footer">
          <div class="dialog-btn-cancel" @click="closeConfirmDialog">取消</div>
          <div class="dialog-btn-confirm" :class="{ disabled: !confirmDialog.checked }" @click="handleConfirm">确认有效</div>
        </div>
      </div>
    </div>

    <!-- 用户信息编辑弹窗 -->
    <userInfoVue
      v-if="user_info_dialogFormVisible"
      :user_info_dialogFormVisible="user_info_dialogFormVisible"
      :data="currentUserRow"
      @close="closeUserInfoDialog"
    />

    </template>
  </div>
</template>

<script>
import service from "@/api/request";
import { ElMessage } from "element-plus";
import formatDateTime from "@/api/common/dateConvert.js";
import axios from "axios";
import ReceiveExceptionRecord from "@/components/reportManage/ReceiveExceptionRecord.vue";
import userInfoVue from "@/components/userManage/userInfo.vue";
import { useDetailNavigation } from "@/composables/useDetailNavigation";
export default {
  components: {
    ReceiveExceptionRecord,
    userInfoVue,
  },
  setup() {
    const { navigateToDetail } = useDetailNavigation();
    return { navigateToDetail };
  },
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
        order: 1,
        meterVendor: null,
        battery: null,
        valveStatus: null
      },
      recordType: "report",
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
      vendorWidth: 0,
      factoryDateWidth: 0,
      operationWidth: 0,  // 操作列宽
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

      // 操作确认弹窗
      confirmDialog: {
        visible: false,
        type: '',      // 'ignore' | 'valid'
        row: null,
        checked: false, // 有效确认时的勾选框
      },

      // 用户信息弹窗
      user_info_dialogFormVisible: false,
      currentUserRow: {},

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
    // 每列的百分比宽度（仅计算实际使用列，总计 100%）
    columnPercentages() {
      return {
        selection: 0,
        index: 0,
        account: 8,
        worker_name: 7,
        company: 6,
        address: 0,
        phone: 6,
        post: 0,
        role: 8,
        //password: 0,
        last_login_time: 9,
        vendor: 0,
        factory_date: 0,
        operation: 12,
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
    // 检查是否需要恢复页面状态（从 userRecordDetail 返回时）
    if (this.$route.query.restore === 'true') {
      if (this.$route.query.paramsState) {
        try {
          const savedParams = JSON.parse(this.$route.query.paramsState);
          this.params = { ...this.params, ...savedParams };
        } catch (e) {
          console.error('恢复搜索参数失败', e);
        }
      }
      if (this.$route.query.recordType) {
        this.recordType = this.$route.query.recordType;
      }
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

    showIgnoreDialog(row) {
      this.confirmDialog = {
        visible: true,
        type: 'ignore',
        row: row,
        checked: false,
      };
    },
    showValidDialog(row) {
      this.confirmDialog = {
        visible: true,
        type: 'valid',
        row: row,
        checked: false,
      };
    },
    closeConfirmDialog() {
      this.confirmDialog.visible = false;
    },
    handleConfirm() {
      if (this.confirmDialog.type === 'valid' && !this.confirmDialog.checked) {
        ElMessage.warning('请勾选确认后再提交');
        return;
      }
      const { id } = this.confirmDialog.row;
      const status = this.confirmDialog.type === 'ignore' ? 1 : 2;
      this.edit(id, status);
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
              if (response.data && response.data.expired) {
                // 该异常数据已过期，本地标记已失效
                this.closeConfirmDialog();
                const target = this.ErrorRecordData.find(r => r.id === id);
                if (target) {
                  target._expired = true;
                }
                ElMessage.info(response.data.message || "该记录已过期，水表读数已恢复正常");
              } else {
                ElMessage.success("修改成功");
                this.closeConfirmDialog();
                this.getErrorReportRecordData();
              }
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          });
    },
    handleUserInfo(row) {
      if (this.staffPermissionIds.includes(17)) {
        this.currentUserRow = row;
        this.user_info_dialogFormVisible = true;
      } else {
        ElMessage.warning("暂无用户详情查看权限");
      }
    },
    closeUserInfoDialog() {
      this.user_info_dialogFormVisible = false;
      this.currentUserRow = {};
    },
    handlePrevReadingClick(row) {
      this.navigateToDetail(
        {
          ...row,
          companyId: row.companyId || this.companyId,
        },
        {
          source: 'errorReportRecord',
          tab: 'meter',
          pageState: {
            params: { ...this.params },
            recordType: this.recordType,
          },
        }
      );
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
        this.vendorWidth = (this.columnPercentages.vendor / 100) * parentWidth;
        this.factoryDateWidth = (this.columnPercentages.factory_date / 100) * parentWidth;
        this.operationWidth = (this.columnPercentages.operation / 100) * parentWidth;
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
      this.params.pageNo = 1;
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
        meterVendor: null,
        battery: null,
        valveStatus: null
      };
    },
    exportExcel() {
      const exportParams = { ...this.params };
      exportParams.pageNo = 1;
      exportParams.pageSize = 10000000;

      if (this.companyId === 1) {
        exportParams.companyId = this.params.company || null;
      } else {
        exportParams.companyId = this.companyId;
      }
      delete exportParams.company;

      const requestParams = Object.fromEntries(
        Object.entries(exportParams).filter(([_, value]) => value !== null && value !== undefined && value !== '')
      );

      axios({
        url: '/meterReportErrorRecord/exportMeterReportErrorRecord',
        method: 'POST',
        responseType: 'blob',
        data: requestParams,
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error('导出失败: ' + response.statusText);
          }
          const blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          if (blob.size === 0) {
            ElMessage.warning('内容为空，无法下载');
            return;
          }
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = '异常数据列表.xlsx';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(link.href);
        })
        .catch((error) => {
          console.error('导出失败:', error);
          ElMessage.error('导出失败: ' + error.message);
        });
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
  justify-content: flex-start;
  width: 100%;
  height: 98%;
  padding: 0px 20px;
}

.search-box {
  margin-top: 15px;
  margin-bottom: 20px;
  width: 100%;
  min-height: 112px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  background-color: #fff;
  padding: 8px 0;
}

.search-content {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  height: 100%;
  align-items: center;
  padding: 5px 0;
}

.search-input {
  display: flex;
  justify-content: center;
  flex-direction: column;
  flex: 1;
  min-width: 160px;
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
  flex-shrink: 0;
  height: 100%;
  align-items: center;
  padding-right: 15px;
  gap: 15px;
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
}

.sercah-btn {
  background-color: #45ba7e;
}

.clear-btn {
  background-color: #fff;
  border: 2px solid #f2f2f2;
  color: #5a5a5a;
}

.yuangong-info {
  width: 100%;
  height: calc(100% - 150px);
  margin-bottom: 0px;
  display: flex;
  flex-direction: column;
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

/* ========== 操作确认弹窗 ========== */
.confirm-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  background-color: rgb(31 33 38 / 40%);
}

.confirm-dialog-content {
  width: 520px;
  background-color: #fafafa;
  border-radius: 8px;
  position: absolute;
  left: 50%;
  top: 45%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.confirm-dialog-content--valid {
  width: 580px;
}

.dialog-title {
  width: 100%;
  height: 45px;
  line-height: 45px;
  background-color: #fff;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.dialog-close-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.dialog-close-icon:hover {
  opacity: 0.8;
}

.dialog-body {
  width: 88%;
  background-color: #fff;
  border-radius: 6px;
  margin-top: 20px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dialog-text {
  font-size: 20px;
  color: #333;
  font-weight: 600;
  margin: 0;
  text-align: center;
}

.dialog-subtext {
  font-size: 17px;
  color: #888;
  margin: 4px 0 8px;
  text-align: center;
  line-height: 1.6;
}

.dialog-info-row {
  display: flex;
  justify-content: center;
  gap: 40px;
  font-size: 17px;
  color: #555;
}

.dialog-highlight {
  font-size: 18px;
  color: #e6a23c;
  text-align: center;
  margin: 8px 0 4px;
  padding: 10px 16px;
  background-color: #fef8ee;
  border-radius: 6px;
  border: 1px solid #fae0a2;
}

.dialog-highlight strong {
  color: #e6920b;
  font-size: 20px;
}

.checkbox-text {
  font-size: 17px;
  color: #555;
  white-space: normal;
  line-height: 1.5;
}

.checkbox-text strong {
  color: #e6920b;
  font-size: 18px;
}

.dialog-footer {
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  margin-top: 15px;
  margin-bottom: 10px;
}

.dialog-btn-cancel,
.dialog-btn-confirm,
.dialog-btn-confirm-danger {
  height: 38px;
  width: 120px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s;
  border: 1px solid #e0e0e0;
}

.dialog-btn-cancel {
  background-color: #fff;
  color: #666;
}

.dialog-btn-cancel:hover {
  background-color: #f5f5f5;
}

.dialog-btn-confirm {
  background-color: #45ba7e;
  color: #fff;
  border-color: #45ba7e;
}

.dialog-btn-confirm:hover {
  background-color: #3aa06b;
}

.dialog-btn-confirm.disabled {
  background-color: #c0c4cc;
  border-color: #c0c4cc;
  cursor: not-allowed;
}

.dialog-btn-confirm-danger {
  background-color: #f56c6c;
  color: #fff;
  border-color: #f56c6c;
}

.dialog-btn-confirm-danger:hover {
  background-color: #e04545;
}

.confirm-dialog-content--valid .dialog-body {
  gap: 10px;
  padding: 22px 20px 16px;
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
