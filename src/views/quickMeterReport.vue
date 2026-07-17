<template>
  <div class="quick-meter-report">
    <!-- 顶部搜索栏 -->
    <div class="search-header">
      <div class="search-form">
        <div class="form-item">
          <label class="form-label">水厂</label>
          <el-select
            v-model="searchParams.companyId"
            placeholder="请选择水厂"
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
            placeholder="请先选择水厂"
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

        <div class="form-actions">
          <el-button type="danger" @click="handleClearAll">
            <el-icon><Delete /></el-icon>
            <span>清空</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主体内容区 -->
    <div class="main-content">
      <!-- 左侧：用户列表区域 -->
      <div class="user-list-panel">
        <div class="panel-header">
          <h3>用户列表</h3>
          <el-input
            v-model="userSearchKeyword"
            placeholder="搜索用户名、用户号或地址"
            clearable
            style="width: 300px;"
            @input="handleUserSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <span class="result-count" v-if="userList.length > 0">
            共 {{ filteredUserList.length }} 个用户
          </span>
        </div>

        <div class="table-container">
          <el-table 
            :data="paginatedUserList"
            stripe
            border
            @selection-change="handleSelectionChange"
            v-loading="loading"
            height="800"
          >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column prop="userId" label="用户号" min-width="120" align="center" />
            <el-table-column prop="userName" label="用户名" min-width="120" align="center" />
            <el-table-column prop="address" label="地址" min-width="200" align="center" show-overflow-tooltip />
            <el-table-column prop="lastReading" label="上月数" min-width="120" align="center" />
          </el-table>

          <!-- 分页器 -->
          <div class="pagination-container" v-if="userList.length > 0">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="filteredUserList.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>

          <!-- 空数据提示 -->
          <div v-if="filteredUserList.length === 0 && !loading" class="empty-state">
            <el-empty description="暂无数据" />
          </div>
        </div>
      </div>

      <!-- 右侧：用户详情面板（始终存在） -->
      <div class="detail-panel">
        <!-- 未选中用户时显示空状态 -->
        <div v-if="!selectedUserDetail" class="detail-empty">
          <el-empty description="请选择一个用户查看详情" />
        </div>
        <!-- 选中用户后显示详情内容 -->
        <template v-else>
          <div class="panel-header">
            <h3>用户详情 - {{ selectedUserDetail.userName }}</h3>
            <el-button type="text" @click="closeDetailPanel">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>

          <div class="detail-content">
            <!-- 基本信息 -->
            <div class="info-section">
              <div class="section-title">基本信息</div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">用户号</span>
                  <span class="value">{{ selectedUserDetail.userId }}</span>
                </div>
                <div class="info-item">
                  <span class="label">用户名</span>
                  <span class="value">{{ selectedUserDetail.userName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">地址</span>
                  <span class="value">{{ selectedUserDetail.address }}</span>
                </div>
                <div class="info-item">
                  <span class="label">表号</span>
                  <span class="value">{{ selectedUserDetail.meterCode || '-' }}</span>
                </div>
              </div>
            </div>

            <!-- 抄表信息 -->
            <div class="reading-section">
              <div class="section-title">抄表信息</div>
              <div class="reading-grid">
                <div class="reading-item highlight">
                  <span class="label">上月读数</span>
                  <span class="value">{{ selectedUserDetail.lastReading }} 吨</span>
                </div>
                
                <!-- 抄表状态下拉框 -->
                <div class="reading-item">
                  <span class="label">抄表状态</span>
                  <el-select 
                    v-model="selectedUserDetail.reportStatus" 
                    placeholder="请选择抄表状态"
                    @change="handleReportStatusChange"
                  >
                    <el-option label="正常" value="正常" />
                    <el-option label="表数未动" value="表数未动" />
                    <el-option label="表不清" value="表不清" />
                    <el-option label="表破" value="表破" />
                    <el-option label="表埋" value="表埋" />
                    <el-option label="暂拆" value="暂拆" />
                    <el-option label="止码未到" value="止码未到" />
                    <el-option label="其他" value="其他" />
                    <el-option label="无人在家" value="无人在家" />
                  </el-select>
                </div>
                
                <!-- 本月读数（仅正常状态时显示） -->
                <div class="reading-item" v-if="selectedUserDetail.reportStatus === '正常'">
                  <span class="label">本月读数</span>
                  <el-input 
                    v-model="selectedUserDetail.currentReadingInput" 
                    type="number"
                    placeholder="请输入本月数"
                  />
                </div>
                
                <!-- 异常状态提示 -->
                <div class="reading-item abnormal-tip" v-else>
                  <span class="label">状态说明</span>
                  <span class="tip-text">当前选择“{{ selectedUserDetail.reportStatus }}”，不更新读数和余额，仅记录状态</span>
                </div>
                
                <div class="reading-item" v-if="selectedUserDetail.balance !== undefined">
                  <span class="label">当前余额</span>
                  <span class="value amount">{{ formatMoney(selectedUserDetail.balance) }} 元</span>
                </div>
              </div>
            </div>

            <!-- 最近抄表记录 -->
            <div class="history-section" v-if="reportHistory.length > 0">
              <div class="section-title">
                <el-icon><Document /></el-icon>
                <span>最近抄表记录</span>
              </div>
              <el-table
                :data="reportHistory"
                size="medium"
                stripe
                border
                max-height="440"
              >
                <el-table-column prop="createTime" label="抄表时间" min-width="140" align="center">
                  <template #default="{ row }">
                    {{ formatDate(row.createTime) }}
                  </template>
                </el-table-column>
                
                <!-- 根据 reportStatus 显示读数或状态 -->
                <el-table-column label="读数/状态" min-width="100" align="center">
                  <template #default="{ row }">
                    <span v-if="row.reportStatus && row.reportStatus !== '正常'" class="status-tag">
                      {{ row.reportStatus }}
                    </span>
                    <span v-else>{{ row.readingCount }} 吨</span>
                  </template>
                </el-table-column>
                
                <el-table-column prop="deltaWater" label="用水量" min-width="80" align="center">
                  <template #default="{ row }">
                    <span v-if="row.reportStatus && row.reportStatus !== '正常'">-</span>
                    <span v-else>{{ row.deltaWater }} 吨</span>
                  </template>
                </el-table-column>
                <el-table-column prop="feeThisTime" label="本次费用" min-width="90" align="center">
                  <template #default="{ row }">
                    <span v-if="row.reportStatus && row.reportStatus !== '正常'">-</span>
                    <span v-else>{{ formatMoney(row.feeThisTime) }} 元</span>
                  </template>
                </el-table-column>
                <el-table-column prop="balanceThisTime" label="扣费后余额" min-width="100" align="center">
                  <template #default="{ row }">
                    <span v-if="row.reportStatus && row.reportStatus !== '正常'">-</span>
                    <span v-else>{{ formatMoney(row.balanceThisTime) }} 元</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 提交按钮 -->
            <div class="action-buttons">
              <el-button 
                type="primary" 
                @click="submitSingleUser" 
                :disabled="!canSubmitSingle"
                size="large"
              >
                <el-icon><Upload /></el-icon>
                <span>提交该用户</span>
              </el-button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown, Close, Search, Document, Check, Upload, Delete } from '@element-plus/icons-vue';
import service from '@/api/request';

// 搜索参数
const searchParams = reactive({
  companyId: '', // 新增：水厂ID
  region: ''
});

// 水厂列表
const companyList = ref([]);

// 区域列表
const regionList = ref([]);

// 用户列表（原始数据）
const userList = ref([]);

// 用户搜索关键词
const userSearchKeyword = ref('');

// 分页相关
const currentPage = ref(1);
const pageSize = ref(20);

// 过滤后的用户列表（根据搜索关键词）
const filteredUserList = computed(() => {
  if (!userSearchKeyword.value.trim()) {
    return userList.value;
  }

  const keyword = userSearchKeyword.value.trim().toLowerCase();
  return userList.value.filter(user => {
    return (
      (user.userName && user.userName.toLowerCase().includes(keyword)) ||
      (user.userId && user.userId.toString().toLowerCase().includes(keyword)) ||
      (user.address && user.address.toLowerCase().includes(keyword))
    );
  });
});

// 分页后的用户列表
const paginatedUserList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredUserList.value.slice(start, end);
});

// 选中的用户
const selectedUsers = ref([]);

// 选中的用户详情
const selectedUserDetail = ref(null);

// 抄表历史记录
const reportHistory = ref([]);

// 加载状态
const loading = ref(false);

// 是否可以提交单个用户（正常状态需要输入本月数，异常状态不需要）
const canSubmitSingle = computed(() => {
  if (!selectedUserDetail.value) return false;
  
  // 如果没有选择抄表状态，不允许提交
  if (!selectedUserDetail.value.reportStatus) return false;
  
  // 如果是正常状态，必须输入本月数
  if (selectedUserDetail.value.reportStatus === '正常') {
    return !!selectedUserDetail.value.currentReadingInput;
  }
  
  // 异常状态可以直接提交
  return true;
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
      companyList.value = res.data || [];

      // 如果只有一个水厂，自动选中
      if (companyList.value.length === 1) {
        searchParams.companyId = companyList.value[0].companyId;
        handleCompanyChange(searchParams.companyId);
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
    userList.value = [];
    searchParams.region = '';
    return;
  }

  try {
    // 调用后端接口获取该水厂下的区域列表
    const res = await service.get(`/getRegion?companyId=${companyId}`);
    
    if (res.code === 200) {
      regionList.value = res.data || [];

      // 清空用户列表和选中的区域
      userList.value = [];
      searchParams.region = '';

      if (regionList.value.length > 0) {
        ElMessage.success(`已加载 ${regionList.value.length} 个区域`);
      } else {
        ElMessage.warning('该水厂下暂无区域');
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

// 区域变化时加载用户列表
const handleRegionChange = async (regionId) => {
  if (!regionId) {
    userList.value = [];
    return;
  }

  loading.value = true;
  try {
    // 调用后端接口获取用户列表
    const res = await service.get(`/manual/charge/getUserListByRegion?regionId=${regionId}`);
    
    if (res.code === 200) {
      // 处理返回的数据，添加 currentReadingInput 和 reportStatus 字段
      userList.value = (res.data || []).map(user => ({
        userId: user.userId,
        userName: user.userName,
        address: user.userAddr,
        lastReading: user.lastReading || 0,
        currentReading: null,
        currentReadingInput: '',
        meterCode: user.meterCode || '',
        balance: user.balance || 0,
        reportStatus: '正常' // 默认选择正常状态
      }));
      
      ElMessage.success(`已加载 ${userList.value.length} 个用户`);
    } else {
      ElMessage.error(res.msg || '获取用户列表失败');
      userList.value = [];
    }
  } catch (error) {
    console.error('加载用户列表错误:', error);

    // 如果接口不存在，给出明确提示
    if (error.response?.status === 404) {
      ElMessage.error('用户列表接口未找到，请确认后端服务已启动并包含最新代码');
      userList.value = [];
    } else {
      ElMessage.error(error.message || '加载用户列表失败');
      userList.value = [];
    }
  } finally {
    loading.value = false;
  }
};

// 用户搜索处理函数
const handleUserSearch = () => {
  // 重置到第一页
  currentPage.value = 1;
  
  // 清空选中状态，因为过滤后可能不包含之前选中的用户
  // 只在搜索结果为空时才清空选中状态
  if (filteredUserList.value.length === 0) {
    selectedUsers.value = [];
    closeDetailPanel();
  } else {
    // 如果搜索结果不为空，尝试保留已选中的用户
    const stillSelected = selectedUsers.value.filter(user =>
      filteredUserList.value.includes(user)
    );

    if (stillSelected.length !== selectedUsers.value.length) {
      // 如果有用户不在搜索结果中，需要更新选中状态
      selectedUsers.value = stillSelected;

      // 如果只选中一个用户，重新加载抄表记录
      if (stillSelected.length === 1) {
        loadReportHistory(stillSelected[0].userId);
      } else {
        closeDetailPanel();
      }
    }
  }
};

// 选择用户变化
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection;
  
  // 如果只选中一个用户，显示详情面板并加载抄表记录
  if (selection.length === 1) {
    // 使用深拷贝确保响应式
    selectedUserDetail.value = JSON.parse(JSON.stringify(selection[0]));
    loadReportHistory(selection[0].userId);
  } else if (selection.length === 0) {
    selectedUserDetail.value = null;
    reportHistory.value = [];
  } else {
    // 选中多个用户时，不显示详情面板
    selectedUserDetail.value = null;
    reportHistory.value = [];
  }
};

// 分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1; // 重置到第一页
};

// 当前页变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
};

// 加载用户抄表记录
const loadReportHistory = async (userId) => {
  if (!userId) {
    reportHistory.value = [];
    return;
  }

  try {
    const res = await service.get(`/manual/charge/getUserReportHistory?userId=${userId}`);

    if (res.code === 200) {
      reportHistory.value = res.data || [];
    } else {
      reportHistory.value = [];
    }
  } catch (error) {
    console.error('加载抄表记录错误:', error);
    reportHistory.value = [];
  }
};

// 关闭详情面板
const closeDetailPanel = () => {
  selectedUserDetail.value = null;
  reportHistory.value = [];
};

// 清空所有数据
const handleClearAll = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有数据吗？这将清除选中的用户、搜索条件和用户列表。',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // 清空选中状态
    selectedUsers.value = [];
    selectedUserDetail.value = null;
    reportHistory.value = [];
    
    // 清空搜索条件
    searchParams.companyId = '';
    searchParams.region = '';
    userSearchKeyword.value = '';
    
    // 清空列表
    userList.value = [];
    regionList.value = [];
    
    // 重置分页
    currentPage.value = 1;
    pageSize.value = 20;
    
    ElMessage.success('已清空所有数据');
  } catch (error) {
    // 用户取消操作
  }
};

// 抄表状态变化处理
const handleReportStatusChange = (status) => {
  if (!selectedUserDetail.value) return;
  
  // 如果切换到正常状态，清空本月数输入
  if (status === '正常') {
    selectedUserDetail.value.currentReadingInput = '';
  }
};

// 提交单个用户
const submitSingleUser = async () => {
  if (!selectedUserDetail.value) {
    ElMessage.warning('请先选择用户');
    return;
  }
  
  // 如果没有选择抄表状态，不允许提交
  if (!selectedUserDetail.value.reportStatus) {
    ElMessage.warning('请选择抄表状态');
    return;
  }

  if (!selectedUserDetail.value.meterCode) {
    ElMessage.warning('该用户未绑定水表');
    return;
  }
  
  // 如果是正常状态，必须输入本月数
  if (selectedUserDetail.value.reportStatus === '正常' && !selectedUserDetail.value.currentReadingInput) {
    ElMessage.warning('请输入本月数');
    return;
  }

  loading.value = true;
  try {
    // 构建提交数据
    const submitData = {
      meterCode: selectedUserDetail.value.meterCode,
      reportStatus: selectedUserDetail.value.reportStatus
    };
    
    // 只有正常状态才传递 endRead 参数
    if (selectedUserDetail.value.reportStatus === '正常') {
      submitData.endRead = selectedUserDetail.value.currentReadingInput;
    }
    
    // 调用后端接口提交单个用户
    const res = await service.post('/manual/charge/submit', submitData);
    
    if (res.code === 200) {
      let successMsg = `用户 ${selectedUserDetail.value.userName} 提交成功`;
      if (selectedUserDetail.value.reportStatus !== '正常') {
        successMsg += `（状态：${selectedUserDetail.value.reportStatus}）`;
      }
      ElMessage.success(successMsg);
      
      // 更新列表中的本月数和余额（仅正常状态）
      if (selectedUserDetail.value.reportStatus === '正常') {
        const userInList = userList.value.find(u => u.userId === selectedUserDetail.value.userId);
        if (userInList) {
          userInList.currentReading = selectedUserDetail.value.currentReadingInput;
          userInList.balance = res.data.newBalance || userInList.balance;
        }
      }
      
      // 关闭详情面板
      closeDetailPanel();
    } else {
      ElMessage.error(res.msg || '提交失败');
    }
  } catch (error) {
    console.error('提交用户错误:', error);
    ElMessage.error(error.message || '提交失败');
  } finally {
    loading.value = false;
  }
};

// 初始化
fetchCompanyList();
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

.quick-meter-report {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
  background-color: #f5f7fa;
  padding: 20px;
  gap: 20px;

  // 顶部搜索栏
  .search-header {
    background-color: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

    .search-form {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;

      .form-item {
        display: flex;
        align-items: center;
        gap: 10px;

        .form-label {
          font-size: 20px;
          color: #606266;
          white-space: nowrap;

          &.required::before {
            content: '* ';
            color: #f56c6c;
          }
        }

        :deep(.el-select),
        :deep(.el-input) {
          width: 200px;
        }
      }

      .form-actions {
        margin-left: auto;
      }
    }
  }

  // 主体内容区
  .main-content {
    display: flex;
    flex-direction: row;
    gap: 20px;
    flex: 1;
    overflow: hidden;

    // 用户列表面板（左侧）
    .user-list-panel {
      flex: 1;
      min-width: 0;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid #ebeef5;

        h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #303133;
        }

        .result-count {
          font-size: 20px;
          color: #909399;
        }
      }

      .table-container {
        flex: 1;
        overflow: hidden;
        padding: 20px;
        display: flex;
        flex-direction: column;
        min-height: 0; // 关键：防止flex溢出

        .empty-state {
          padding: 40px 0;
        }

        // 分页器样式
        .pagination-container {
          margin-top: auto; // 自动推到底部
          display: flex;
          justify-content: center;
          padding: 8px 0;
          flex-shrink: 0; // 防止被压缩
          background-color: #fff; // 确保可见
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); // 添加阴影使其更明显
        }
      }
    }

    // 详情面板（右侧，始终存在）
    .detail-panel {
      flex: 0 0 60%;
      min-width: 0;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      // 空状态居中显示
      .detail-empty {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid #ebeef5;

        h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #303133;
        }
      }

      .detail-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 20px;

        // 基本信息区域
        .info-section {
          .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 16px;
            padding-bottom: 10px;
            border-bottom: 2px solid #46b97e;
          }

          .info-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;

            .info-item {
              display: flex;
              align-items: center;
              padding: 8px 12px;
              background-color: #f9f9f9;
              border-radius: 6px;
              flex: 1;
              min-width: 200px;

              &.full-width {
                flex-basis: 100%;
              }

              .label {
                width: 70px;
                font-size: 20px;
                color: #909399;
                flex-shrink: 0;
              }

              .value {
                flex: 1;
                font-size: 20px;
                color: #303133;
                font-weight: 500;
                word-break: break-all;
              }
            }
          }
        }

        // 抄表信息区域
        .reading-section {
          .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 16px;
            padding-bottom: 10px;
            border-bottom: 2px solid #46b97e;
          }

          .reading-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;

            .reading-item {
              display: flex;
              align-items: center;
              padding: 12px;
              background-color: #f9f9f9;
              border-radius: 6px;
              flex: 1;
              min-width: 200px;

              .label {
                width: 80px;
                font-size: 20px;
                color: #909399;
                flex-shrink: 0;
              }

              .value {
                flex: 1;
                font-size: 20px;
                color: #303133;
                font-weight: 500;

                &.amount {
                  color: #46b97e;
                  font-weight: 600;
                  font-size: 20px;
                }
              }

              &.highlight {
                .value {
                  color: #46b97e;
                  font-weight: 600;
                  font-size: 20px;
                }
              }

              :deep(.el-input) {
                flex: 1;
              }
              
              :deep(.el-select) {
                flex: 1;
              }
              
              // 异常状态提示样式
              &.abnormal-tip {
                background-color: #fef0f0;
                border-left: 3px solid #f56c6c;
                
                .tip-text {
                  font-size: 20px;
                  color: #f56c6c;
                  line-height: 1.5;
                }
              }
            }
          }
        }

        // 抄表记录区域
        .history-section {
          .section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 20px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 16px;
            padding-bottom: 10px;
            border-bottom: 2px solid #46b97e;

            .el-icon {
              color: #46b97e;
            }
          }

          :deep(.el-table) {
            font-size: 20px;

            .el-table__header th {
              background-color: #f5f7fa;
              font-weight: 600;
              color: #606266;
            }

            .el-table__body td {
              color: #606266;
            }
            
            // 状态标签样式
            .status-tag {
              display: inline-block;
              padding: 2px 8px;
              background-color: #fff1f0;
              color: #f56c6c;
              border-radius: 4px;
              font-size: 16px;
              font-weight: 500;
            }
          }
        }

        // 操作按钮
        .action-buttons {
          display: flex;
          justify-content: center;
          padding: 10px 0 10px;
          border-top: 1px solid #ebeef5;

          :deep(.el-button) {
            min-width: 180px;
            height: 44px;
            font-size: 20px;
          }
        }
      }
    }
  }
}

// 响应式适配
@media (max-width: 1200px) {
  .quick-meter-report {
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

    .main-content {
      gap: 16px;
      
      // 中等屏幕改为上下结构
      flex-direction: column;
      
      .detail-panel {
        max-height: 500px;
        flex: 0 0 auto;

        .detail-content {
          .info-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .quick-meter-report {
    padding: 12px;
    gap: 12px;

    .search-header {
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
    }

    .main-content {
      // 小屏幕保持上下结构
      flex-direction: column;
      
      .user-list-panel {
        min-height: 300px;

        .panel-header {
          flex-wrap: wrap;
          gap: 12px;

          h3 {
            font-size: 20px;
          }

          .result-count {
            font-size: 20px;
          }
        }

        .table-container {
          padding: 12px;
        }
      }

      .detail-panel {
        min-height: 200px;
        max-height: 400px;

        .detail-content {
          padding: 12px;

          .info-section {
            .info-grid {
              grid-template-columns: 1fr;
            }
          }
        }
      }
    }
  }
}
</style>