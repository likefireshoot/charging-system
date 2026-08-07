<template>
  <div class="region-meter-report">
    <!-- 顶部搜索栏 -->
    <div class="search-header">
      <div class="page-title">
        <el-icon><Document /></el-icon>
        <span>区域抄表报表</span>
      </div>

      <div class="search-form">
        <div class="form-item">
          <label class="form-label">水厂</label>
          <span class="company-name">{{ currentCompanyName }}</span>
        </div>

        <div class="form-item">
          <label class="form-label">区域</label>
          <el-select
            v-model="searchParams.region"
            placeholder="选择区域"
            clearable
            @change="handleRegionChange"
            :disabled="!currentCompanyId"
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
        <el-button type="success" @click="handleExportExcel">
          <el-icon><Document /></el-icon>
          <span>导出Excel</span>
        </el-button>

        <el-button type="primary" @click="handleExportPdf">
          <el-icon><Document /></el-icon>
          <span>导出PDF</span>
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
        :data="paginatedReportList"
        stripe
        border
        v-loading="loading"
        height="100%"
      >
        <el-table-column prop="userId" label="用户号" min-width="120" align="center" />
        <el-table-column prop="userName" label="用户姓名" min-width="120" align="center" />
        <el-table-column prop="address" label="用户地址" min-width="200" align="center" show-overflow-tooltip />

        <el-table-column prop="dataType" label="数据类型" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.dataType === '未审核' ? 'warning' : row.dataType === '已审核' ? 'success' : 'info'"
              size="small"
              class="status-tag-large"
            >
              {{ row.dataType }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="reportStatus" label="抄表状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.reportStatus === '正常' ? 'success' : 'warning'" size="small" class="status-tag-large">
              {{ row.reportStatus || '-' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="startReading" label="起码(吨)" min-width="100" align="center">
          <template #default="{ row }">
            <span>{{ showMeterReadings(row) ? Math.floor(row.startReading || 0) : '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="endReading" label="止码(吨)" min-width="100" align="center">
          <template #default="{ row }">
            <span>{{ showMeterReadings(row) ? Math.floor(row.endReading || 0) : '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="deltaWater" label="本期用量(吨)" min-width="110" align="center">
          <template #default="{ row }">
            <span>{{ showMeterReadings(row) ? (row.deltaWater || 0) : '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="feeThisTime" label="本次扣费(元)" min-width="110" align="center">
          <template #default="{ row }">
            {{ row.createTime ? formatMoney(row.feeThisTime) : '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="抄表日期" min-width="140" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>

      </el-table>

      <!-- 分页器 -->
      <div class="pagination-container" v-if="filteredReportList.length > 0">
        <span class="total-count">共 {{ filteredReportList.length }} 条</span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredReportList.length"
          layout="sizes, prev, pager, next, jumper, total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 空数据提示 -->
      <div v-if="filteredReportList.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无数据" />
      </div>
    </div>
  </div>

  <!-- PDF 导出专用区域：屏幕外渲染，供 html2pdf 捕获 -->
  <div class="print-wrapper">
    <div class="print-area" ref="printAreaRef">
    <div class="print-header">
      <h1>区域抄表报表</h1>
      <div class="print-info">
        <span>水厂：{{ currentCompanyName || '-' }}</span>
        <span>区域：{{ printRegionName }}</span>
        <span>生成时间：{{ printTime }}</span>
      </div>
    </div>

    <table class="print-table">
      <thead>
        <tr>
          <th style="width: 10%">用户号</th>
          <th style="width: 9%">用户姓名</th>
          <th style="width: 16%">用户地址</th>
          <th style="width: 9%">数据类型</th>
          <th style="width: 9%">抄表状态</th>
          <th style="width: 8%">起码(吨)</th>
          <th style="width: 8%">止码(吨)</th>
          <th style="width: 9%">本期用量(吨)</th>
          <th style="width: 10%">本次扣费(元)</th>
          <th style="width: 22%">抄表日期</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in printData.list" :key="row.userId">
          <td>{{ row.userId }}</td>
          <td>{{ row.userName }}</td>
          <td>{{ row.address }}</td>
          <td>{{ row.dataType }}</td>
          <td>{{ row.reportStatus || '-' }}</td>
          <td>{{ showMeterReadings(row) ? Math.floor(row.startReading || 0) : '-' }}</td>
          <td>{{ showMeterReadings(row) ? Math.floor(row.endReading || 0) : '-' }}</td>
          <td>{{ showMeterReadings(row) ? (row.deltaWater || 0) : '-' }}</td>
          <td>{{ row.createTime ? formatMoney(row.feeThisTime) : '-' }}</td>
          <td>{{ formatDate(row.createTime) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="print-footer">
      共 {{ printData.list.length }} 条记录
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Document, Search, Delete, ArrowLeft } from '@element-plus/icons-vue';
import service from '@/api/request';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';

const router = useRouter();

// 搜索参数
const searchParams = reactive({
  companyId: '',
  region: ''
});

// 当前登录用户的公司信息
const currentCompanyId = ref(null);
const currentCompanyName = ref('');

// 水厂列表
const companyList = ref([]);

// 区域列表
const regionList = ref([]);

// 报表列表（原始数据）
const reportList = ref([]);

// 搜索关键词
const searchKeyword = ref('');

// 分页相关
const currentPage = ref(1);
const pageSize = ref(20);

// 加载状态
const loading = ref(false);

// 打印区域 ref
const printAreaRef = ref(null);

// 打印数据
const printData = reactive({
  list: []
});

// 打印区域名称
const printRegionName = computed(() => {
  const region = regionList.value.find(item => item.regionId === searchParams.region);
  return region?.regionName || '-';
});

// 打印时间
const printTime = computed(() => {
  return formatDate(new Date());
});

// 过滤后的报表列表
const filteredReportList = computed(() => {
  if (!searchKeyword.value.trim()) {
    return reportList.value;
  }

  const keyword = searchKeyword.value.trim().toLowerCase();
  return reportList.value.filter(item => {
    return (
      (item.userName && item.userName.toLowerCase().includes(keyword)) ||
      (item.userId && item.userId.toString().toLowerCase().includes(keyword)) ||
      (item.address && item.address.toLowerCase().includes(keyword))
    );
  });
});

// 分页后的报表列表
const paginatedReportList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredReportList.value.slice(start, end);
});

// 格式化金额
const formatMoney = (value) => {
  if (value === null || value === undefined || value === '') return '0.00';
  const num = parseFloat(value);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr || isNaN(new Date(dateStr).getTime())) return '-';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
};

// 是否显示起码、止码、本期用量
// 已审核数据始终显示；未审核数据仅在抄表状态为“正常”时显示
const showMeterReadings = (row) => {
  if (row.dataType === '已审核') return true;
  return row.reportStatus === '正常';
};

// 加载区域报表数据（使用后端聚合接口，只发 1 个请求）
const loadRegionReport = async (regionId) => {
  if (!regionId) {
    reportList.value = [];
    return;
  }

  loading.value = true;
  try {
    const res = await service.get(`/manual/charge/getRegionLatestReport?regionId=${regionId}`);

    if (res.code === 200) {
      const data = res.data || [];
      reportList.value = data.map(item => {
        const hasUnreviewed = item.hasUnreviewed === true || item.hasUnreviewed === 1;
        const reviewStatus = item.reviewStatus;
        // 数据类型：有未审核记录 -> 未审核；有审核通过记录 -> 已审核；其余 -> 无数据
        let dataType = '无数据';
        if (hasUnreviewed) {
          dataType = '未审核';
        } else if (reviewStatus === 1 || reviewStatus === '1') {
          dataType = '已审核';
        }

        const readingCount = item.readingCount || 0;
        const deltaWater = item.deltaWater || 0;
        const reportStatus = item.reportStatus || '';

        return {
          id: item.userId,
          userId: item.userId,
          userName: item.userName,
          address: item.userAddr,
          meterCode: item.meterCode || '',
          dataType,
          reportStatus,
          // 历史记录里只有止码(readingCount)和本期用量(deltaWater)，起码由两者推算
          startReading: readingCount - deltaWater,
          endReading: readingCount,
          deltaWater: reportStatus === '正常' ? deltaWater : 0,
          createTime: item.createTime,
          feeThisTime: item.feeThisTime || 0
        };
      });
    } else {
      ElMessage.error(res.msg || '获取区域报表失败');
      reportList.value = [];
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      ElMessage.error('区域报表接口未找到，请联系后端开发人员');
    } else {
      console.error('加载区域报表错误:', error);
      ElMessage.error('加载区域报表失败，请稍后重试');
    }
    reportList.value = [];
  } finally {
    loading.value = false;
  }
};

// 获取水厂列表
const fetchCompanyList = async () => {
  try {
    const res = await service.get('/getAllUnblockCompany');

    if (res.code === 200) {
      let allCompanies = res.data || [];

      const userData = JSON.parse(sessionStorage.getItem('userData'));
      currentCompanyId.value = userData?.companyId;

      const currentUserCompany = allCompanies.find(company => company.companyId === currentCompanyId.value);
      if (currentUserCompany) {
        currentCompanyName.value = currentUserCompany.companyName;
        searchParams.companyId = currentCompanyId.value;
        handleCompanyChange(currentCompanyId.value);
      } else {
        currentCompanyName.value = '-';
      }

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
    reportList.value = [];
    searchParams.region = '';
    return;
  }

  try {
    const res = await service.get(`/getRegion?companyId=${companyId}`);

    if (res.code === 200) {
      const allRegions = res.data || [];
      // 筛选普表区域：名称包含"普表"前缀（历史兼容），或 region_type === 3
      regionList.value = allRegions.filter(region =>
        (region.regionName && region.regionName.includes('普表')) || region.regionType === 3
      );

      reportList.value = [];
      searchParams.region = '';

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
};

// 区域变化时加载报表
const handleRegionChange = async (regionId) => {
  currentPage.value = 1;
  await loadRegionReport(regionId);
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
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

// 清空
const handleClearAll = () => {
  searchKeyword.value = '';
  searchParams.region = '';
  reportList.value = [];
  currentPage.value = 1;
  pageSize.value = 20;
};

// 导出 Excel：按当前搜索条件导出全部数据
const handleExportExcel = () => {
  if (filteredReportList.value.length === 0) {
    ElMessage.warning('暂无数据可导出');
    return;
  }

  const exportData = filteredReportList.value.map((row, index) => ({
    '序号': index + 1,
    '用户号': row.userId,
    '用户姓名': row.userName,
    '用户地址': row.address,
    '数据类型': row.dataType,
    '抄表状态': row.reportStatus || '-',
    '起码(吨)': showMeterReadings(row) ? Math.floor(row.startReading || 0) : '-',
    '止码(吨)': showMeterReadings(row) ? Math.floor(row.endReading || 0) : '-',
    '本期用量(吨)': showMeterReadings(row) ? (row.deltaWater || 0) : '-',
    '本次扣费(元)': row.createTime ? row.feeThisTime : '-',
    '抄表日期': formatDate(row.createTime)
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '区域抄表报表');

  const fileName = `区域抄表报表_${printRegionName.value || '-'}_${formatDate(new Date()).replace(/[:\s]/g, '-')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// 返回
const goBack = () => {
  router.push('/meterReading/quickMeterReport');
};

// 导出 PDF：直接下载 A4 横向 PDF
const handleExportPdf = async () => {
  if (filteredReportList.value.length === 0) {
    ElMessage.warning('暂无数据可导出');
    return;
  }

  // 按当前搜索条件导出全部数据（不分页）
  printData.list = filteredReportList.value;

  await nextTick();

  const element = printAreaRef.value;
  if (!element) return;

  loading.value = true;
  const fileName = `区域抄表报表_${printRegionName.value || '-'}_${formatDate(new Date()).replace(/[:\s]/g, '-')}.pdf`;

  try {
    await html2pdf()
      .set({
        margin: 10,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      })
      .from(element)
      .save();
  } catch (error) {
    console.error('PDF导出失败:', error);
    ElMessage.error('PDF导出失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCompanyList();
});
</script>

<style scoped lang="scss">
.region-meter-report {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
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
          font-size: 24px;
          color: #606266;
          white-space: nowrap;
        }

        .company-name {
          font-size: 24px;
          color: #303133;
          font-weight: 500;
          min-width: 150px;
          display: inline-block;
        }

        :deep(.el-select),
        :deep(.el-input) {
          width: 200px;

          .el-select__wrapper,
          .el-select__input,
          .el-select__placeholder,
          .el-select__selected-item {
            font-size: 24px;
          }

          .el-select-dropdown__item {
            font-size: 24px;
          }
        }

        :deep(.el-input__inner) {
          font-size: 24px;
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
    min-height: calc(100vh - 280px);
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

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

      .el-table__empty-block {
        min-height: calc(100vh - 360px);
      }

      .status-tag-large {
        font-size: 22px !important;
        padding: 6px 12px;
      }
    }

    .empty-state {
      padding: 40px 0;
    }

    .pagination-container {
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 0;
      flex-shrink: 0;
      border-top: 1px solid #ebeef5;

      .total-count {
        font-size: 20px;
        color: #606266;
      }
    }
  }
}

@media (max-width: 1200px) {
  .region-meter-report {
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
  .region-meter-report {
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
      }
    }
  }
}

// PDF 导出专用区域：屏幕外渲染，供 html2pdf 捕获
.print-wrapper {
  position: fixed;
  left: 0;
  top: 0;
  width: 0;
  height: 0;
  overflow: visible;
  z-index: -9999;
  opacity: 1;
  pointer-events: none;
}

.print-area {
  position: relative;
  width: 277mm;
  padding: 0;
  background: #fff;
  color: #000;
  font-family: 'Microsoft YaHei', 'SimSun', sans-serif;
  font-size: 9pt;
  line-height: 1.4;

  .print-header {
    text-align: center;
    margin-bottom: 8px;

    h1 {
      font-size: 16pt;
      margin: 0 0 4px 0;
    }

    .print-info {
      display: flex;
      justify-content: center;
      gap: 20px;
      font-size: 9pt;
      color: #333;
    }
  }

  .print-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;

    th,
    td {
      border: 1px solid #333;
      padding: 3px 5px;
      text-align: center;
      word-break: break-all;
    }

    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
  }

  .print-footer {
    margin-top: 8px;
    text-align: right;
    font-size: 9pt;
  }
}
</style>
