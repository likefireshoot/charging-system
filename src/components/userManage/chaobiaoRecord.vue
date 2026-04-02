<template>
  <div class="chaobiao-record-dialog" v-if="chaobiao_dialogFormVisible">
    <div class="chaobiao-record-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon14.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 20px">历史抄表记录</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleChaobiaoRecord">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="chaobiao-record-content">
        <div class="serach-box">
          <div class="search-input" style="width: 40%; margin-right: 10px">
            <span style="font-size: 20px;margin-top: -10px">时间</span>
            <div class="time-input">
              <el-select v-model="chaobiaoData.time.type" placeholder="请选择"  style="width: 100px; margin-right: 10px" >
                <el-option label="年" value="year"  style="color: #46b97e"></el-option>
                <el-option label="月" value="month"  style="color: #46b97e"></el-option>
                <el-option label="日" value="day" style="color: #46b97e"></el-option>
              </el-select>
              <div v-if="chaobiaoData.time.type === 'year'" style="margin-right: 0px; flex-grow: 1">
                <div style="display: flex; align-items: center">
                  <el-date-picker v-model="chaobiaoData.time.accurateTime" type="year" placeholder="选择年份"
                                  style="flex-grow: 1; width: 100%; height: 35px" value-format="YYYY" />
                </div>
              </div>
              <div v-if="chaobiaoData.time.type === 'month'" style="margin-right: 0px; flex-grow: 1">
                <div style="display: flex; align-items: center">
                  <el-date-picker v-model="chaobiaoData.time.accurateTime" type="month" placeholder="选择月份"
                                  style="flex-grow: 1; width: 100%; height: 35px" value-format="YYYY-MM" />
                </div>
              </div>
              <div v-if="!chaobiaoData.time.type || chaobiaoData.time.type === 'day'"
                   style="margin-right: 0px; flex-grow: 1">
                <div style="display: flex; align-items: center">
                  <el-date-picker v-model="chaobiaoData.time.accurateTime" type="date" placeholder="选择日期"
                                  style="flex-grow: 1; width: 100%; height: 35px" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
                </div>
              </div>
            </div>
          </div>
          <div class="buttons" style="margin-left: 10%; margin-right: 10px">
            <div class="sercah-btn" @click="search">
              <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: 8px" />
              <span style="font-size: 20px; margin-left: 15%">搜索</span>
            </div>
            <div class="clear-btn" @click="clear">
              <img src="@/assets/yonghu/icon4.png" alt="" style="margin-left: 8px" />
              <span style="font-size: 20px; margin-left: 15%; color: #5a5a5a">清空</span>
            </div>
          </div>
        </div>
        <div class="chaobiao-list">
          <div class="command-buttons">
            <div class="export-out-btn" style="margin-right: 10px; width: 140px" @click="download"
                 v-if="staffPermissionIds.includes(16)">
              <img src="@/assets/yonghu/icon1.png" alt="" style="margin-left: 7px" />
              <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">模板下载</span>
            </div>
            <div class="export-in-btn" style="margin-right: 10px" @click="triggerFileInput"
                 v-if="staffPermissionIds.includes(16)">
              <img src="@/assets/yonghu/icon1.png" alt="" style="margin-left: 7px" />
              <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">导入</span>
              <input ref="fileInput" type="file" accept=".xls,.xlsx" style="display: none" @change="exportIn" />
            </div>
            <div class="export-out-btn" style="margin-right: 10px" @click="exportExcel">
              <img src="@/assets/yonghu/icon2.png" alt="" style="margin-left: 7px" />
              <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">导出</span>
            </div>
            <div class="reflush" style="margin-left: 10px" @click="reflush">
              <img src="@/assets/yonghu/icon15.png" alt="" />
            </div>
          </div>
          <div class="chaobiao-table">
            <el-table
              ref="multipleTableRef"
              :data="chaobiaoTableData"
              row-key="theId"
              style="width: 100%; height: 100%;"
              :max-height="tableMaxHeight"
              border
              :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
              @selection-change="handleSelectionChange"
              id="chaobiao-record-table"
              v-loading="isLoading"
            >
              <el-table-column type="selection" :selectable="selectable" min-width="55" align="center" fixed="left" />
              <!-- <el-table-column property="theId" label="序号" width="100" align="center" fixed="left" /> -->
              <el-table-column property="userId" label="用户号" min-width="150" align="center" fixed="left" />
              <el-table-column property="userName" label="用户名称" min-width="120" align="center" />
              <el-table-column property="meterCode" label="表号" min-width="160" align="center" />
              <el-table-column property="readingCount" label="水表读数/吨" min-width="160" align="center" />
              <el-table-column property="deltaWater" label="本次用水量/吨" min-width="160" align="center" />
              <el-table-column property="feeThisTime" label="本次扣费/元" min-width="160" align="center" />
              <el-table-column property="balanceThisTime" label="本次余额/元" min-width="160" align="center"/>
              <el-table-column property="valveStatus" label="阀门状态" min-width="160" align="center" />
              <!-- <el-table-column property="balance" label="余额/元" width="120" align="center" /> -->
              <el-table-column property="battery" label="电量" min-width="160" align="center" />
              <el-table-column property="signalValue" label="信号值" min-width="100" align="center" />
              <el-table-column property="createTime" label="抄表时间" min-width="200" align="center" />
              <el-table-column property="regionName" label="所属区域" min-width="200" align="center" />
              <!-- <el-table-column property="companyName" label="所属水厂" width="200" align="center" /> -->
              <el-table-column property="userAddr" label="用户地址" min-width="150" align="center" />
              <el-table-column property="userPhone" label="手机号" min-width="180" align="center" />
              <!-- <el-table-column property="imei" label="IMEI号" width="240" align="center" /> -->
            </el-table>
          </div>
          <div class="summary-box">
            <div class="summary-item">
              <span class="summary-label">用水总量</span>
              <span class="summary-value">{{ totalWater }}</span>
            </div>
          </div>
        </div>
        <div class="page-box">
          <div class="demo-pagination-block">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 15]"
                           layout="total,  prev, pager, next, jumper" :total="total"  @current-change = "handlePageChange"/>
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
    chaobiao_dialogFormVisible: {
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
      chaobiaoData: {
        time: {
          type: "",
          accurateTime: "",
        },
        meterCode: "",
        imei: "",
        companyId: null,
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId, // 公司ID
      staffPermissionIds: JSON.parse(sessionStorage.getItem("userData")).staffPermissionIds,
      // companyId: 2,
      startData: {
        meterCode: "",
        imei: "",
        companyId: null,
      },
      chaobiaoTableData: [],
      multipleSelection: [], //存储当前勾选的行的数据信息
      currentPage: 1,
      pageSize: 30,
      total: null,

      // ****** 锁
      isLoading: false,

      // ****** 用水总量
      totalWater: 0
    };
  },
  computed: {
    tableMaxHeight() {
      return "40vh";
    },
  },
  watch: {
    // currentPage() {
    //   this.getChaboBiaoRecordData();
    // },
  },
  mounted() {
    this.assignmentData();
    this.getChaboBiaoRecordData();
    this.getTotalWater();
  },
  methods: {
    // ****** 获取总用水量 ******
    getTotalWater(){
      // const nonEmptyParams = {
      //   meterCode: this.startData.meterCode,
      //   imei: this.startData.imei,
      //   companyId: this.startData.companyId,
      //   createTime: this.chaobiaoData.time.accurateTime,
      //   timeType: this.chaobiaoData.time.type
      // };
      // // 如果有非空参数，则发起请求
      // if (Object.keys(nonEmptyParams).length > 0) {
      //   // 初始化查询字符串
      //   let queryString = "";
      //   // 遍历 nonEmptyParams 对象，将键值对拼接成查询字符串
      //   for (const key in nonEmptyParams) {
      //     if (nonEmptyParams.hasOwnProperty(key)) {
      //       const value = nonEmptyParams[key];
      //       // 如果查询字符串不为空，添加 & 符号分隔参数
      //       if (queryString) {
      //         queryString += `&${key}=${encodeURIComponent(value)}`;
      //       } else {
      //         // 第一个参数前添加 ? 符号
      //         queryString += `?${key}=${encodeURIComponent(value)}`;
      //       }
      //     }
      //   }
      const nonEmptyParams = this.filterNonEmptyParams(this.chaobiaoData);
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
        const url = `/userManage/meterRead/getTotalWater${queryString}`;
        service
          .get(url)
          .then((response) => {
            if (response.code === 200) {

              this.totalWater = response.data;
            } else {
              //ElMessage.error(response.msg);
              console.log(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
            //console.log(error);
          });
      }
    },

    // ****** 手动处理分页变化，避免 watch 循环 ******
    handlePageChange(page) {
      if (this.isLoading) return;
      // this.isLoading = true;
      this.currentPage = page;
      this.getChaboBiaoRecordData();
    },

    selectable() {
      return true; // 目前允许所有行选择，你可以加上你的业务逻辑
    },
    handleSelectionChange(val) {
      this.multipleSelection = val; // 存储当前勾选的行的数据信息
    },
    handleChaobiaoRecord() {
      this.$emit("close");
    },
    assignmentData() {
      this.chaobiaoData.meterCode = this.data.meterCode;
      this.chaobiaoData.imei = this.data.imei;
      this.startData.meterCode = this.data.meterCode;
      this.startData.imei = this.data.imei;
      this.chaobiaoData.companyId = this.data.companyId;
      this.startData.companyId = this.data.companyId;
    },
    getChaboBiaoRecordData() {
      if (this.isLoading) return
      this.isLoading = true
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
        const url = `/userManage/meterRead/showReadMeterRecords/${this.currentPage}${queryString}`;
        service
          .get(url)
          .then((response) => {
            if (response.code === 200) {
              response.data.userInfoData.map((v, i) => {
                v.theId = this.pageSize * (response.data.currentPages - 1) + i + 1;
              });
              this.chaobiaoTableData = response.data.userInfoData;
              console.log(response.data);
              if (this.chaobiaoTableData.length > 0) {
                this.chaobiaoTableData.forEach((item) => {
                  item.createTime = item.createTime.replace("T", " ");
                });
              }
              this.total = response.data.totalElements;
              // this.currentPage = response.data.currentPages;
              this.getTotalWater();
            } else {
              //ElMessage.error(response.msg);
              console.log(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
            //console.log(error);
          }).finally(()=>{
            this.isLoading = false
        });
      }
    },
    reflush() {
      this.clear(1);
      service
        .get(`/userManage/meterRead/showReadMeterRecords/1?meterCode=${this.data.meterCode}&imei=${this.data.imei}&companyId=${this.data.companyId}`)
        .then((response) => {
          if (response.code === 200) {
            response.data.userInfoData.map((v, i) => {
              v.theId = this.pageSize * (response.data.currentPages - 1) + i + 1;
            });
            this.chaobiaoTableData = response.data.userInfoData;
            if (this.chaobiaoTableData.length > 0) {
              this.chaobiaoTableData.forEach((item) => {
                item.createTime = item.createTime.replace("T", " ");
              });
            }
            this.total = response.data.totalElements;
            this.currentPage = 1;
            this.getTotalWater();
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    clear(isSearch) {
      this.chaobiaoData.time.type = "";
      this.chaobiaoData.time.accurateTime = "";
      if (typeof isSearch != 'number' || isNaN(isSearch)) {
        this.currentPage = 1;
        service
          .get(`/userManage/meterRead/showReadMeterRecords/1?meterCode=${this.data.meterCode}&imei=${this.data.imei}&companyId=${this.data.companyId}`)
          .then((response) => {
            if (response.code === 200) {
              response.data.userInfoData.map((v, i) => {
                v.theId = this.pageSize * (response.data.currentPages - 1) + i + 1;
              });
              this.chaobiaoTableData = response.data.userInfoData;
              if (this.chaobiaoTableData.length > 0) {
                this.chaobiaoTableData.forEach((item) => {
                  item.createTime = item.createTime.replace("T", " ");
                });
              }
              this.total = response.data.totalElements;
              this.currentPage = 1;
              this.getTotalWater();
            } else {
              ElMessage.error(response.msg);
            }
          })
          .catch((error) => {
            ElMessage.error(error);
          });
      }
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
                filteredParams["timeType"] = type;
                filteredParams["createTime"] = formattedTime;
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
      const nonEmptyParams = this.filterNonEmptyParams(this.chaobiaoData);
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
        const url = `/userManage/meterRead/showReadMeterRecords/${this.currentPage}${queryString}`;
        service
          .get(url)
          .then((response) => {
            if (response.code === 200) {
              console.log(response.data);
              response.data.userInfoData.map((v, i) => {
                v.theId = this.pageSize * (response.data.currentPages - 1) + i + 1;
              });
              this.chaobiaoTableData = response.data.userInfoData;
              if (this.chaobiaoTableData.length > 0) {
                this.chaobiaoTableData.forEach((item) => {
                  item.createTime = item.createTime.replace("T", " ");
                });
              }
              this.total = response.data.totalElements;
              this.currentPage = response.data.currentPages;
              this.getTotalWater();
            }
          })
          .catch((error) => {
            ElMessage.error(error);
            console.error("查询失败:", error);
          });
      } else {
        ElMessage.error("请输入搜索条件");
      }
    },
    // 触发文件输入框点击
    triggerFileInput() {
      this.$refs.fileInput.value = ""; // 清空文件输入框，确保每次点击都能触发 @change
      this.$refs.fileInput.click();
    },
    // 处理文件上传
    async exportIn() {
      const companyId = this.data.companyId;
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

      const formData = new FormData();
      formData.append("file", file);
      formData.append("companyId", companyId);

      try {
        const response = await service.post("/userManage/userCharge/importMeterReportRecord", formData, { responseType: "blob" });
        // 获取 Blob 对象
        const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

        if (blob.size === 0) {
          ElMessage.success("导入成功");
          fileInput.value = ""; // 清空文件输入框
          this.reflush();
          return;
        }
        ElMessage.warning("部分数据导入失败，等待下载失败列表");

        // 创建一个链接元素
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob); // 创建 Blob URL
        link.download = "抄表记录导入数据失败列表.xlsx"; // 设置下载文件名
        document.body.appendChild(link);
        link.click(); // 触发下载
        document.body.removeChild(link); // 移除链接元素
        window.URL.revokeObjectURL(link.href); // 释放 Blob URL
        fileInput.value = ""; // 清空文件输入框
        this.reflush();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "未知错误";
        ElMessage.error("导入失败: " + errorMessage);
        console.error("上传失败:", error);
      }
    },
    download() {
      let url = "/userManage/userCharge/importMeterReportRecordTemplate";
      // 调用后端接口
      axios({
        url: url, // 后端接口地址
        method: "GET",
        responseType: "blob", // 指定响应类型为二进制流
        headers: {
          Authorization: this.token,
        },
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error("导出失败: " + response.statusText);
          }

          // 获取 Blob 对象
          const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

          // if (blob.size === 0) {
          //   ElMessage.warning("内容为空，无法下载");
          //   return;
          // }

          // 创建一个链接元素
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob); // 创建 Blob URL
          link.download = "抄表记录导入模板.xlsx"; // 设置下载文件名
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
    exportExcel() {
      const params = this.filterNonEmptyParams(this.chaobiaoData);
      // 调用后端接口
      axios({
        url: "/userManage/meterRead/exportMeterReportRecord", // 后端接口地址
        method: "GET",
        responseType: "blob", // 指定响应类型为二进制流
        params,
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
          link.download = "用户抄表数据记录.xlsx"; // 设置下载文件名
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
.chaobiao-record-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.chaobiao-record-dialog-content {
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

.chaobiao-record-content {
  width: 100%;
  min-height: 42vh;
  margin-top: 0px;
  margin-bottom: 5px;
  background: none;
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
  justify-content: center;
  /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 12%;
  height: 100%;
  margin-right: 20px;
}

.search-input>span {
  font-size: 18px;
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

.chaobiao-record-content>.serach-box {
  background-color: #fff;
  border-radius: 5px;
  width: 96%;
  height: 100px;
  margin-top: 5px;
  margin-bottom: 5px;
  padding: 0 10px;
}

.buttons {
  display: flex;
  width: 240px;
  height: 100%;
  margin-left: 15%;
  align-items: center;
}

.buttons>* {
  width: 120px;
  margin-right: 30px;
}

.sercah-btn,
.clear-btn {
  display: flex;
  align-items: center;
  height: 35px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  color: #fff;
}

.sercah-btn {
  background-color: #45ba7e;
}

.clear-btn {
  background-color: #fff;
  border: 2px solid #f2f2f2;
}

.chaobiao-record-content>.chaobiao-list {
  width: 96%;
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
  font-size: 18px;
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
  font-size: 18px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
}

.chaobiao-table {
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


.summary-box {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 12px;
  margin-bottom: 8px;
}

.summary-item {
  border: 1px solid #d9efe2;
  background-color: #f7fbf8;
  border-radius: 5px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-label {
  color: #5a5a5a;
}

.summary-value {
  color: #2d8f63;
  font-weight: 600;
}


</style>
