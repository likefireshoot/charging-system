<template>
  <div class="region-meter-report">
    <!-- 顶部搜索栏 -->
    <div class="search-header">
<!--      <div class="page-title">-->
<!--        <el-icon><Document /></el-icon>-->
<!--      </div>-->

      <div class="search-form">
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

        <div class="search-input">
          <span>姓名/地址/用户号</span>
          <el-input
            v-model="searchKeyword"
            placeholder="请输入姓名/地址/用户号"
            clearable
            @input="handleSearch"
          >
<!--            <template #prefix>-->
<!--              <el-icon><Search /></el-icon>-->
<!--            </template>-->
          </el-input>
        </div>
        </div>

        <div class="buttons">
        <el-button @click="handleSearch" class="search-btn">
          <img src="@/assets/yonghu/icon16.png" alt="" />
          <span style="margin-left:10%;">搜索</span>
        </el-button>

        <el-button @click="handleClearAll" class="clear-btn">
          <img src="@/assets/yuangong/icon4.png" alt="" />
          <span style="margin-left:10%; color: #5a5a5a">清空</span>
        </el-button>
        </div>

<!--        <el-button type="success" @click="handleExportExcel" class="header-btn">-->
<!--          <el-icon><Document /></el-icon>-->
<!--          <span>导出Excel</span>-->
<!--        </el-button>-->

<!--        <el-button type="primary" @click="handleExportPdf" class="header-btn">-->
<!--          <el-icon><Document /></el-icon>-->
<!--          <span>导出PDF</span>-->
<!--        </el-button>-->

    </div>

    <!-- 主体卡片：完全照搬登录安全页 .yuangong-info -->
    <div class="info-card">
      <!-- 工具行：与登录安全页 .command-box 对应 -->
      <div class="command-box">
        <div @click="handleExportExcel" class="command-btn">
          <img src="@/assets/yonghu/icon1.3.png" alt="" />
          <span>导出Excel</span>
        </div>

        <div @click="handleExportPdf" class="command-btn">
          <img src="@/assets/yonghu/icon1.3.png" alt="" />
          <span>导出PDF</span>
        </div>

        <div class="cmd-btn refresh-btn" @click="reflush" title="刷新">
          <img src="@/assets/yonghu/icon15.png" alt="" />
        </div>
      </div>

      <!-- 表格区域：与登录安全页 .yuangong-table 对应 -->
      <div class="table-zone">
        <el-table
          :data="paginatedReportList"
          ref="multipleTableRef"
          row-key="id"
          border
          v-loading="loading"
          :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
          class="report-table"
          style="width: 100%; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
        >
          <el-table-column prop="userId" label="用户号" :width="userIdWidth" align="center">
            <template #default="{ row }">
              <span>{{ maskUserId(row.userId) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="userName" label="用户姓名" :width="userNameWidth" align="center" />
          <el-table-column prop="address" label="用户地址" :width="addressWidth" align="center" show-overflow-tooltip />

          <el-table-column prop="dataType" label="数据类型" :width="dataTypeWidth" align="center">
            <template #default="{ row }">
              <span
                class="status-badge"
                :class="{
                  'badge-warning': row.dataType === '未审核',
                  'badge-success': row.dataType === '已审核',
                  'badge-info': row.dataType === '无数据' || !row.dataType
                }"
              >
                {{ row.dataType || '-' }}
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="reportStatus" label="抄表状态" :width="reportStatusWidth" align="center">
            <template #default="{ row }">
              <span
                class="status-badge"
                :class="{
                  'badge-success': row.reportStatus === '正常',
                  'badge-warning': row.reportStatus && row.reportStatus !== '正常',
                  'badge-info': !row.reportStatus
                }"
              >
                {{ row.reportStatus || '-' }}
              </span>
            </template>
          </el-table-column>

          <el-table-column prop="startReading" label="起码(吨)" :width="startReadingWidth" align="center">
            <template #default="{ row }">
              <span>{{ showMeterReadings(row) ? Math.floor(row.startReading || 0) : '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="endReading" label="止码(吨)" :width="endReadingWidth" align="center">
            <template #default="{ row }">
              <span>{{ showMeterReadings(row) ? Math.floor(row.endReading || 0) : '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="deltaWater" label="本期用量(吨)" :width="deltaWaterWidth" align="center">
            <template #default="{ row }">
              <span>{{ showMeterReadings(row) ? (row.deltaWater || 0) : '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="feeThisTime" label="本次扣费(元)" :width="feeThisTimeWidth" align="center">
            <template #default="{ row }">
              {{ row.createTime ? formatMoney(row.feeThisTime) : '-' }}
            </template>
          </el-table-column>

          <el-table-column prop="createTime" label="抄表日期" :width="createTimeWidth" align="center">
            <template #default="{ row }">
              {{ formatDate(row.createTime) }}
            </template>
          </el-table-column>

        </el-table>

        <!-- 空状态：与登录安全页对空数据时的呈现保持一致 -->
<!--        <div v-if="!loading && filteredReportList.length === 0" class="empty-tip">-->
<!--          <span>暂无数据</span>-->
<!--        </div>-->
      </div>

      <!-- 分页：与登录安全页 .page-box 对应 -->
      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination
            v-if="filteredReportList.length > 0"
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 25, 50, 100]"
            :total="filteredReportList.length"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
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
        <span>表册：{{ printCodeBookName }}</span>
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
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, Search, Delete } from '@element-plus/icons-vue';
import service from '@/api/request';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';

// 搜索参数
const searchParams = reactive({
  companyId: '',
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

// 报表列表（原始数据）
const reportList = ref([]);

// 搜索关键词
const searchKeyword = ref('');

// 分页相关
const currentPage = ref(1);
const pageSize = ref(25);

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

// 打印表册名称
const printCodeBookName = computed(() => {
  const codeBook = allCodeBookList.value.find(item => item.codeBookId === searchParams.codeBook);
  return codeBook?.codeBookName || '-';
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

// 用户号脱敏：不展示前三位
const maskUserId = (userId) => {
  if (!userId) return '-';
  const str = userId.toString();
  return str.length > 3 ? str.slice(3) : str;
};

// ============== 表格列宽（参考登录安全页做法，按容器百分比分配） ==============
const columnPercentages = {
  userId: 10,
  userName: 8,
  address: 14,
  dataType: 9,
  reportStatus: 9,
  startReading: 8,
  endReading: 8,
  deltaWater: 10,
  feeThisTime: 9,
  createTime: 15
};

const tableContainer = ref(null);

const userIdWidth = ref(0);
const userNameWidth = ref(0);
const addressWidth = ref(0);
const dataTypeWidth = ref(0);
const reportStatusWidth = ref(0);
const startReadingWidth = ref(0);
const endReadingWidth = ref(0);
const deltaWaterWidth = ref(0);
const feeThisTimeWidth = ref(0);
const createTimeWidth = ref(0);

const calculateColumnWidths = () => {
  if (!tableContainer.value) return;
  const w = tableContainer.value.offsetWidth;
  userIdWidth.value = (columnPercentages.userId / 100) * w;
  userNameWidth.value = (columnPercentages.userName / 100) * w;
  addressWidth.value = (columnPercentages.address / 100) * w;
  dataTypeWidth.value = (columnPercentages.dataType / 100) * w;
  reportStatusWidth.value = (columnPercentages.reportStatus / 100) * w;
  startReadingWidth.value = (columnPercentages.startReading / 100) * w;
  endReadingWidth.value = (columnPercentages.endReading / 100) * w;
  deltaWaterWidth.value = (columnPercentages.deltaWater / 100) * w;
  feeThisTimeWidth.value = (columnPercentages.feeThisTime / 100) * w;
  createTimeWidth.value = (columnPercentages.createTime / 100) * w;
};

let resizeObserver = null;

// 是否显示起码、止码、本期用量
// 已审核数据始终显示；未审核数据仅在抄表状态为“正常”时显示
const showMeterReadings = (row) => {
  if (row.dataType === '已审核') return true;
  return row.reportStatus === '正常';
};

// 加载区域报表数据（使用后端聚合接口，只发 1 个请求）
const loadRegionReport = async (regionId, codeBookId) => {
  if (!regionId) {
    reportList.value = [];
    return;
  }

  loading.value = true;
  try {
    let url = `/manual/charge/getRegionLatestReport?regionId=${regionId}`;
    if (codeBookId) {
      url += `&codeBookId=${codeBookId}`;
    }
    const res = await service.get(url);

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

// 刷新：直接调用 handleRegionChange 重新拉当前区域
const reflush = () => {
  if (!searchParams.region) {
    ElMessage.warning('请先选择区域');
    return;
  }
  currentPage.value = 1;
  loadRegionReport(searchParams.region, searchParams.codeBook);
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

      // 洪湖峰口（companyId=95）：放行全部区域，不做普表筛选
      // 原因：洪湖峰口业务场景特殊，所有区域类型均需在区域抄表报表中可选
      if (companyId === 95) {
        regionList.value = allRegions;
      } else {
        // 其他水厂：仅筛选普表区域（名称含"普表"历史兼容，或 regionType === 3）
        regionList.value = allRegions.filter(region =>
          (region.regionName && region.regionName.includes('普表')) || region.regionType === 3
        );
      }

      reportList.value = [];
      searchParams.region = '';
      searchParams.codeBook = '';
      allCodeBookList.value = [];
      codeBookList.value = [];

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

// 区域变化时加载表册并刷新报表
const handleRegionChange = async (regionId) => {
  currentPage.value = 1;
  searchParams.codeBook = '';
  allCodeBookList.value = [];
  codeBookList.value = [];

  if (regionId) {
    try {
      const res = await service.get(`/getCodeBookByRegion?companyId=${searchParams.companyId}&regionId=${regionId}`);
      if (res.code === 200) {
        allCodeBookList.value = res.data || [];
        codeBookList.value = allCodeBookList.value;

        if (allCodeBookList.value.length === 1) {
          // 只有一个表册时自动选中，并加载该表册下的报表
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
  }

  await loadRegionReport(regionId, searchParams.codeBook);
};

// 表册变化时刷新报表
const handleCodeBookChange = async (codeBookId) => {
  currentPage.value = 1;
  await loadRegionReport(searchParams.region, codeBookId);
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
  searchParams.codeBook = '';
  reportList.value = [];
  allCodeBookList.value = [];
  codeBookList.value = [];
  currentPage.value = 1;
  pageSize.value = 25;
};

// 导出 Excel：按当前搜索条件导出全部数据
const handleExportExcel = () => {
  if (filteredReportList.value.length === 0) {
    ElMessage.warning('暂无数据可导出');
    return;
  }

  const exportData = filteredReportList.value.map((row, index) => ({
    '序号': index + 1,
    '用户号': row.userId ? '\t' + maskUserId(row.userId) : '',
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

  const fileName = `区域抄表报表_${printRegionName.value || '-'}_${printCodeBookName.value || '-'}_${formatDate(new Date()).replace(/[:\s]/g, '-')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
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
  const fileName = `区域抄表报表_${printRegionName.value || '-'}_${printCodeBookName.value || '-'}_${formatDate(new Date()).replace(/[:\s]/g, '-')}.pdf`;

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
  // 表格列宽自适应
  nextTick(() => {
    tableContainer.value = document.querySelector('.table-zone') || document.querySelector('.info-card');
    calculateColumnWidths();
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(calculateColumnWidths);
      if (tableContainer.value) {
        resizeObserver.observe(tableContainer.value);
      }
    } else {
      window.addEventListener('resize', calculateColumnWidths);
    }
  });
  fetchCompanyList();
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  } else {
    window.removeEventListener('resize', calculateColumnWidths);
  }
});
</script>

<style scoped lang="scss">
/* 完全照搬登录安全页 loginLog.vue 的样式结构 */

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
  --el-color-primary: #46b97e;
  font-size: 16px;
}

:deep(.el-pagination .el-pager li) {
  font-size: 16px;
  min-width: 35px;
  height: 35px;
  line-height: 35px;
}

:deep(.el-input) {
  --el-color-primary: #46b97e;
}

:deep(.el-select .el-select__wrapper) {
  height: 35px;
}

:deep(.el-select) {
  --el-color-primary: #46b97e;
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

:deep(.el-tag) {
  font-size: 16px !important;
}

/* 数据类型 / 抄表状态徽章：字号 20px */
.status-badge {
  display: inline-block;
  font-size: 20px;
  line-height: 1;
  padding: 5px 12px;
  border-radius: 4px;
  border: 1px solid transparent;
  white-space: nowrap;
  vertical-align: middle;
}

.status-badge.badge-success {
  color: #67c23a;
  background-color: #f0f9eb;
  border-color: #e1f3d8;
}

.status-badge.badge-warning {
  color: #e6a23c;
  background-color: #fdf6ec;
  border-color: #faecd8;
}

.status-badge.badge-info {
  color: #909399;
  background-color: #f4f4f5;
  border-color: #e9e9e9;
}

/* 最外层容器：与登录安全页 .yuangong-container 对齐 */
.region-meter-report {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  min-width: 94%;
  height: 100%;
  padding: 0 15px;
}

/* 顶部搜索栏（横向单行排列，整体 1.5 倍放大） */
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

  .page-title {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    .el-icon {
      color: #46b97e;
      font-size: 33px; /* 22 * 1.5 */
    }
  }

  .search-form {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    flex: 1;
    min-width: 0;
  }

  .form-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-shrink: 0;

    .form-label {
      font-size: 18px; /* 16 * 1.5 */
      margin-right: 12px;
      color: #606266;
      white-space: nowrap;
    }

    .company-name {
      font-size: 18px; /* 16 * 1.5 */
      font-weight: 500;
      color: #303133;
      min-width: 180px;
      display: inline-block;
      white-space: nowrap;
    }

    :deep(.el-select) {
      width: 270px; /* 区域、表册下拉框宽度，180 * 1.5 */

      .el-select__wrapper,
      .el-select__input,
      .el-select__placeholder,
      .el-select__selected-item {
        font-size: 24px !important; /* 16 * 1.5，!important 覆盖 el-select 默认 */
        line-height: 1.2;
      }
    }

    :deep(.el-select .el-select__wrapper) {
      height: 48px !important;            /* 与区域选择框保持统一高度，24px 字体不截断 */
      min-height: 48px !important;
      box-sizing: border-box;
      padding: 8px 15px;
      font-size: 24px !important;
    }

    :deep(.el-select .el-select__wrapper .el-select__placeholder) {
      font-size: 24px !important;
      line-height: 32px;
    }

    :deep(.el-select .el-select__wrapper .el-select__selected-item) {
      font-size: 24px !important;
      line-height: 32px;
    }

    :deep(.el-input) {
      width: 100%;

      .el-input__wrapper {
        height: 48px !important;          /* 与 select__wrapper 保持统一高度 */
        min-height: 48px !important;
        box-sizing: border-box;
        padding: 8px 15px;
      }

      .el-input__inner {
        font-size: 24px !important; /* 16 * 1.5 */
        line-height: 32px;       /* 与 select 文字垂直居中高度一致 */
        height: 32px;
      }
    }
  }

  .form-item-input {
    width: 260px; /* 260 * 1.5 */
  }

  .header-btn {
    flex-shrink: 0;
    font-size: 21px; /* 14 * 1.5 */
  }

  .header-btn :deep(.el-icon) {
    font-size: 21px; /* 图标随文字同步放大 */
  }
}

/* 主体卡片：与登录安全页 .yuangong-info 对应 */
.info-card {
  width: 99.3%;
  height: calc(100% - 120px);
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  background-color: #fff;
  position: relative;
  padding: 0 10px;
}

/* 工具行：与登录安全页 .command-box 对应 */
.command-bar {
  display: flex;
  align-items: center;
  width: 100%;
  height: auto;
  margin-top: 10px;
}

.cmd-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fff;
  border: 2px solid #f2f2f2;
  margin-right: 10px;
}

/* 表格区：与登录安全页 .yuangong-table 对应（固定高度，减去分页） */
.table-zone {
  width: 100%;
  height: calc(100% - 100px);
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.empty-tip {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 18px;
  pointer-events: none;
}

/* 分页：完全照搬登录安全页 .page-box，绝对定位钉在底部 */
.page-box {
  width: 100%;
  height: 40px;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.demo-pagination-block {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* PDF 导出专用区域：屏幕外渲染，供 html2pdf 捕获 */
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

.search-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 18%;
  height: 100%;
  margin-right: 10px;
}

.search-input > span {
  font-size: 18px;
  margin-bottom: 5px;
}

.buttons {
  display: flex;
  width: 220px;
  height: 100%;
  align-items: center;
  // 消除 ElementPlus 默认相邻按钮左边距
  :deep(.el-button + .el-button) {
    margin-left: 0;
  }
}

.buttons > * {
  width: 100px;
  margin-right: 10px;
}

.search-btn,
.clear-btn {
  display: flex;
  align-items: center;
  height: 32px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  color: #fff;
  font-size: 18px;
}

.search-btn {
  background-color: #45ba7e;
}
.clear-btn {
  background-color: #fff;
  border: 2px solid #f2f2f2;
  margin-right: 10px;
}
.command-box {
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  margin-top: 10px;
}

.command-box>* {
  margin-right: 10px;
}

.command-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  min-width: 50px;
  height: 35px;
  padding: 0 8px;
  color: #5a5a5a;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 18px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
}
.command-btn img {
  margin-right: 6px;
  flex-shrink: 0;
}
</style>

<!--&lt;!&ndash; 全局：与登录安全页保持一致（保留垂直滚动条，避免缩放抖动） &ndash;&gt;-->
<!--<style>-->
<!--html {-->
<!--  overflow-y: scroll;-->
<!--}-->
<!--</style>-->
