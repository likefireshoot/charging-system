<template>
  <div class="quick-meter-report">
    <!-- 顶部搜索栏 -->
    <div class="search-header">
      <div class="search-content">
        <div class="search-input">
          <span>水厂</span>
<!--          <span class="company-name">{{ currentCompanyName }}</span>-->
          <el-input v-model="currentCompanyName" disabled />
        </div>

        <div class="search-input">
          <span>区域</span>
          <el-select
            v-model="searchParams.region"
            placeholder="选择区域"
            clearable
            @change="handleRegionChange"
            :disabled="!currentCompanyId"
            class="codebook-select"
            filterable
            :filter-method="(val) => filterRegion(val)"
          >
            <el-option
              v-for="item in regionList"
              :key="item.regionId"
              :label="item.regionName"
              :value="item.regionId"
            />
          </el-select>
        </div>

        <div class="search-input">
          <span>表册</span>
          <el-select
            v-model="searchParams.codeBook"
            placeholder="选择表册"
            clearable
            @change="handleCodeBookChange"
            :disabled="!currentCompanyId || !searchParams.region"
            class="codebook-select"
            filterable
            :filter-method="(val) => filterCodeBook(val)"
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

        <div class="buttons">
          <el-button class="clear-btn" @click="handleClearAll">
            <img src="@/assets/yuangong/icon4.png" alt="" />
            <span style="margin-left:10%; color: #5a5a5a">清空</span>
          </el-button>
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
          <div class="auto-jump-control">
            <el-checkbox v-model="autoJumpEnabled" size="large">
              <span class="checkbox-label">自动跳变</span>
            </el-checkbox>
          </div>
        </div>

        <div class="table-container">
          <el-table 
            :data="paginatedUserList"
            stripe
            border
            @row-click="handleRowClick"
            v-loading="loading"
            highlight-current-row
          >
            <el-table-column label="选择" width="65" align="center">
              <template #default="{ row }">
                <el-radio
                  v-model="selectedUserId"
                  :label="row.userId"
                  @change="handleRadioChange(row)"
                >
                  &nbsp;
                </el-radio>
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号" min-width="65" align="center" />
            <el-table-column prop="userId" label="用户号" min-width="120" align="center">
              <template #default="{ row }">
                <span>{{ maskUserId(row.userId) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="userName" label="用户名" min-width="120" align="center" />
            <el-table-column prop="lastReading" label="上月数" min-width="120" align="center" />
            <el-table-column prop="currentReading" label="本月数" min-width="120" align="center">
              <template #default="{ row }">
                <span>{{ row.currentReading || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="address" label="地址" min-width="200" align="center"/>
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

<!--          &lt;!&ndash; 空数据提示 &ndash;&gt;-->
<!--          <div v-if="filteredUserList.length === 0 && !loading" class="empty-state">-->
<!--            <el-empty description="暂无数据" />-->
<!--          </div>-->
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
          </div>

          <div class="detail-content">
            <!-- 基本信息 -->
            <div class="info-section">
              <div class="section-title">基本信息</div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">用户号</span>
                  <span class="value">{{ maskUserId(selectedUserDetail.userId) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">用户名</span>
                  <span class="value">{{ selectedUserDetail.userName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">电话</span>
                  <span class="value">{{ selectedUserDetail.userPhone || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">表号</span>
                  <span class="value">{{ selectedUserDetail.meterCode || '-' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">地址</span>
                  <span class="value">{{ selectedUserDetail.address }}</span>
                </div>
              </div>
            </div>

            <!-- 抄表数据 -->
            <div class="reading-section">
              <div class="section-title">抄表数据</div>
              <div class="reading-grid">
                <!-- 抄表状态单选组 - 放在最上方，先选状态 -->
                <div class="reading-item status-row full-width">
                  <span class="label">抄表状态</span>
                  <el-radio-group v-model="selectedUserDetail.reportStatus" @change="handleReportStatusChange">
                    <el-radio label="正常">正常</el-radio>
                    <el-radio label="表数未动">表数未动</el-radio>
                    <el-radio label="表不清">表不清</el-radio>
                    <el-radio label="表破">表破</el-radio>
                    <el-radio label="表埋">表埋</el-radio>
                    <el-radio label="暂拆">暂拆</el-radio>
                    <el-radio label="止码未到">止码未到</el-radio>
                    <el-radio label="无人在家">无人在家</el-radio>
                    <el-radio label="其他">其他</el-radio>
                  </el-radio-group>
                </div>

                <div class="reading-item highlight">
                  <span class="label">上月读数</span>
                  <span class="value">{{ selectedUserDetail.lastReading }} 吨</span>
                </div>

                <!-- 本月读数（仅正常状态时显示，默认带上月读数，回车提交） -->
                <div class="reading-item highlight" v-if="selectedUserDetail.reportStatus === '正常'">
                  <span class="label">本月读数</span>
                  <el-input
                    ref="currentReadingRef"
                    v-model="selectedUserDetail.currentReadingInput"
                    type="text"
                    inputmode="decimal"
                    placeholder="请输入本月数"
                    @input="handleCurrentReadingInput"
                    @keyup.enter="submitSingleUser"
                    class="current-reading-input"
                  />
                </div>

                <!-- 异常状态提示 -->
                <div class="reading-item  abnormal-tip" v-else>
                  <span class="label">状态说明</span>
                  <span class="tip-text">当前选择“{{ selectedUserDetail.reportStatus }}”，按回车提交</span>
                </div>

                <div class="reading-item highlight" v-if="selectedUserDetail.reportStatus === '正常'">
                  <span class="label" style="width: 100px">本月用水量</span>
                  <span class="value amount">{{ formatMoney(waterUsage) }} 吨</span>
                </div>
              </div>

              <!-- 提交按钮 - 移到抄表信息区域底部 -->
              <div class="action-buttons-inline" style="display: flex; justify-content: center">
                <el-button
                  class="submit-btn"
                  @click="submitSingleUser"
                  :disabled="!canSubmitSingle"
                >
                  <el-icon><Upload /></el-icon>
                  <span>提交该用户</span>
                </el-button>
              </div>
            </div>

            <!-- 抄表记录 -->
            <div class="history-section" v-if="reportHistory.length > 0">
              <div class="section-title">
<!--                <el-icon><Document /></el-icon>-->
                <span>抄表记录</span>
              </div>
              <el-table
                :data="reportHistory"
                size="medium"
                stripe
                border
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

          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown, Close, Search, Document, Check, Upload, Delete } from '@element-plus/icons-vue';
import service from '@/api/request';

const router = useRouter();

// 搜索参数
const searchParams = reactive({
  companyId: '', // 新增：水厂ID
  region: '',
  codeBook: ''
});

// 当前登录用户的公司信息
const currentCompanyId = ref(null);
const currentCompanyName = ref('');

// 水厂列表
const companyList = ref([]);

// 区域列表
const regionList = ref([]);

// 表册列表（全量，用于前端过滤）
const allCodeBookList = ref([]);
// 表册列表（过滤后用于显示）
const codeBookList = ref([]);

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

// 选中的用户ID（单选）
const selectedUserId = ref(null);

// 选中的用户详情
const selectedUserDetail = ref(null);

// 抄表历史记录
const reportHistory = ref([]);

// 本月读数输入框引用（用于回车后聚焦）
const currentReadingRef = ref(null);

// 加载状态
const loading = ref(false);

// 自动跳变开关
const autoJumpEnabled = ref(false);

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

// 本月用水量 = 本月读数 - 上月读数
const waterUsage = computed(() => {
  if (!selectedUserDetail.value) return 0;
  const current = parseFloat(selectedUserDetail.value.currentReadingInput);
  const last = parseFloat(selectedUserDetail.value.lastReading);
  if (isNaN(current) || isNaN(last)) return 0;
  return Math.max(0, current - last);
});

// 用户号脱敏：不展示前三位
const maskUserId = (userId) => {
  if (!userId) return '-';
  const str = userId.toString();
  return str.length > 3 ? str.slice(3) : str;
};

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

      // 根据当前登录用户的 companyId 设置水厂名称
      const currentUserCompany = allCompanies.find(company => company.companyId === currentCompanyId.value);
      if (currentUserCompany) {
        currentCompanyName.value = currentUserCompany.companyName;
        searchParams.companyId = currentCompanyId.value;

        // 自动加载该水厂的表册列表
        handleCompanyChange(currentCompanyId.value);
      } else {
        currentCompanyName.value = '-';
      }

      // 如果 companyId !== 1，只显示当前用户所在的水厂
      if (currentCompanyId.value && currentCompanyId.value !== 1) {
        allCompanies = allCompanies.filter(company => company.companyId === currentCompanyId.value);
      }

      companyList.value = allCompanies;
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
    allCodeBookList.value = [];
    codeBookList.value = [];
    userList.value = [];
    searchParams.region = '';
    searchParams.codeBook = '';
    return;
  }

  try {
    const res = await service.get(`/getRegion?companyId=${companyId}`);

    if (res.code === 200) {
      const allRegions = res.data || [];

      // 洪湖峰口（companyId=95）：放行全部区域，不做普表筛选
      if (companyId === 95) {
        regionList.value = allRegions;
      } else {
        // 其他水厂：仅筛选普表区域（名称含"普表"历史兼容，或 regionType === 3）
        regionList.value = allRegions.filter(region =>
          (region.regionName && region.regionName.includes('普表')) || region.regionType === 3
        );
      }

      if (regionList.value.length === 0) {
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

  // 清空用户列表、表册和选中项
  userList.value = [];
  allCodeBookList.value = [];
  codeBookList.value = [];
  searchParams.region = '';
  searchParams.codeBook = '';
};

// 区域变化时加载表册列表（按区域过滤）
const handleRegionChange = async (regionId) => {
  searchParams.codeBook = '';
  userList.value = [];

  if (!regionId) {
    allCodeBookList.value = [];
    codeBookList.value = [];
    return;
  }

  try {
    const res = await service.get(`/getCodeBookByRegion?companyId=${searchParams.companyId}&regionId=${regionId}`);

    if (res.code === 200) {
      allCodeBookList.value = res.data || [];
      codeBookList.value = allCodeBookList.value;

      if (allCodeBookList.value.length === 0) {
        ElMessage.warning('该区域下暂无表册');
      } else if (allCodeBookList.value.length === 1) {
        // 只有一个表册时自动选中，并加载该表册下的用户
        const onlyCodeBook = allCodeBookList.value[0];
        searchParams.codeBook = onlyCodeBook.codeBookId;
        handleCodeBookChange(onlyCodeBook.codeBookId);
      }
    } else {
      ElMessage.error(res.msg || '获取表册列表失败');
      allCodeBookList.value = [];
      codeBookList.value = [];
    }
  } catch (error) {
    console.error('获取表册列表错误:', error);
    ElMessage.error('网络请求失败');
    allCodeBookList.value = [];
    codeBookList.value = [];
  }
};

// 表册下拉框前端过滤（输入关键字只显示匹配的表册）
const filterCodeBook = (val) => {
  if (!val) {
    codeBookList.value = allCodeBookList.value;
    return;
  }
  const keyword = val.toLowerCase();
  codeBookList.value = (allCodeBookList.value || []).filter(item =>
    (item.codeBookName && item.codeBookName.toLowerCase().includes(keyword)) ||
    (item.codeBookId != null && item.codeBookId.toString().includes(keyword))
  );
};

// 区域下拉框前端过滤（el-select filterable 由组件内置完成，无需自定义逻辑）
const filterRegion = () => {};

// 表册变化时加载用户列表
const handleCodeBookChange = async (codeBookId) => {
  if (!codeBookId) {
    userList.value = [];
    return;
  }

  loading.value = true;
  try {
    const res = await service.get(`/manual/charge/getUserListByCodeBook?codeBookId=${codeBookId}`);

    if (res.code === 200) {
      userList.value = (res.data || []).map(user => ({
        userId: user.userId,
        userName: user.userName,
        address: user.userAddr,
        userPhone: user.userPhone || '',
        lastReading: user.lastReading || 0,
        currentReading: user.currentReading ?? null,   // 读取后端本月数
        // 本月读数不再默认填充，让用户手动输入
        currentReadingInput: '',
        meterCode: user.meterCode || '',
        balance: user.balance || 0,
        reportStatus: '正常'
      }));

      // 自动选中第一个用户
      if (userList.value.length > 0) {
        const firstUser = userList.value[0];
        selectedUserId.value = firstUser.userId;
        loadUserDetail(firstUser);
      }
    } else {
      ElMessage.error(res.msg || '获取用户列表失败');
      userList.value = [];
    }
  } catch (error) {
    console.error('加载用户列表错误:', error);

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
  if (filteredUserList.value.length === 0) {
    selectedUserId.value = null;
    closeDetailPanel();
  } else {
    // 如果搜索结果不为空，检查当前选中的用户是否还在结果中
    const currentSelected = filteredUserList.value.find(user => user.userId === selectedUserId.value);

    if (!currentSelected && selectedUserId.value) {
      // 选中的用户不在搜索结果中，清空选中状态
      selectedUserId.value = null;
      closeDetailPanel();
    }
  }
};

// 行点击事件
const handleRowClick = (row) => {
  selectedUserId.value = row.userId;
  loadUserDetail(row);
};

// 单选按钮变化事件
const handleRadioChange = (row) => {
  loadUserDetail(row);
};

// 加载用户详情
const loadUserDetail = (user) => {
  // 使用深拷贝确保响应式
  selectedUserDetail.value = JSON.parse(JSON.stringify(user));
  loadReportHistory(user.userId);

  // 详情加载后，若处于正常状态则自动聚焦本月读数输入框
  if (selectedUserDetail.value.reportStatus === '正常') {
    nextTick(() => {
      currentReadingRef.value?.focus();
    });
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
    selectedUserId.value = null;
    selectedUserDetail.value = null;
    reportHistory.value = [];
    
    // 清空搜索条件
    searchParams.companyId = '';
    searchParams.region = '';
    searchParams.codeBook = '';
    userSearchKeyword.value = '';

    // 清空列表
    userList.value = [];
    regionList.value = [];
    allCodeBookList.value = [];
    codeBookList.value = [];
    
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

  // 切换到正常状态时，本月读数保持空，让用户手动输入
  if (status === '正常') {
    selectedUserDetail.value.currentReadingInput = '';
    nextTick(() => {
      currentReadingRef.value?.focus();
    });
  } else {
    // 异常状态提交时不需要读数
    selectedUserDetail.value.currentReadingInput = '';
  }
};

// 处理本月读数输入（只允许数字和小数点）
const handleCurrentReadingInput = (value) => {
  // 移除非数字和非小数点的字符
  let newValue = value.replace(/[^\d.]/g, '');

  // 确保只有一个小数点
  const parts = newValue.split('.');
  if (parts.length > 2) {
    newValue = parts[0] + '.' + parts.slice(1).join('');
  }

  // 更新值
  if (selectedUserDetail.value) {
    selectedUserDetail.value.currentReadingInput = newValue;
  }
};

// 提交单个用户（改为提交到审核表）
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
    
    // 调用后端接口提交到审核表
    const res = await service.post('/manual/charge/submitForReview', submitData);
    
    if (res.code === 200) {

      ElMessage.success('抄表数据提交成功');

      // 更新列表中的本月数和余额（仅正常状态）
      if (selectedUserDetail.value.reportStatus === '正常') {
        const userInList = userList.value.find(u => u.userId === selectedUserDetail.value.userId);
        if (userInList) {
          userInList.currentReading = parseFloat(selectedUserDetail.value.currentReadingInput) || null;
          userInList.waterUsage = waterUsage.value;
        }
      }
      
      // 关闭详情面板
      // closeDetailPanel();

      // 如果开启了自动跳变，选中下一个用户
      if (autoJumpEnabled.value) {
        selectNextUser();
      }
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

// 选中下一个用户
const selectNextUser = () => {
  if (!selectedUserId.value || filteredUserList.value.length === 0) {
    return;
  }

  // 找到当前选中的用户在过滤后列表中的索引（使用过滤后的列表）
  const currentIndex = filteredUserList.value.findIndex(user => user.userId === selectedUserId.value);

  if (currentIndex === -1) {
    return;
  }

  // 计算下一个用户的索引
  const nextIndex = currentIndex + 1;

  // 如果还有下一个用户，选中它
  if (nextIndex < filteredUserList.value.length) {
    const nextUser = filteredUserList.value[nextIndex];
    selectedUserId.value = nextUser.userId;
    loadUserDetail(nextUser);

    // 如果在分页列表中看不到下一个用户，调整当前页
    const currentPageFirstIndex = (currentPage.value - 1) * pageSize.value;
    const currentPageLastIndex = currentPageFirstIndex + pageSize.value - 1;

    if (nextIndex > currentPageLastIndex) {
      // 下一页
      currentPage.value++;
    }
  } else {
    // 已经是最后一个用户，清空选中状态
    selectedUserId.value = null;
    closeDetailPanel();
    ElMessage.info('已是最后一个用户');
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
  align-content: center;
  justify-content: center;
  min-width: 94%;
  height: 100%;
  padding: 0 15px;

  // 顶部搜索栏
  .search-header {
    margin-top: 5px;
    margin-bottom: 10px;
    width: 99.3%;
    height: 98px;
    padding: 0px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;
    border: 1px solid #e9e9e9;
    border-radius: 5px;
    background-color: #fff;

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
          font-size: 24px;
          color: #606266;
          white-space: nowrap;

          &.required::before {
            content: '* ';
            color: #f56c6c;
          }
        }

        :deep(.el-select) {
          width: 300px; /* 区域、表册下拉框宽度，200 * 1.5 */
        }

        :deep(.el-input) {
          width: 200px;
        }

        // 水厂名称样式
        .company-name {
          font-size: 24px;
          color: #303133;
          font-weight: 500;
          min-width: 150px;
          display: inline-block;
        }
      }

      .form-actions {
        margin-left: auto;
      }
    }

    //// 区域下拉框专用样式 - 针对 el-select 的正确结构
    //:deep(.codebook-select) {
    //  // 下拉框整体容器高度
    //  .el-select__wrapper {
    //    min-height: 40px !important;
    //    padding: 0 20px !important;
    //    border-radius: 8px !important;
    //  }
    //
    //  // 选中项/占位符文字样式
    //  .el-select__selected-item,
    //  .el-select__placeholder {
    //    font-size: 24px !important;
    //    height: 40px !important;
    //    line-height: 40px !important;
    //    color: #606266 !important;
    //  }
    //
    //  // 下拉箭头图标
    //  .el-select__caret {
    //    font-size: 36px !important;
    //  }
    //
    //  // 下拉选项列表中的每一项
    //  .el-select-dropdown__item {
    //    font-size: 36px !important;
    //    height: 60px !important;
    //    line-height: 60px !important;
    //  }
    //}
  }

  // 主体内容区
  .main-content {
    display: flex;
    flex-direction: row;
    gap: 0 10px;
    flex: 1;
    overflow: hidden;
    width: 100%;
    height: calc(100% - 120px);
    margin-bottom: 0px;

    // 用户列表面板（左侧）
    .user-list-panel {
      flex: 1;
      min-width: 0;
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
        padding: 10px 15px 5px;
        border-bottom: 1px solid #ebeef5;

        h3 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #303133;
        }

        .result-count {
          font-size: 20px;
          color: #909399;
        }

        // 自动跳变控制调整
        .auto-jump-control {
          display: flex;
          align-items: center;

          :deep(.el-checkbox__label) {
            font-size: 20px;
            font-weight: 500;
            color: #303133;
          }

          :deep(.el-checkbox__inner) {
            width: 22px;
            height: 22px;
            border: 1px solid #acacac;
          }
        }
      }
      :deep(.el-table) {
        font-size: 20px;

        .el-table__header th {
          background-color: #46b97e;
          font-weight: 600;
          color: #fff;
        }
      }

      .table-container {
        flex: 1;
        overflow: hidden;
        padding: 10px;
        display: flex;
        flex-direction: column;
        height: calc(100% - 100px);

        .empty-state {
          padding: 40px 0;
        }

        // 分页器样式
        .pagination-container {
          display: flex;
          justify-content: center;
          flex-shrink: 0; // 防止被压缩
          margin-top: 10px;
        }
      }
    }

    // 详情面板（右侧，始终存在）
    .detail-panel {
      flex: 0 0 50%;
      min-width: 0;
      background-color: #fff;
      border: 1px solid #e9e9e9;
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
        padding: 12px 15px 8px;
        border-bottom: 1px solid #ebeef5;
        flex-shrink: 0;

        h3 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #303133;
        }
      }

      .detail-content {
        flex: 1;
        padding: 12px 15px 5px;
        display: flex;
        flex-direction: column;
        gap: 15px;
        min-height: 0;
        overflow: hidden;

        &::-webkit-scrollbar {
          width: 8px;
        }

        &::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        &::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;

          &:hover {
            background: #a8a8a8;
          }
        }

        // 基本信息区域
        .info-section {
          .section-title {
            font-size: 24px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 12px;
            padding-bottom: 5px;
            border-bottom: 2px solid #46b97e;
          }

          .info-grid {
            display: grid;
            // 网格列定义：
            // 用户号(1fr) | 用户名(1fr) | 电话(1fr)
            // 表号(1fr)   | 地址(占2fr)
            grid-template-columns: 1fr 1fr 1fr;
            gap: 12px;

            // 表号 和 用户号 同宽（已经都是1fr自动相等）
            // 地址 横跨【用户号+用户名】两列，宽度 = 用户号+用户名总和
            .info-item:nth-child(5) {
              grid-column: 2 / span 2;
            }

            .info-item {
              display: flex;
              align-items: center;
              padding: 8px 12px;
              background-color: #f9f9f9;
              border-radius: 6px;

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
            font-size: 24px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 12px;
            padding-bottom: 5px;
            border-bottom: 2px solid #46b97e;
          }

          .reading-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;

            .reading-item {
              display: flex;
              align-items: center;
              padding: 8px 12px;
              background-color: #f9f9f9;
              border-radius: 6px;
              flex: 1;
              min-width: 200px;
              gap: 15px;

              &.full-width {
                flex-basis: 100%;
              }

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
                height: 60px;

                .value {
                  color: #46b97e;
                  font-weight: 600;
                  font-size: 20px;
                }
              }

              :deep(.el-input) {
                flex: 1;
              }

              :deep(.current-reading-input .el-input__inner) {
                height: 40px !important;
                font-size: 20px !important;
              }
              
              :deep(.el-select) {
                flex: 1;
              }
              
              // 状态单选组样式
              &.status-row {
                flex-direction: column;
                gap: 5px;
                .label {
                  align-self: flex-start;
                }
                
                :deep(.el-radio-group) {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 5px 30px;
                  flex: 1;
                  align-self: flex-start;
                }
                
                :deep(.el-radio) {
                  margin-right: 0;
                  font-size: 20px;
                }
                
                :deep(.el-radio__inner) {
                  width: 18px;
                  height: 18px;
                  border: 2px solid #bcbcbc;
                  background-color: #fff;
                }

                :deep(.el-radio__input.is-checked .el-radio__inner) {
                  border-color: #46b97e;
                  background-color: #46b97e;
                }
                
                :deep(.el-radio__label) {
                  font-size: 20px;
                  color: #303133;
                  padding-left: 8px;
                }
              }
              
              // 异常状态提示样式
              &.abnormal-tip {
                background-color: #fef0f0;
                
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
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 120px;

          .section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 24px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 12px;
            padding-bottom: 5px;
            border-bottom: 2px solid #46b97e;


            .el-icon {
              color: #46b97e;
            }
          }

          :deep(.el-table) {
            flex: 1;
            font-size: 20px;

            .el-table__header th {
              background-color: #46b97e;
              font-weight: 600;
              color: #fff;
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
          display: none;
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
          :deep(.el-select) {
            width: 270px; /* 区域、表册下拉框宽度，180 * 1.5 */
          }

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
      // 小屏幕上下结构
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
.search-content {
  display: flex;
  width: 80%;
  height: 100%;
}

.search-input {
  display: flex;
  justify-content: center;
  /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 18%;
  height: 100%;
  margin-right: 10px;
}

.search-input>span {
  font-size: 18px;
  margin-bottom: 5px;
}
.buttons {
  display: flex;
  width: 110px;
  height: 100%;
  align-items: center;
}

.buttons > * {
  width: 100px;
  margin-right: 10px;
}

.clear-btn {
  display: flex;
  align-items: center;
  height: 32px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  color: #fff;
  font-size: 18px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
  margin-right: 10px;
}

.submit-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #66b1ff 0%, #409EFF 55%, #2589f5 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 20px;
  font-weight: bold;
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.28);
  transition: all 0.3s;
  margin-top: 10px;
  height: 40px;
}
.submit-btn:hover {
  background: linear-gradient(135deg, #79bbff 0%, #53a8ff 55%, #409EFF 100%);
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.36);
  color: #fff;
}
// 新增：禁用状态
.submit-btn:is(:disabled) {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12); // 灰色阴影
}
.submit-btn:is(:disabled):hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}
:deep(.el-input__inner) {
  font-size: 16px !important;
}

:deep(.el-select__wrapper .el-select__placeholder) {
  font-size: 16px !important;
}

:deep(.el-select__wrapper .el-select__selected-item) {
  font-size: 16px !important;
}
:deep(.el-table__body tr:nth-child(odd)) {
  background-color: #edf8f2;
}

:deep(.el-table__body tr:nth-child(even)) {
  background-color: #ffffff;
}

:deep(.el-table__body tr:hover > td) {
  background-color: #fbf2cb !important;
}
:deep(.el-pagination) {
  font-size: 16px;
}
// 表格内单选框放大/缩小
:deep(.el-table .el-radio__inner) {
  width: 18px;    /* 圆圈宽度 */
  height: 18px;   /* 圆圈高度 */
}
// 隐藏 &nbsp; 多余空白
:deep(.el-table .el-radio__label) {
  display: none;
}
</style>
