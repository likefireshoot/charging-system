<template>
  <div class="region-meter-report">
    <!-- 顶部搜索栏 -->
    <div class="search-header">

      <div class="search-form">
        <div class="search-input">
          <span>水厂</span>
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
          </el-input>
        </div>

        <!-- 本月用水量相关 -->
        <div class="search-input">
          <span>本月用水量</span>
          <div style="display:flex;gap:4px;align-items:center;">
            <el-select
              v-model="waterCompareOpt"
              placeholder="条件"
              style="width:40%"
              clearable
            >
              <el-option label="大于" value="gt" />
              <el-option label="小于" value="lt" />
            </el-select>
            <span style="font-size: 16px">上月</span>
            <el-input
              v-model.number="waterCompareVal"
              placeholder="吨"
              style="width:30%"
              min="0"
            />
            <span style="font-size: 16px">吨</span>
          </div>
        </div>
        </div>

        <div class="buttons">
        <el-button @click="handleSearch" class="search-btn">
          <img src="@/assets/yonghu/icon16.png" alt="" />
          <span style="margin-left:10%;">搜索</span>
        </el-button>
        </div>

    </div>

    <!-- 主体卡片 -->
    <div class="info-card">
      <!-- 工具行 -->
      <div class="command-box">
        <div @click="exportReport('excel')" class="command-btn">
          <img src="@/assets/yonghu/icon1.3.png" alt="" />
          <span>导出Excel</span>
        </div>

        <div @click="exportReport('pdf')" class="command-btn">
          <img src="@/assets/yonghu/icon1.3.png" alt="" />
          <span>导出PDF</span>
        </div>

        <div class="cmd-btn refresh-btn" @click="reflush" title="刷新">
          <img src="@/assets/yonghu/icon15.png" alt="" />
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="table-zone">
        <el-table
          :data="filteredReportList"
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
              <span>{{ row.userId % 10000000 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="userName" label="用户名" :width="userNameWidth" align="center" />
          <el-table-column prop="address" label="地址" :width="addressWidth" align="center" />
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
          <el-table-column prop="dataType" label="处理状态" :width="dataTypeWidth" align="center">
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

          <el-table-column prop="startReading" label="起码" :width="startReadingWidth" align="center">
            <template #default="{ row }">
              <span>{{ showMeterReadings(row) ? Math.floor(row.startReading || 0) : '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="endReading" label="止码" :width="endReadingWidth" align="center">
            <template #default="{ row }">
              <span>{{ showMeterReadings(row) ? Math.floor(row.endReading || 0) : '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="deltaWater" label="本月用量" :width="deltaWaterWidth" align="center">
            <template #default="{ row }">
              <span>{{ showMeterReadings(row) ? (row.deltaWater || 0) : '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="feeThisTime" label="本次扣费" :width="feeThisTimeWidth" align="center">
            <template #default="{ row }">
              {{ row.createTime ? formatMoney(row.feeThisTime) : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="lastMonthDeltaWater" label="上月用量" :width="lastMonthDeltaWaterWidth" align="center">
            <template #default="{ row }">
              <span>{{ showMeterReadings(row) ? (row.lastMonthDeltaWater || 0) : '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="lastDeltaWater" label="环比增减量" :width="lastDeltaWaterWidth" align="center">
            <template #default="{ row }">
              <span>{{ showMeterReadings(row) ? (row.lastDeltaWater || 0) : '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="createTime" label="抄表日期" :width="createTimeWidth" align="center">
            <template #default="{ row }">
              {{ formatDate(row.createTime) }}
            </template>
          </el-table-column>

        </el-table>
      </div>

      <!-- 分页 -->
      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination
            v-if="total > 0"
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 25, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import service from '@/api/request';

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

// 本月用水量相关
// 用水量对比筛选
const waterCompareOpt = ref('') // gt 大于 / lt 小于
const waterCompareVal = ref(40) // 默认40吨

// 分页相关
const currentPage = ref(1);
const pageSize = ref(25);
// 该区域/表册下总条数（后端分页返回，用于分页控件）
const total = ref(0);

// 加载状态
const loading = ref(false);

// 区域名称
const regionName = computed(() => {
  const region = regionList.value.find(item => item.regionId === searchParams.region);
  return region?.regionName || '';
});

// 表册名称
const codeBookName = computed(() => {
  const codeBook = allCodeBookList.value.find(item => item.codeBookId === searchParams.codeBook);
  return codeBook?.codeBookName || '';
});

// 过滤后的报表列表
// 后端已按 page/pageSize 返回本页数据，searchKeyword 仅在本页已加载数据内过滤
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

// ============== 表格列宽（参考登录安全页做法，按容器百分比分配） ==============
const columnPercentages = {
  userId: 7,
  userName: 8,
  address: 10,  // 本月用水量相关
  dataType: 8,
  reportStatus: 8,
  startReading: 8,
  endReading: 8,
  deltaWater: 8,
  lastMonthDeltaWater: 8,
  lastDeltaWater: 9,  // 本月用水量相关
  feeThisTime: 8,
  createTime: 10
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
const lastMonthDeltaWaterWidth = ref(0);
const lastDeltaWaterWidth = ref(0); // 本月用水量相关
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
  lastMonthDeltaWaterWidth.value = (columnPercentages.lastMonthDeltaWater / 100) * w;
  lastDeltaWaterWidth.value = (columnPercentages.lastDeltaWater / 100) * w;
  feeThisTimeWidth.value = (columnPercentages.feeThisTime / 100) * w;
  createTimeWidth.value = (columnPercentages.createTime / 100) * w;
};

let resizeObserver = null;

// 是否显示起码、止码、本期用量
// 已审核数据始终显示；未审核数据仅在抄表状态为"正常"时显示
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
    let url = `/manual/charge/getRegionLatestReport?regionId=${regionId}&page=${currentPage.value}&pageSize=${pageSize.value}`;
    if (codeBookId) {
      url += `&codeBookId=${codeBookId}`;
    }
    // 本月用水量相关：筛选条件（大于/小于）+ 对比数值，仅已填写时拼接
    if (waterCompareOpt.value) {
      url += `&waterCompareOpt=${encodeURIComponent(waterCompareOpt.value)}`;
      url += `&waterCompareVal=${encodeURIComponent(waterCompareVal.value ?? 40)}`;
    }
    const res = await service.get(url);

    if (res.code === 200) {
      const pageData = res.data || {};
      const data = pageData.list || [];
      total.value = pageData.total || 0;
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
        const lastMonthDeltaWater = item.lastMonthDeltaWater || 0;
        const lastDeltaWater = item.lastDeltaWater || 0;  // 本月用水量相关
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
          lastMonthDeltaWater: reportStatus === '正常' ? lastMonthDeltaWater : 0,
          lastDeltaWater: reportStatus === '正常' ? lastDeltaWater : 0, // 本月用水量相关
          createTime: item.createTime,
          feeThisTime: item.feeThisTime || 0
        };
      });
    } else {
      ElMessage.error(res.msg || '获取区域报表失败');
      reportList.value = [];
      total.value = 0;
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      ElMessage.error('区域报表接口未找到，请联系后端开发人员');
    } else {
      console.error('加载区域报表错误:', error);
      ElMessage.error('加载区域报表失败，请稍后重试');
    }
    reportList.value = [];
    total.value = 0;
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
  loadRegionReport(searchParams.region, searchParams.codeBook);
};

// 分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1;
  // 重新请求后端分页
  loadRegionReport(searchParams.region, searchParams.codeBook);
};

// 当前页变化
const handleCurrentChange = (val) => {
  currentPage.value = val;
  // 重新请求后端分页
  loadRegionReport(searchParams.region, searchParams.codeBook);
};

// 导出：请求后端生成文件并下载
// type: 'excel' | 'pdf'
const exportReport = async (type) => {
  if (!searchParams.region) {
    ElMessage.warning('请先选择区域');
    return;
  }

  const path = type === 'excel'
    ? '/manual/charge/exportRegionReportExcel'
    : '/manual/charge/exportRegionReportPdf';

  // 本工程 request 拦截器会覆盖 GET 的 params，因此筛选参数拼进 URL 字符串
  const query = new URLSearchParams({
    regionId: searchParams.region,
    keyword: searchKeyword.value || '',
    waterCompareOpt: waterCompareOpt.value || '',
    waterCompareVal: waterCompareVal.value ?? 40,
    regionName: regionName.value,
    codeBookName: codeBookName.value,
    companyName: currentCompanyName.value || ''  // 仅 PDF 用到，可始终传
  });

  loading.value = true;
  try {
    const resp = await service.get(`${path}?${query}`, { responseType: 'blob', skipAutoMsg: true });
    const headers = resp.headers || {};

    // 空数据处理：后端返回 X-Empty-Data: true，不保存文件
    if (String(headers['x-empty-data']).toLowerCase() === 'true') {
      ElMessage.warning('暂无数据可导出');
      return;
    }

    const blob = resp.data;

    // 文件名优先从响应头 filename*=UTF-8'' 解析（已 URL 编码，需 decodeURIComponent）
    let fileName = '';
    const cd = headers['content-disposition'] || '';
    const m = cd.match(/filename\*=UTF-8''(.+)/i);
    if (m) {
      fileName = decodeURIComponent(m[1]);
    } else {
      const ext = type === 'excel' ? 'xlsx' : type;
      fileName = `区域抄表报表_${regionName.value}_${codeBookName.value}.${ext}`;
    }

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    // 后端出错返回 JSON，解析出错误信息给用户
    const data = error.response?.data || error.data;
    if (data && data instanceof Blob && data.type.includes('json')) {
      try {
        const json = JSON.parse(await data.text());
        ElMessage.error(json.msg || '导出失败');
        return;
      } catch (e) {
        // fallthrough
      }
    }
    ElMessage.error('导出失败，请稍后重试');
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

/* 最外层容器 */
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
}

/* 筛选表单：横向单行排列，撑满剩余空间 */
.search-form {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  flex: 1;
  min-width: 0;
}

/* 主体卡片 */
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

/* 表格区：固定高度，减去分页 */
.table-zone {
  width: 100%;
  height: calc(100% - 100px);
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 分页：绝对定位钉在底部 */
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
  width: 110px;
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