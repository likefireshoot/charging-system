<template>
  <div class="tongzhi-container">
    <div class="search-box">
      <div class="search-content">
        <div class="search-input" style="margin-left: 10px" v-if="companyId === 1">
          <span>所属水厂</span>
          <el-select v-model="params.company" placeholder="请选择所属水厂">
            <el-option v-for="item in companyList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>所属区域</span>
          <el-select v-model="params.regionName" placeholder="请选择...">
            <el-option v-for="item in quyu_data" :key="item.id" :label="item.label" :value="item.label"> </el-option>
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>用户号</span>
          <el-input v-model="params.userId" placeholder="请输入..." />
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>用户名称</span>
          <el-input v-model="params.userName" placeholder="请输入..." />
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>表号</span>
          <el-input v-model="params.meterCode" type="number" placeholder="请输入..." />
        </div>
        <!-- <div class="search-input" style="margin-left: 10px">
          <span>IMEI号</span>
          <el-input v-model="params.imei" placeholder="请输入..." />
        </div> -->
        <div class="search-input" style="width: 37%; margin-left: 10px">
          <span>时间</span>
          <div class="time-input">
            <el-date-picker
              v-model="params.startTime"
              type="datetime"
              placeholder="选择日期"
              style="flex-grow: 0; width: 210px; flex-basis: auto; margin-right: 5px; height: 35px"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
            <span>至</span>
            <el-date-picker
              v-model="params.endTime"
              type="datetime"
              placeholder="选择日期"
              style="flex-grow: 0; width: 210px; flex-basis: auto; height: 35px"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </div>
        </div>
      </div>
      <div class="buttons">
        <div class="sercah-btn" @click="search">
          <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 15%">搜索</span>
        </div>
        <div class="clear-btn" @click="clear">
          <img src="@/assets/tongzhi/icon4.png" alt="" style="margin-left: 10px" />
          <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">清空</span>
        </div>
      </div>
    </div>
    <div class="tongzhi-info">
      <div class="command-box">
        <!-- <div class="export-in-btn" style="margin-left: 10px" @click="triggerFileInput">
          <img src="@/assets/tongzhi/icon1.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">导入</span>
          <input ref="fileInput" type="file" accept=".xls,.xlsx" style="display: none" @change="exportIn" />
        </div> -->
        <div class="export-out-btn" style="margin-left: 10px" @click="exportExcel">
          <img src="@/assets/tongzhi/icon2.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">导出</span>
        </div>
        <div class="reflush" style="margin-left: 10px" @click="reflush">
          <img src="@/assets/yonghu/icon15.png" alt="" />
        </div>
      </div>
      <div class="tongzhi-table">
        <el-table
          ref="multipleTableRef"
          :data="smsData"
          row-key="smsRecordId"
          style="width: 98%; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
          border
          :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
          @selection-change="handleSelectionChange"
          id="log-table"
        >
          <el-table-column type="selection" :selectable="selectable" min-width="40" align="center" fixed="left" />
          <!-- <el-table-column label="序号" width="120" align="center" fixed="left" #default="scope">
            {{ scope.$index + 1 + (params.pageNo - 1) * params.pageSize }}
          </el-table-column> -->
          <el-table-column property="userId" label="用户号" min-width="50" align="center" fixed="left" />
          <el-table-column property="userName" label="用户名称" min-width="70" align="center" />
          <el-table-column property="userPhone" label="联系电话" min-width="70" align="center" />
          <el-table-column property="meterCode" label="表号" min-width="100" align="center" />
          <!-- <el-table-column property="imei" label="IMEI号" width="240" align="center" /> -->
          <el-table-column property="balance" label="当前余额/元" min-width="70" align="center" />
          <el-table-column property="monthlyWaterCosts" label="本月用水量/吨" min-width="70" align="center" />
          <el-table-column property="monthlyMoneyCosts" label="本月消费金额/元" min-width="70" align="center" />
          <el-table-column property="arrears" label="欠费金额/元" min-width="70" align="center" />
          <el-table-column property="minimumBalanceThreshold" label="余额不足触发值/元" min-width="70" align="center" />
          <el-table-column property="createTime" label="短信发送时间" min-width="120" align="center" />
          <el-table-column property="regionName" label="所属区域" min-width="80" align="center" />
          <el-table-column property="companyName" label="所属水厂" min-width="70" align="center" />
          <el-table-column property="userAddr" label="用户住址" min-width="100" align="center" />
          <!-- <el-table-column property="sendContent" label="短信内容" width="180" align="center" /> -->
        </el-table>
      </div>
      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination v-model:current-page="params.pageNo" v-model:page-size="params.pageSize" :page-sizes="[5, 10, 15]" layout="total,  prev, pager, next, jumper" :total="total" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import service from "@/api/request";
import { ElMessage } from "element-plus";
import axios from "axios";
export default {
  data() {
    return {
      params: {
        company: null, // 所属水厂
        regionName: "",
        userId: "",
        userName: "",
        meterCode: null,
        imei: "",
        startTime: "",
        endTime: "",
        pageNo: 1,
        pageSize: 50,
        companyId: null,
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId, // 公司ID
      quyu_data: [],
      smsData: [],
      multipleSelection: null,

      total: null,

      //表格勾选行
      selection: [],
      companyList: [],
    };
  },
  watch: {
    "params.pageNo": {
      handler() {
        this.getSmsRecordData();
      },
    },
    "params.startTime": {
      handler(newVal) {
        this.checkDateRange();
      },
      immediate: true,
    },
    "params.endTime": {
      handler(newVal) {
        this.checkDateRange();
      },
      immediate: true,
    },
    "params.company"() {
      this.params.regionName = "";
      this.getRegionData();
    },
  },
  mounted() {
    this.getRegionData();
    this.getSmsRecordData();
    this.getCompanyList();
  },
  methods: {
    selectable() {
      return true; // 目前允许所有行选择，你可以加上你的业务逻辑
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
    checkDateRange() {
      const { startTime, endTime } = this.params;
      const today = new Date();

      if (startTime && endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (end <= start) {
          const nextDay = new Date(start);
          nextDay.setDate(nextDay.getDate() + 1);
          this.params.endTime = this.formatDate(nextDay);
        } else if (end > today) {
          this.params.endTime = this.formatDate(today);
        }
      } else if (startTime) {
        const start = new Date(startTime);
        if (start > today) {
          today.setHours(0, 0, 0, 0);
          this.params.startTime = this.formatDate(today);
        }
      } else if (endTime) {
        const end = new Date(endTime);
        if (end > today) {
          this.params.endTime = this.formatDate(today);
        }
      }
    },
    getCompanyList() {
      service
        .get("/getAllCompany")
        .then((response) => {
          if (response.code === 200) {
            this.companyList = response.data.map((item) => {
              return {
                id: item.companyId,
                name: item.companyName,
              };
            });
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    getRegionData() {
      let url = "";
      if (this.companyId === 1) {
        if (this.params.company) {
          url = `/getRegion?companyId=${this.params.company}`; // 所属水厂ID
        } else {
          url = `/getRegion`; // 所属水厂ID
        }
      } else {
        url = `/getRegion?companyId=${this.companyId}`; // 所属水厂ID
      }
      console.log(url);
      service
        .get(`${url}`)
        .then((response) => {
          if (response.code === 200) {
            this.quyu_data = response.data.map((item) => {
              return {
                id: item.regionId,
                value: item.regionId,
                label: item.regionName,
              };
            });
          }
        })
        .catch((error) => {
          ElMessage.error("获取区域数据失败");
        });
    },

    getSmsRecordData() {
      if (this.companyId === 1) {
        if (this.params.company) {
          this.params.companyId = this.params.company; // 所属水厂ID
        }
      } else {
        this.params.companyId = this.companyId; // 所属水厂ID
      }
      const filteredParams = Object.fromEntries(Object.entries(this.params).filter(([_, value]) => value !== null && value !== ""));
      service
        .post("/sms/querySmsRecord", filteredParams)
        .then((response) => {
          if (response.code === 200) {
            this.smsData = response.data.records;
            this.total = response.data.total;
            this.params.pageNo = response.data.current; // 更新当前页码
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },

    search() {
      this.getSmsRecordData();
    },

    clear() {
      this.params.regionName = "";
      this.params.userId = "";
      this.params.userName = "";
      this.params.meterCode = null;
      this.params.imei = null;
      this.params.startTime = null;
      this.params.endTime = null;
      this.params.companyId = null;
      this.params.company = null; // 清空所属水厂
    },

    reflush() {
      this.clear();
      this.params.pageNo = 1; // 重置页码
      this.params.pageSize = 50; // 重置每页条数
      let params = {
        pageNo: 1,
        pageSize: 50,
      };
      if (this.companyId === 1) {
        if (this.params.company) {
          params.companyId = this.params.company; // 所属水厂ID
        }
      } else {
        params.companyId = this.companyId; // 所属水厂ID
      }
      service
        .post("/sms/querySmsRecord", params)
        .then((response) => {
          if (response.code === 200) {
            this.smsData = response.data.records;
            this.total = response.data.total;
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },

    exportExcel() {
      let url = "";
      let params = {};
      if (this.companyId === 1) {
        if (this.params.company) {
          params.companyId = this.params.company; // 所属水厂ID
          url = `/sms/exportSmsRecord?companyId=${params.companyId}`; // 后端接口地址
        } else {
          url = `/sms/exportSmsRecord`; // 后端接口地址
        }
      } else {
        params.companyId = this.companyId; // 所属水厂ID
        url = `/sms/exportSmsRecord?companyId=${params.companyId}`;
      }
      // 调用后端接口
      axios({
        url: url, // 后端接口地址
        method: "GET",
        responseType: "blob", // 指定响应类型为二进制流
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error("导出失败: " + response.statusText);
          }

          // 获取 Blob 对象
          const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

          if (blob.size === 0) {
            ElMessage.warning("内容为空，无法下载");
            return;
          }

          // 创建一个链接元素
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob); // 创建 Blob URL
          link.download = "短信记录数据列表.xlsx"; // 设置下载文件名
          document.body.appendChild(link);
          link.click(); // 触发下载
          document.body.removeChild(link); // 移除链接元素
          window.URL.revokeObjectURL(link.href); // 释放 Blob URL
        })
        .catch((error) => {
          console.error("导出失败:", error);
          ElMessage.error("导出失败: " + error.message);
        });
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

/* 修改勾选框选中时的背景颜色和边框颜色 */
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

:deep(.el-select) {
  --el-color-primary: #46b97e;
}

:deep(.el-select .el-select__wrapper) {
  height: 35px;
}

:deep(.el-pagination) {
  --el-color-primary: #46b97e;
}

:deep(.el-tree) {
  --el-fill-color-light: #46b97e;
  --el-fill-color-blank: #e8f3ed;
  --el-text-color-primary: #fff;
}

:deep(.el-tree-node__content) {
  height: 40px;
  line-height: 40px;
  border-radius: 5px;
  margin: 0 10px;
}

/* 设置鼠标滑过选项时的字体颜色 */
:deep(.el-tree-node__content:hover) {
  color: #fff;
}

.tongzhi-container {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  width: 100%;
  height: 98%;
  padding: 0px 20px;
}

.search-box {
  margin-top: 15px;
  margin-bottom: 20px;
  width: 100%;
  height: 98px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  background-color: #fff;
}

.search-content {
  display: flex;
  width: 80%;
  height: 100%;
}

.search-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 15%;
  height: 100%;
  margin-right: 10px;
}

.search-input > span {
  font-size: 14px;
  margin-bottom: 5px;
}

.time-input {
  display: flex;
}

.time-input > span {
  font-size: 14px;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 100%;
  margin-right: 5px;
}

.buttons {
  display: flex;
  width: 240px;
  height: 100%;
  align-items: center;
  margin-left: 100px;
  margin-right: 30px;
}

.buttons > * {
  width: 120px;
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
}

.sercah-btn {
  background-color: #45ba7e;
  margin-right: 30px;
}
.clear-btn {
  background-color: #fff;
  border: 2px solid #f2f2f2;
  margin-right: 10px;
}

.tongzhi-info {
  width: 100%;
  height: calc(100% - 135px);
  margin-bottom: 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  background-color: #fff;
  position: relative;
}

.command-box {
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  margin-top: 15px;
  margin-bottom: 15px;
}

.command-box > * {
  margin-right: 20px;
}

.export-in-btn,
.export-out-btn {
  display: flex;
  align-items: center;
  width: 80px; /* 设置按钮的宽度 */
  height: 32px; /* 设置按钮的高度 */
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
}

.reflush {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px; /* 设置按钮的宽度 */
  height: 32px; /* 设置按钮的高度 */
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
}

.tongzhi-table,
.page-box {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tongzhi-table {
  height: calc(98% - 110px);
}

.page-box {
  height: 65px;
  position: absolute;
  bottom: 0;
}

.btn {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 15px;
}

.confirm-btn,
.cancel-btn {
  height: 35px;
  width: 90px;
  cursor: pointer;
  border: 1px solid #f2f2f2;
  border-radius: 5px;
  display: flex;
  align-items: center;
}

.confirm-btn {
  background-color: #45ba7e;
  margin-right: 15px;
  color: #fff;
}

.cancel-btn {
  background-color: #fff;
  margin-right: 5%;
}
</style>
