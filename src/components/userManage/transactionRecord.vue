<template>
  <div class="transaction-record-dialog" v-if="transaction_dialogFormVisible">
    <div class="transaction-record-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon11.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 18px">历史交易记录</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleTransactionRecordClose">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="transaction-record-content">
        <div class="serach-box">
          <div class="search-input" style="width: 30%; margin-right: 10px">
            <span>时间</span>
            <div class="time-input">
              <el-select v-model="transactionData.time.type" placeholder="请选择" style="width: 100px; margin-right: 10px">
                <el-option label="年" value="year" selected style="color: #46b97e"></el-option>
                <el-option label="月" value="month" selected style="color: #46b97e"></el-option>
                <el-option label="日" value="day" selected style="color: #46b97e"></el-option>
              </el-select>
              <div v-if="transactionData.time.type === 'year'" style="margin-right: 0px; flex-grow: 1">
                <div style="display: flex; align-items: center">
                  <el-date-picker v-model="transactionData.time.accurateTime" type="year" placeholder="选择年份" style="flex-grow: 1; width: 100%; height: 35px" value-format="YYYY" />
                </div>
              </div>
              <div v-if="transactionData.time.type === 'month'" style="margin-right: 0px; flex-grow: 1">
                <div style="display: flex; align-items: center">
                  <el-date-picker v-model="transactionData.time.accurateTime" type="month" placeholder="选择月份" style="flex-grow: 1; width: 100%; height: 35px" value-format="YYYY-MM" />
                </div>
              </div>
              <div v-if="!transactionData.time.type || transactionData.time.type === 'day'" style="margin-right: 0px; flex-grow: 1">
                <div style="display: flex; align-items: center">
                  <el-date-picker
                    v-model="transactionData.time.accurateTime"
                    type="date"
                    placeholder="选择日期"
                    style="flex-grow: 1; width: 100%; height: 35px"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="buttons" style="margin-left: 10%; margin-right: 10px">
            <div class="sercah-btn" @click="search">
              <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: 8px" />
              <span style="font-size: 16px; margin-left: 15%">搜索</span>
            </div>
            <div class="clear-btn" @click="clear">
              <img src="@/assets/yonghu/icon4.png" alt="" style="margin-left: 8px" />
              <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">清空</span>
            </div>
          </div>
        </div>
        <div class="transaction-list">
          <div class="command-buttons">
            <!-- <div class="export-in-btn" style="margin-right: 10px" @click="triggerFileInput">
              <img src="@/assets/yonghu/icon1.png" alt="" style="margin-left: 7px" />
              <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">导入</span>
              <input ref="fileInput" type="file" accept=".xls,.xlsx" style="display: none" @change="exportIn" />
            </div> -->
            <div class="export-out-btn" style="margin-right: 10px" @click="exportExcel">
              <img src="@/assets/yonghu/icon2.png" alt="" style="margin-left: 7px" />
              <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">导出</span>
            </div>
            <div class="reflush" style="margin-right: 10px" @click="reflush">
              <img src="@/assets/yonghu/icon15.png" alt="" />
            </div>
          </div>
          <div class="transaction-table">
            <el-table
              ref="multipleTableRef"
              :data="transactionTableData"
              row-key="index"
              style="width: auto; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
              :max-height="tableMaxHeight"
              border
              :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
              @selection-change="handleSelectionChange"
              id="transaction-record-table"
            >
              <el-table-column type="selection" :selectable="selectable" width="55" align="center" fixed="left" />
              <el-table-column property="index" label="序号" width="180" align="center" fixed="left" />
              <el-table-column property="uuid" label="用户号" width="300" align="center" />
              <el-table-column property="user_name" label="用户名称" width="300" align="center" />
              <el-table-column property="water_meter_uid" label="表号" width="300" align="center" />
              <el-table-column property="report_time" label="交易时间" width="300" align="center" />
              <el-table-column property="recharge_type" label="交易方式" width="300" align="center" />
              <el-table-column property="recharge_price" label="交易金额" width="300" align="center" />
              <el-table-column property="bef_recharge_price" label="充值前余额/元" width="300" align="center" />
              <el-table-column property="aft_recharge_price" label="充值后余额/元" width="300" align="center" />
            </el-table>
          </div>
        </div>
        <div class="page-box">
          <div class="demo-pagination-block">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 15]" layout="total,  prev, pager, next, jumper" :total="total" />
          </div>
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
  props: {
    transaction_dialogFormVisible: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      transactionData: {
        time: {
          type: "",
          accurateTime: "",
        },
        water_meter_uid: "",
      },
      startData: {
        water_meter_uid: "",
      },
      transactionTableData: [],
      multipleSelection: [], //存储当前勾选的行的数据信息
      currentPage: 1,
      pageSize: 30,
      total: null,
    };
  },
  computed: {
    tableMaxHeight() {
      return "40vh";
    },
  },
  watch: {
    currentPage() {
      this.getTransactionRecordData();
    },
  },
  mounted() {
    this.assignmentData();
    this.getTransactionRecordData();
  },
  methods: {
    selectable() {
      return true; // 目前允许所有行选择，你可以加上你的业务逻辑
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleTransactionRecordClose() {
      this.$emit("close");
    },
    assignmentData() {
      this.transactionData.water_meter_uid = this.data.meterCode;
      this.startData.water_meter_uid = this.data.meterCode;
      console.log(this.startData);
    },
    getTransactionRecordData() {
      const nonEmptyParams = this.filterNonEmptyParams(this.startData);
      // 如果有非空参数，则发起请求
      if (Object.keys(nonEmptyParams).length > 0) {
        // 初始化查询字符串
        let queryString = "";
        // 遍历 nonEmptyParams 对象，将键值对拼接成查询字符串
        for (const key in nonEmptyParams) {
          if (nonEmptyParams.hasOwnProperty(key)) {
            const value = nonEmptyParams[key];
            // 如果查询字符串不为空，添加 & 符号分隔参数
            if (queryString) {
              queryString += `&${key}=${encodeURIComponent(value)}`;
            } else {
              // 第一个参数前添加 ? 符号
              queryString += `?${key}=${encodeURIComponent(value)}`;
            }
          }
        }
        // 拼接完整的 URL
        const url = `/userManage/userCharge/showSingleRechargeMeterRecords/${this.currentPage}${queryString}`;
        console.log(url);
        service
          .get(url)
          .then((response) => {
            if (response.code === 200) {
              this.transactionTableData = response.data.userInfoData;
              this.transactionTableData.forEach((item) => {
                item.report_time = item.report_time.replace("T", " ");
              });
              this.total = response.data.totalElements;
              console.log(this.transactionTableData);
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          });
      }
    },
    reflush() {
      service
        .get(`/userManage/userCharge/showSingleRechargeMeterRecords/1?water_meter_uid=${this.data.meterCode}`)
        .then((response) => {
          if (response.code === 200) {
            this.transactionTableData = response.data.userInfoData;
            this.transactionTableData.forEach((item) => {
              item.report_time = item.report_time.replace("T", " ");
            });
            this.total = response.data.totalElements;
            this.currentPage = 1;
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    clear() {
      this.transactionData.time.type = "";
      this.transactionData.time.accurateTime = "";
    },
    // 过滤掉值为空的参数
    filterNonEmptyParams(params) {
      const filteredParams = {};
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          const value = params[key];
          if (typeof value === "object") {
            if (key === "time" && value.accurateTime) {
              let formattedTime = "";
              let type = null;
              switch (value.type) {
                case "year":
                  formattedTime = `${value.accurateTime}-01-01 00:00:00`;
                  type = 1;
                  break;
                case "month":
                  formattedTime = `${value.accurateTime}-01 00:00:00`;
                  type = 2;
                  break;
                case "day":
                  formattedTime = `${value.accurateTime} 00:00:00`;
                  type = 3;
                  break;
              }
              if (formattedTime) {
                // 将处理好的时间以 record_time 字段添加到过滤后的参数中
                filteredParams["record_time_type"] = type;
                filteredParams["record_time"] = formattedTime;
              }
            } else {
              const subFiltered = this.filterNonEmptyParams(value);
              if (Object.keys(subFiltered).length > 0) {
                filteredParams[key] = subFiltered;
              }
            }
          } else if (value !== "") {
            filteredParams[key] = value;
          }
        }
      }
      return filteredParams;
    },
    search() {
      const nonEmptyParams = this.filterNonEmptyParams(this.transactionData);
      console.log(nonEmptyParams);
      // 如果有非空参数，则发起请求
      if (Object.keys(nonEmptyParams).length > 0) {
        // 初始化查询字符串
        let queryString = "";
        // 遍历 nonEmptyParams 对象，将键值对拼接成查询字符串
        for (const key in nonEmptyParams) {
          if (nonEmptyParams.hasOwnProperty(key)) {
            const value = nonEmptyParams[key];
            // 如果查询字符串不为空，添加 & 符号分隔参数
            if (queryString) {
              queryString += `&${key}=${encodeURIComponent(value)}`;
            } else {
              // 第一个参数前添加 ? 符号
              queryString += `?${key}=${encodeURIComponent(value)}`;
            }
          }
        }
        // 拼接完整的 URL
        const url = `/userManage/userCharge/showSingleRechargeMeterRecords/${this.currentPage}${queryString}`;
        service
          .get(url)
          .then((response) => {
            if (response.code === 200) {
              console.log(response.data.userInfoData);
              this.transactionTableData = response.data.userInfoData;
              this.total = response.data.totalElements;
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          });
      } else {
        ElMessage.error("请输入搜索条件");
      }
    },
    // 触发文件输入框点击
    triggerFileInput() {
      ElMessage.warning("暂不支持该功能");
    },
    // triggerFileInput() {
    //   this.$refs.fileInput.value = ""; // 清空文件输入框，确保每次点击都能触发 @change
    //   this.$refs.fileInput.click();
    // },
    // 处理文件上传
    async exportIn() {
      const fileInput = this.$refs.fileInput;
      const file = fileInput.files[0];

      if (!file) {
        ElMessage.warning("请选择要上传的文件");
        return;
      }

      // 文件类型验证
      const allowedTypes = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
      if (!allowedTypes.includes(file.type)) {
        ElMessage.warning("仅支持上传 .xls 或 .xlsx 文件");
        return;
      }

      // 文件大小限制（例如 10MB）
      // const maxSize = 10 * 1024 * 1024; // 10MB
      // if (file.size > maxSize) {
      //   ElMessage.warning("文件大小不能超过 10MB");
      //   return;
      // }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await service.post("/uploadInvoiceList", formData);
        ElMessage.success("导入成功");
        fileInput.value = ""; // 清空文件输入框
        this.reflush();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "未知错误";
        ElMessage.error("导入失败: " + errorMessage);
        console.error("上传失败:", error);
      }
    },
    exportExcel() {
      const recordIdList = this.transactionTableData.map((item) => item.recordId); // 获取选中行的 recordId列表;
      console.log(recordIdList);
      // 调用后端接口
      axios({
        url: "/userManage/userCharge/exportMeterHisTradeReport", // 后端接口地址
        method: "POST",
        responseType: "blob", // 指定响应类型为二进制流
        // params: {
        //   recordIdList: JSON.stringify(recordIdList),
        // },
        data: {
          recordIdList,
        },
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error("导出失败: " + response.statusText);
          }

          // 获取 Blob 对象
          const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

          if (blob.size === 0) {
            alert("内容为空，无法下载");
            return;
          }

          // 创建一个链接元素
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob); // 创建 Blob URL
          link.download = "用户历史交易记录.xlsx"; // 设置下载文件名
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

<style>
.transaction-record-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.transaction-record-dialog-content {
  width: 80%;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.transaction-record-content {
  width: 100%;
  min-height: 42vh;
  background: none;
  margin-top: 0px;
  margin-bottom: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-wrap: nowrap;
  padding: 1%;
  overflow-y: auto;
}

.serach-box {
  margin-top: 15px;
  margin-bottom: 20px;
  height: 100px;
  display: flex;
  align-items: center;
}

.search-input {
  display: flex;
  justify-content: flex-start;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 12%;
  height: 100%;
  margin-right: 20px;
}

.search-input > span {
  font-size: 14px;
  margin-bottom: 5px;
}

.time-input {
  display: flex;
  width: 100%;
}

.time-input > * {
  width: 50%;
  margin-right: 20px;
}

.transaction-record-content > .serach-box {
  background-color: #fff;
  border-radius: 5px;
  width: 96%;
  height: 100px;
  margin-top: 5px;
  margin-bottom: 5px;
  padding: 0 10px;
}

.transaction-record-content > .transaction-list {
  width: 96%;
  /* height: 100%; */
  background-color: #fff;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
  padding: 0 10px;
  margin-bottom: 50px;
}

.command-buttons {
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  margin-top: 10px;
  margin-bottom: 5px;
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

.transaction-table {
  width: 100%;
  height: 40vh;
  margin-top: 5px;
  overflow-y: auto;
}

.title {
  width: 100%;
  background-color: #fff;
  border-radius: 5px 5px 0 0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  height: 45px;
  line-height: 45px;
  text-align: center;
  display: flex;
  justify-content: space-between;
}

.page-box {
  width: 100%;
  height: 65px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 0;
}
</style>
