<template>
  <div class="yuangong-container">
    <div class="search-box">
      <div class="search-content">
        <div class="search-input" v-if="companyId === 1">
          <span>所属水厂</span>
          <el-select v-model="params.companyId" placeholder="请选择所属水厂" @change="handleCompanyChange">
            <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </div>
        <div class="search-input">
          <span>区域</span>
          <el-select
            v-model="params.region"
            placeholder="选择区域"
            clearable
            @change="handleRegionChange"
            :disabled="!params.companyId"
            filterable
            :filter-method="filterRegion"
            style="width:100%"
          >
            <el-option v-for="item in regionList" :key="item.regionId" :label="item.regionName" :value="item.regionId"/>
          </el-select>
        </div>
        <div class="search-input">
          <span>表册</span>
          <el-select
            v-model="params.codeBook"
            placeholder="选择表册"
            clearable
            @change="handleCodeBookChange"
            :disabled="!params.companyId || !params.region"
            filterable
            :filter-method="filterCodeBook"
            style="width:100%"
          >
            <el-option v-for="item in codeBookList" :key="item.codeBookId" :label="item.codeBookName" :value="item.codeBookId"/>
          </el-select>
        </div>
        <div class="search-input">
          <span>时间</span>
          <el-date-picker
            v-model="params.queryYear"
            type="year"
            placeholder="选择年份"
            value-format="YYYY"
            style="width:100%"
          ></el-date-picker>
        </div>
      </div>
      <div class="buttons" >
        <div class="sercah-btn" @click="search">
          <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: 10px" />
          <span style="margin-left: 10%">搜索</span>
        </div>
        <div class="clear-btn" @click="clear">
          <img src="@/assets/yuangong/icon4.png" alt="" style="margin-left: 10px" />
          <span style="margin-left: 10%; color: #5a5a5a">清空</span>
        </div>
      </div>
    </div>
    <div class="yuangong-info">
      <div class="report-title">
        <div class="export-out-btn" @click="handleExport">
          <img src="@/assets/yonghu/icon1.3.png" alt="" />
          <span style="margin-left: 6px; color: #5a5a5a">导出excel</span>
        </div>
        <div class="export-out-btn" @click="handleExportPdf" style="margin-left: 10px">
          <img src="@/assets/yonghu/icon1.3.png" alt="" />
          <span style="margin-left: 6px; color: #5a5a5a">导出pdf</span>
        </div>
<!--        <div class="code-book-title" style="color: #575556;padding: 3px" >{{ currentCodeBookName }}</div>-->
      </div>
      <div class="yuangong-table">
        <el-table
          :data="tableData"
          style="width: 100%; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
          border
          :header-cell-style="{ height:'45px', background: '#46B97E', color: '#FFFFFF' }"
          :row-style="{ height: '45px' }"
          v-loading="isLoading"
        >
          <el-table-column label="序号" min-width="70" align="center" fixed="left" #default="scope">
            {{ scope.$index + 1 + (params.pageNo - 1) * params.pageSize }}
          </el-table-column>
          <el-table-column prop="userId" label="用户号" align="center" min-width="110"/>
          <el-table-column prop="userName" label="用户名" align="center" min-width="120"/>
          <el-table-column prop="meterCode" label="表号" align="center" min-width="150"/>
          <el-table-column prop="userAddr" label="地址" align="center" min-width="130" />
          <el-table-column prop="month1" label="1月" align="center" min-width="80"/>
          <el-table-column prop="month2" label="2月" align="center" min-width="80"/>
          <el-table-column prop="month3" label="3月" align="center" min-width="80"/>
          <el-table-column prop="month4" label="4月" align="center" min-width="80"/>
          <el-table-column prop="month5" label="5月" align="center" min-width="80"/>
          <el-table-column prop="month6" label="6月" align="center" min-width="80"/>
          <el-table-column prop="month7" label="7月" align="center" min-width="80"/>
          <el-table-column prop="month8" label="8月" align="center" min-width="80"/>
          <el-table-column prop="month9" label="9月" align="center" min-width="80"/>
          <el-table-column prop="month10" label="10月" align="center" min-width="80"/>
          <el-table-column prop="month11" label="11月" align="center" min-width="80"/>
          <el-table-column prop="month12" label="12月" align="center" min-width="80"/>
        </el-table>
      </div>
      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination v-model:current-page="params.pageNo" v-model:page-size="params.pageSize" :page-sizes="[5, 10, 15]" layout="total,  prev, pager, next, jumper" :total="total"
                         @current-change="handlePageChange"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import service from "@/api/request";
import { ElMessage } from "element-plus";

export default {
  data() {
    return {
      params: {
        companyId: null,
        pageNo: 1,
        pageSize: 30,
        region: null,
        codeBook: null,
        queryYear: this.getCurMonthStr()
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      companyList: [],
      tableData: [],
      total: 0,
      isLoading: false,
      regionList:[],
      codeBookList:[],
      allCodeBookList:[],
      currentCodeBookName: '',
    };
  },
  mounted() {
    if (this.companyId === 1) {
      this.getCompanyList();
    }
    if(this.companyId !== 1){
      this.params.companyId = this.companyId
      this.handleCompanyChange(this.companyId)
    }
  },
  methods: {
    async handleCompanyChange(companyId){
      if(!companyId){
        this.regionList = [];
        this.allCodeBookList = [];
        this.codeBookList = [];
        this.params.region = null;
        this.params.codeBook = null;
        return;
      }
      try{
        const res = await service.get(`/getRegion?companyId=${companyId}`);
        if(res.code===200){
          const allRegions = res.data||[];
          //参考页过滤普表逻辑
          if(companyId ===95){
            this.regionList = allRegions;
          }else{
            this.regionList = allRegions.filter(r=>
              (r.regionName && r.regionName.includes('普表')) || r.regionType ===3
            )
          }
          if(this.regionList.length ===0){
            ElMessage.warning('该水厂下暂无普表区域')
          }
        }else{
          this.regionList = [];
        }
      }catch(e){
        console.error(e);
        this.regionList = [];
      }
      //清空下游
      this.allCodeBookList = [];
      this.codeBookList = [];
      this.params.region = null;
      this.params.codeBook = null;
    },
    filterRegion(){},
    filterCodeBook(val){
      if(!val){
        this.codeBookList = this.allCodeBookList;
        return;
      }
      const keyword = val.toLowerCase();
      this.codeBookList = (this.allCodeBookList||[]).filter(item=>
        (item.codeBookName && item.codeBookName.toLowerCase().includes(keyword)) ||
        (item.codeBookId !=null && item.codeBookId.toString().includes(keyword))
      )
    },
    async handleRegionChange(regionId){
      this.params.codeBook = null;
      if(!regionId){
        this.allCodeBookList = [];
        this.codeBookList = [];
        return;
      }
      try{
        const res = await service.get(`/getCodeBookByRegion?companyId=${this.params.companyId}&regionId=${regionId}`);
        if(res.code===200){
          this.allCodeBookList = res.data||[];
          this.codeBookList = this.allCodeBookList;
          if(this.allCodeBookList.length === 1){
            const only = this.allCodeBookList[0];
            this.params.codeBook = only.codeBookId;
            this.currentCodeBookName = only.codeBookName;
            this.search();
          }
        }else{
          this.allCodeBookList = [];
          this.codeBookList = [];
        }
      }catch(e){
        console.error(e);
        this.allCodeBookList = [];
        this.codeBookList = [];
      }
    },
//表册切换
    handleCodeBookChange(codeBookId){
      const findItem = this.allCodeBookList.find(d=>d.codeBookId === codeBookId)
      this.currentCodeBookName = findItem ? findItem.codeBookName : ''
      this.search();
    },
    getCurMonthStr(){
      const now = new Date();
      const y = now.getFullYear();
      return String(y);
    },
    handlePageChange(page) {
      if (this.isLoading) return;
      this.params.pageNo = page;
      this.fetchReport();
    },
    getCompanyList() {
      service
        .get("/getAllCompany")
        .then((response) => {
          if (response.code === 200) {
            this.companyList = response.data.map((item) => ({
              id: item.companyId,
              name: item.companyName,
            }));
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    search() {
      // 参数校验
      if (!this.params.companyId) {
        ElMessage.warning("请选择水厂");
        return;
      }
      if (!this.params.region) {
        ElMessage.warning("请选择区域");
        return;
      }
      if (!this.params.codeBook) {
        ElMessage.warning("请选择表册");
        return;
      }
      if (!this.params.queryYear) {
        ElMessage.warning("请选择年份");
        return;
      }
      this.params.pageNo = 1;
      if (this.companyId === 1) {
        this.params.companyId = this.params.companyId || null;
      } else {
        this.params.companyId = this.companyId;
      }
      this.fetchReport();
    },
    clear() {
      this.params.region = null;
      this.params.codeBook = null;
      this.currentCodeBookName = '';
      this.params.pageNo = 1;
      this.params.queryYear = this.getCurMonthStr();
      this.tableData = [];
      this.total = 0;
      if (this.companyId === 1) {
        this.regionList = [];
        this.params.companyId = null;
      }
      this.allCodeBookList = [];
      this.codeBookList = [];
    },
    async handleExport() {
      if (!this.params.companyId || !this.params.region || !this.params.codeBook || !this.params.queryYear) {
        ElMessage.warning("请先完成查询条件选择");
        return;
      }
      let token = "";
      const userData = sessionStorage.getItem("userData");
      if (userData) token = JSON.parse(userData).token;
      try {
        const res = await service.get(`/manual/charge/meterBookYearReport/export?regionId=${this.params.region}&codeBookId=${this.params.codeBook}&queryYear=${this.params.queryYear}&pageNum=${this.params.pageNo}&pageSize=${this.params.pageSize}`, {
          responseType: "blob",
          headers: { Authorization: token, token: token }
        });
        const blob = new Blob([res.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `${this.params.queryYear}年度抄表册报表.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        ElMessage.success("导出成功");
      }catch (err) {
        ElMessage.error("导出失败");
        console.error(err);
      }
    },
    async handleExportPdf() {
      if (!this.params.companyId || !this.params.region || !this.params.codeBook || !this.params.queryYear) {
        ElMessage.warning("请先完成查询条件选择");
        return;
      }
      let token = "";
      const userData = sessionStorage.getItem("userData");
      if (userData) token = JSON.parse(userData).token;
      try {
        const res = await service.get(`/manual/charge/meterBookYearReport/exportpdf?regionId=${this.params.region}&codeBookId=${this.params.codeBook}&queryYear=${this.params.queryYear}`, {
          responseType: "blob",
          headers: { authentication: token, Authorization: token, token: token }
        });
        const blob = new Blob([res.data], { type: "application/pdf" });
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = this.getPdfFileName(res.headers && res.headers["content-disposition"]);
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        ElMessage.success("导出成功");
      }catch (err) {
        ElMessage.error("导出失败");
        console.error(err);
      }
    },
    getPdfFileName(contentDisposition) {
      if (contentDisposition) {
        const starMatch = contentDisposition.match(/filename\*=([^']*)''([^;]+)/i);
        let name = "";
        if (starMatch && starMatch[2]) {
          try {
            name = decodeURIComponent(starMatch[2].trim());
          } catch (e) {}
        }
        if (!name) {
          const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
          if (plainMatch && plainMatch[1]) name = plainMatch[1].trim();
        }
        if (name) return name;
      }
      return `抄表册报表-${this.currentCodeBookName}.pdf`;
    },
    async fetchReport() {
      this.isLoading = true;
      let token = "";
      const userData = sessionStorage.getItem("userData");
      if (userData) {
        try {
          token = JSON.parse(userData).token;
        } catch (e) {}
      }
      try {
        const res = await service.get(`/manual/charge/meterBookYearReport?regionId=${this.params.region}&codeBookId=${this.params.codeBook}&queryYear=${this.params.queryYear}&pageNum=${this.params.pageNo}&pageSize=${this.params.pageSize}`, {
          headers: { Authorization: token, token: token }
        });
        if(res.code === 200){
          this.tableData = res.data.list;
          this.total = res.data.total;
        }else{
          ElMessage.error(res.msg||"获取报表失败")
        }
      } catch (err) {
        ElMessage.error("获取报表失败");
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
:deep(.el-table__body tr:nth-child(odd)) {
  background-color: #edf8f2;
}

:deep(.el-table__body tr:nth-child(even)) {
  background-color: #ffffff;
}

:deep(.el-table__body tr:hover > td) {
  background-color: #fbf2cb !important;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #45bb81;
  border-color: #45bb81;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner::after) {
  border-color: #fff;
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

.yuangong-container {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  min-width: 94%;
  height: 100%;
  padding: 0px 15px;
}

.search-box {
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
}

.search-content {
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  width: 80%;
  min-height: 100%;
}

.search-input {
  display: flex;
  flex-direction: column;
  width: 15%;
  margin-right: 10px;
  height: 100%;
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
  position: absolute;
  right: 10px;
  margin-left: 0;
}

.buttons > * {
  width: 100px;
  margin-right: 10px;
}

.sercah-btn,
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

.sercah-btn {
  background-color: #45ba7e;
}

.clear-btn {
  background-color: #fff;
  border: 2px solid #f2f2f2;
  margin-right: 10px;
}
.export-out-btn {
  display: flex;
  align-items: center;
  width: auto;
  height: 32px;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 18px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
  padding: 0 8px;
  white-space: nowrap;
}

.export-out-btn:hover {
  border-color: #45ba7e;
}

.yuangong-info {
  width: 99.3%;
  height: calc(100% - 120px);
  margin-bottom: 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  background-color: #fff;
  position: relative;
  padding: 0 10px;
}

.yuangong-table,
.page-box {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.yuangong-table {
  height: calc(100% - 100px);
  margin-top: 8px;
}

.page-box {
  height: 40px;
  position: absolute;
  bottom: 0;
}
.report-title {
  display: flex;
  text-align: center;
  margin-top: 10px;
  width: 100%;
}

/* 汇总行样式：绿色底色+白色加粗文字，和表头风格统一 */
:deep(.summary-row) {
  height: 50px !important;
  background-color: #46B97E !important;
}
:deep(.summary-row td) {
  font-weight: bold;
  color: #ffffff;
  font-size: 20px;
  text-align: center;
}
</style>

<style scoped>
:deep(.el-input__inner) {
  font-size: 16px !important;
}

:deep(.el-select__wrapper .el-select__placeholder) {
  font-size: 16px !important;
}

:deep(.el-select__wrapper .el-select__selected-item) {
  font-size: 16px !important;
}
</style>