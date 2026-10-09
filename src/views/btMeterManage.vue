<template>
  <div class="bt-container">
    <!-- 搜索区 -->
    <div class="serach-box">
      <div class="search-input">
        <span>表号</span>
        <el-input v-model="params.meterCode" placeholder="请输入..." clearable />
      </div>
      <div class="search-input">
        <span>用户名</span>
        <el-input v-model="params.userName" placeholder="请输入..." clearable />
      </div>
      <div class="search-input">
        <span>手机号</span>
        <el-input v-model="params.userPhone" placeholder="请输入..." clearable />
      </div>
      <div class="search-input">
        <span>表状态</span>
        <el-select v-model="params.meterStatus" placeholder="全部" clearable>
          <el-option label="未开户" :value="0" />
          <el-option label="已设置" :value="1" />
          <el-option label="已开户" :value="2" />
          <el-option label="正常运行" :value="3" />
          <el-option label="停用" :value="9" />
        </el-select>
      </div>
      <div class="buttons">
        <div class="sercah-btn" @click="handleSearch">
          <span>搜索</span>
        </div>
        <div class="clear-btn" @click="handleReset">
          <span>清空</span>
        </div>
      </div>
    </div>

    <!-- 操作区 -->
    <div class="command-box">
      <div class="add-btn" @click="openEdit(null)">
        <span>登记蓝牙表</span>
      </div>
      <div
        class="delete-btn"
        :class="{ 'is-disabled': multipleSelection.length === 0 }"
        @click="multipleSelection.length && handleDelete()"
      >
        <span>删除</span>
      </div>
      <div class="reflush" @click="loadData">
        <span>刷新</span>
      </div>
      <div class="reflush" @click="exportCsv">
        <span>导出</span>
      </div>
    </div>

    <!-- 列表 -->
    <div class="table-box">
      <el-table
        ref="multipleTableRef"
        :data="tableData"
        border
        style="width: 100%"
        :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
        @selection-change="handleSelectionChange"
        v-loading="loading"
      >
        <el-table-column type="selection" min-width="55" align="center" />
        <el-table-column prop="meterCode" label="表号" min-width="150" align="center" fixed="left" />
        <el-table-column label="用户" min-width="160" align="center">
          <template #default="scope">
            <div>{{ scope.row.userName || "-" }}</div>
            <div class="sub-text">{{ scope.row.userAddr || "" }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="areaCode" label="区域号" min-width="80" align="center" />
        <el-table-column prop="userNo" label="用户号" min-width="80" align="center" />
        <el-table-column label="表状态" min-width="100" align="center">
          <template #default="scope">
            <span :class="['status-tag', statusClass(scope.row.meterStatus)]">
              {{ scope.row.meterStatusDesc || "-" }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="表端余额" min-width="110" align="center">
          <template #default="scope">￥{{ meterMoney(scope.row.lastBalance) }}</template>
        </el-table-column>
        <el-table-column label="累计用量" min-width="110" align="center">
          <template #default="scope">
            {{ scope.row.lastTotalUsage == null ? "-" : meterMoney(scope.row.lastTotalUsage) + " 吨" }}
          </template>
        </el-table-column>
        <el-table-column label="待写表" min-width="90" align="center">
          <template #default="scope">
            <span v-if="scope.row.pendingTaskCount > 0" class="status-tag warn">
              {{ scope.row.pendingTaskCount }} 笔
            </span>
            <span v-else class="sub-text">无</span>
          </template>
        </el-table-column>
        <el-table-column label="最近上报" min-width="160" align="center">
          <template #default="scope">{{ fmtTime(scope.row.lastReportTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="220" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="openInit('CLEAR', scope.row)">清零</el-button>
            <el-button size="small" @click="openInit('CLOCK', scope.row)">校时</el-button>
            <el-button size="small" @click="openInit('SETTING', scope.row)">设置</el-button>
            <el-button size="small" type="warning" @click="openOpenAccount(scope.row)">开户</el-button>
            <el-button size="small" type="primary" @click="openRecharge(scope.row)">充值</el-button>
            <el-button size="small" @click="openValve(scope.row)">阀控</el-button>
            <el-button size="small" @click="openDetail(scope.row)">详情</el-button>
            <el-button size="small" @click="openEdit(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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

    <!-- 充值弹窗 -->
    <el-dialog v-model="rechargeVisible" title="蓝牙卡表充值" width="500px">
      <el-form :model="rechargeForm" label-width="110px">
        <el-form-item label="表号">
          <el-input v-model="rechargeForm.meterCode" disabled />
        </el-form-item>
        <el-form-item label="充值金额" required>
          <el-input-number v-model="rechargeForm.amount" :min="0.01" :precision="2" :step="10" />
        </el-form-item>
        <el-form-item label="收费人">
          <el-input v-model="rechargeForm.operateStaff" placeholder="操作员姓名" />
        </el-form-item>
      </el-form>
      <div class="tip-box">
        提示：提交后系统完成收费并生成一条「待写表」任务，
        需由手机蓝牙端到表前现场写表，写表成功后充值才真正生效。
      </div>
      <template #footer>
        <el-button @click="rechargeVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitRecharge">确认收费</el-button>
      </template>
    </el-dialog>

    <!-- 阀控弹窗 -->
    <el-dialog v-model="valveVisible" title="阀控指令" width="450px">
      <el-form :model="valveForm" label-width="110px">
        <el-form-item label="表号">
          <el-input v-model="valveForm.meterCode" disabled />
        </el-form-item>
        <el-form-item label="动作" required>
          <el-select v-model="valveForm.valveAction" placeholder="请选择">
            <el-option label="强制开阀" :value="0" />
            <el-option label="强制关阀" :value="1" />
            <el-option label="取消强制" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="valveForm.operateStaff" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="valveVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitValve">下发指令</el-button>
      </template>
    </el-dialog>

    <!-- 初始化指令弹窗：清零 / 校时 / 设置 -->
    <el-dialog v-model="initVisible" :title="initTitle" width="480px">
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 12px"
        title="开户前必须按顺序执行：清零 → 校时 → 设置，之后才能开户/充值"
      />
      <el-form :model="initForm" label-width="110px">
        <el-form-item label="表号">
          <el-input v-model="initForm.meterCode" disabled />
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="initForm.operateStaff" placeholder="操作员姓名" />
        </el-form-item>
        <template v-if="initType === 'SETTING'">
          <el-form-item label="价格类型">
            <el-select
              v-model="initForm.priceId"
              filterable
              clearable
              placeholder="选择价格方案（自动带出单价/上限/保底）"
              style="width: 100%"
              :loading="priceLoading"
              @change="onInitPriceChange"
            >
              <el-option v-for="opt in priceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
            </el-select>
            <div class="form-tip">选了价格类型后，阶梯单价 / 上限 / 保底自动带出，无需手填</div>
          </el-form-item>
          <div v-if="initForm.priceId" class="price-preview">
            <div class="pv-title">价格类型自动带出（只读）</div>
            <div class="pv-grid">
              <div class="pv-item"><span>一阶单价</span><b>{{ initForm.unitPrice1 }} 元/吨</b></div>
              <div class="pv-item"><span>二阶单价</span><b>{{ initForm.unitPrice2 }} 元/吨</b></div>
              <div class="pv-item"><span>三阶单价</span><b>{{ initForm.unitPrice3 }} 元/吨</b></div>
              <div class="pv-item"><span>一阶上限量</span><b>{{ initForm.limitValue1 }} 吨</b></div>
              <div class="pv-item"><span>二阶上限量</span><b>{{ initForm.limitValue2 }} 吨</b></div>
              <div class="pv-item"><span>保底金额</span><b>{{ initForm.minValue }} 元</b></div>
            </div>
            <div class="pv-tip">
              {{ initMinLocked
                ? "该价格方案已启用保底费，表端保底金额以下发值为准"
                : "该价格方案保底费为 0，表端保底金额可手动填写" }}
            </div>
          </div>
          <el-form-item label="区域号">
            <el-input-number v-model="initForm.areaCode" :min="0" :max="255" />
          </el-form-item>
          <el-form-item label="参数类型 hst">
            <el-input-number v-model="initForm.hst" :min="0" :max="255" />
          </el-form-item>
          <el-form-item label="费率版本">
            <el-input-number v-model="initForm.rateVersion" :min="0" :max="15" />
          </el-form-item>
          <el-form-item label="阶梯周期">
            <el-input-number v-model="initForm.cycle" :min="0" :max="12" />
          </el-form-item>
          <el-form-item label="阶梯1上限量（吨）">
            <el-input-number v-model="initForm.limitValue1" :min="0" :max="16383" :precision="1" :step="0.1" :disabled="!!initForm.priceId" />
          </el-form-item>
          <el-form-item label="阶梯2上限量（吨）">
            <el-input-number v-model="initForm.limitValue2" :min="0" :max="16383" :precision="1" :step="0.1" :disabled="!!initForm.priceId" />
          </el-form-item>
          <el-form-item label="阶梯上限小数位(RateAssist)">
            <el-select v-model="initForm.rateAssist" :disabled="!!initForm.priceId" placeholder="请选择">
              <el-option label="1位小数(0.1吨，默认)" :value="0" />
              <el-option label="整数吨" :value="4" />
            </el-select>
            <div class="form-tip">0=阶梯上限允许 0.1 吨小数；4=上限必须整数吨。需与表端口径一致</div>
          </el-form-item>
          <el-form-item label="阶梯1单价(元)">
            <el-input-number v-model="initForm.unitPrice1" :min="0" :max="99.99" :precision="2" :step="0.5" :disabled="!!initForm.priceId" />
          </el-form-item>
          <el-form-item label="阶梯2单价(元)">
            <el-input-number v-model="initForm.unitPrice2" :min="0" :max="99.99" :precision="2" :step="0.5" :disabled="!!initForm.priceId" />
          </el-form-item>
          <el-form-item label="阶梯3单价(元)">
            <el-input-number v-model="initForm.unitPrice3" :min="0" :max="99.99" :precision="2" :step="0.5" :disabled="!!initForm.priceId" />
          </el-form-item>
          <el-form-item label="保底金额(元)">
            <el-input-number v-model="initForm.minValue" :min="0" :max="9999" :precision="2" :disabled="initMinLocked" />
            <div class="form-tip">
              {{ initMinLocked
                ? "由价格方案的保底费自动带出并锁定，不可手填"
                : "表端账户余额警戒值，可手动填写（价格方案保底费为 0 时不参与系统扣费）" }}
            </div>
          </el-form-item>
          <el-form-item label="报警金额(元)">
            <el-input-number v-model="initForm.shutoffAmount" :min="0" :max="9999" />
          </el-form-item>
          <el-form-item label="限购金额(元)">
            <el-input-number v-model="initForm.limitAmount" :min="0" :max="9999" />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="initVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitInit">下发指令</el-button>
      </template>
    </el-dialog>

    <!-- 开户弹窗 -->
    <el-dialog v-model="openAccountVisible" title="蓝牙卡表开户" width="500px">
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 12px"
        title="开户前必须先完成：清零 → 校时 → 设置；开户只能执行一次"
      />
      <el-form :model="openAccountForm" label-width="110px">
        <el-form-item label="表号">
          <el-input v-model="openAccountForm.meterCode" disabled />
        </el-form-item>
        <el-form-item label="用户号" required>
          <el-input-number v-model="openAccountForm.userNo" :min="1" :max="65535" />
          <div class="form-tip">用户号(UsersCode) 1-65535，会被注册进表端，后续充值必须一致</div>
        </el-form-item>
        <el-form-item label="预设金额(元)">
          <el-input-number v-model="openAccountForm.amount" :min="0" :precision="2" :step="10" />
          <div class="form-tip">可填 0 表示纯开户不充值；大于 0 则同时计入账务</div>
        </el-form-item>
        <el-form-item label="收费人">
          <el-input v-model="openAccountForm.operateStaff" placeholder="操作员姓名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="openAccountVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitOpenAccount">确认开户</el-button>
      </template>
    </el-dialog>

    <!-- 档案编辑弹窗 -->
    <el-dialog
      v-model="editVisible"
      :title="editForm.btMeterId ? '编辑蓝牙卡表' : '登记蓝牙卡表'"
      width="580px"
      top="10vh"
      modal-class="bt-edit-dialog"
    >
      <div class="form-hint">
        档案只维护通信与计量必需字段；费率（阶梯单价 / 上限 / 保底）请到「设置指令」下发。
      </div>
      <el-form :model="editForm" label-width="110px" label-position="right">
        <!-- 主表单：与蓝牙表通信真正需要的字段 -->
        <el-form-item label="表号" required>
          <el-input v-model="editForm.meterCode" placeholder="广播名 JNM- 后14位" :disabled="!!editForm.btMeterId" />
          <div class="form-tip">表号唯一，登记后不可修改</div>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="用户号">
              <el-input-number v-model="editForm.userNo" :min="1" :max="65535" controls-position="right" />
              <div class="form-tip">1-65535，需与表端一致</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="区域号">
              <el-input-number v-model="editForm.areaCode" :min="0" :max="255" controls-position="right" />
              <div class="form-tip">0-255，同程序内固定</div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="采样系数">
          <el-input-number v-model="editForm.samplingFactor" :min="0" :precision="4" :step="0.1" controls-position="right" />
          <div class="form-tip">表端原始用量 × 采样系数 = 实际吨数（0.1 表示 1 个字 = 0.1 吨），保存即写入档案</div>
        </el-form-item>

      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 档案详情弹窗 -->
    <el-dialog v-model="detailVisible" title="蓝牙卡表档案详情" width="660px">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="表号">{{ detail.meterCode || "-" }}</el-descriptions-item>
        <el-descriptions-item label="IMEI">{{ detail.imei || "-" }}</el-descriptions-item>
        <el-descriptions-item label="区域号">{{ detail.areaCode }}</el-descriptions-item>
        <el-descriptions-item label="用户号">{{ detail.userNo }}</el-descriptions-item>
        <el-descriptions-item label="关联用户ID">{{ detail.userId || "-" }}</el-descriptions-item>
        <el-descriptions-item label="水厂ID">{{ detail.companyId || "-" }}</el-descriptions-item>
        <el-descriptions-item label="价格方案ID">{{ detail.priceId != null ? detail.priceId : "-" }}</el-descriptions-item>
        <el-descriptions-item label="购买次数">{{ detail.buyCount }}</el-descriptions-item>
        <el-descriptions-item label="表状态">{{ detail.meterStatusDesc || "-" }}</el-descriptions-item>
        <el-descriptions-item label="表端余额">￥{{ meterMoney(detail.lastBalance) }}</el-descriptions-item>
        <el-descriptions-item label="累计用量">{{ detail.lastTotalUsage == null ? "-" : meterMoney(detail.lastTotalUsage) + " 吨" }}</el-descriptions-item>
        <el-descriptions-item label="阀门状态">{{ detail.lastValveStatus || "-" }}</el-descriptions-item>
        <el-descriptions-item label="状态字">{{ detail.lastStatusWord || "-" }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ detail.userName || "-" }}</el-descriptions-item>
        <el-descriptions-item label="地址">{{ detail.userAddr || "-" }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ detail.userPhone || "-" }}</el-descriptions-item>
        <el-descriptions-item label="最近上报">{{ fmtTime(detail.lastReportTime) }}</el-descriptions-item>
        <el-descriptions-item label="最近写表">{{ fmtTime(detail.lastWriteTime) }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  queryBtMeter,
  saveBtMeter,
  deleteBtMeter,
  getBtMeterDetail,
  recharge,
  valve,
  zero,
  clock,
  setting,
  openAccount,
} from "@/api/btMeter";
import { queryPriceMg, getPriceDetail } from "@/api/price/price";
import { exportToCsv } from "@/utils/csv";

const loading = ref(false);
const submitting = ref(false);
const tableData = ref([]);
const total = ref(0);
const multipleSelection = ref([]);

const params = reactive({
  pageNo: 1,
  pageSize: 10,
  meterCode: null,
  userName: null,
  userPhone: null,
  meterStatus: null,
});

// ==================== 数据加载 ====================

async function loadData() {
  loading.value = true;
  try {
    const res = await queryBtMeter(params);
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
  params.meterCode = null;
  params.userName = null;
  params.userPhone = null;
  params.meterStatus = null;
  params.pageNo = 1;
  loadData();
}

function handleSelectionChange(val) {
  multipleSelection.value = val;
}

// ==================== 删除 ====================

async function handleDelete() {
  const ids = multipleSelection.value.map((r) => r.btMeterId);
  try {
    await ElMessageBox.confirm(
      `确认删除选中的 ${ids.length} 条档案？存在待写表任务的档案无法删除。`,
      "删除确认",
      { type: "warning", lockScroll: false }
    );
  } catch {
    return;
  }
  const res = await deleteBtMeter(ids);
  if (res.code === 200) {
    ElMessage.success("删除成功");
    loadData();
  }
}

// ==================== 充值 ====================

const rechargeVisible = ref(false);
const rechargeForm = reactive({ meterCode: "", amount: null, operateStaff: "" });

function openRecharge(row) {
  // 必须先开户才能充值（开户已由独立指令完成，且只能一次）
  if (row.meterStatus == null || row.meterStatus < 2) {
    ElMessage.warning("该表尚未开户，请先执行「开户」指令再充值");
    return;
  }
  rechargeForm.meterCode = row.meterCode;
  rechargeForm.amount = null;
  rechargeForm.operateStaff = "";
  rechargeVisible.value = true;
}

// ==================== 开户 ====================

const openAccountVisible = ref(false);
const openAccountForm = reactive({ meterCode: "", userNo: null, amount: 0, operateStaff: "" });

function openOpenAccount(row) {
  // 开户前置：必须先完成设置（meterStatus >= 1）
  if (row.meterStatus == null || row.meterStatus < 1) {
    ElMessage.warning("该表尚未完成设置，请先执行清零 → 校时 → 设置");
    return;
  }
  if (row.meterStatus >= 2) {
    ElMessage.warning("该表已开户，不能重复开户（如需充值请使用充值指令）");
    return;
  }
  openAccountForm.meterCode = row.meterCode;
  openAccountForm.userNo = row.userNo != null ? row.userNo : null;
  openAccountForm.amount = 0;
  openAccountForm.operateStaff = "";
  openAccountVisible.value = true;
}

async function submitOpenAccount() {
  if (openAccountForm.userNo == null || openAccountForm.userNo < 1 || openAccountForm.userNo > 65535) {
    ElMessage.error("用户号必填，范围 1-65535");
    return;
  }
  submitting.value = true;
  try {
    const res = await openAccount(openAccountForm);
    if (res.code === 200) {
      ElMessage.success(`开户指令已生成：${res.data.taskNo}（请到手机蓝牙端写表）`);
      openAccountVisible.value = false;
      loadData();
    }
  } finally {
    submitting.value = false;
  }
}

async function submitRecharge() {
  if (!rechargeForm.amount || rechargeForm.amount <= 0) {
    ElMessage.error("充值金额必须大于0");
    return;
  }
  submitting.value = true;
  try {
    const res = await recharge(rechargeForm);
    if (res.code === 200) {
      ElMessage.success(`收费成功，已生成待写表任务：${res.data.taskNo}`);
      rechargeVisible.value = false;
      loadData();
    }
  } finally {
    submitting.value = false;
  }
}

// ==================== 阀控 ====================

const valveVisible = ref(false);
const valveForm = reactive({ meterCode: "", valveAction: 0, operateStaff: "" });

function openValve(row) {
  valveForm.meterCode = row.meterCode;
  valveForm.valveAction = 0;
  valveForm.operateStaff = "";
  valveVisible.value = true;
}

async function submitValve() {
  submitting.value = true;
  try {
    const res = await valve(valveForm);
    if (res.code === 200) {
      ElMessage.success(`阀控指令已生成：${res.data.taskNo}`);
      valveVisible.value = false;
    }
  } finally {
    submitting.value = false;
  }
}

// ==================== 初始化指令：清零 / 校时 / 设置 ====================

const initVisible = ref(false);
const initType = ref("CLEAR");
const initTitle = computed(() => {
  return { CLEAR: "清零指令", CLOCK: "校时指令", SETTING: "设置指令" }[initType.value] || "初始化指令";
});
const initForm = reactive({
  meterCode: "",
  operateStaff: "",
  priceId: null,
  areaCode: 205,
  hst: 5,
  rateVersion: 0,
  cycle: 0,
  rateIdent: 1,
  rateAssist: 0,
  limitValue1: 100,
  limitValue2: 200,
  unitPrice1: 3,
  unitPrice2: 4,
  unitPrice3: 5,
  minValue: 0,
  shutoffAmount: 100,
  limitAmount: 100,
});

// 价格方案的「保底费」：>0 表示系统启用保底，表端保底金额由方案自动带出并锁定；
// =0 / 未选方案时，系统「保底费」与表端「保底金额」语义不同，改为允许手动填写。
const initMinFromPrice = ref(0);
const initMinLocked = computed(() => !!initForm.priceId && Number(initMinFromPrice.value) > 0);

function openInit(type, row) {
  initType.value = type;
  initForm.meterCode = row.meterCode;
  initForm.operateStaff = "";
  initVisible.value = true;
  loadPriceOptions();
}

// 设置指令选了价格类型后，按后端回填规则在前端预览单价/上限/保底（价格表单价/保底直接存「元」）；取消选择则恢复默认
async function onInitPriceChange(val) {
  if (!val) {
    initForm.unitPrice1 = 3;
    initForm.unitPrice2 = 4;
    initForm.unitPrice3 = 5;
    initForm.limitValue1 = 100;
    initForm.limitValue2 = 200;
    initForm.minValue = 0;
    initMinFromPrice.value = 0;
    return;
  }
  const res = await getPriceDetail(val);
  if (res.code === 200 && res.data) {
    const p = res.data;
    initForm.unitPrice1 = p.priceFirst != null ? Number(p.priceFirst) : 0;
    initForm.unitPrice2 = p.priceSecond != null ? Number(p.priceSecond) : 0;
    initForm.unitPrice3 = p.priceThird != null ? Number(p.priceThird) : 0;
    initForm.limitValue1 = p.amountFirstEnd != null ? Number(p.amountFirstEnd) : 0;
    initForm.limitValue2 = p.amountSecondEnd != null ? Number(p.amountSecondEnd) : 0;
    // 保底费 >0 才自动带出（并锁定）；=0/为空表示系统不启用保底，表端保底金额交由人工填写
    const fee = p.guaranteedWaterFee != null ? Number(p.guaranteedWaterFee) : 0;
    initMinFromPrice.value = fee;
    initForm.minValue = fee > 0 ? fee : 0;
  }
}

async function submitInit() {
  submitting.value = true;
  try {
    const params = { ...initForm };
    let res;
    if (initType.value === "CLEAR") res = await zero(params);//调用清零后端接口
    else if (initType.value === "CLOCK") res = await clock(params);//调用校时后端接口
    else res = await setting(params);//调用设置后端接口
    if (res.code === 200) {
      ElMessage.success(`${initTitle.value}已生成：${res.data.taskNo}`);
      initVisible.value = false;
    }
  } finally {
    submitting.value = false;
  }
}

// ==================== 档案编辑 ====================

const editVisible = ref(false);
const editForm = reactive(newEditForm());

const detailVisible = ref(false);
const detail = reactive({});

const priceOptions = ref([]);
const priceLoading = ref(false);

function newEditForm() {
  const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
  return {
    btMeterId: null,
    meterCode: "",
    imei: "",
    areaCode: 0,
    userNo: 1,
    userId: null,
    companyId: userData.companyId || null,
    samplingFactor: 1,
    alarmAmount: 0,
    limitAmount: 0,
    rateVersion: 0,
    unitPrice1: 0,
    unitPrice2: 0,
    unitPrice3: 0,
    limitValue1: 0,
    limitValue2: 0,
    minValue: 0,
    minConfig: null,
    rateAssist: 0,
    priceId: null,
    remark: "",
  };
}

function openEdit(row) {
  Object.assign(editForm, newEditForm());
  if (row) {
    // 水厂ID 统一取登录信息，不沿用行内值（数据隔离）
    const { companyId, ...rest } = row;
    Object.assign(editForm, rest);
  }
  editVisible.value = true;
  loadPriceOptions();
}

async function loadPriceOptions() {
  priceLoading.value = true;
  try {
    const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
    const res = await queryPriceMg({ pageNo: 1, pageSize: 1000, companyId: userData.companyId });
    if (res.code === 200) {
      priceOptions.value = (res.data?.records || []).map((p) => ({
        value: p.priceId,
        label: p.priceName || "方案" + p.priceId,
      }));
    }
  } finally {
    priceLoading.value = false;
  }
}

async function submitEdit() {
  if (!editForm.meterCode || !editForm.meterCode.trim()) {
    ElMessage.error("表号不能为空");
    return;
  }
  submitting.value = true;
  try {
    const res = await saveBtMeter(editForm);
    if (res.code === 200) {
      ElMessage.success("保存成功");
      editVisible.value = false;
      loadData();
    }
  } finally {
    submitting.value = false;
  }
}

// ==================== 详情 ====================

async function openDetail(row) {
  const res = await getBtMeterDetail(row.meterCode);
  if (res.code === 200) {
    Object.assign(detail, res.data || {});
    detailVisible.value = true;
  }
}

function exportCsv() {
  exportToCsv("蓝牙卡表档案", [
    { label: "表号", prop: "meterCode" },
    { label: "用户", prop: "userName" },
    { label: "区域号", prop: "areaCode" },
    { label: "用户号", prop: "userNo" },
    { label: "表状态", prop: "meterStatusDesc" },
    { label: "表端余额(元)", prop: (r) => meterMoney(r.lastBalance) },
    { label: "累计用量(吨)", prop: (r) => meterMoney(r.lastTotalUsage) },
    { label: "待写表", prop: "pendingTaskCount" },
    { label: "最近上报", prop: (r) => fmtTime(r.lastReportTime) },
  ], tableData.value);
}

// ==================== 工具 ====================

// 后端已将金额/用量统一归一化为「元 / 吨」，前端只做两位小数格式化，不再除 10000。
function meterMoney(v) {
  if (v == null || v === '' || isNaN(Number(v))) return '-';
  return Number(v).toFixed(2);
}

function fmtTime(t) {
  if (!t) return "-";
  // 后端可能返回数组 [y,m,d,h,mi,s] 或字符串
  if (Array.isArray(t)) {
    const p = (n) => String(n).padStart(2, "0");
    return `${t[0]}-${p(t[1])}-${p(t[2])} ${p(t[3])}:${p(t[4])}:${p(t[5])}`;
  }
  return String(t).replace("T", " ").substring(0, 19);
}

function statusClass(s) {
  if (s === 3) return "ok";
  if (s === 2) return "blue";
  if (s === 0) return "warn";
  if (s === 9) return "err";
  return "";
}

onMounted(() => {
  loadData();
});
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
    :deep(.el-input) { width: 160px; }
    :deep(.el-select) { width: 160px; }
  }
  .buttons {
    display: flex;
    gap: 10px;
    margin-left: auto;
    .sercah-btn,
    .clear-btn {
      height: 35px;
      padding: 0 18px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 16px;
      span { margin-left: 4px; }
    }
    .sercah-btn { background: #46b97e; color: #fff; }
    .clear-btn { background: #fff; color: #5a5a5a; border: 1px solid #d9d9d9; }
  }
}

.command-box {
  display: flex;
  gap: 10px;
  margin: 12px 0;
  .add-btn,
  .delete-btn,
  .reflush {
    height: 35px;
    padding: 0 16px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 16px;
    color: #5a5a5a;
    border: 1px solid #d9d9d9;
    background: #fff;
    &.is-disabled { opacity: 0.5; cursor: not-allowed; }
  }
  .add-btn { background: #46b97e; color: #fff; border-color: #46b97e; }
}

.table-box {
  flex: 1;
  background: #fff;
  border-radius: 6px;
  padding: 12px;
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

.sub-text {
  font-size: 12px;
  color: #a8abb2;
}

.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  background: #f5f5f5;
  color: #8a919f;
  &.ok { background: #f0f9eb; color: #46b97e; }
  &.blue { background: #ecf5ff; color: #409eff; }
  &.warn { background: #fdf6ec; color: #e6a23c; }
  &.err { background: #fef0f0; color: #f56c6c; }
}

.tip-box {
  background: #f4f4f5;
  border-radius: 4px;
  padding: 10px 12px;
  font-size: 13px;
  color: #909399;
  line-height: 1.8;
  margin-top: 10px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.6;
  margin-top: 4px;
}

.price-preview {
  background: #f6fbf8;
  border: 1px solid #d6efe1;
  border-radius: 6px;
  padding: 12px 14px;
  margin-bottom: 8px;
  .pv-title {
    font-size: 13px;
    color: #46b97e;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .pv-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 24px;
  }
  .pv-item {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 13px;
    color: #606266;
    span { color: #909399; }
    b { color: #303133; font-weight: 600; }
  }
}

.form-hint {
  margin: 0 0 14px;
  padding: 8px 12px;
  border-radius: 6px;
  background: #f4fbf7;
  border-left: 3px solid #46b97e;
  font-size: 13px;
  color: #5a6b60;
  line-height: 1.6;
}

.pv-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

/* ===== 登记/编辑弹窗整体放大美化（modal-class 落在遮罩容器上，弹窗为其子节点） ===== */
:global(.bt-edit-dialog) {
  .el-dialog {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    overflow: hidden;
  }
  .el-dialog__header {
    padding: 20px 28px 14px;
    border-bottom: 1px solid #f0f2f5;
  }
  .el-dialog__title {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
  }
  .el-dialog__body {
    padding: 22px 28px 10px;
    font-size: 16px;
  }
  .el-dialog__footer {
    padding: 12px 28px 20px;
  }
  /* 表单字体放大 */
  .el-form-item__label {
    font-size: 16px;
    color: #303133;
  }
  .el-input__inner,
  .el-textarea__inner {
    font-size: 16px;
  }
  .el-input-number,
  .el-select,
  .el-input {
    width: 100%;
  }
  .el-input__wrapper {
    padding: 4px 12px;
  }
  .el-input-number {
    height: 44px;
  }
  .el-input-number .el-input__inner {
    height: 44px;
    line-height: 44px;
  }
  .el-button {
    font-size: 16px;
    padding: 10px 26px;
    border-radius: 8px;
  }
  /* 价格预览区放大 */
  .price-preview {
    padding: 14px 18px;
    margin: 4px 0 10px;
    border-radius: 8px;
    .pv-title {
      font-size: 15px;
    }
    .pv-item {
      font-size: 15px;
      b { font-size: 16px; }
    }
  }
  .form-tip {
    font-size: 13px;
  }
}
</style>
