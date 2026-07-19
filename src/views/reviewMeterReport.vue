<template>
  <div class="review-meter-report">
    <!-- 顶部搜索栏 -->
    <div class="search-header">
      <div class="page-title">
        <el-icon><Document /></el-icon>
        <span>用户抄表审核</span>
      </div>
      
      <div class="search-form">
        <div class="form-item">
          <label class="form-label">水厂</label>
          <el-select 
            v-model="searchParams.companyId" 
            placeholder="选择水厂"
            clearable
            @change="handleCompanyChange"
          >
            <el-option 
              v-for="item in companyList" 
              :key="item.companyId"
              :label="item.companyName"
              :value="item.companyId"
            />
          </el-select>
        </div>

        <div class="form-item">
          <label class="form-label">区域</label>
          <el-select 
            v-model="searchParams.region" 
            placeholder="选择区域"
            clearable
            @change="handleRegionChange"
            :disabled="!searchParams.companyId"
          >
            <el-option 
              v-for="item in regionList" 
              :key="item.regionId"
              :label="item.regionName"
              :value="item.regionId"
            />
          </el-select>
        </div>

        <div class="form-item">
          <el-input
            v-model="searchKeyword"
            placeholder="姓名/地址/用户号"
            clearable
            style="width: 300px;"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="form-actions">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            <span>搜索</span>
          </el-button>
          
          <el-button @click="handleClearAll">
            <el-icon><Delete /></el-icon>
            <span>清空</span>
          </el-button>
        </div>
      </div>

      <div class="header-right">
        <!-- 审核通过（针对单个用户） -->
        <el-button 
          type="success" 
          @click="handleSingleReview"
          :disabled="selectedRows.length !== 1"
        >
          <el-icon><Check /></el-icon>
          <span>审核通过</span>
        </el-button>
        
        <!-- 本页审核通过 -->
        <el-button 
          type="primary" 
          @click="handleCurrentPageReview"
          :disabled="paginatedReviewList.length === 0"
        >
          <el-icon><Check /></el-icon>
          <span>本页审核通过</span>
        </el-button>
        
        <!-- 全部审核通过 -->
        <el-button 
          type="warning" 
          @click="handleAllReview"
          :disabled="filteredReviewList.length === 0"
        >
          <el-icon><Check /></el-icon>
          <span>全部审核通过</span>
        </el-button>
        
        <!-- 返回 -->
        <el-button @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
    </div>

    <!-- 主体表格区域 -->
    <div class="main-content">
      <el-table 
        :data="paginatedReviewList"
        stripe
        border
        v-loading="loading"
        height="650"
        @selection-change="handleSelectionChange"
        ref="tableRef"
      >
        <el-table-column type="selection" width="55" align="center" />
        
        <el-table-column label="#" width="60" align="center">
          <template #default="{ $index }">
            {{ (currentPage - 1) * pageSize + $index + 1 }}
          </template>
        </el-table-column>
        
        <el-table-column prop="userId" label="用户号" min-width="120" align="center" />
        <el-table-column prop="userName" label="用户姓名" min-width="120" align="center" />
        <el-table-column prop="address" label="用户地址" min-width="200" align="center" show-overflow-tooltip />
        <el-table-column prop="reportStatus" label="抄表状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.reportStatus === '正常' ? 'success' : 'warning'" size="small">
              {{ row.reportStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startReading" label="起码(吨)" min-width="100" align="center" />
        <el-table-column prop="endReading" label="止码(吨)" min-width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.reportStatus !== '正常'">-</span>
            <el-input
              v-else-if="editingRow?.id === row.id"
              v-model="editingEndReading"
              type="number"
              size="small"
              ref="endReadingInputRef"
              @blur="submitEndReading(row)"
              @keyup.enter="submitEndReading(row)"
              @keyup.esc="cancelEditEndReadingInline"
              class="end-reading-input"
              style="width: 80px;"
            />
            <span
              v-else
              class="editable-end-reading"
              @click="startEditEndReading(row)"
            >
              {{ row.endReading }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="deltaWater" label="本期用量(吨)" min-width="110" align="center">
          <template #default="{ row }">
            <span v-if="row.reportStatus !== '正常'">-</span>
            <span v-else>{{ row.deltaWater }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="抄表日期" min-width="140" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-container" v-if="filteredReviewList.length > 0">
        <div class="pagination-info">
          <el-button-group>
            <el-button 
              size="small" 
              :type="isCurrentPageAllSelected ? 'primary' : 'default'"
              @click="toggleSelectCurrentPage"
            >
              {{ isCurrentPageAllSelected ? '取消本页' : '选择本页' }}
            </el-button>
            <el-button 
              size="small" 
              :type="isAllSelected ? 'primary' : 'default'"
              @click="toggleSelectAll"
            >
              {{ isAllSelected ? '取消全部' : '选择全部' }}
            </el-button>
          </el-button-group>
          <span class="total-count">共 {{ filteredReviewList.length }} 条</span>
        </div>
        
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[1, 10, 20, 50, 100]"
          :total="filteredReviewList.length"
          layout="sizes, prev, pager, next, jumper, total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />

      </div>

      <!-- 空数据提示 -->
      <div v-if="filteredReviewList.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无待审核数据" />
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Document, Search, Delete, Check, ArrowLeft } from '@element-plus/icons-vue';
import service from '@/api/request';

const router = useRouter();

// 搜索参数
const searchParams = reactive({
  companyId: '',
  region: ''
});

// 当前登录用户的公司信息
const currentCompanyId = ref(null);

// 水厂列表
const companyList = ref([]);

// 区域列表
const regionList = ref([]);

// 审核列表（原始数据）
const reviewList = ref([]);

// 搜索关键词
const searchKeyword = ref('');

// 分页相关
const currentPage = ref(1);
const pageSize = ref(20);

// 选中的行
const selectedRows = ref([]);

// 加载状态
const loading = ref(false);

// 止码编辑相关（内联编辑）
const editingRow = ref(null);
const editingEndReading = ref('');
const endReadingInputRef = ref(null);

// 表格引用
const tableRef = ref(null);

// 过滤后的审核列表（根据搜索关键词）
const filteredReviewList = computed(() => {
  if (!searchKeyword.value.trim()) {
    return reviewList.value;
  }

  const keyword = searchKeyword.value.trim().toLowerCase();
  return reviewList.value.filter(item => {
    return (
      (item.userName && item.userName.toLowerCase().includes(keyword)) ||
      (item.userId && item.userId.toString().toLowerCase().includes(keyword)) ||
      (item.address && item.address.toLowerCase().includes(keyword))
    );
  });
});

// 分页后的审核列表
const paginatedReviewList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredReviewList.value.slice(start, end);
});

// 格式化金额
const formatMoney = (value) => {
  if (value === null || value === undefined || value === '') return '0.00';
  const num = parseFloat(value);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
};

// 获取水厂列表
const fetchCompanyList = async () => {
  try {
    const res = await service.get('/getAllUnblockCompany');
    
    if (res.code === 200) {
      let allCompanies = res.data || [];

      // 获取当前登录用户的 companyId
      const userData = JSON.parse(sessionStorage.getItem('userData'));
      currentCompanyId.value = userData?.companyId;

      // 如果 companyId !== 1，只显示当前用户所在的水厂
      if (currentCompanyId.value && currentCompanyId.value !== 1) {
        allCompanies = allCompanies.filter(company => company.companyId === currentCompanyId.value);
      }

      companyList.value = allCompanies;
      
      // 如果有当前公司，自动选中
      if (currentCompanyId.value) {
        searchParams.companyId = currentCompanyId.value;
        handleCompanyChange(currentCompanyId.value);
      }
    } else {
      ElMessage.error(res.msg || '获取水厂列表失败');
    }
  } catch (error) {
    console.error('获取水厂列表错误:', error);
    ElMessage.error('网络请求失败');
  }
};

// 水厂变化时加载区域列表
const handleCompanyChange = async (companyId) => {
  if (!companyId) {
    regionList.value = [];
    reviewList.value = [];
    searchParams.region = '';
    return;
  }

  try {
    // 调用后端接口获取该水厂下的区域列表
    const res = await service.get(`/getRegion?companyId=${companyId}`);
    
    if (res.code === 200) {
      // 筛选出区域名称包含"普表"的区域
      const allRegions = res.data || [];
      regionList.value = allRegions.filter(region =>
        region.regionName && region.regionName.includes('普表')
      );

      // 清空审核列表和选中的区域
      reviewList.value = [];
      searchParams.region = '';

      if (regionList.value.length > 0) {
        ElMessage.success(`已加载 ${regionList.value.length} 个普表区域`);
      } else {
        ElMessage.warning('该水厂下暂无普表区域');
      }
    } else {
      ElMessage.error(res.msg || '获取区域列表失败');
      regionList.value = [];
    }
  } catch (error) {
    console.error('获取区域列表错误:', error);
    ElMessage.error('网络请求失败');
    regionList.value = [];
  }
};

// 区域变化时加载审核列表
const handleRegionChange = async (regionId) => {
  if (!regionId) {
    reviewList.value = [];
    return;
  }

  loading.value = true;
  try {
    // 调用后端接口获取待审核的抄表记录
    const res = await service.get(`/manual/charge/getPendingReviewList?regionId=${regionId}`);
    
    if (res.code === 200) {
      // 处理返回的数据
      reviewList.value = (res.data || []).map(item => ({
        id: item.id,
        userId: item.userId,
        userName: item.userName,
        address: item.userAddr,
        meterCode: item.meterCode,
        startReading: item.startReading || 0,
        endReading: item.endReading || 0,
        deltaWater: item.deltaWater || 0,
        reportStatus: item.reportStatus || '正常',
        createTime: item.createTime,
        balance: item.balance || 0
      }));
      
      ElMessage.success(`已加载 ${reviewList.value.length} 条待审核记录`);
    } else {
      ElMessage.error(res.msg || '获取审核列表失败');
      reviewList.value = [];
    }
  } catch (error) {
    console.error('加载审核列表错误:', error);
    ElMessage.error(error.message || '加载审核列表失败');
    reviewList.value = [];
  } finally {
    loading.value = false;
  }
};

// 搜索处理函数
const handleSearch = () => {
  // 重置到第一页
  currentPage.value = 1;
  
  // 清空选中状态
  selectedRows.value = [];
  selectAll.value = false;
};

// 清空所有数据
const handleClearAll = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有数据吗？这将清除选中的区域、搜索条件和审核列表。',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // 清空搜索条件
    searchParams.companyId = '';
    searchParams.region = '';
    searchKeyword.value = '';
    
    // 清空列表
    reviewList.value = [];
    regionList.value = [];
    
    // 清空选中状态
    selectedRows.value = [];
    selectAll.value = false;
    
    // 重置分页
    currentPage.value = 1;
    pageSize.value = 20;
    
    ElMessage.success('已清空所有数据');
  } catch (error) {
    // 用户取消操作
  }
};

// 表格选择变化 - 只在用户手动操作时更新 selectedRows
const handleSelectionChange = (selection) => {
  // 如果是程序操作期间，不更新 selectedRows
  if (isProgrammaticOperation.value) {
    return;
  }
  
  // 用户手动操作：同步 selection 到 selectedRows
  // 需要合并当前页的 selection 和其他页已选的记录
  const currentPageIds = paginatedReviewList.value.map(row => row.id);
  const otherPageSelected = selectedRows.value.filter(row =>
    !currentPageIds.includes(row.id)
  );

  selectedRows.value = [...otherPageSelected, ...selection];
};

// 标记是否是程序操作（用于区分用户操作和程序操作）
const isProgrammaticOperation = ref(false);

// 判断当前页是否全部选中
const isCurrentPageAllSelected = computed(() => {
  const currentPageNormalRows = paginatedReviewList.value.filter(row => row.reportStatus === '正常');
  if (currentPageNormalRows.length === 0) return false;
  
  return currentPageNormalRows.every(row => 
    selectedRows.value.some(selected => selected.id === row.id)
  );
});

// 判断是否全部选中
const isAllSelected = computed(() => {
  const allNormalRows = filteredReviewList.value.filter(row => row.reportStatus === '正常');
  if (allNormalRows.length === 0) return false;
  
  return allNormalRows.every(row => 
    selectedRows.value.some(selected => selected.id === row.id)
  );
});

// 切换选择本页
const toggleSelectCurrentPage = () => {
  const currentPageNormalRows = paginatedReviewList.value.filter(row => row.reportStatus === '正常');
  
  if (isCurrentPageAllSelected.value) {
    // 取消选择本页：移除当前页已选中的记录
    const currentPageIds = new Set(currentPageNormalRows.map(row => row.id));
    selectedRows.value = selectedRows.value.filter(row => !currentPageIds.has(row.id));
  } else {
    // 选择本页：添加当前页所有正常记录
    const otherPageSelected = selectedRows.value.filter(row =>
      !paginatedReviewList.value.some(pageRow => pageRow.id === row.id)
    );
    selectedRows.value = [...otherPageSelected, ...currentPageNormalRows];
  }
  
  // 更新表格显示
  updateTableSelection();
};

// 切换选择全部
const toggleSelectAll = () => {
  const allNormalRows = filteredReviewList.value.filter(row => row.reportStatus === '正常');
  
  if (isAllSelected.value) {
    // 取消选择全部：清空所有选中
    selectedRows.value = [];
  } else {
    // 选择全部：选中所有正常状态的记录
    selectedRows.value = allNormalRows;
  }
  
  // 更新表格显示
  updateTableSelection();
};

// 更新表格选中状态
const updateTableSelection = () => {
  isProgrammaticOperation.value = true;
  
  nextTick(() => {
    if (tableRef.value) {
      tableRef.value.clearSelection();
      
      selectedRows.value.forEach(row => {
        tableRef.value.toggleRowSelection(row, true);
      });
      
      setTimeout(() => {
        isProgrammaticOperation.value = false;
      }, 100);
    }
  });
};

// 开始编辑止码（内联）
const startEditEndReading = async (row) => {
  if (!row || row.reportStatus !== '正常') return;

  editingRow.value = row;
  editingEndReading.value = row.endReading || '';

  // 等待 DOM 更新后聚焦输入框
  await nextTick();
  if (endReadingInputRef.value) {
    endReadingInputRef.value.focus();
  }
};

// 提交止码修改（内联）
const submitEndReading = async (row) => {
  if (!editingRow.value || editingRow.value.id !== row.id) return;

  // 验证输入
  const value = parseFloat(editingEndReading.value);
  if (isNaN(value) || value < 0) {
    ElMessage.error('请输入有效的正数');
    cancelEditEndReadingInline();
    return;
  }

  try {
    loading.value = true;

    // 调用后端接口更新止码
    const res = await service.post('/manual/charge/updateEndReading', {
      id: row.id,
      endReading: value
    });

    if (res.code === 200) {
      ElMessage.success('止码修改成功');

      // 更新本地数据
      row.endReading = value;

      // 重新计算本期用量（如果有起码的话）
      if (row.startReading !== undefined) {
        row.deltaWater = value - row.startReading;
      }

      // 退出编辑模式
      editingRow.value = null;
      editingEndReading.value = '';
    } else {
      ElMessage.error(res.msg || '修改失败');
      cancelEditEndReadingInline();
    }
  } catch (error) {
    console.error('修改止码错误:', error);
    ElMessage.error(error.message || '修改失败');
    cancelEditEndReadingInline();
  } finally {
    loading.value = false;
  }
};

// 取消编辑止码（内联）
const cancelEditEndReadingInline = () => {
  editingRow.value = null;
  editingEndReading.value = '';
};

// 分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;

  // 恢复选中状态
  nextTick(() => {
    restoreSelection();
  });
};

// 当前页变化
const handleCurrentChange = (val) => {
  currentPage.value = val;

  // 恢复选中状态
  nextTick(() => {
    restoreSelection();
  });
};

// 恢复选中状态
const restoreSelection = () => {
  if (!tableRef.value || selectedRows.value.length === 0) {
    return;
  }

  // 遍历当前页的数据，如果该行在 selectedRows 中，则选中
  paginatedReviewList.value.forEach(row => {
    const isSelected = selectedRows.value.some(selected => selected.id === row.id);
    if (isSelected) {
      tableRef.value.toggleRowSelection(row, true);
    }
  });
};

// 单个审核（针对某一个用户）
const handleSingleReview = async () => {
  if (selectedRows.value.length !== 1) {
    ElMessage.warning('请选择一条记录进行审核');
    return;
  }
  
  const row = selectedRows.value[0];
  
  try {
    await ElMessageBox.confirm(
      `确认审核用户【${row.userName}】的记录吗？`,
      '审核确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    );
    
    loading.value = true;
    
    // 调用审核接口
    const res = await service.post('/manual/charge/batchReview', {
      ids: [row.id],
      approved: true
    });
    
    if (res.code === 200) {
      ElMessage.success(`成功审核用户【${row.userName}】的记录`);
      
      // 从列表中移除已审核的记录
      reviewList.value = reviewList.value.filter(item => item.id !== row.id);
      
      // 清空选中状态
      selectedRows.value = [];
    } else {
      ElMessage.error(res.msg || '审核失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '审核失败');
    }
  } finally {
    loading.value = false;
  }
};

// 本页审核通过
const handleCurrentPageReview = async () => {
  const currentPageRows = paginatedReviewList.value.filter(row => row.reportStatus === '正常');
  
  if (currentPageRows.length === 0) {
    ElMessage.warning('当前页没有可审核的记录');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确认审核当前页的 ${currentPageRows.length} 条记录吗？`,
      '本页审核确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    );
    
    loading.value = true;
    
    // 构建审核数据
    const reviewIds = currentPageRows.map(row => row.id);
    
    // 验证ID是否有效
    if (!reviewIds || reviewIds.length === 0 || reviewIds.some(id => !id)) {
      ElMessage.error('记录ID无效，请刷新页面后重试');
      return;
    }
    
    // 调用批量审核接口
    const res = await service.post('/manual/charge/batchReview', {
      ids: reviewIds,
      approved: true
    });
    
    if (res.code === 200) {
      ElMessage.success(`成功审核 ${reviewIds.length} 条记录`);
      
      // 从列表中移除已审核的记录
      reviewList.value = reviewList.value.filter(item => !reviewIds.includes(item.id));
      
      // 清空选中状态
      selectedRows.value = [];
      
      // 自动加载下一页
      setTimeout(() => {
        if (paginatedReviewList.value.length > 0 && currentPage.value < Math.ceil(filteredReviewList.value.length / pageSize.value)) {
          // 还有下一页，自动跳转
          currentPage.value++;
        } else {
          // 已经是最后一页或没有数据了
          ElMessage.info('已审核完所有数据');
        }
      }, 500);
    } else {
      ElMessage.error(res.msg || '审核失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '审核失败');
    }
  } finally {
    loading.value = false;
  }
};

// 全部审核通过
const handleAllReview = async () => {
  const allNormalRows = filteredReviewList.value.filter(row => row.reportStatus === '正常');
  
  if (allNormalRows.length === 0) {
    ElMessage.warning('没有可审核的记录');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确认审核全部的 ${allNormalRows.length} 条记录吗？此操作不可撤销！`,
      '全部审核确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    loading.value = true;
    
    // 构建审核数据
    const reviewIds = allNormalRows.map(row => row.id);
    
    // 验证ID是否有效
    if (!reviewIds || reviewIds.length === 0 || reviewIds.some(id => !id)) {
      ElMessage.error('记录ID无效，请刷新页面后重试');
      return;
    }
    
    // 调用批量审核接口
    const res = await service.post('/manual/charge/batchReview', {
      ids: reviewIds,
      approved: true
    });
    
    if (res.code === 200) {
      ElMessage.success(`成功审核 ${reviewIds.length} 条记录`);
      
      // 从列表中移除已审核的记录
      reviewList.value = reviewList.value.filter(item => !reviewIds.includes(item.id));
      
      // 清空选中状态
      selectedRows.value = [];
      
      // 重置到第一页
      currentPage.value = 1;
    } else {
      ElMessage.error(res.msg || '审核失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '审核失败');
    }
  } finally {
    loading.value = false;
  }
};

// 批量审核（保留用于兼容性）
const handleBatchReview = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要审核的记录');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确认审核选中的 ${selectedRows.value.length} 条记录吗？`,
      '批量审核确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    );
    
    loading.value = true;
    
    // 构建批量审核数据
    const reviewIds = selectedRows.value.map(row => row.id);

    // 验证ID是否有效
    if (!reviewIds || reviewIds.length === 0 || reviewIds.some(id => !id)) {
      ElMessage.error('选中的记录ID无效，请刷新页面后重试');
      return;
    }

    // 调用批量审核接口
    const res = await service.post('/manual/charge/batchReview', {
      ids: reviewIds,
      approved: true
    });
    
    if (res.code === 200) {
      ElMessage.success(`成功审核 ${reviewIds.length} 条记录`);
      
      // 从列表中移除已审核的记录
      reviewList.value = reviewList.value.filter(item => !reviewIds.includes(item.id));
      
      // 清空选中状态
      selectedRows.value = [];
    } else {
      ElMessage.error(res.msg || '批量审核失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      // 根据错误类型给出更具体的提示
      if (error.response?.status === 404) {
        ElMessage.error('批量审核接口未找到，请联系后端开发人员');
      } else if (error.response?.status === 500) {
        ElMessage.error('服务器内部错误，请稍后重试');
      } else if (error.response?.status === 403) {
        ElMessage.error('无权限执行此操作');
      } else {
        ElMessage.error(error.message || '批量审核失败');
      }
    }
  } finally {
    loading.value = false;
  }
};

// 返回快速抄表页面
const goBack = () => {
  router.push('/quickMeterReport');
};

// 初始化
onMounted(() => {
  fetchCompanyList();
});
</script>

<style lang="scss" scoped>
:deep(.el-input) {
  --el-color-primary: #46b97e;
}

:deep(.el-select) {
  --el-color-primary: #46b97e;
}

:deep(.el-button--primary) {
  background-color: #46b97e;
  border-color: #46b97e;
  
  &:hover {
    background-color: #3da86e;
    border-color: #3da86e;
  }
}

.review-meter-report {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
  gap: 20px;

  // 顶部搜索栏
  .search-header {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .page-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #46b97e;

      .el-icon {
        color: #46b97e;
        font-size: 28px;
      }
    }

    .search-form {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
      margin-bottom: 15px;

      .form-item {
        display: flex;
        align-items: center;
        gap: 10px;

        .form-label {
          font-size: 20px;
          color: #606266;
          white-space: nowrap;
        }

        :deep(.el-select),
        :deep(.el-input) {
          width: 200px;
        }
      }

      .form-actions {
        display: flex;
        gap: 10px;
      }
    }

    .header-right {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
  }

  // 主体内容区
  .main-content {
    flex: 1;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .empty-state {
      padding: 40px 0;
    }

    // 分页器样式
    .pagination-container {
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      flex-shrink: 0;
      border-top: 1px solid #ebeef5;

      .pagination-info {
        display: flex;
        align-items: center;
        gap: 20px;

        .total-count {
          font-size: 20px;
          color: #606266;
        }
      }
    }
  }
}

// 可编辑止码样式
.editable-end-reading {
  color: #46b97e;
  cursor: pointer;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
  display: inline-block;
  min-width: 40px;
  text-align: center;

  &:hover {
    background-color: #f0f9ff;
    text-decoration: underline;
  }
}

// 止码输入框样式 - 隐藏上下箭头
.end-reading-input {
  :deep(.el-input__inner) {
    /* Chrome, Safari, Edge, Opera */
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* Firefox */
    &[type='number'] {
      -moz-appearance: textfield;
    }
  }
}

// 响应式适配
@media (max-width: 1200px) {
  .review-meter-report {
    padding: 16px;
    gap: 16px;

    .search-header {
      .search-form {
        gap: 16px;

        .form-item {
          :deep(.el-select),
          :deep(.el-input) {
            width: 180px;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .review-meter-report {
    padding: 12px;
    gap: 12px;

    .search-header {
      .page-title {
        font-size: 20px;
      }

      .search-form {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;

        .form-item {
          justify-content: space-between;

          :deep(.el-select),
          :deep(.el-input) {
            width: 100%;
            flex: 1;
          }
        }

        .form-actions {
          margin-left: 0;
        }
      }

      .header-right {
        flex-direction: column;
      }
    }

    .main-content {
      .pagination-container {
        flex-direction: column;
        gap: 15px;

        .pagination-info {
          width: 100%;
          justify-content: space-between;
        }
      }
    }
  }
}
</style>