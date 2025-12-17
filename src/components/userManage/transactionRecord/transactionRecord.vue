<template>
   <div class="transaction-record-content">
        <div class="serach-box">
         <div class="search-input" style="width:15% ;margin-right: 10px;margin-top: 55px;">
         <el-select v-model="title" placeholder="请选择" style="width: 100%;">
              <el-option v-for="item in transactionOrChargeRecordList" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
         </div>
          <div class="search-input" style="width:40% ;margin-right: 10px;margin-top: 55px;">          
            <span>时间</span>
            <div class="time-input">
              <el-select v-model="transactionData.timeType" placeholder="请选择" style="width: 100px; margin-right: 10px">
                <el-option label="年" value="year" selected style="color: #46b97e"></el-option>
                <el-option label="月" value="month" selected style="color: #46b97e"></el-option>
                <el-option label="日" value="day" selected style="color: #46b97e"></el-option>
              </el-select>
              <div v-if="transactionData.timeType === 'year'" style="margin-right: 0px; flex-grow: 1">
                <div style="display: flex; align-items: center">
                  <el-date-picker v-model="transactionData.createTime" type="year" placeholder="选择年份"
                    style="flex-grow: 1; width: 100%; height: 35px" value-format="YYYY" />
                </div>
              </div>
              <div v-if="transactionData.timeType === 'month'" style="margin-right: 0px; flex-grow: 1">
                <div style="display: flex; align-items: center">
                  <el-date-picker v-model="transactionData.createTime" type="month" placeholder="选择月份"
                    style="flex-grow: 1; width: 100%; height: 35px" value-format="YYYY-MM" />
                </div>
              </div>
              <div v-if="!transactionData.timeType || transactionData.timeType === 'day'"
                style="margin-right: 0px; flex-grow: 1">
                <div style="display: flex; align-items: center">
                  <el-date-picker v-model="transactionData.createTime" type="date" placeholder="选择日期"
                    style="flex-grow: 1; width: 100%; height: 35px" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
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
            <div class="export-out-btn" style="margin-right: 10px; width: 100px" @click="receipt">
              <img src="@/assets/yonghu/icon26.png" alt="" style="margin-left: 7px" />
              <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">开收据</span>
            </div>
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
            <el-table ref="multipleTableRef" :data="transactionTableData" row-key="theId"
              style="width: auto; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
              :max-height="tableMaxHeight" border :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
              @selection-change="handleSelectionChange" id="transaction-record-table">
              <el-table-column type="selection" :selectable="selectable" min-width="55" align="center" fixed="left" />
              <!-- <el-table-column property="theId" label="序号" width="100" align="center" fixed="left" /> -->
              <el-table-column property="userId" label="用户号" min-width="100" align="center" fixed="left" />
              <el-table-column property="userName" label="用户名称" min-width="160" align="center" />
              <el-table-column property="regionName" label="所属区域" min-width="200" align="center" />
              <!-- <el-table-column property="companyName" label="所属水厂" width="240" align="center" /> -->
              <el-table-column property="userPhone" label="联系电话" min-width="200" align="center" />
              <el-table-column property="meterCode" label="表号" min-width="200" align="center" />
              <!-- <el-table-column property="imei" label="IMEI号" width="240" align="center" /> -->
              <el-table-column property="meterType" label="水表类型" min-width="160" align="center" />
              <el-table-column property="payerPhone" label="缴费人手机号" min-width="160" align="center" />
              <el-table-column property="rechargeType" label="交易方式" min-width="160" align="center" />
              <el-table-column property="rechargeAmount" label="交易金额" min-width="160" align="center" />
              <el-table-column property="oldBalance" label="充值前余额/元" min-width="160" align="center" />
              <el-table-column property="newBalance" label="充值后余额/元" min-width="160" align="center" />
              <el-table-column property="createTime" label="交易时间" min-width="240" align="center" />
            </el-table>
          </div>
        </div>
        <div class="page-box">
          <div class="demo-pagination-block">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 15]"
              layout="total,  prev, pager, next, jumper" :total="total" />
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
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      transactionData: {
        timeType: "", // 用于选择时间类型
        createTime: "", // 用于存储选择的时间
        meterCode: "",
      },
      startData: {
        meterCode: "",
      },
      transactionTableData: [],
      multipleSelection: [], //存储当前勾选的行的数据信息
      currentPage: 1,
      pageSize: 30,
      total: null,
      title: "历史交易记录",
      transactionOrChargeRecordList: [{
          value: '历史交易记录',
          label: '历史交易记录'
        }, {
          value: '历史扣费记录',
          label: '历史扣费记录'
        }]
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
    title(newVal,oldVal){
        this.$emit("changeTye")
    }
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
      this.transactionData.meterCode = this.data.meterCode;
      this.startData.meterCode = this.data.meterCode;
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
        console.log(this.currentPage);
        const url = `/userManage/userCharge/showSingleRechargeMeterRecords/${this.currentPage}${queryString}`;
        console.log(url);
        service
          .get(url)
          .then((response) => {
            if (response.code === 200) {
              response.data.userSingleRechargeRecordData.map((v, i) => {
                v.theId = this.pageSize * (response.data.currentPages - 1) + i + 1;
              });
              this.transactionTableData = response.data.userSingleRechargeRecordData;
              this.transactionTableData.forEach((item) => {
                item.createTime = item.createTime.replace("T", " ");
              });
              this.total = response.data.totalElements;
              this.currentPage = response.data.currentPages;
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
      this.clear();
      service
        .get(`/userManage/userCharge/showSingleRechargeMeterRecords/1?meterCode=${this.data.meterCode}`)
        .then((response) => {
          if (response.code === 200) {
            response.data.userSingleRechargeRecordData.map((v, i) => {
              v.theId = this.pageSize * (response.data.currentPages - 1) + i + 1;
            });
            this.transactionTableData = response.data.userSingleRechargeRecordData;
            this.transactionTableData.forEach((item) => {
              item.createTime = item.createTime.replace("T", " ");
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
      this.transactionData.timeType = "";
      this.transactionData.createTime = "";
    },
    // 过滤掉值为空的参数，并格式化时间类型参数
    filterNonEmptyParams(params) {
      const filteredParams = {};

      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          const value = params[key];

          // 跳过无效值
          if (value === "" || value === null || value === undefined) {
            continue;
          }

          // 关键：如果是createTime，且已经通过timeType处理过，则跳过
          if (key === "createTime" && filteredParams.hasOwnProperty("createTime")) {
            continue;
          }

          // 处理时间类型参数
          if (key === "timeType" && params["createTime"]) {
            let formattedTime = "";
            let timeTypeValue = null;

            switch (value) {
              case "year":
                formattedTime = `${params["createTime"]}-01-01 00:00:00`;
                timeTypeValue = 1;
                break;
              case "month":
                formattedTime = `${params["createTime"]}-01 00:00:00`;
                timeTypeValue = 2;
                break;
              case "day":
                formattedTime = `${params["createTime"]} 00:00:00`;
                timeTypeValue = 3;
                break;
              default:
                continue;
            }

            filteredParams["timeType"] = timeTypeValue;
            filteredParams["createTime"] = formattedTime;
            continue;
          }

          // 其他参数直接添加
          filteredParams[key] = value;
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
              response.data.userSingleRechargeRecordData.map((v, i) => {
                v.theId = this.pageSize * (response.data.currentPages - 1) + i + 1;
              });
              console.log(response.data.userSingleRechargeRecordData);
              this.transactionTableData = response.data.userSingleRechargeRecordData;
              this.transactionTableData.forEach((item) => {
                item.createTime = item.createTime.replace("T", " ");
              });
              this.total = response.data.totalElements;
              this.currentPage = response.data.currentPages;
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
    receipt() {
      let params = {
        userId: "",
        date: "",
        userName: "",
        userAddress: "",
        operator: "",
        beforeAmount: 0,
        amount: 0,
        afterAmount: 0,
      };
      if (this.multipleSelection.length === 0) {
        ElMessage.warning("请至少选择一条记录");
        return;
      } else {
        params.userId = this.multipleSelection[0].userId;
        params.date = this.multipleSelection[0].createTime.replace("T", " ");
        params.userName = this.multipleSelection[0].userName;
        params.userAddress = this.data.userAddr;
        params.operator = JSON.parse(sessionStorage.getItem("userData")).staffName;
        params.beforeAmount = this.multipleSelection[0].oldBalance;
        params.amount = this.multipleSelection[0].rechargeAmount;
        params.afterAmount = this.multipleSelection[0].newBalance;
        console.log(params);
        // 调用后端接口
        axios({
          url: "/userManage/userCharge/receipt", // 后端接口地址
          method: "POST",
          responseType: "blob", // 指定响应类型为二进制流
          data: params,
        })
          .then((response) => {
            if (response.status !== 200) {
              throw new Error("导出失败: " + response.statusText);
            }

            // 获取 Blob 对象
            const blob = new Blob([response.data], { type: "application/pdf" });
            if (blob.size === 0) {
              ElMessage.warning("内容为空，无法下载");
              return;
            }

            // 创建一个链接元素
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob); // 创建 Blob URL
            link.download = this.multipleSelection[0].userName + "-收据.pdf"; // 设置下载文件名
            document.body.appendChild(link);
            link.click(); // 触发下载
            document.body.removeChild(link); // 移除链接元素
            window.URL.revokeObjectURL(link.href); // 释放 Blob URL
          })
          .catch((error) => {
            console.error("导出失败:", error);
            ElMessage.error("导出失败: " + error.message);
          });
      }
    },
    exportExcel() {
      const recordIdList = this.transactionTableData.map((item) => item.recordId); // 获取选中行的 recordId列表;
      console.log(recordIdList);
      // 调用后端接口
      axios({
        url: "/userManage/userCharge/exportRechargeRecord", // 后端接口地址
        method: "GET",
        responseType: "blob", // 指定响应类型为二进制流
        params: {
          companyId: this.data.companyId,
          userId: this.data.userId,
        },
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
            ElMessage.warning("内容为空，无法下载");
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
  justify-content: flex-end;
  justify-content: center;
  /* 确保子元素在父容器中垂直居中 */
  flex-direction: row;
  width: 12%;
  height: 100%;
  margin-right: 20px;
}

.search-input>span {
  font-size: 14px;
  margin-bottom: 5px;
}

.time-input {
  display: flex;
  width: 100%;
}

.time-input>* {
  width: 50%;
  margin-right: 20px;
}

.transaction-record-content>.serach-box {
  background-color: #fff;
  border-radius: 5px;
  width: 96%;
  height: 100px;
  margin-top: 5px;
  margin-bottom: 5px;
  padding: 0 10px;
}

.transaction-record-content>.transaction-list {
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
  width: 80px;
  /* 设置按钮的宽度 */
  height: 32px;
  /* 设置按钮的高度 */
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
  width: 35px;
  /* 设置按钮的宽度 */
  height: 32px;
  /* 设置按钮的高度 */
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
