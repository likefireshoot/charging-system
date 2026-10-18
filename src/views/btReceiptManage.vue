<template>
  <div class="bt-container">
    <!-- 搜索区 -->
    <div class="serach-box">
      <div class="search-input">
        <span>表号</span>
        <el-input v-model="params.meterCode" placeholder="请输入..." clearable />
      </div>
      <div class="buttons">
        <div class="sercah-btn" @click="handleSearch"><span>搜索</span></div>
        <div class="clear-btn" @click="handleReset"><span>清空</span></div>
        <div class="reflush" @click="loadData"><span>刷新</span></div>
        <div class="reflush" @click="exportCsv"><span>导出</span></div>
      </div>
    </div>

    <!-- 列表 -->
    <div class="table-box">
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
        v-loading="loading"
      >
        <el-table-column prop="meterCode" label="表号" min-width="150" align="center" />
        <el-table-column prop="userName" label="用户" min-width="120" align="center" />
        <el-table-column prop="receiptTypeDesc" label="类型" min-width="100" align="center" />
        <el-table-column label="结果" min-width="140" align="center">
          <template #default="scope">
            <span :class="['status-tag', scope.row.resultCode === 0 ? 'ok' : 'err']">
              {{ scope.row.resultCodeDesc || "-" }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="表端余额" min-width="110" align="center">
          <template #default="scope">￥{{ money(scope.row.balance) }}</template>
        </el-table-column>
        <el-table-column label="累计用量" min-width="110" align="center">
          <template #default="scope">
            {{ scope.row.totalUsage == null ? "-" : scope.row.totalUsage + " 吨" }}
          </template>
        </el-table-column>
        <el-table-column label="周期用量" min-width="110" align="center">
          <template #default="scope">
            {{ scope.row.monthUsage == null ? "-" : scope.row.monthUsage + " 吨" }}
          </template>
        </el-table-column>
        <el-table-column prop="valveStatus" label="阀门" min-width="90" align="center" />
        <el-table-column label="表端时间" min-width="160" align="center">
          <template #default="scope">{{ fmtTime(scope.row.meterTime) }}</template>
        </el-table-column>
        <el-table-column label="接收时间" min-width="160" align="center">
          <template #default="scope">{{ fmtTime(scope.row.createTime) }}</template>
        </el-table-column>
      </el-table>

      <div class="pagination-box">
        <el-pagination
          v-model:current-page="params.pageNo"
          v-model:page-size="params.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { queryReceipt } from "@/api/btMeter";
import { exportToCsv } from "@/utils/csv";

const loading = ref(false);
const tableData = ref([]);
const total = ref(0);

const params = reactive({
  meterCode: "",
  pageNo: 1,
  pageSize: 10,
});

async function loadData() {
  loading.value = true;
  try {
    const res = await queryReceipt({
      meterCode: params.meterCode || undefined,
      pageNo: params.pageNo,
      pageSize: params.pageSize,
    });
    if (res.code === 200) {
      tableData.value = res.data?.records || [];
      total.value = res.data?.total || 0;
    }
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  params.pageNo = 1;
  loadData();
}

function handleReset() {
  params.meterCode = "";
  params.pageNo = 1;
  loadData();
}

function money(v) {
  return v == null ? "-" : Number(v).toFixed(2);
}

function fmtTime(t) {
  if (!t) return "-";
  if (Array.isArray(t)) {
    const p = (n) => String(n).padStart(2, "0");
    return `${t[0]}-${p(t[1])}-${p(t[2])} ${p(t[3])}:${p(t[4])}:${p(t[5])}`;
  }
  return String(t).replace("T", " ").substring(0, 19);
}

function exportCsv() {
  exportToCsv("蓝牙卡表表端回执", [
    { label: "表号", prop: "meterCode" },
    { label: "用户", prop: "userName" },
    { label: "类型", prop: "receiptTypeDesc" },
    { label: "结果", prop: "resultCodeDesc" },
    { label: "表端余额(元)", prop: (r) => money(r.balance) },
    { label: "累计用量(吨)", prop: "totalUsage" },
    { label: "周期用量(吨)", prop: "monthUsage" },
    { label: "阀门", prop: "valveStatus" },
    { label: "表端时间", prop: (r) => fmtTime(r.meterTime) },
    { label: "接收时间", prop: (r) => fmtTime(r.createTime) },
  ], tableData.value);
}

onMounted(loadData);
</script>

<style lang="scss" scoped>
.bt-container {
  padding: 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.serach-box {
  background: #fff;
  border-radius: 6px;
  padding: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  .search-input {
    display: flex;
    align-items: center;
    span {
      font-size: 15px;
      color: #747374;
      margin-right: 8px;
      white-space: nowrap;
    }
    :deep(.el-input) { width: 180px; }
  }
  .buttons {
    display: flex;
    gap: 10px;
    margin-left: auto;
    flex-shrink: 0;
    .sercah-btn,
    .clear-btn,
    .reflush {
      height: 35px;
      width: 96px;
      padding: 0;
      box-sizing: border-box;
      flex: 0 0 auto;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 16px;
      white-space: nowrap;
      user-select: none;
      transition: all 0.2s;
      span { margin-left: 0; }
    }
    .sercah-btn { background: #46b97e; color: #fff; }
    .sercah-btn:hover { background: #3fa971; }
    .clear-btn,
    .reflush { background: #fff; color: #5a5a5a; border: 1px solid #d9d9d9; }
    .clear-btn:hover,
    .reflush:hover { color: #46b97e; border-color: #46b97e; }
  }
}

.table-box {
  flex: 1;
  background: #fff;
  border-radius: 6px;
  padding: 12px;
  margin-top: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.pagination-box {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #f5f5f5;
  color: #8a919f;
  &.ok { background: #f0f9eb; color: #46b97e; }
  &.err { background: #fef0f0; color: #f56c6c; }
}
</style>
