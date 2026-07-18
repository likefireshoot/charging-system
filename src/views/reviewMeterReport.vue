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
        <el-button type="primary" @click="handleBatchReview" :disabled="selectedRows.length === 0">
          <el-icon><Check /></el-icon>
          <span>审核</span>
        </el-button>
        
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
            <span
              v-else
              class="editable-end-reading"
              @click="handleEditEndReading(row)"
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
        
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small"
              @click="handleSingleReview(row)"
            >
              审核
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="pagination-container" v-if="filteredReviewList.length > 0">
        <div class="pagination-info">
          <span class="total-count">共 {{ filteredReviewList.length }} 条</span>
        </div>
        
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
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

  <!-- 止码编辑对话框 -->
  <el-dialog
    v-model="editDialogVisible"
    title="修改止码"
    width="500px"
    :close-on-click-modal="false"
  >
    <div class="end-reading-form">
      <el-form label-width="100px" size="large">
        <el-form-item label="用户号：">
          <span class="info-text">{{ currentEditingRow?.userId || '-' }}</span>
        </el-form-item>

        <el-form-item label="用户姓名：">
          <span class="info-text">{{ currentEditingRow?.userName || '-' }}</span>
        </el-form-item>

        <el-form-item label="当前止码：">
          <span class="info-text highlight">{{ currentEditingRow?.endReading || '0' }} 吨</span>
        </el-form-item>

        <el-form-item label="新止码：" required>
          <el-input
            v-model="newEndReading"
            type="number"
            placeholder="请输入新止码"
            inputmode="decimal"
            clearable
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelEditEndReading">取消</el-button>
        <el-button type="primary" @click="confirmEditEndReading">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
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

// 全选状态
const selectAll = ref(false);

// 加载状态
const loading = ref(false);

// 止码编辑相关
const editDialogVisible = ref(false);
const currentEditingRow = ref(null);
const newEndReading = ref('');

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

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection;
};

// 处理止码编辑
const handleEditEndReading = (row) => {
  if (!row || row.reportStatus !== '正常') return;

  currentEditingRow.value = row;
  newEndReading.value = row.endReading || '';
  editDialogVisible.value = true;
};

// 确认修改止码
const confirmEditEndReading = async () => {
  if (!currentEditingRow.value) return;

  // 验证输入
  const value = parseFloat(newEndReading.value);
  if (isNaN(value) || value < 0) {
    ElMessage.error('请输入有效的正数');
    return;
  }

  try {
    loading.value = true;

    // 调用后端接口更新止码
    const res = await service.post('/manual/charge/updateEndReading', {
      id: currentEditingRow.value.id,
      endReading: value
    });

    if (res.code === 200) {
      ElMessage.success('止码修改成功');

      // 更新本地数据
      currentEditingRow.value.endReading = value;

      // 重新计算本期用量（如果有起码的话）
      if (currentEditingRow.value.startReading !== undefined) {
        currentEditingRow.value.deltaWater = value - currentEditingRow.value.startReading;
      }

      // 关闭对话框
      editDialogVisible.value = false;
    } else {
      ElMessage.error(res.msg || '修改失败');
    }
  } catch (error) {
    console.error('修改止码错误:', error);
    ElMessage.error(error.message || '修改失败');
  } finally {
    loading.value = false;
  }
};

// 取消修改止码
const cancelEditEndReading = () => {
  editDialogVisible.value = false;
  currentEditingRow.value = null;
  newEndReading.value = '';
};

// 全选/取消全选
const handleSelectAll = (val) => {
  if (val) {
    // 全选当前页
    const tableComponent = document.querySelector('.el-table');
    if (tableComponent) {
      const checkboxes = tableComponent.querySelectorAll('.el-checkbox__input:not(.is-checked)');
      checkboxes.forEach(checkbox => checkbox.click());
    }
  } else {
    // 取消全选
    selectedRows.value = [];
  }
};

// 分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
};

// 当前页变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// 单个审核
const handleSingleReview = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认审核用户 ${row.userName} 的抄表记录吗？`,
      '审核确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    );
    
    loading.value = true;
    
    // 调用审核接口
    const res = await service.post('/manual/charge/review', {
      id: row.id,
      approved: true
    });
    
    if (res.code === 200) {
      ElMessage.success('审核成功');
      
      // 从列表中移除已审核的记录
      const index = reviewList.value.findIndex(item => item.id === row.id);
      if (index > -1) {
        reviewList.value.splice(index, 1);
      }
      
      // 如果在选中列表中，也移除
      const selectedIndex = selectedRows.value.findIndex(item => item.id === row.id);
      if (selectedIndex > -1) {
        selectedRows.value.splice(selectedIndex, 1);
      }
    } else {
      ElMessage.error(res.msg || '审核失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('审核错误:', error);
      ElMessage.error(error.message || '审核失败');
    }
  } finally {
    loading.value = false;
  }
};

// 批量审核
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
    
    // 调试日志：检查是否有有效的ID
    console.log('选中的记录:', selectedRows.value);
    console.log('审核IDs:', reviewIds);

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
      selectAll.value = false;
    } else {
      ElMessage.error(res.msg || '批量审核失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量审核错误详情:', error);
      console.error('错误响应:', error.response);
      console.error('错误消息:', error.message);

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

  &:hover {
    background-color: #f0f9ff;
    text-decoration: underline;
  }
}

// 止码编辑对话框样式
.end-reading-form {
  padding: 20px 10px;

  .info-text {
    font-size: 16px;
    color: #303133;
    font-weight: 500;

    &.highlight {
      color: #46b97e;
      font-weight: 600;
      font-size: 18px;
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 20px;

    .el-form-item__label {
      font-size: 16px;
      color: #606266;
      font-weight: 500;
    }

    .el-form-item__content {
      display: flex;
      align-items: center;
    }
  }

  :deep(.el-input) {
    .el-input__inner {
      height: 40px;
      line-height: 40px;
      font-size: 16px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 15px;

  .el-button {
    min-width: 100px;
    height: 40px;
    font-size: 16px;
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