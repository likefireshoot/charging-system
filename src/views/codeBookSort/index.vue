<template>
  <div class="code-book-sort">
    <div v-if="!available" class="unavailable">
      <el-empty :description="unavailableText" />
    </div>

    <template v-else>
      <div class="search-header">
        <div class="search-content">
          <div class="search-input">
            <span>表册</span>
            <el-select
              v-model="selectedCodeBookId"
              placeholder="选择表册"
              clearable
              filterable
              class="codebook-select"
              :disabled="loading || saving"
              @change="handleCodeBookChange"
            >
              <el-option
                v-for="item in codeBookList"
                :key="item.codeBookId"
                :label="item.codeBookName"
                :value="item.codeBookId"
              />
            </el-select>
          </div>
        </div>

        <div class="header-actions">
          <span class="tip-text">仅95号水厂；按户排序；未编号户默认排在最后</span>
          <el-button :loading="loading" :disabled="saving" @click="handleRefresh">刷新</el-button>
        </div>
      </div>

      <div class="main-content">
        <div class="panel sortable-panel">
          <div class="panel-header">
            <h3>可排序户（{{ sortableHouseholds.length }}）</h3>
            <div class="header-right">
              <span v-if="isSearching" class="search-tip">搜索状态下不可调整位置</span>
              <el-input
                v-model="keyword"
                placeholder="搜索用户名、地址、用户号、表号"
                clearable
                style="width: 320px"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </div>
          </div>

          <div class="table-container" v-loading="loading || saving">
            <el-empty v-if="!selectedCodeBookId" description="请选择表册" />
            <el-empty v-else-if="sortableHouseholds.length === 0" description="该表册暂无可排序户" />
            <el-table v-else :data="displayHouseholds" stripe border height="100%">
              <el-table-column label="序号" width="110" align="center">
                <template #default="{ row }">
                  <span :class="{ 'no-sort': row.sortNo === null || row.sortNo === undefined }">
                    {{ row.sortNo ?? '未编号' }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="displayUserId" label="用户号" min-width="110" align="center" />
              <el-table-column prop="userName" label="用户名" min-width="120" align="center" />
              <el-table-column label="地址" min-width="220" align="center">
                <template #default="{ row }">{{ row.userAddr || '-' }}</template>
              </el-table-column>
              <el-table-column label="电话" min-width="140" align="center">
                <template #default="{ row }">{{ row.userPhone || '-' }}</template>
              </el-table-column>
              <el-table-column label="表号" min-width="180" align="center">
                <template #default="{ row }">{{ formatMeterCodes(row.meterCodes) }}</template>
              </el-table-column>
              <el-table-column label="操作" width="120" align="center">
                <template #default="{ row }">
                  <el-button
                    v-if="!isSearching"
                    type="primary"
                    link
                    :disabled="saving || sortableHouseholds.length < 2"
                    @click="openAdjust(row)"
                  >
                    调整位置
                  </el-button>
                  <span v-else class="disabled-text">-</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <div v-if="selectedCodeBookId" class="panel unsortable-panel">
          <div class="panel-header">
            <h3>不可排序户（无普表绑定/无历史编号）（{{ unsortableHouseholds.length }}）</h3>
          </div>
          <div class="table-container">
            <el-empty v-if="unsortableHouseholds.length === 0" description="无不可排序户" :image-size="60" />
            <el-table v-else :data="unsortableHouseholds" stripe border height="100%">
              <el-table-column label="序号" width="110" align="center">
                <template #default="{ row }">
                  <span class="no-sort">{{ row.sortNo ?? '未编号' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="displayUserId" label="用户号" min-width="110" align="center" />
              <el-table-column prop="userName" label="用户名" min-width="120" align="center" />
              <el-table-column label="地址" min-width="220" align="center">
                <template #default="{ row }">{{ row.userAddr || '-' }}</template>
              </el-table-column>
              <el-table-column label="电话" min-width="140" align="center">
                <template #default="{ row }">{{ row.userPhone || '-' }}</template>
              </el-table-column>
              <el-table-column label="表号" min-width="180" align="center">
                <template #default="{ row }">{{ formatMeterCodes(row.meterCodes) }}</template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </template>

    <el-dialog
      v-model="adjustVisible"
      title="调整位置"
      width="560px"
      :close-on-click-modal="!saving"
      :close-on-press-escape="!saving"
      :show-close="!saving"
    >
      <div v-if="currentHousehold" class="adjust-body">
        <p class="adjust-target">
          将 <b>{{ currentHousehold.userName }}</b>（用户号 {{ currentHousehold.displayUserId }}）移动到：
        </p>
        <el-radio-group v-model="selectedGap" class="gap-list">
          <el-radio
            v-for="gap in gapOptions"
            :key="gap.value"
            :label="gap.value"
            :disabled="gap.disabled || saving"
            class="gap-item"
          >
            {{ gap.label }}
          </el-radio>
        </el-radio-group>
      </div>
      <template #footer>
        <el-button :disabled="saving" @click="adjustVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="saving"
          :disabled="selectedGap === null || selectedGap === undefined"
          @click="confirmAdjust"
        >
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import service from '@/api/request';

const COMPANY_95_ID = 95;
const PERMISSION_ID = 114;
const PERMISSION_NAME = '表册排序';

const store = useStore();
const userData = computed(() => store.state.userData || {});
const isCompany95 = computed(() => userData.value.companyId === COMPANY_95_ID);
const hasPermission = computed(() => {
  const ids = userData.value.staffPermissionIds;
  return Array.isArray(ids) && ids.includes(PERMISSION_ID);
});
const available = computed(() => isCompany95.value && hasPermission.value);
const unavailableText = computed(() => {
  if (!isCompany95.value) return '表册排序仅对95号水厂开放';
  return `当前账号无“${PERMISSION_NAME}”权限，请联系管理员分配`;
});

const codeBookList = ref([]);
const selectedCodeBookId = ref(null);
const keyword = ref('');
const loading = ref(false);
const saving = ref(false);

const sortableHouseholds = ref([]);
const unsortableHouseholds = ref([]);

const isSearching = computed(() => keyword.value.trim() !== '');

const displayHouseholds = computed(() => {
  const text = keyword.value.trim().toLowerCase();
  if (!text) return sortableHouseholds.value;
  return sortableHouseholds.value.filter((row) => {
    const meterCodes = (row.meterCodes || []).join(',');
    return (
      String(row.userName || '').toLowerCase().includes(text) ||
      String(row.userAddr || '').toLowerCase().includes(text) ||
      String(row.displayUserId ?? '').includes(text) ||
      meterCodes.toLowerCase().includes(text)
    );
  });
});

const formatMeterCodes = (meterCodes) => {
  if (!Array.isArray(meterCodes) || meterCodes.length === 0) return '-';
  return meterCodes.join(', ');
};

const isTransportError = (error) => !!error?.response || error?.message === 'Network Error';

const notifyBusinessError = (error, fallback = '操作失败') => {
  if (isTransportError(error)) return;
  ElMessage.error(error?.message || fallback);
};

const loadCodeBooks = async () => {
  if (!available.value) return;
  try {
    const res = await service.get('/getCodeBook', {
      params: { companyId: userData.value.companyId },
      skipAutoMsg: true,
    });
    if (res.code !== 200) {
      codeBookList.value = [];
      notifyBusinessError(new Error(res.msg || '获取表册列表失败'));
      return;
    }
    codeBookList.value = res.data || [];
  } catch (error) {
    codeBookList.value = [];
    notifyBusinessError(error, '获取表册列表失败');
  }
};

const clearList = () => {
  sortableHouseholds.value = [];
  unsortableHouseholds.value = [];
};

const loadSortList = async () => {
  if (!selectedCodeBookId.value) {
    clearList();
    return;
  }

  loading.value = true;
  try {
    const res = await service.get('/codeBookSort/list', {
      params: { codeBookId: selectedCodeBookId.value },
      skipAutoMsg: true,
    });
    if (res.code !== 200) {
      clearList();
      notifyBusinessError(new Error(res.msg || '获取排序列表失败'));
      return;
    }

    const list = Array.isArray(res.data?.list) ? res.data.list : [];
    sortableHouseholds.value = list
      .filter((row) => row.sortable === true)
      .map((row) => ({ ...row, meterCodes: Array.isArray(row.meterCodes) ? row.meterCodes : [] }));
    unsortableHouseholds.value = list
      .filter((row) => row.sortable !== true)
      .map((row) => ({ ...row, meterCodes: Array.isArray(row.meterCodes) ? row.meterCodes : [] }));
  } catch (error) {
    clearList();
    notifyBusinessError(error, '获取排序列表失败');
  } finally {
    loading.value = false;
  }
};

const handleCodeBookChange = () => {
  keyword.value = '';
  adjustVisible.value = false;
  currentHousehold.value = null;
  clearList();
  loadSortList();
};

const handleRefresh = () => {
  if (saving.value) return;
  if (!selectedCodeBookId.value) {
    loadCodeBooks();
    return;
  }
  loadSortList();
};

const adjustVisible = ref(false);
const currentHousehold = ref(null);
const selectedGap = ref(null);

const gapOptions = computed(() => {
  const list = sortableHouseholds.value;
  const current = currentHousehold.value;
  const currentIndex = current ? list.findIndex((row) => row.userId === current.userId) : -1;

  return Array.from({ length: list.length + 1 }, (_, gap) => {
    let label;
    if (gap === 0) {
      label = '最前（第 1 位）';
    } else if (gap === list.length) {
      label = `最后（第 ${list.length} 位）`;
    } else {
      const prev = list[gap - 1];
      const next = list[gap];
      if (prev.sortNo !== null && prev.sortNo !== undefined && next.sortNo !== null && next.sortNo !== undefined) {
        label = `编号 ${prev.sortNo}（${prev.userName}）与 编号 ${next.sortNo}（${next.userName}）之间`;
      } else {
        label = `第 ${gap} 位（${prev.userName}）与第 ${gap + 1} 位（${next.userName}）之间`;
      }
    }
    return {
      value: gap,
      label,
      disabled: gap === currentIndex || gap === currentIndex + 1,
    };
  });
});

const openAdjust = (row) => {
  if (saving.value || isSearching.value) return;
  currentHousehold.value = row;
  selectedGap.value = null;
  adjustVisible.value = true;
};

const confirmAdjust = async () => {
  if (saving.value || !currentHousehold.value) return;
  if (selectedGap.value === null || selectedGap.value === undefined) return;

  const snapshot = sortableHouseholds.value.map((row) => ({ ...row }));
  const currentIndex = snapshot.findIndex((row) => row.userId === currentHousehold.value.userId);
  if (currentIndex < 0) return;

  const nextList = snapshot.map((row) => ({ ...row }));
  const [moved] = nextList.splice(currentIndex, 1);
  const insertIndex = selectedGap.value > currentIndex ? selectedGap.value - 1 : selectedGap.value;
  nextList.splice(insertIndex, 0, moved);
  nextList.forEach((row, index) => {
    row.sortNo = index + 1;
  });
  sortableHouseholds.value = nextList;

  saving.value = true;
  try {
    const res = await service.post(
      '/codeBookSort/save',
      {
        codeBookId: selectedCodeBookId.value,
        userIds: nextList.map((row) => row.userId),
      },
      { skipAutoMsg: true }
    );
    if (res.code !== 200) {
      throw new Error(res.msg || '保存失败');
    }
    ElMessage.success('排序已保存');
    adjustVisible.value = false;
    await loadSortList();
  } catch (error) {
    sortableHouseholds.value = snapshot;
    const message = error?.message || '保存失败';
    if (message.includes('排序列表与表册用户不一致')) {
      ElMessage.warning(message);
      adjustVisible.value = false;
      await loadSortList();
    } else {
      notifyBusinessError(error, '保存失败');
    }
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  if (available.value) {
    loadCodeBooks();
  }
});
</script>

<style lang="scss" scoped>
// 只影响普通实心按钮；link 文字按钮必须保持透明，否则打包后会被渲染成整块绿色
:deep(.el-button--primary:not(.is-link)) {
  background-color: #46b97e;
  border-color: #46b97e;

  &:hover {
    background-color: #3da86e;
    border-color: #3da86e;
  }
}

.code-book-sort {
  --el-color-primary: #46b97e;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 94%;
  padding: 0 15px;
  box-sizing: border-box;

  .unavailable {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .search-header {
    margin-top: 5px;
    margin-bottom: 10px;
    width: 99.3%;
    height: 98px;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #e9e9e9;
    border-radius: 5px;
    background-color: #fff;
    box-sizing: border-box;

    .search-content {
      display: flex;
      width: 80%;
      height: 100%;
    }

    .search-input {
      display: flex;
      justify-content: center;
      flex-direction: column;
      width: 18%;
      min-width: 260px;
      height: 100%;
      margin-right: 10px;

      > span {
        font-size: 18px;
        margin-bottom: 5px;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;

      .tip-text {
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .main-content {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    padding-bottom: 10px;
    box-sizing: border-box;
  }

  .panel {
    background-color: #fff;
    border: 1px solid #e9e9e9;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 15px;
      border-bottom: 1px solid #ebeef5;
      flex-shrink: 0;

      h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #303133;
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 12px;

        .search-tip {
          font-size: 14px;
          color: #e6a23c;
        }
      }
    }

    .table-container {
      flex: 1;
      min-height: 0;
      padding: 10px;
      display: flex;
      flex-direction: column;
    }
  }

  .sortable-panel {
    flex: 1;
    min-height: 0;
  }

  .unsortable-panel {
    flex: 0 0 240px;
    min-height: 180px;
  }

  :deep(.el-table) {
    font-size: 16px;

    .el-table__header th {
      background-color: #46b97e;
      font-weight: 600;
      color: #fff;
    }

    .no-sort {
      color: #c0c4cc;
    }

    .disabled-text {
      color: #c0c4cc;
    }
  }

  .adjust-body {
    .adjust-target {
      margin: 0 0 12px;
      font-size: 15px;
      color: #303133;
    }

    .gap-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
      max-height: 50vh;
      overflow-y: auto;
      padding-right: 6px;

      :deep(.el-radio) {
        margin-right: 0;
        height: auto;
        padding: 6px 8px;
        border-radius: 4px;

        &.is-checked {
          background-color: #edf8f2;
        }
      }

      :deep(.el-radio__label) {
        white-space: normal;
        font-size: 14px;
      }
    }
  }
}

:deep(.el-select .el-select__wrapper) {
  min-height: 32px;
}
</style>
