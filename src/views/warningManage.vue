<!--超级大文件，dialog全写里面了-->
<template>
  <div class="jinggao-container">
    <div class="serach-box">
      <div class="search-input" style="margin-left: 10px" v-if="companyId === 1">
        <span>所属水厂</span>
        <el-select  class="big-font-el-select" v-model="params.company" placeholder="请选择所属水厂">
          <el-option v-for="item in companyList" :key="item.id" :value="item.id" :label="item.name"></el-option>
        </el-select>
      </div>
      <div class="search-input" style="margin-left: 10px">
        <span>警告类型</span>
        <el-select class="big-font-el-select" v-model="params.warningType" @change="onWarningTypeChange">
          <el-option label="欠费用户" value="欠费用户"></el-option>
          <el-option label="水表0用量用户" value="水表0用量用户"></el-option>
          <el-option label="水表大用量用户" value="水表大用量用户"></el-option>
          <el-option label="数据长时间未上报" value="数据长时间未上报"></el-option>
          <el-option label="设备异常" value="设备异常"></el-option>
          <el-option label="关阀状态读数增加" value="关阀状态读数增加"></el-option>
          <el-option label="水表频繁上报" value="水表频繁上报"></el-option>
        </el-select>
      </div>
      <div class="search-input">
        <span>用户号</span>
        <el-input v-model="params.userId" placeholder="请输入..." />
      </div>
      <div class="search-input" style="margin-left: 10px">
        <span>用户名称</span>
        <el-input v-model="params.userName" placeholder="请输入..." />
      </div>
      <!-- <div class="search-input">
        <span>IMEI号</span>
        <el-input v-model="params.imei" placeholder="请输入..." />
      </div> -->
      <div class="search-input">
        <span>表号</span>
        <el-input v-model="params.meterCode" placeholder="请输入..." />
      </div>
      <div class="search-input">
        <span>阀门</span>
        <el-select class="big-font-el-select" v-model="params.valveStatus">
          <el-option label="开阀" value="开阀"></el-option>
          <el-option label="关阀" value="关阀"></el-option>
        </el-select>
      </div>
      <div class="search-input">
        <span>电量</span>
        <el-select class="big-font-el-select" v-model="params.battery" clearable placeholder="请选择">
          <el-option label="正常" value="正常"></el-option>
          <el-option label="异常" value="异常"></el-option>
        </el-select>
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
      <div class="buttons">
        <div class="sercah-btn" @click="getWaringData">
          <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: 12px" />
          <span style="font-size: 20px; margin-left: 10px">搜索</span>
        </div>
        <div class="clear-btn" @click="clear">
          <img src="@/assets/yonghu/icon4.png" alt="" style="margin-left: 12px" />
          <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">清空</span>
        </div>
      </div>
    </div>
    <div class="jinggao-info">
      <div class="command-box">
        <!-- <div class="export-in-btn" style="margin-left: 10px">
          <img src="@/assets/fapiao/icon3.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">导入</span>
        </div> -->
        <div class="config-display">
          <div class="config-item" v-for="item in configItems" :key="item.key">
            <span class="config-label">{{ item.label }}:</span>
            <el-input
              v-model="item.displayValue"
              :disabled="!configEditMode"
              :class="{ 'config-input-editable': configEditMode }"
              class="config-input"
            />
          </div>
          <el-checkbox v-model="configEditMode" class="config-checkbox">编辑</el-checkbox>
          <div class="config-confirm-btn" v-if="configEditMode" @click="confirmEditConfig">确认</div>
        </div>
        <div class="export-out-btn" style="margin-left: 10px" @click="exportExcel">
          <img src="@/assets/yonghu/icon1.3.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">导出</span>
        </div>
        <div class="reflush" style="margin-left: 10px" @click="reflush">
          <img src="@/assets/yonghu/icon15.png" alt="" />
        </div>
      </div>
      <div class="jinggao-list">
        <div class="quyu-box">
          <el-input v-model="filterText" placeholder="请输入关键字进行过滤" style="height: 32px; margin-bottom: 10px" />
          <el-tree
            ref="treeRef"
            style="max-width: 600px"
            class="filter-tree"
            :data="quyu_data"
            node-key="id"
            :props="defaultProps"
            default-expand-all
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
          />
        </div>
        <div class="jinggao-table">
          <el-table
            ref="multipleTableRef"
            :data="jinggaoData"
            row-key="theId"
            style="width: auto; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
            border
            :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
            @selection-change="handleSelectionChange"
            id="jinggao-table"
            v-loading="isLoading"
          >
            <el-table-column type="selection" :width="selectionWidth" align="center" fixed="left" />
            <el-table-column property="theId" label="序号" :width="idWidth" align="center" fixed="left"> </el-table-column>
            <el-table-column property="userId" label="用户号" :width="userIdWidth" align="center" />
            <el-table-column property="userName" label="用户名" :width="userNameWidth" align="center" />
            <el-table-column property="meterCode" label="表号" :width="biaohaoWidth" align="center" />
            <el-table-column property="userAddr" label="地址" :width="addressWidth" align="center" />
<!--            <el-table-column property="regionName" label="所属区域" :width="quyuWidth" align="center" />-->
            <el-table-column property="userPhone" label="电话" :width="phoneWidth" align="center" />
            <el-table-column property="meterVendor" label="厂商" :width="deviceVendorWidth" align="center" />
            <el-table-column property="companyName" label="水厂" :width="companyWidth" align="center" />
<!--            <el-table-column property="meterCode" label="表号" :width="biaohaoWidth" align="center" />-->
            <!-- <el-table-column property="imei" label="IMEI号" :width="imeihaoWidth" align="center" /> -->
            <el-table-column property="valveStatus" label="阀门" :width="deviceValveWidth" align="center" />
            <el-table-column property="battery" label="电量" :width="deviceBatteryWidth" align="center" />
            <el-table-column label="读数" :width="totalWaterWidth" align="center">
              <template #default="scope">
                <span @click="handleWarningMeterJump(scope.row)"
                      style="color: #46b97e; cursor: pointer; display: block; width: 100%; text-align: center">{{ scope.row.totalWater }}</span>
              </template>
            </el-table-column>
            <el-table-column property="balance" label="余额/元" :width="amountWidth" align="center" />
            <el-table-column property="warningType" label="警告类型" :width="warningTypeWidth" align="center" />
            <el-table-column property="createTime" :label="warningTimeLabel" :width="warningTimeWidth" align="center" :formatter="formatDateByType" />
            <el-table-column v-if="showOweAmountColumn" property="oweAmount" label="欠费金额" :width="oweAmountWidth" align="center">
              <template #header>
                <div class="sortable-header">
                  <span>欠费金额</span>
                  <div class="sort-icons">
                    <!-- 升序 ▲ -->
                    <span
                      class="asc-icon"
                      :class="{ active: params.sortType === 1 }"
                      @click="setSortType(1)"
                    >▲</span>
                    <!-- 降序 ▼ -->
                    <span
                      class="desc-icon"
                      :class="{ active: params.sortType === 0 }"
                      @click="setSortType(0)"
                    >▼</span>
                  </div>
                </div>
              </template>
              <template #default="scope">
                <span @click="handleDetail(scope.row)"
                      style="color: #46b97e; display: block; width: 100%; text-align: center">{{ formatOweAmount(scope.row.oweAmount)}}</span>
              </template>
            </el-table-column>
            <el-table-column v-if="showOweAmountColumn" property="qianfeiDays" label="欠费天数" :width="qianfeiDaysWidth" align="center" />
            <el-table-column v-if="showZeroUsageColumn" property="durationDays" label="0用量天数" :width="durationDaysWidth" align="center" />
            <el-table-column v-if="showLargeUsageColumn" property="largeUsageAmount" label="昨日用水量" :width="largeUsageAmountWidth" align="center" />
            <el-table-column v-if="showDeviceAbnormalColumn" property="signalValue" label="信号值" :width="deviceSignalWidth" align="center" />
            <el-table-column v-if="showLongTimeNoReportColumn" property="durationDays" label="未上报天数" :width="durationDaysWidth" align="center" />
            <el-table-column v-if="showLongTimeNoReportColumn" property="signalValue" label="信号值" :width="deviceSignalWidth" align="center" />


            <!-- 水表频繁上报专用列 -->
            <el-table-column v-if="showFrequentReportColumn" label="当日上报次数" :width="reportCountWidth" align="center">
              <template #default="scope">
                <span @click="handleWarningMeterJump(scope.row)"
                      style="color: #46b97e; cursor: pointer; display: block; width: 100%; text-align: center">{{ scope.row.dailyReportCount }}</span>
              </template>
            </el-table-column>
            <!-- 关阀状态读数增加专用列 -->
            <el-table-column v-if="showValveClosedIncreaseColumn" label="上次读数" :width="lastReadingWidth" align="center">
              <template #default="{ row }">
                {{ (row.tons != null && row.abnormalWaterDelta != null) ? (row.tons - row.abnormalWaterDelta).toFixed(2) : '' }}
              </template>
            </el-table-column>
            <el-table-column v-if="showValveClosedIncreaseColumn" label="异常增加量" :width="abnormalIncreaseWidth" align="center">
              <template #default="{ row }">
                {{ row.abnormalWaterDelta != null ? row.abnormalWaterDelta : '' }}
              </template>
            </el-table-column>
<!--            <el-table-column v-if="showValveClosedIncreaseColumn" label="告警时读数" :width="alarmReadingWidth" align="center">-->
<!--              <template #default="scope">-->
<!--                <span @click="handleWarningMeterJump(scope.row)"-->
<!--                      style="color: #46b97e; cursor: pointer; display: block; width: 100%; text-align: center">{{ scope.row.tons != null ? scope.row.tons : '' }}</span>-->
<!--              </template>-->
<!--            </el-table-column>-->
          </el-table>
        </div>
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
import axios from "axios";
import { useWarningStore } from "@/store/warningStore.js";
import { mapState } from "pinia";
import { useDetailNavigation } from "@/composables/useDetailNavigation";
export default {
  components: {},
  setup() {
    const { navigateToDetail } = useDetailNavigation();
    return { navigateToDetail };
  },
  data() {
    return {
      params: {
        //company: "",
        userId: "",
        pageNo: 1,
        pageSize: 50,
        userName: "",
        warningType: "",
        imei: "",
        meterCode: "",
        company: null,
        companyId: null,
        valveStatus: "",
        // 新增电量、厂商
        meterVendor: "",
        battery: "",
        sortType: null // 新增：0=欠费降序，1=欠费升序，null=默认时间
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      staffPermissionIds: JSON.parse(sessionStorage.getItem("userData")).staffPermissionIds,
      region: "",
      total: null,
      filterText: "",
      treeRef: null,
      defaultProps: {
        label: "label",
      },
      quyu_data: [],
      quyu_selected: "",
      jinggaoData: [],
      companyList: [],

      // 每列的实际宽度
      selectionWidth: 0,
      idWidth: 0,
      userIdWidth: 0,
      userNameWidth: 0,
      addressWidth: 0,
      qianfeiDaysWidth: 0, 
      valveStatusWidth: 0,
      quyuWidth: 0,
      phoneWidth: 0,
      biaohaoWidth: 0,
      imeihaoWidth: 0,
      warningTimeWidth: 0,
      warningTypeWidth: 0,
      oweAmountWidth: 0,
      totalWaterWidth: 0,
      durationDaysWidth: 0,
      largeUsageAmountWidth: 0,
      deviceValveWidth: 0,
      deviceBatteryWidth: 0,
      deviceSignalWidth: 0,
      deviceVendorWidth: 0,
      reportCountWidth: 0,
      lastReadingWidth: 0,
      abnormalIncreaseWidth: 0,
      alarmReadingWidth: 0,
      companyWidth: 0,
      amountWidth: 0,
      // 父容器元素
      parentContainer: null,
      // ResizeObserver 实例
      resizeObserver: null,

      // 警告配置参数展示
      configItems: [
        { label: '大用量额度（吨）', key: 'amountQuota', displayValue: '' },
        { label: '最大持续未上报天数（天）', key: 'delayDays', displayValue: '' },
        { label: '最大每日上报次数', key: 'maxDailyReportTimes', displayValue: '' },
        { label: '最大零用量天数', key: 'maxDaysWithoutUsage', displayValue: '' },
      ],
      configEditMode: false,

      // ****** 锁
      isLoading: false,

      // ****** 警告类型切换防抖 + 缓存
      warningTypeDebounceTimer: null,
      warningDataCache: {},

      //存储当前勾选的行的数据信息
      multipleSelection: [],

    };
  },
  watch: {
    filterText(val) {
      if (this.treeRef) {
        this.$nextTick(() => {
          this.treeRef.filter(val);
        });
      }
    },
    // region() {
    //   this.getWaringDataByRegion();
    // },
    // "params.pageNo"() {
    //   this.getWaringData();
    // },
    "params.warningType"() {
      this.$nextTick(() => {
        this.calculateColumnWidths();
      });
    },
    "params.company"() {
      this.quyu_selected = null;
      this.region = "";
      this.$refs.treeRef.setCurrentKey(null);
      this.getRegionData();
    },
  },
  computed: {
    ...mapState(useWarningStore, ["currentWarningType", "isFromHomeClick"]),
    // 计算属性，判断是否应该从 Pinia 读取数据
    shouldReadFromPinia() {
      return this.isFromHomeClick;
    },
    showOweAmountColumn() {
      return (this.params.warningType || "").includes("欠费");
    },
    showZeroUsageColumn() {
      return (this.params.warningType || "").includes("0用量");
    },
    showLargeUsageColumn() {
      return (this.params.warningType || "").includes("大用量");
    },
    showDeviceAbnormalColumn() {
      return (this.params.warningType || "").includes("设备异常");
    },
    showLongTimeNoReportColumn() {
      return (this.params.warningType || "").includes("长时间未上报");
    },
    showFrequentReportColumn() {
      return (this.params.warningType || "").includes("水表频繁上报");
    },
    showValveClosedIncreaseColumn() {
      return (this.params.warningType || "").includes("关阀");
    },
    warningTimeLabel() {
      if (this.showZeroUsageColumn) return "未用水起始时间";
      if (this.showLongTimeNoReportColumn) return "未上报起始时间";
      if (this.showFrequentReportColumn) return "警告日期";
      return "警告时间";
    },
    // 定义每列的百分比宽度
    // ⚠️ 注意：每种警告类型的列宽百分比总和必须恰好等于 100%
    // 否则表格宽度不满容器，会与左侧 el-tree 的间距不一致
    // 修改列宽后请核对各 block 末尾注释中的总和
    columnPercentages() {
      // 欠费用户 — sum: 4+5+6+9+11+9+9+11+7+6+8+7+8 = 100
      if (this.showOweAmountColumn) {
        return {
          selection: 2,
          id: 5,
          userId: 6,
          userName: 8,
          address: 6,
          phone: 6,
          biaohao: 6,
          deviceVendor: 5,
          company: 7,
          deviceValve: 4,
          deviceBattery: 4,
          warningTime: 9,
          warningType: 4,
          totalWater: 7,
          amount: 6,
          oweAmount: 8,
          qianfeiDays: 5,
        };
      }
      // 水表0用量用户 — sum: 4+5+7+10+13+11+10+13+9+7+11 = 100
      if (this.showZeroUsageColumn) {
        return {
          selection: 2,
          id: 5,
          userId: 6,
          userName: 8,
          address: 8,
          phone: 7,
          biaohao: 6,
          deviceVendor: 4,
          company: 8,
          deviceValve: 4,
          deviceBattery: 4,
          warningTime: 10,
          warningType: 7,
          totalWater: 7,
          amount: 6,
          durationDays: 8,
        };
      }
      // 设备异常 — sum: 4+5+6+9+11+9+8+10+7+6+6+6+6+7 = 100
      if (this.showDeviceAbnormalColumn) {
        return {
          selection: 2,
          id: 5,
          userId: 6,
          userName: 8,
          address: 8,
          phone: 6,
          biaohao: 7,
          deviceVendor: 6,
          company: 8,
          deviceValve: 4,
          deviceBattery: 4,
          warningTime: 9,
          warningType: 7,
          totalWater: 7,
          amount: 6,
          deviceSignal: 6,
        };
      }
      // 水表大用量用户 — sum: 4+5+7+10+13+11+10+13+9+7+11 = 100
      if (this.showLargeUsageColumn) {
        return {
          selection: 2,
          id: 5,
          userId: 6,
          userName: 11,
          address: 6,
          phone: 6,
          biaohao: 6,
          deviceVendor: 4,
          company: 7,
          deviceValve: 4,
          deviceBattery: 4,
          warningTime: 10,
          warningType: 7,
          totalWater: 6,
          amount: 8,
          largeUsageAmount: 8,
        };
      }
      // 数据长时间未上报 — sum: 4+5+7+9+11+11+9+10+8+5+9+6+6 = 100
      if (this.showLongTimeNoReportColumn) {
        return {
          selection: 2,
          id: 5,
          userId: 6,
          userName: 7,
          address: 7,
          phone: 6,
          biaohao: 6,
          deviceVendor: 4,
          company: 7,
          deviceValve: 4,
          deviceBattery: 4,
          warningTime: 10,
          warningType: 7,
          totalWater: 7,
          amount: 6,
          durationDays: 6,
          deviceSignal: 6,
        };
      }
      // 水表频繁上报 — sum: 4+5+7+11+13+11+10+13+10+8+8 = 100
      if (this.showFrequentReportColumn) {
        return {
          selection: 2,
          id: 5,
          userId: 6,
          userName: 8,
          address: 8,
          phone: 6,
          biaohao: 7,
          deviceVendor: 6,
          company: 8,
          deviceValve: 4,
          deviceBattery: 4,
          warningTime: 9,
          warningType: 7,
          totalWater: 7,
          amount: 6,
          reportCount: 6,
        };
      }
      // 关阀状态读数增加 — sum: 4+6+7+10+13+9+9+12+9+6+7+8 = 100
      if (this.showValveClosedIncreaseColumn) {
        return {
          selection: 2,
          id: 5,
          userId: 6,
          userName: 8,
          address: 6,
          phone: 6,
          biaohao: 6,
          deviceVendor: 4,
          company: 7,
          deviceValve: 4,
          deviceBattery: 4,
          warningTime: 9,
          warningType: 7,
          totalWater: 6,
          amount: 7,
          lastReading: 7,
          abnormalIncrease: 6,
        };
      }
      // 默认（fallback）— sum: 4+6+8+12+14+11+11+15+10+9 = 100
      return {
        selection: 4,
        id: 6,
        userId: 8,
        userName: 12,
        address: 14,
        phone: 11,
        biaohao: 11,
        warningTime: 15,
        warningType: 10,
        totalWater: 9,
      };
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.treeRef = this.$refs.treeRef;
    });
    if (this.shouldReadFromPinia) {
      this.params.warningType = this.currentWarningType;
    }
    // 获取父容器元素
    this.parentContainer = document.querySelector(".jinggao-table");
    // 初始化列宽
    this.calculateColumnWidths();

    // 创建 ResizeObserver 实例并监听父容器宽度变化
    this.resizeObserver = new ResizeObserver(this.calculateColumnWidths);
    if (this.parentContainer) {
      this.resizeObserver.observe(this.parentContainer);
    }
    if(this.$route.query.warningType!=""){
          this.params.warningType = this.$route.query.warningType
          this.$store.commit("setNavIndex", 6);
    }
    if (this.params.warningType === "" || this.params.warningType === undefined){
      this.params.warningType = "欠费用户" //默认选项
    }

    // 检查是否需要恢复页面状态（从 userRecordDetail 返回时）
    this._restoring = this.$route.query.restore === 'true';
    if (this._restoring) {
      // 恢复搜索参数
      if (this.$route.query.paramsState) {
        try {
          const savedParams = JSON.parse(this.$route.query.paramsState);
          this.params = { ...this.params, ...savedParams };
        } catch (e) {
          console.error('恢复搜索参数失败', e);
        }
      }
      // 恢复区域筛选
      if (this.$route.query.region) {
        this.region = this.$route.query.region;
      }
      // 恢复树过滤文本
      if (this.$route.query.filterText) {
        this.filterText = this.$route.query.filterText;
      }
      // 恢复区域树选中节点
      if (this.$route.query.quyu_selected && this.$route.query.quyu_selected !== 'null') {
        try {
          const quyuSelected = JSON.parse(this.$route.query.quyu_selected);
          this.quyu_selected = quyuSelected;
        } catch (e) {
          this.quyu_selected = null;
        }
      }
      // 清除 sessionStorage 中的保存状态
      sessionStorage.removeItem('warningManagePageState');
    }

    this.getCompanyList();
    this.getRegionData();
    this.getWaringData();
    this.loadWarningConfig();

    // 恢复区域树节点选中状态（需等树渲染完成）
    if (this._restoring && this.quyu_selected) {
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.$refs.treeRef && this.quyu_selected) {
            this.$refs.treeRef.setCurrentKey(this.quyu_selected.id);
          }
        }, 350);
      });
    }
  },
  beforeUnmount() {
    // 组件卸载时取消监听
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  methods: {
    // 设置欠费金额排序：0降序，1升序，再次点击同一切回null默认
    setSortType(type) {
      // 重复点击同一按钮则取消排序（恢复默认按时间）
      this.params.sortType = this.params.sortType === type ? null : type;
      this.params.pageNo = 1;
      this.getWaringData();
    },
    // ****** 欠费金额点击 → 跳转至用户详情页（默认 tab：扣费记录）
    handleDetail(row) {
      this.navigateToDetail(row, {
        source: 'warningManage',
        pageState: {
          params: { ...this.params },
          region: this.region,
          quyu_selected: this.quyu_selected,
          filterText: this.filterText,
        },
      });
    },

    // ****** 告警读数/次数点击 → 跳转至用户详情页（抄表记录 tab）
    handleWarningMeterJump(row) {
      this.navigateToDetail(row, {
        source: 'warningManage',
        tab: 'meter',
        pageState: {
          params: { ...this.params },
          region: this.region,
          quyu_selected: this.quyu_selected,
          filterText: this.filterText,
        },
      });
    },

    // ****** 警告类型切换（带防抖 + 缓存）
    onWarningTypeChange() {
      if (this.warningTypeDebounceTimer) {
        clearTimeout(this.warningTypeDebounceTimer);
      }
      this.warningTypeDebounceTimer = setTimeout(() => {
        this.params.pageNo = 1;
        this.params.sortType = null; // 重置排序
        this.getWaringData();
      }, 300);
    },

    // ****** 手动处理分页变化，避免 watch 循环 ******
    handlePageChange(page) {
      if (this.isLoading) return;
      // this.isLoading = true;
      this.params.pageNo = page;
      this.getWaringData();
    },

    filterNode(value, data) {
      if (!value) return true;
      return data.label.includes(value);
    },
    handleNodeClick(data) {
      this.quyu_selected = data;
      this.region = this.quyu_selected.label;
      const region = this.quyu_selected.label;
      console.log(this.params);
      const nonEmptyParams = this.filterNonEmptyParams(this.params);
      nonEmptyParams.regionName = region;
      console.log(nonEmptyParams);
      service
        .post("/warning/queryWarning", nonEmptyParams)
        .then((response) => {
          if (response.code === 200) {
            response.data.records.map((v, i) => {
              v.theId = this.params.pageSize * (response.data.current - 1) + i + 1;
            });
            this.jinggaoData = response.data.records;
            this.jinggaoData.forEach((item) => {
              if (item.qianfeiDays === -1) item.qianfeiDays = 0;
            });
            this.total = response.data.total;
            this.params.pageNo = response.data.current;
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          //ElMessage.error(error);
          console.log(error);
        });
    },
    selectable() {
      return true; // 目前允许所有行选择，你可以加上你的业务逻辑
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 计算列宽的函数
    // 根据 columnPercentages 的百分比分配计算各列实际像素宽度
    // 百分比总和 = 100，确保表格填满容器，与左侧 el-tree 间距一致
    calculateColumnWidths() {
      if (this.parentContainer) {
        const p = this.columnPercentages;
        const w = this.parentContainer.offsetWidth;
        this.selectionWidth = (p.selection / 100) * w;
        this.idWidth = (p.id / 100) * w;
        this.userIdWidth = (p.userId / 100) * w;
        this.userNameWidth = (p.userName / 100) * w;
        this.addressWidth = (p.address / 100) * w;
        this.phoneWidth = (p.phone / 100) * w;
        this.biaohaoWidth = (p.biaohao / 100) * w;
        this.warningTimeWidth = (p.warningTime / 100) * w;
        this.warningTypeWidth = (p.warningType / 100) * w;
        this.totalWaterWidth = (p.totalWater / 100) * w;
        this.oweAmountWidth = p.oweAmount ? (p.oweAmount / 100) * w : 0;
        this.valveStatusWidth = p.valveStatus ? (p.valveStatus / 100) * w : 0;
        this.qianfeiDaysWidth = p.qianfeiDays ? (p.qianfeiDays / 100) * w : 0;
        this.durationDaysWidth = p.durationDays ? (p.durationDays / 100) * w : 0;
        this.largeUsageAmountWidth = p.largeUsageAmount ? (p.largeUsageAmount / 100) * w : 0;
        this.deviceValveWidth = p.deviceValve ? (p.deviceValve / 100) * w : 0;
        this.deviceBatteryWidth = p.deviceBattery ? (p.deviceBattery / 100) * w : 0;
        this.deviceSignalWidth = p.deviceSignal ? (p.deviceSignal / 100) * w : 0;
        this.deviceVendorWidth = p.deviceVendor ? (p.deviceVendor / 100) * w : 0;
        this.reportCountWidth = p.reportCount ? (p.reportCount / 100) * w : 0;
        this.lastReadingWidth = p.lastReading ? (p.lastReading / 100) * w : 0;
        this.abnormalIncreaseWidth = p.abnormalIncrease ? (p.abnormalIncrease / 100) * w : 0;
        this.alarmReadingWidth = p.alarmReading ? (p.alarmReading / 100) * w : 0;
        this.companyWidth = p.company ? (p.company / 100) * w : 0;
        this.amountWidth = p.amount ? (p.amount / 100) * w : 0;
      }
    },
    formatOweAmount(val) {
      if (val === null || val === undefined || val === "") return "--";
      const num = Number(val);
      if (Number.isFinite(num)) return `${num.toFixed(2)} 元`;
      return `${val} 元`;
    },
    formatDateByType(row){
      if (!row.createTime) return "";
      if (this.showFrequentReportColumn){
        return row.createTime.split(" ")[0];
      }
      return row.createTime;
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
        if (this.params.company) {
          url = `/getRegion?companyId=${this.params.company}`; // 所属水厂ID
        } else {
          url = `/getRegion`; // 所属水厂ID
        }
      } else {
        url = `/getRegion?companyId=${this.companyId}`; // 所属水厂ID
      }
      console.log(url);
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
            console.log(this.quyu_data);
          }
        })
        .catch((error) => {
          ElMessage.error("获取区域数据失败");
        });
    },
    getWaringData() {
      if(this.isLoading) return
      if (this.companyId === 1) {
        if (this.params.company) {
          this.params.companyId = this.params.company; // 所属水厂ID
        }
      } else {
        this.params.companyId = this.companyId; // 所属水厂ID
      }
      let params = this.filterNonEmptyParams(this.params);
      if (this.region != null && this.region != "") {
        params.regionName = this.region;
      }
      console.log(params);

      // 检查缓存
      const cacheKey = JSON.stringify(params);
      if (this.warningDataCache[cacheKey]) {
        const cached = this.warningDataCache[cacheKey];
        this.jinggaoData = cached.records;
        this.total = cached.total;
        console.log("使用缓存数据", cacheKey);
        return;
      }

      this.isLoading = true
      // 从sessionStorage获取token
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
        .post("/warning/queryWarning", params, {
          headers: {
            Authorization: token,
            token: token,
          },
        })
        .then((response) => {
          if (response.code === 200) {
            response.data.records.map((v, i) => {
              v.theId = this.params.pageSize * (response.data.current - 1) + i + 1;
            });
            this.jinggaoData = response.data.records;
            this.jinggaoData.forEach((item) => {
              if (item.qianfeiDays === -1) item.qianfeiDays = 0;
            });
            this.total = response.data.total;
            // 存入缓存
            this.warningDataCache[cacheKey] = {
              records: this.jinggaoData,
              total: this.total,
            };
            // this.params.pageNo = response.data.current;
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          //ElMessage.error(error);
          console.log(error);
        }).finally(()=>{
          this.isLoading = false
      });
    },
    getWaringDataByPage() {
      let params = this.filterNonEmptyParams(this.params);
      if (this.region != null && this.region != "") {
        params.regionName = this.region;
      }
      params.companyId = this.params.company ? this.params.company : this.companyId;
      service
        .post("/warning/queryWarning", params)
        .then((response) => {
          if (response.code === 200) {
            this.jinggaoData = response.data.records;
            this.jinggaoData.forEach((item) => {
              if (item.qianfeiDays === -1) item.qianfeiDays = 0;
            });
            this.total = response.data.total;
            this.params.pageNo = response.data.current;
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          //ElMessage.error(error);
          console.log(error);
        });
    },
    filterNonEmptyParams(params) {
      const filteredParams = {};
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          const value = params[key];
          if (value !== "") {
            filteredParams[key] = value;
          }
        }
      }
      return filteredParams;
    },
    reflush() {
      this.warningDataCache = {};
      this.clear(1);
      this.params.sortType = null; // 重置排序
      this.filterText = "";
      this.$refs.treeRef.setCurrentKey(null);
      this.region = "";
      let params = { pageNo: 1, pageSize: 50 };
      if (this.companyId === 1) {
        if (this.params.company) {
          params.companyId = this.params.company; // 所属水厂ID
        }
      } else {
        params.companyId = this.companyId; // 所属水厂ID
      }
      params.warningType = this.params.warningType
      service
        .post("/warning/queryWarning", params)
        .then((response) => {
          if (response.code === 200) {
            response.data.records.map((v, i) => {
              v.theId = this.params.pageSize * (response.data.current - 1) + i + 1;
            });
            this.jinggaoData = response.data.records;
            this.jinggaoData.forEach((item) => {
              if (item.qianfeiDays === -1) item.qianfeiDays = 0;
            });
            this.total = response.data.total;
            this.params.pageNo = response.data.current;
            this.quyu_selected = null;
            // this.region = "";
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    clear(isSearch) {
      this.params.company = null;
      this.params.companyId = null;
      // this.params.warningType = "欠费用户";
      this.params.userName = "";
      this.params.imei = "";
      this.params.meterCode = "";
      this.params.valveStatus = "";
      this.params.regionName = "";
      this.params.userId = "";
      this.params.meterVendor = "";
      this.params.battery = "";
      if (typeof isSearch != 'number' || isNaN(isSearch)) {
        this.warningDataCache = {};
        this.filterText = "";
        if (this.$refs.treeRef) {
          this.$refs.treeRef.setCurrentKey(null);
        }
        this.region = "";
        this.params.pageNo = 1;
        this.params.sortType = null; // 重置排序
        this.getWaringData();
      }
    },
    exportExcel() {
      // 复制params并剔除分页参数 pageNo、pageSize
      const tempParams = { ...this.params };
      delete tempParams.pageNo;
      delete tempParams.pageSize;

      const exportParams = {
        ...tempParams,
        companyId: this.companyId === 1 ? this.params.company || null : this.companyId,
      };
      if (this.region) {
        exportParams.regionName = this.region;
      }
      delete exportParams.company;
      const requestParams = Object.fromEntries(Object.entries(exportParams).filter(([_, value]) => value !== null && value !== undefined && value !== ""));
      axios({
        url: "/warning/exportWarningReport",
        method: "POST",
        responseType: "blob",
        data: requestParams,
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error("导出失败: " + response.statusText);
          }

          const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

          if (blob.size === 0) {
            ElMessage.warning("内容为空，无法下载");
            return;
          }

          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = "警告数据列表.xlsx";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(link.href);
        })
        .catch((error) => {
          console.error("导出失败:", error);
          ElMessage.error("导出失败: " + error.message);
        });
      return;
      let url = "";
      let params = {};
      if (this.companyId === 1) {
        if (this.params.company) {
          params.companyId = this.params.company; // 所属水厂ID
          url = `/warning/exportWarningReport?companyId=${params.companyId}`; // 后端接口地址
        } else {
          url = `/warning/exportWarningReport`; // 后端接口地址
        }
      } else {
        params.companyId = this.companyId; // 所属水厂ID
        url = `/warning/exportWarningReport?companyId=${params.companyId}`;
      }
      axios({
        url: url, // 后端接口地址
        method: "GET",
        responseType: "blob", // 指定响应类型为二进制流
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
          link.download = "警告数据列表.xlsx"; // 设置下载文件名
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
    loadWarningConfig() {
      service
        .get("/warning/getWarningConfig")
        .then((response) => {
          if (response.code === 200) {
            this.configItems[0].displayValue = response.data.dailyWaterUsageLimit;
            this.configItems[1].displayValue = response.data.maxDaysWithoutReport;
            this.configItems[2].displayValue = response.data.maxDailyReportTimes;
            this.configItems[3].displayValue = response.data.maxDaysWithoutUsage;
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    confirmEditConfig() {
      // 校验所有配置项均不为空
      for (const item of this.configItems) {
        if (item.displayValue === null || item.displayValue === '') {
          ElMessage.error(item.label + '不能为空');
          return;
        }
        const numVal = parseInt(item.displayValue);
        if (isNaN(numVal) || numVal < 0) {
          ElMessage.error(item.label + '必须为正整数');
          return;
        }
      }

      const amountQuota = this.configItems[0].displayValue;
      const delayDays = this.configItems[1].displayValue;
      const maxDailyReportTimes = this.configItems[2].displayValue;
      const maxDaysWithoutUsage = this.configItems[3].displayValue;

      service
        .get(`/warning/setWarningConfig?amountQuota=${amountQuota}&delayDays=${delayDays}&maxDailyReportTimes=${maxDailyReportTimes}&maxDaysWithoutUsage=${maxDaysWithoutUsage}`)
        .then((response) => {
          if (response.code === 200) {
            ElMessage.success('设置成功');
            this.configEditMode = false;
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
  }
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

:deep(.el-select) {
  --el-color-primary: #46b97e;
}

:deep(.el-select .el-select__wrapper) {
  height: 35px;
}

:deep(.el-select-dropdown .el-scrollbar .el-select-dropdown__wrap .el-select-dropdown__list li.selected span) {
  color: #46b97e;
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
  overflow-y: auto;
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

.jinggao-container {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  width: 100%;
  height: 98%;
  padding: 0px 20px;
}

.jinggao-container > * {
  padding: 0px 10px;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  width: 99.3%;
  background-color: #fff;
}

.serach-box {
  margin-top: 10px;
  margin-bottom: 10px;
  height: 98px;
  display: flex;
  align-items: center;
  position: relative;
}

.search-input {
  display: flex;
  justify-content: flex-start;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 9%;
  height: 100%;
  margin-right: 20px;
}

.search-input > span {
  font-size: 20px;
  margin-bottom: 5px;
}

.time-input {
  display: flex;
  width: 100%;
}

.time-input > * {
  width: 50%;
  margin-right: 20px;
}

.buttons {
  display: flex;
  width: 240px;
  height: 100%;
  align-items: center;
  position: absolute;
  right: 20px;
  margin-right: 30px;
}

.buttons > * {
  width: 120px;
  margin-right: 50px;
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
  margin-right: 0px;
}

.jinggao-info {
  height: calc(100% - 120px);
  margin-bottom: 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.command-box {
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  margin-bottom: 20px;
  position: absolute;
  top: 15px;
}

.command-box > * {
  margin-right: 20px;
}

.config-display {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  padding-left: 30px;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.config-label {
  font-size: 20px;
  color: #575556;
  white-space: nowrap;
}

.config-input {
  width: 100px;
  font-size: 20px;
}

.config-input-editable :deep(.el-input__inner) {
  background-color: #ffffff !important;
  border-color: #46b97e !important;
  color: #333333 !important;
  font-size: 20px !important;
}

.config-checkbox {
  white-space: nowrap;
  font-size: 20px;
}

:deep(.config-checkbox .el-checkbox__label) {
  font-size: 20px;
}

.config-confirm-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 35px;
  padding: 0 20px;
  background-color: #45ba7e;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
  font-size: 20px;
  white-space: nowrap;
  transition: all 0.3s;
}

.config-confirm-btn:hover {
  background-color: #3aa86e;
}

.add-btn,
.delete-btn,
.command-btn,
.recharge-btn,
.recharge-record-btn,
.water-meter-btn,
.water-meter-record-btn,
.export-in-btn,
.export-out-btn {
  display: flex;
  align-items: center;
  width: 90px; /* 设置按钮的宽度 */
  height: 35px; /* 设置按钮的高度 */
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
  width: 35px; /* 设置按钮的宽度 */
  height: 32px; /* 设置按钮的高度 */
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 20px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
}

.jinggao-list {
  width: 100%;
  height: calc(100% - 150px);
  display: flex;
  margin-top: 10px;
  margin-bottom: 5px;
}

.quyu-box {
  width: 220px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fafafa;
  border-radius: 5px;
  padding: 10px;
  margin-right: 1%;
}

.quyu-box > * {
  width: 100%;
  margin-bottom: 5px;
}

.quyu-box > .el-tree {
  height: 100%;
}

.quyu-box > .el-input ::placeholder {
  text-align: center;
}

.jinggao-table {
  flex: 1;
  margin-left: 1%;
  height: calc(100% - 10px);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
}

.page-box {
  width: 100%;
  height: 65px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 5px;
  position: absolute;
  bottom: 0;
}

.add-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.add-dialog {
  z-index: 200;
}

.add-dialog-content {
  width: 40%;
  height: 270px;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-top: -135px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  width: 100%;
  height: 45px;
  line-height: 45px;
  background-color: #fff;
  border-radius: 5px 5px 0 0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  text-align: center;
  display: flex;
  justify-content: space-between;
}

.add-content {
  border: 1px solid #fff;
  background-color: #fff;
  border-radius: 5px;
  width: 90%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 0 3%;
}

.add-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 40%;
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
  margin-bottom: 15px;
}

.confirm-btn,
.cancel-btn {
  height: 35px;
  width: 100px;
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

/* 自定义el-dialog的遮罩层背景色 */
.el-overlay {
  background: rgba(0, 0, 0, 0.5) !important;
}
/* 确保el-dialog弹出框本身不被覆盖 */
.el-dialog__wrapper {
  background: transparent !important;
}

.sortable-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.sort-icons {
  display: flex;
  flex-direction: column;
  line-height: 1;
  font-size: 12px;
  gap: 2px;
}
.asc-icon, .desc-icon {
  cursor: pointer;
  color: #cccccc;
}
.asc-icon.active, .desc-icon.active {
  color: #ffffff;
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
</style>
