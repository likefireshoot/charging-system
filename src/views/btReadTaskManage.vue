<template>
  <div class="bt-container">
    <!-- 搜索区 -->
    <div class="serach-box">
      <div class="search-input">
        <span>任务号</span>
        <el-input v-model="params.taskNo" placeholder="请输入..." clearable />
      </div>
      <div class="search-input">
        <span>表号</span>
        <el-input v-model="params.meterCode" placeholder="请输入..." clearable />
      </div>
      <div class="search-input">
        <span>区域编码</span>
        <el-input-number
          v-model="params.areaCode"
          :min="0"
          :max="255"
          :controls="false"
          placeholder="全部"
          style="width: 150px"
        />
      </div>
      <div class="search-input">
        <span>任务状态</span>
        <el-select v-model="params.status" placeholder="全部" clearable>
          <el-option label="待读" :value="0" />
          <el-option label="已读" :value="1" />
          <el-option label="失败" :value="2" />
          <el-option label="作废" :value="9" />
        </el-select>
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
      <div class="command-row">
        <div
          class="add-btn"
          v-if="staffPermissionIds.includes(45)"
          @click="openCreateDialog"
        >
          <span>新建抄表任务</span>
        </div>
      </div>
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
        v-loading="loading"
      >
        <el-table-column prop="taskNo" label="任务号" min-width="200" align="center" />
        <el-table-column label="表号" min-width="160" align="center">
          <template #default="scope">{{ scope.row.meterCode || "-" }}</template>
        </el-table-column>
        <el-table-column label="抄表项" min-width="180" align="center">
          <template #default="scope">{{ formatReadItems(scope.row.readItems) }}</template>
        </el-table-column>
        <el-table-column label="状态" min-width="110" align="center">
          <template #default="scope">
            <span :class="['status-tag', statusClass(scope.row.status)]">
              {{ scope.row.statusName || statusDesc(scope.row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="创建人" min-width="110" align="center">
          <template #default="scope">{{ scope.row.createStaff || "-" }}</template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="170" align="center">
          <template #default="scope">{{ fmtTime(scope.row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="120" align="center" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 1 || scope.row.status === 2 || scope.row.status === 9"
              size="small"
              @click="handleResetTask(scope.row)"
            >
              重置
            </el-button>
            <el-button
              v-if="scope.row.status === 0 || scope.row.status === 2"
              size="small"
              type="danger"
              @click="handleCancel(scope.row)"
            >
              取消
            </el-button>
            <span v-else>-</span>
          </template>
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

    <!-- 新建抄表任务弹窗 -->
    <div class="create-dialog" v-if="createVisible">
      <div class="create-dialog-content">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <span style="font-size: 22px">新建抄表任务</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="createVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="create-body">
          <div class="form-row">
            <span class="form-label">表号<em>*</em></span>
            <el-select
              v-model="createForm.meterCodes"
              multiple
              filterable
              collapse-tags
              placeholder="从蓝牙卡表档案中选择（可搜索）"
              style="width: 100%"
              :loading="meterLoading"
            >
              <el-option
                v-for="item in meterOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <div class="form-tip">留空且区域编码也留空 = 对所有建档蓝牙表生成读表任务（全量复核）</div>
          </div>
          <div class="form-row">
            <span class="form-label">区域编码</span>
            <el-input-number
              v-model="createForm.areaCode"
              :min="0"
              :max="255"
              :controls="false"
              placeholder="蓝牙表区域号 0-255"
              style="width: 100%"
            />
            <div class="form-tip">
              蓝牙协议区域号（AreaCode 0-255），与表端指令一致，非业务区域。
            </div>
          </div>
          <div class="form-row">
            <span class="form-label">抄表项<em>*</em></span>
            <el-select
              v-model="createForm.readItems"
              multiple
              collapse-tags
              placeholder="请选择抄表项"
              style="width: 100%"
            >
              <el-option
                v-for="item in readItemOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <div class="form-tip">空 = 全读（电量 + 阀门状态 + 上次读数）</div>
          </div>
          <div class="form-row">
            <span class="form-label">创建人</span>
            <el-input v-model="createForm.createStaff" placeholder="请输入创建人" />
          </div>
        </div>
        <div class="btn">
          <div class="confirm-btn" @click="submitCreate">
            <el-icon style="margin-left: 15%"><Check /></el-icon>
            <span style="font-size: 18px; margin-left: 15%">确认</span>
          </div>
          <div class="cancel-btn" @click="createVisible = false">
            <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
            <span style="font-size: 18px; margin-left: 15%; color: #5a5a5a">取消</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { queryReadTask, createReadTask, cancelReadTask, resetReadTask, queryBtMeter } from "@/api/btMeter";
import { exportToCsv } from "@/utils/csv";

const loading = ref(false);
const tableData = ref([]);
const total = ref(0);

const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
const staffPermissionIds = userData.staffPermissionIds || [];

// 抄表项：与后端 BtReadTaskBatchForm.readItems 取值对齐（power/valve/last_read，空=全读）
const readItemOptions = [
  { label: "电量", value: "power" },
  { label: "阀门状态", value: "valve" },
  { label: "上次读数", value: "last_read" },
];
const readItemLabel = {
  power: "电量",
  valve: "阀门状态",
  last_read: "上次读数",
};

const params = reactive({
  pageNo: 1,
  pageSize: 10,
  taskNo: null,
  meterCode: null,
  areaCode: null,
  status: null,
});

async function loadData() {
  loading.value = true;
  try {
    // areaCode 为空(null)时不参与筛选；后端 BtReadTaskQueryForm 同义
    const req = { ...params };
    if (req.areaCode === null || req.areaCode === undefined) delete req.areaCode;
    const res = await queryReadTask(req);
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
  params.taskNo = null;
  params.meterCode = null;
  params.areaCode = null;
  params.status = null;
  params.pageNo = 1;
  loadData();
}

async function handleCancel(row) {
  try {
    await ElMessageBox.confirm(
      "确认取消该抄表任务？取消后不可恢复。",
      "取消确认",
      { type: "warning", lockScroll: false }
    );
  } catch {
    return;
  }
  const res = await cancelReadTask(row.readTaskId, userData.staffName);
  if (res.code === 200) {
    ElMessage.success("已取消");
    loadData();
  }
}

async function handleResetTask(row) {
  try {
    await ElMessageBox.confirm(
      "确认重置该抄表任务为待读？",
      "重置确认",
      { type: "warning", lockScroll: false }
    );
  } catch {
    return;
  }
  const res = await resetReadTask(row.readTaskId, userData.staffName);
  if (res.code === 200) {
    ElMessage.success("已重置为待读");
    loadData();
  }
}

function exportCsv() {
  exportToCsv("蓝牙卡表抄表任务", [
    { label: "任务号", prop: "taskNo" },
    { label: "表号", prop: "meterCode" },
    { label: "抄表项", prop: (r) => formatReadItems(r.readItems) },
    { label: "状态", prop: "statusName" },
    { label: "创建人", prop: "createStaff" },
    { label: "创建时间", prop: (r) => fmtTime(r.createTime) },
    { label: "读表人", prop: "readStaff" },
    { label: "读表时间", prop: (r) => fmtTime(r.readTime) },
  ], tableData.value);
}

// ==================== 新建 ====================

const createVisible = ref(false);
const meterLoading = ref(false);
const meterOptions = ref([]);
const createForm = reactive({
  meterCodes: [],
  areaCode: null,
  readItems: [],
  createStaff: userData.staffName || "",
});

async function loadMeters() {
  meterLoading.value = true;
  try {
    // 复用蓝牙卡表档案查询接口，取 meterCode 做下拉
    const res = await queryBtMeter({ pageNo: 1, pageSize: 500 });
    if (res.code === 200) {
      const list = res.data?.records || [];
      meterOptions.value = list
        .filter((m) => m.meterCode)
        .map((m) => ({ label: m.meterCode, value: m.meterCode }));
    }
  } finally {
    meterLoading.value = false;
  }
}

function openCreateDialog() {
  createForm.meterCodes = [];
  createForm.areaCode = null;
  createForm.readItems = [];
  createForm.createStaff = userData.staffName || "";
  createVisible.value = true;
  loadMeters();
}

async function submitCreate() {
  const meterCodes = (createForm.meterCodes || []).map((s) => String(s).trim()).filter(Boolean);
  if (meterCodes.length === 0 && createForm.areaCode == null) {
    ElMessage.error("请至少选择表号或填写区域编码");
    return;
  }
  if (createForm.readItems.length === 0) {
    ElMessage.error("请至少选择一个抄表项");
    return;
  }
  const payload = {
    meterCodes,
    areaCode: createForm.areaCode == null ? null : Number(createForm.areaCode),
    readItems: createForm.readItems,
    createStaff: createForm.createStaff || userData.staffName,
  };
  const res = await createReadTask(payload);
  if (res.code === 200) {
    ElMessage.success("创建成功");
    createVisible.value = false;
    loadData();
  }
}

// ==================== 工具 ====================

function formatReadItems(items) {
  if (!items) return "-";
  let arr = items;
  if (typeof items === "string") {
    try {
      arr = JSON.parse(items);
    } catch {
      arr = null;
    }
  }
  let rawList = [];
  if (Array.isArray(arr)) {
    rawList = arr;
  } else if (typeof arr === "string") {
    rawList = arr.replace(/[\[\]"]/g, "").split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (rawList.length === 0) return "-";
  return rawList.map((v) => readItemLabel[v] || v).join("、");
}

function statusDesc(s) {
  if (s === 0) return "待读";
  if (s === 1) return "已读";
  if (s === 2) return "失败";
  if (s === 9) return "作废";
  return "-";
}

function statusClass(s) {
  if (s === 0) return "warn";
  if (s === 1) return "ok";
  if (s === 2) return "err";
  return "";
}

function fmtTime(t) {
  if (!t) return "-";
  if (Array.isArray(t)) {
    const p = (n) => String(n).padStart(2, "0");
    return `${t[0]}-${p(t[1])}-${p(t[2])} ${p(t[3])}:${p(t[4])}:${p(t[5])}`;
  }
  return String(t).replace("T", " ").substring(0, 19);
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
    :deep(.el-input) { width: 170px; }
    :deep(.el-select) { width: 170px; }
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

.command-row {
  display: flex;
  margin-bottom: 10px;
}

.add-btn {
  display: flex;
  align-items: center;
  height: 35px;
  padding: 0 16px;
  border-radius: 4px;
  background: #46b97e;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
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
  &.warn { background: #fdf6ec; color: #e6a23c; }
  &.err { background: #fef0f0; color: #f56c6c; }
}

/* 新建弹窗 */
.create-dialog {
  position: fixed;
  inset: 0;
  z-index: 199;
  background-color: rgba(31, 33, 38, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.create-dialog-content {
  width: 560px;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.create-body {
  width: 92%;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 15px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  .form-label {
    font-size: 16px;
    color: #575556;
    em {
      color: #f56c6c;
      font-style: normal;
      margin-left: 2px;
    }
  }
  .form-tip {
    font-size: 12px;
    color: #909399;
    line-height: 1.6;
  }
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
  margin: 15px 0;
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
</style>
