<template>
  <div class="user-detail-container">
    <div class="detail-content">
      <div class="info-side">
        <div class="info-card user-info-card">
          <div class="card-title">用户信息</div>
          <!-- 扣费记录 tab: 余额 + 消费总额 并列 -->
          <div v-if="activeTab === 'bill'" class="stats-row">
            <div class="stat-item">
              <div class="stat-circle yellow-circle">¥</div>
              <div class="stat-text">
                <div class="num">{{ currentUser.balance || 0 }}</div>
                <div class="unit">可用余额 (元)</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-circle green-circle">¥</div>
              <div class="stat-text">
                <div class="num">{{ totalMoney }}</div>
                <div class="unit">消费总额 (元)</div>
              </div>
            </div>
          </div>

          <!-- 其他 tab: 仅显示余额 -->
          <div v-else class="stats-row">
            <div class="stat-item">
              <div class="stat-circle yellow-circle">¥</div>
              <div class="stat-text">
                <div class="num">{{ currentUser.balance || 0 }}</div>
                <div class="unit">可用余额 (元)</div>
              </div>
            </div>
          </div>
          <div class="data-list">
            <div class="data-item"><span>用户号：</span>{{ currentUser.userId || '-' }}</div>
            <div class="data-item"><span>用户名称：</span>{{ currentUser.userName || '-' }}</div>
            <div class="data-item"><span>联系电话：</span>{{ currentUser.phone || '-' }}</div>
            <div class="data-item"><span>开户时间：</span>{{ currentUser.createTime || '-' }}</div>
            <div class="data-item"><span>用户地址：</span>{{ currentUser.userAddr || '-' }}</div>
            <div class="data-item"><span>价格类型：</span>{{ currentUser.userType || '-' }}</div>
          </div>
        </div>

        <div class="info-card meter-info-card">
          <div class="card-title">表信息</div>

          <!-- 水表选择器 -->
          <div v-if="userMeters.length > 0" class="meter-selector">
            <div
              v-for="meter in userMeters"
              :key="meter.meterCode"
              :class="['meter-chip', { active: selectedMeterCode === meter.meterCode }]"
              @click="switchMeter(meter.meterCode)"
            >
              <span class="chip-code">{{ meter.meterCode }}</span>
              <span :class="['chip-status', getStatusClass(meter.status)]">
                {{ getStatusLabel(meter.status) }}
              </span>
            </div>
          </div>

          <!-- 抄表记录 tab: 当前吨数 + 总用水量 并列 -->
          <div v-if="activeTab === 'meter'" class="stats-row">
            <div class="stat-item">
              <div class="stat-circle blue-circle">T</div>
              <div class="stat-text">
                <div class="num">{{ meterReading }}</div>
                <div class="unit">当前吨数 (吨)</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-circle teal-circle">Σ</div>
              <div class="stat-text">
                <div class="num">{{ meterTotalWater }}</div>
                <div class="unit">总用水量 (吨)</div>
              </div>
            </div>
          </div>

          <!-- 其他 tab: 仅显示当前吨数 -->
          <div v-else class="stats-row">
            <div class="stat-item">
              <div class="stat-circle blue-circle">T</div>
              <div class="stat-text">
                <div class="num">{{ meterReading }}</div>
                <div class="unit">当前吨数 (吨)</div>
              </div>
            </div>
          </div>

          <div class="data-list">
            <div class="data-item"><span>表号：</span>{{ selectedMeter.meterCode || currentUser.meterCode || '-' }}</div>
            <div class="data-item"><span>表具类型：</span>{{ selectedMeter.meterType || currentUser.meterType || 'NB-IoT表' }}</div>
            <div class="data-item"><span>品牌类型：</span>{{ selectedMeter.meterVendor || currentUser.meterVendor || '-' }}</div>
            <div class="data-item"><span>结算日期：</span>{{ currentUser.settleDate || '20260305' }}</div>
            <div class="data-item"><span>阀门状态：</span>{{ selectedMeter.valveStatus || currentUser.valveStatus || '-' }}</div>
            <!-- 解绑时间不再展示 -->
            <!-- <div v-if="selectedMeter.removeDate" class="data-item"><span>解绑时间：</span>{{ selectedMeter.removeDate }}</div> -->
          </div>
        </div>
      </div>

      <div class="table-side">
        <div class="tab-bar">
          <div
            v-for="tab in tabs"
            :key="tab.type"
            :class="['tab-item', { active: activeTab === tab.type }]"
            @click="switchTab(tab.type)"
          >
            {{ tab.name }}
          </div>
          <div class="back-button-wrapper">
            <button class="back-btn" @click="goBack">
              <img src="@/assets/yonghu/icon27.png" alt="back" />
              <span>{{ source === 'warningManage' ? '返回警告管理' : '返回用户列表' }}</span>
            </button>
          </div>
        </div>

        <div class="table-box">
          <keep-alive>
            <component
              :is="currentTabComponent"
              :user="currentUser"
              :user-meters="userMeters"
              @update-total-money="handleTotalMoneyUpdate"
            />
          </keep-alive>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessage } from "element-plus";
import service from "@/api/request";
import BillTable from "./userRecordTabs/BillTable.vue";
import TransactionTable from "./userRecordTabs/TransactionTable.vue";
import MeterTable from "./userRecordTabs/MeterTable.vue";
import CommandLogTable from "./userRecordTabs/CommandLogTable.vue";

export default {
  name: "UserBillDetail",
  components: {
    BillTable,
    TransactionTable: TransactionTable,
    MeterTable,
    CommandLogTable
  },
  data() {
    return {
      currentUser: {},
      userMeters: [],
      selectedMeterCode: '',
      totalMoney: 0,
      meterReading: 0,
      meterTotalWater: 0,
      source: "",
      activeTab: "bill",
      tabs: [
        { name: "扣费记录", type: "bill" },
        { name: "充值记录", type: "transaction" },
        { name: "抄表记录", type: "meter" },
        { name: "命令下发记录", type: "command" },
        // { name: "操作历史", type: "operation" }
      ]
    };
  },
  computed: {
    selectedMeter() {
      return this.userMeters.find(m => m.meterCode === this.selectedMeterCode) || {};
    },
    currentTabComponent() {
      const componentMap = {
        bill: "BillTable",
        transaction: "TransactionTable",
        command: "CommandLogTable",
        meter: "MeterTable",
      };
      return componentMap[this.activeTab] || "BillTable";
    }
  },
  watch: {
    activeTab(newVal) {
      if (newVal === 'meter') {
        this.fetchCardTotalWater();
      }
    }
  },
  mounted() {
    // 标记来源页面（userManage / warningManage）
    this.source = this.$route.query.source || "userManage";

    // 支持从路由参数指定初始tab
    if (this.$route.query.tab) {
      this.activeTab = this.$route.query.tab;
    }

    const userId = this.$route.query.userId;
    const meterCode = this.$route.query.meterCode;
    const companyId = this.$route.query.companyId;
    if (userId && meterCode) {
      this.currentUser = {
        userId,
        meterCode,
        companyId: companyId || "",
        userName: this.$route.query.userName || "",
        userAddr: this.$route.query.userAddr || "",
        phone: this.$route.query.userPhone || "",
        balance: this.$route.query.userBalance || ""
      };

      // 读取当前水表吨数（从抄表入口跳转时传递）
      this.meterReading = this.$route.query.meterReading || 0;

      // 获取用户所有水表列表（当前为Mock数据，后端接口就绪后替换）
      this.fetchUserMeters();

      // 若初始tab为抄表记录，预加载总用水量
      if (this.activeTab === 'meter') {
        this.fetchCardTotalWater();
      }
    } else {
      ElMessage.error("缺少用户参数");
    }
  },
  methods: {
    switchTab(type) {
      this.activeTab = type;
    },
    async fetchUserMeters() {
      try {
        const params = `?userId=${encodeURIComponent(this.currentUser.userId)}&companyId=${encodeURIComponent(this.currentUser.companyId || '')}`;
        const response = await service.get(`/userManage/meter/getUserMeters${params}`);
        if (response.code === 200 && response.data) {
          this.userMeters = response.data;
          this.selectedMeterCode = this.$route.query.meterCode || (response.data[0]?.meterCode || '');
          const meter = this.userMeters.find(m => m.meterCode === this.selectedMeterCode);
          if (meter) {
            this.meterReading = meter.newReading || 0;
          }
        }
      } catch (error) {
        console.error("获取用户水表列表失败", error);
      }
    },
    switchMeter(meterCode) {
      if (this.selectedMeterCode === meterCode) return;
      this.selectedMeterCode = meterCode;
      this.currentUser.meterCode = meterCode;
      const meter = this.userMeters.find(m => m.meterCode === meterCode);
      if (meter) {
        this.meterReading = meter.newReading || 0;
      }
      if (this.activeTab === 'meter') {
        this.fetchCardTotalWater();
      }
    },
    getStatusLabel(status) {
      const map = { '0': '当前表', '1': '历史表', '2': '历史表' };
      return map[status] || '-';
    },
    getStatusClass(status) {
      const map = { '0': 'status-current', '1': 'status-history', '2': 'status-history' };
      return map[status] || '';
    },
    async fetchCardTotalWater() {
      if (!this.currentUser.userId || !this.currentUser.meterCode) return;
      try {
        const query = `?userId=${encodeURIComponent(this.currentUser.userId)}&meterCode=${encodeURIComponent(this.currentUser.meterCode)}&companyId=${encodeURIComponent(this.currentUser.companyId || '')}`;
        const response = await service.get(`/userManage/meterRead/getTotalWater${query}`);
        if (response.code === 200) {
          this.meterTotalWater = response.data || 0;
        }
      } catch (error) {
        console.error("获取总用水量失败", error);
      }
    },
    goBack() {
      // 从警告管理进入时，恢复保存的页面状态后返回
      if (this.source === 'warningManage') {
        const savedState = sessionStorage.getItem('warningManagePageState');
        if (savedState) {
          try {
            const pageState = JSON.parse(savedState);
            this.$router.push({
              path: '/warningManage',
              query: {
                restore: 'true',
                paramsState: JSON.stringify(pageState.params),
                region: pageState.region || '',
                quyu_selected: pageState.quyu_selected ? JSON.stringify(pageState.quyu_selected) : null,
                filterText: pageState.filterText || '',
              }
            });
          } catch (e) {
            this.$router.push({ path: '/warningManage' });
          }
        } else {
          this.$router.push({ path: '/warningManage' });
        }
        return;
      }

      // 尝试恢复之前保存的页面状态（userManage 入口）
      const savedState = sessionStorage.getItem('userManagePageState');
      if (savedState) {
        try {
          const pageState = JSON.parse(savedState);
          // 将页面状态存储到 query 参数中，让 userManage 页面可以读取并恢复
          this.$router.push({
            path: '/userManage',
            query: {
              restore: 'true',
              currentPage: pageState.currentPage,
              pageSize: pageState.pageSize,
              sortField: pageState.sortField,
              sortOrder: pageState.sortOrder,
              // 将搜索参数编码后传递
              param: JSON.stringify(pageState.param),
              quyu_selected: pageState.quyu_selected ? JSON.stringify(pageState.quyu_selected) : null
            }
          });
        } catch (e) {
          // 解析失败，直接返回
          this.$router.back();
        }
      } else {
        this.$router.back();
      }
    },
    handleTotalMoneyUpdate(value) {
      this.totalMoney = value || 0;
    }
  }
};
</script>

<style scoped>
.user-detail-container {
  background-color: #f4f7f9;
  height: 100%;
  padding: 15px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}


.detail-content {
  display: flex;
  gap: 15px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.info-side {
  width: 420px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-height: 0;
}

.info-card {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.user-info-card {
  flex: 1.2;
  min-height: 0;
}

.meter-info-card {
  flex: 1.2;
  min-height: 0;
}

.card-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  border-left: 4px solid #46B97E;
  padding-left: 10px;
  margin-bottom: 20px;
}

/* ========== 统计数值区域（按 tab 切换） ========== */
.stats-row {
  display: flex;
  align-items: center;
  justify-content: center;        /* 内容居中，更紧凑 */
  gap: 0;
  margin-bottom: 20px;
  background: #f7f9fc;           /* 浅色背景提升层次 */
  border: 1px solid #e2e8f0;     /* 浅色边框 */
  border-radius: 10px;
  padding: 12px 10px;            /* 减小内边距 */
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
}

/* 两个 stat-item 之间自动添加分隔线 */
.stat-item + .stat-item {
  border-left: 1px solid #d5dce6;
  padding-left: 24px;
}

.stat-circle {
  width: 40px;                   /* 从50px缩小 */
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;               /* 从24px缩小 */
  font-weight: bold;
  flex-shrink: 0;
}

.stat-circle.yellow-circle {
  background: #fbc02d;
  color: #fff;
}

.stat-circle.green-circle {
  background: #46B97E;
  color: #fff;
}

.stat-circle.blue-circle {
  background: #409EFF;
  color: #fff;
}

.stat-circle.teal-circle {
  background: #20a0b9;
  color: #fff;
}

.stat-text .num {
  font-size: 24px;               /* 从35px缩小，更精致 */
  font-weight: bold;
  color: #f56c6c;
  line-height: 1.2;
}

.stat-text .unit {
  font-size: 16px;               /* 从18px缩小 */
  color: #999;
}

.data-item {
  font-size: 22px;
  margin-bottom: 12px;
  color: #333;
}

.data-item span {
  color: #777;
  display: inline-block;
  width: 160px;
}

/* 右侧表格 */
.table-side {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.tab-bar {
  display: flex;
  align-items: center;
  background: #eef1f6;
  border-bottom: 1px solid #dcdfe6;
  flex-shrink: 0;
  padding: 0 15px;
}

.tab-item {
  padding: 15px 25px;
  cursor: pointer;
  color: #606266;
  font-size: 20px;
  transition: all 0.3s;
}

.tab-item:hover {
  background: rgba(64, 158, 255, 0.1);
}

.tab-item.active {
  background: #55bb8a;
  color: #fff;
}

.back-button-wrapper {
  margin-left: auto;
  padding: 8px 0;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #66b1ff 0%, #409EFF 55%, #2589f5 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.28);
  transition: all 0.3s;
}

.back-btn img {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
}

.back-btn:hover {
  background: linear-gradient(135deg, #79bbff 0%, #53a8ff 55%, #409EFF 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.36);
}

.back-btn:active {
  transform: translateY(0);
}

.table-box {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

/* 扣费记录容器样式 */
.bill-table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

/* 搜索栏样式 - 美化后：白色背景，柔和边框和阴影 */
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

/* 工具栏样式 */
.tool-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.export-btn, .refresh-btn {
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

.export-btn img, .refresh-btn img {
  width: 18px;
  height: 18px;
}

.export-btn:hover, .refresh-btn:hover {
  background-color: #f5f7fa;
  border-color: #46B97E;
}

/* 表格容器 */
.table-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* 汇总信息样式 - 保留以备不时之需，但已在用户信息区域展示 */
.summary-box {
  margin-top: 15px;
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-end;
}

.summary-item {
  border: 1px solid #d9efe2;
  background-color: #f7fbf8;
  border-radius: 5px;
  padding: 10px 20px;
  display: flex;
  gap: 16px;
  align-items: center;
}

.summary-label {
  font-size: 18px;
  color: #5a5a5a;
}

.summary-value {
  font-size: 22px;
  color: #f56c6c;
  font-weight: bold;
}

/* 分页样式 */
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

.data-list {
  margin-top: 20px;
  margin-left: 30px;
}

/* ========== 水表选择器 ========== */
.meter-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  padding: 0 2px;
}

.meter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  background: #f0f2f5;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.25s;
  user-select: none;
}

.meter-chip:hover {
  background: #e6f3ed;
  border-color: #b3d9c5;
}

.meter-chip.active {
  background: #eef9f2;
  border-color: #46B97E;
  box-shadow: 0 0 0 2px rgba(70, 185, 126, 0.15);
}

.chip-code {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.chip-status {
  font-size: 14px;
  padding: 1px 8px;
  border-radius: 10px;
  line-height: 20px;
  white-space: nowrap;
}

.chip-status.status-current {
  color: #2f9e63;
  background-color: #d9f2e2;
  border: 1px solid #a3d9b7;
}

.chip-status.status-history {
  color: #8a8f99;
  background-color: #e8e9eb;
  border: 1px solid #ccd0d5;
}

.chip-status.status-replaced {
  color: #d48920;
  background-color: #fef3e4;
  border: 1px solid #f5d499;
}
</style>
