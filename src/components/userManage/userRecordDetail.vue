<template>
  <div class="user-detail-container">
    <div class="detail-header">
      <div class="back-item" @click="goBack">
        <img src="@/assets/yonghu/icon27.png" alt="back" class="back-icon" />
        <span class="back-text">返回用户列表</span>
      </div>
      <div class="header-title">账单详情 - {{ currentUser.userName || '加载中...' }}</div>
    </div>

    <div class="detail-content">
      <div class="info-side">
        <div class="info-card">
          <div class="card-title">用户信息</div>
          <div class="balance-section">
            <div class="yellow-circle">¥</div>
            <div class="balance-text">
              <div class="num">{{ currentUser.balance || 0 }}</div>
              <div class="unit">可用余额 (元)</div>
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

        <div class="info-card" style="margin-top: 20px">
          <div class="card-title">表信息</div>
          <div class="data-list">
            <div class="data-item"><span>表号：</span>{{ currentUser.meterCode || '-' }}</div>
            <div class="data-item"><span>表具类型：</span>{{ currentUser.meterType || 'NB-IoT表' }}</div>
            <div class="data-item"><span>品牌类型：</span>{{ currentUser.meterVendor || '-' }}</div>
            <div class="data-item"><span>结算日期：</span>{{ currentUser.settleDate || '20260305' }}</div>
            <div class="data-item"><span>阀门状态：</span>{{ currentUser.valveStatus || '-' }}</div>
          </div>
        </div>
      </div>

      <div class="table-side">
        <div class="tab-bar">
          <div
            v-for="(tab, index) in tabs"
            :key="index"
            :class="['tab-item', { active: activeTab === index }]"
            @click="switchTab(index)"
          >
            {{ tab.name }}
          </div>
        </div>

        <div class="table-box">
          <!-- 账单记录表格 -->
          <el-table
            v-if="activeTab === 0"
            :data="billList"
            border
            v-loading="loading"            style="width: 100%"
            :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
            :row-style="{ height: '60px' }"
            max-height="1010"
          >
            <el-table-column property="userId" label="用户号" min-width="130" align="center" />
            <el-table-column property="userName" label="用户名称" min-width="160" align="center" />
            <el-table-column property="meterCode" label="表号" min-width="180" align="center" />
            <el-table-column property="chargeAmount" label="扣费金额" min-width="130" align="center">
              <template #default="scope">{{ scope.row.chargeAmount }} 元</template>
            </el-table-column>
            <el-table-column property="oldBalance" label="原金额" min-width="130" align="center">
              <template #default="scope">{{ scope.row.oldBalance }} 元</template>
            </el-table-column>
            <el-table-column property="newBalance" label="余额" min-width="130" align="center">
              <template #default="scope">{{ scope.row.newBalance }} 元</template>
            </el-table-column>
            <el-table-column property="createTime" label="扣费时间" min-width="210" align="center" />
            <el-table-column label="扣费类型" min-width="140" align="center">
              <template #default="scope">
                <span>{{ formatChargeType(scope.row.type) }}</span>
              </template>
            </el-table-column>
          </el-table>

          <!-- 交易记录表格 -->
          <el-table
            v-if="activeTab === 1"
            :data="transactionList"
            border
            v-loading="loading"
            style="width: 100%"
            :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
          >
            <el-table-column property="tradeDate" label="交易日期" align="center" width="150" />
            <el-table-column property="tradeType" label="交易类型" align="center" />
            <el-table-column property="amount" label="交易金额" align="center">
              <template #default="scope">{{ scope.row.amount }} 元</template>
            </el-table-column>
            <el-table-column property="balance" label="账户余额" align="center">
              <template #default="scope">{{ scope.row.balance }} 元</template>
            </el-table-column>
            <el-table-column property="tradeTime" label="交易时间" align="center" width="180" />
          </el-table>

          <!-- 抄表记录表格 -->
          <el-table
            v-if="activeTab === 2"
            :data="meterReadingList"
            border
            v-loading="loading"
            style="width: 100%"
            :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
          >
            <el-table-column property="readingDate" label="抄表日期" align="center" width="150" />
            <el-table-column property="readingValue" label="表数" align="center" />
            <el-table-column property="usage" label="使用量" align="center" />
            <el-table-column property="operator" label="操作人员" align="center" />
            <el-table-column property="remark" label="备注" align="center" />
          </el-table>

          <!-- 操作历史表格 -->
          <el-table
            v-if="activeTab === 3"
            :data="operationList"
            border
            v-loading="loading"
            style="width: 100%"
            :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
          >
            <el-table-column property="operationDate" label="操作日期" align="center" width="150" />
            <el-table-column property="operationType" label="操作类型" align="center" />
            <el-table-column property="operator" label="操作人员" align="center" />
            <el-table-column property="content" label="操作内容" align="center" />
            <el-table-column property="ip" label="IP地址" align="center" width="140" />
          </el-table>

          <div class="pagination-container" v-if="activeTab === 0">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-size="pageSize"
              layout="total, prev, pager, next, jumper"
              :total="total"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ElMessage } from "element-plus";
import service from "@/api/request";

export default {
  name: "UserBillDetail",
  data() {
    return {
      loading: false,
      isLoading: false,
      token: "",
      currentUser: {},
      billList: [],
      transactionList: [],
      meterReadingList: [],
      operationList: [],
      total: 0,
      currentPage: 1,
      pageSize: 30,
      activeTab: 0,
      tabs: [
        { name: "账单记录", type: "bill" },
        // { name: "交易记录", type: "transaction" },
        // { name: "抄表记录", type: "meter" },
        // { name: "操作历史", type: "operation" }
      ]
    };
  },
  mounted() {
    // 获取token
    const userData = sessionStorage.getItem("userData");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        this.token = parsedData.token || "";
      } catch (e) {
        console.error("解析userData失败", e);
      }
    }

    // 从路由参数中获取用户信息
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
      this.initData(userId);
    } else {
      ElMessage.error("缺少用户参数");
    }
  },
  methods: {
    // 初始化数据
    async initData(userId) {
      await this.fetchUserInfo(userId);
      await this.fetchBillRecords();
      await this.fetchTransactionRecords();
      await this.fetchMeterReadingRecords();
      await this.fetchOperationRecords();
    },

    // 获取用户信息
    async fetchUserInfo(userId) {
      try {
        // 使用路由参数预填，避免覆盖传入的真实用户信息
        if (!this.currentUser.userId) {
          this.currentUser.userId = userId || "";
        }
      } catch (error) {
        console.error("获取用户信息失败", error);
        ElMessage.error("获取用户信息失败");
      }
    },

    async fetchBillRecords() {
      if (this.isLoading) return;
      this.isLoading = true;
      this.loading = true;

      try {
        const params = {
          userId: this.currentUser.userId,
          meterCode: this.currentUser.meterCode,
          companyId: this.currentUser.companyId
        };

        const nonEmptyParams = this.filterNonEmptyParams(params);
        let queryString = "";

        for (const key in nonEmptyParams) {
          if (nonEmptyParams.hasOwnProperty(key)) {
            const value = nonEmptyParams[key];
            if (queryString) {
              queryString += `&${key}=${encodeURIComponent(value)}`;
            } else {
              queryString += `?${key}=${encodeURIComponent(value)}`;
            }
          }
        }

        const url = `/userManage/userCharge/showMeterChargeRecords/${this.currentPage}${queryString}`;

        const response = await service.get(url);

        if (response.code === 200) {
          response.data.userSingleRechargeRecordData.map((v, i) => {
            v.theId = this.pageSize * (response.data.currentPages - 1) + i + 1;
          });

          this.billList = response.data.userSingleRechargeRecordData;
          this.billList.forEach((item) => {
            if (item.createTime) {
              item.createTime = item.createTime.replace("T", " ");
            }
          });

          this.total = response.data.totalElements;
        } else {
          ElMessage.error(response.msg);
        }
      } catch (error) {
        console.error("获取账单记录失败", error);
        ElMessage.error("获取账单记录失败");
      } finally {
        this.loading = false;
        this.isLoading = false;
      }
    },


    // 获取交易记录
    async fetchTransactionRecords() {
      try {
        // TODO: 替换为实际的API调用
        // 模拟数据
        this.transactionList = [
          { tradeDate: '2026-04-01', tradeType: '充值', amount: '100', balance: '264', tradeTime: '2026-04-01 10:30:00' },
          { tradeDate: '2026-03-15', tradeType: '消费', amount: '12', balance: '164', tradeTime: '2026-03-15 08:00:00' },
          { tradeDate: '2026-03-01', tradeType: '充值', amount: '50', balance: '176', tradeTime: '2026-03-01 14:20:00' }
        ];
      } catch (error) {
        console.error("获取交易记录失败", error);
        ElMessage.error("获取交易记录失败");
      }
    },

    // 获取抄表记录
    async fetchMeterReadingRecords() {
      try {
        // TODO: 替换为实际的API调用
        // 模拟数据
        this.meterReadingList = [
          { readingDate: '2026-03-31', readingValue: '1467', usage: '0', operator: '系统自动', remark: '保底消费' },
          { readingDate: '2026-03-05', readingValue: '1466', usage: '1', operator: '远程抄表', remark: '正常' },
          { readingDate: '2026-02-27', readingValue: '1465', usage: '1', operator: '远程抄表', remark: '正常' }
        ];
      } catch (error) {
        console.error("获取抄表记录失败", error);
        ElMessage.error("获取抄表记录失败");
      }
    },

    // 获取操作记录
    async fetchOperationRecords() {
      try {
        // TODO: 替换为实际的API调用
        // 模拟数据
        this.operationList = [
          { operationDate: '2026-04-01', operationType: '充值', operator: 'admin', content: '用户充值100元', ip: '192.168.1.1' },
          { operationDate: '2026-03-05', operationType: '账单生成', operator: '系统', content: '生成3月份账单', ip: '127.0.0.1' },
          { operationDate: '2026-02-27', operationType: '抄表', operator: '系统', content: '远程抄表', ip: '127.0.0.1' }
        ];
      } catch (error) {
        console.error("获取操作记录失败", error);
        ElMessage.error("获取操作记录失败");
      }
    },

    // 切换标签页
    switchTab(index) {
      this.activeTab = index;
    },

    // 分页切换
    handlePageChange(page) {
      this.currentPage = page;
      this.fetchBillRecords();
    },

    // 返回上一页
    goBack() {
      this.$router.back();
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
    formatChargeType(type) {
      if (type === 0 || type === "0") {
        return "抄表扣费";
      }
      if (type === 1 || type === "1") {
        return "保底扣费";
      }
      if (type === 2 || type === "2") {
        return "补扣费用";
      }
      return "-";
    },
    // async getTotalUsedMoney() {
    //   try {
    //     const params = this.filterNonEmptyParams({
    //       meterCode: this.currentUser.meterCode,
    //       userId: this.currentUser.userId,
    //       companyId: this.currentUser.companyId,
    //     });
    //     let queryString = "";
    //     for (const key in params) {
    //       if (Object.prototype.hasOwnProperty.call(params, key)) {
    //         const value = params[key];
    //         if (queryString) {
    //           queryString += `&${key}=${encodeURIComponent(value)}`;
    //         } else {
    //           queryString += `?${key}=${encodeURIComponent(value)}`;
    //         }
    //       }
    //     }
    //     const response = await service.get(`/userManage/userCharge/getTotalChargeAmount${queryString}`);
    //     if (response.code === 200) {
    //       this.currentUser.balance = response.data;
    //     }
    //   } catch (error) {
    //     console.error("获取扣费总额失败", error);
    //   }
    // }
  }
};
</script>

<style scoped>
.user-detail-container {
  background-color: #f4f7f9;
  min-height: 100vh;
  padding: 15px;
}

/* 顶部导航 */
.detail-header {
  display: flex;
  min-height: 60px;
  align-items: center;
  background: #fff;
  padding: 10px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  margin-bottom: 15px;
}

.back-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding-right: 20px;
  border-right: 1px solid #eee;
}

.back-icon {
  width: 30px;
  height: 30px;
}

.back-text {
  margin-left: 8px;
  font-size: 22px;
  color: #5a5a5a;
}

.header-title {
  margin-left: 20px;
  font-size: 22px;
  font-weight: bold;
  color: #333;
}

/* 主体内容布局 */
.detail-content {
  display: flex;
  gap: 15px;
}

/* 左侧卡片 */
.info-side {
  width: 420px;
  flex-shrink: 0;
}

.info-card {
  height: 550px;
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.card-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  border-left: 4px solid #46B97E;
  padding-left: 10px;
  margin-bottom: 20px;
}

.balance-section {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
}

.yellow-circle {
  background: #fbc02d;
  color: #fff;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin-right: 15px;
}

.balance-text .num {
  font-size: 35px;
  font-weight: bold;
  color: #f56c6c;
}

.balance-text .unit {
  font-size: 18px;
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
  flex-grow: 1;
  background: #fff;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tab-bar {
  display: flex;
  background: #eef1f6;
  border-bottom: 1px solid #dcdfe6;
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

.table-box {
  padding: 20px;
  flex: 1;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.pagination-container :deep(.el-pagination) {
  font-size: 18px;
}

.pagination-container :deep(.el-pager li) {
  min-width: 40px;
  height: 40px;
  line-height: 40px;
  font-size: 18px;
}

.pagination-container :deep(.btn-prev),
.pagination-container :deep(.btn-next) {
  min-width: 40px;
  height: 40px;
}

.data-list{
  margin-top: 50px;
  margin-left: 30px;
}
</style>
