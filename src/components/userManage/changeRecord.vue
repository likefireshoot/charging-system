<template>
  <div class="change-record-dialog" v-if="change_record_dialogFormVisible">
    <div class="change-record-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon9.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 18px">换表记录</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleChangeRecordClose">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="change-record-content">
        <div class="serach-box">
          <div class="search-input" style="width: 20%; margin-right: 10px" v-if="companyId === 1">
            <span>所属水厂</span>
            <el-select v-model="changeRecordeData.companyId">
              <el-option v-for="item in companyList" :key="item.id" :value="item.id" :label="item.name"></el-option>
            </el-select>
          </div>
          <div class="search-input" style="width: 20%; margin-right: 10px">
            <span>区域</span>
            <el-select v-model="changeRecordeData.region">
              <el-option v-for="item in quyu_data" :key="item.id" :label="item.label" :value="item.label"> </el-option>
            </el-select>
          </div>
          <div class="search-input" style="width: 12%; margin-right: 10px">
            <span>用户号</span>
            <el-input v-model="changeRecordeData.userId" placeholder="请输入..." />
          </div>
          <div class="search-input" style="width: 12%; margin-right: 10px">
            <span>用户名称</span>
            <el-input v-model="changeRecordeData.userName" placeholder="请输入..." />
          </div>
          <div class="search-input" style="width: 30%; margin-right: 10px">
            <span>时间</span>
            <div class="time-input">
              <el-select v-model="changeRecordeData.time.type" placeholder="请选择" style="width: 100px; margin-right: 10px">
                <el-option label="年" value="year" selected style="color: #46b97e"></el-option>
                <el-option label="月" value="month" selected style="color: #46b97e"></el-option>
                <el-option label="日" value="day" selected style="color: #46b97e"></el-option>
              </el-select>
              <div v-if="changeRecordeData.time.type === 'year'" style="margin-right: 0px; flex-grow: 1">
                <div style="display: flex; align-items: center">
                  <el-date-picker v-model="changeRecordeData.time.accurateTime" type="year" placeholder="选择年份" style="flex-grow: 1; width: 100%; height: 35px" value-format="YYYY" />
                </div>
              </div>
              <div v-if="changeRecordeData.time.type === 'month'" style="margin-right: 0px; flex-grow: 1">
                <div style="display: flex; align-items: center">
                  <el-date-picker v-model="changeRecordeData.time.accurateTime" type="month" placeholder="选择月份" style="flex-grow: 1; width: 100%; height: 35px" value-format="YYYY-MM" />
                </div>
              </div>
              <div v-if="!changeRecordeData.time.type || changeRecordeData.time.type === 'day'" style="margin-right: 0px; flex-grow: 1">
                <div style="display: flex; align-items: center">
                  <el-date-picker
                    v-model="changeRecordeData.time.accurateTime"
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
          <div class="search-input" style="width: 18%; margin-right: 10px">
            <span>表号</span>
            <el-input v-model="changeRecordeData.meterCode" placeholder="请输入..." />
          </div>
          <!-- <div class="search-input" style="width: 21%; margin-right: 10px">
            <span>IMEI号</span>
            <el-input v-model="changeRecordeData.imei" placeholder="请输入..." />
          </div> -->
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
        <div class="change-record-list">
          <div class="command-buttons">
            <div class="export-out-btn" style="margin-right: 10px; width: 110px" @click="download" v-if="staffPermissionIds.includes(15)">
              <img src="@/assets/yonghu/icon1.png" alt="" style="margin-left: 7px" />
              <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">模板下载</span>
            </div>
            <div class="export-in-btn" style="margin-right: 10px" @click="triggerFileInput" v-if="staffPermissionIds.includes(15)">
              <img src="@/assets/yonghu/icon1.png" alt="" style="margin-left: 7px" />
              <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">导入</span>
              <input ref="fileInput" type="file" accept=".xls,.xlsx" style="display: none" @change="exportIn" />
            </div>
            <div class="export-out-btn" style="margin-right: 10px" @click="exportExcel">
              <img src="@/assets/yonghu/icon2.png" alt="" style="margin-left: 7px" />
              <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">导出</span>
            </div>
            <div class="reflush" style="margin-left: 10px" @click="reflush">
              <img src="@/assets/yonghu/icon15.png" alt="" />
            </div>
          </div>
          <div class="change-record-table">
            <el-table
              ref="multipleTableRef"
              :data="changeRecordTableData"
              row-key="theId"
              style="width: auto; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
              :max-height="tableMaxHeight"
              border
              :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
              @selection-change="handleSelectionChange"
              id="change-record-table"
            >
              <el-table-column type="selection" :selectable="selectable" min-width="40" align="center" fixed="left" />
              <!-- <el-table-column property="theId" label="序号" width="100" align="center" fixed="left" /> -->
              <el-table-column property="userId" label="用户号" min-width="50" align="center" fixed="left" />
              <el-table-column property="userName" label="用户名称" min-width="70" align="center" />
              <el-table-column property="userAddr" label="用户地址" min-width="100" align="center" />
              <el-table-column property="regionName" label="所属区域" min-width="80" align="center" />
              <!-- <el-table-column property="companyName" label="所属水厂" width="240" align="center" /> -->
              <el-table-column property="userPhone" label="联系电话" min-width="100" align="center" />
              <el-table-column property="oldMeterCode" label="旧表号" min-width="100" align="center" />
              <!-- <el-table-column property="oldImei" label="旧IMEI号" width="240" align="center" /> -->
              <el-table-column property="oldMeterType" label="旧表类型" min-width="70" align="center" />
              <!-- <el-table-column property="bef_replace_meter_type" label="旧表价格类型" width="120" align="center" /> -->
              <el-table-column property="newMeterCode" label="新表号" min-width="100" align="center" />
              <!-- <el-table-column property="newImei" label="新IMEI号" width="240" align="center" /> -->
              <el-table-column property="newMeterType" label="新表类型" min-width="70" align="center" />
              <!-- <el-table-column property="af_replace_meter_price_type" label="新表价格类型" width="120" align="center" /> -->
              <el-table-column property="createTime" label="换表日期" min-width="100" align="center" />
              <el-table-column property="createTime" label="换表日期" min-width="100" align="center" />

              <el-table-column label="操作" width="150" align="center">
                <template #default="{ row }">
                  <!-- 撤回按钮 -->
                  <el-button size="small" :type="row.isWithdraw === 1 ? 'info' : 'success'" :disabled="row.isWithdraw === 1" @click="withdraw(row.meterChangeRecordId)">
                    {{ row.isWithdraw === 1 ? "已撤回" : "撤回" }}
                  </el-button>
                </template>
              </el-table-column>
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
    change_record_dialogFormVisible: {
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
      changeRecordeData: {
        region: "",
        userId: "",
        time: {
          type: "",
          accurateTime: "",
        },
        userName: "",
        meterCode: "",
        imei: "",
        companyId: null, // 新增字段，用于选择水厂
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId, // 获取当前用户所属水厂ID
      staffPermissionIds: JSON.parse(sessionStorage.getItem("userData")).staffPermissionIds,
      changeRecordTableData: [],
      quyu_data: [],
      multipleSelection: [], //存储当前勾选的行的数据信息

      currentPage: 1,
      pageSize: 30,
      total: null,
      companyList: [],
    };
  },
  computed: {
    tableMaxHeight() {
      return "40vh";
    },
  },
  watch: {
    currentPage() {
      this.getChangeRecordData();
    },
    "changeRecordeData.companyId"() {
      this.changeRecordeData.region = "";
      this.getRegionData();
    },
  },
  mounted() {
    this.getChangeRecordData();
    this.getCompanyList();
    this.getRegionData();
  },
  methods: {
    withdraw(meterChangeRecordId) {
      console.log(meterChangeRecordId);
      let url = `/userManage/meterRead/withdrawChangeMeter/` + meterChangeRecordId; // 所属水厂ID
      service
        .get(url)
        .then((res) => {
          if (res.code === 200) {
            ElMessage.success("撤回成功");
            this.getChangeRecordData();
          } else {
            ElMessage.error(res.msg);
          }
        })
        .catch((err) => {
          ElMessage.error(err);
        });
    },
    selectable() {
      return true; // 目前允许所有行选择，你可以加上你的业务逻辑
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleChangeRecordClose() {
      this.$emit("close");
    },
    getRegionData() {
      let url = "";
      if (this.companyId === 1) {
        if (this.changeRecordeData.companyId) {
          url = `/getRegion?companyId=${this.changeRecordeData.companyId}`; // 所属水厂ID
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
    getChangeRecordData() {
      let url = "";
      if (this.companyId === 1) {
        if (this.changeRecordeData.companyId) {
          url = `/userManage/meterRead/showChangeMeterRecords/${this.currentPage}?companyId=${this.changeRecordeData.companyId}`;
        } else {
          url = `/userManage/meterRead/showChangeMeterRecords/${this.currentPage}`;
        }
      } else {
        url = `/userManage/meterRead/showChangeMeterRecords/${this.currentPage}?companyId=${this.companyId}`;
      }
      service
        .get(url)
        .then((res) => {
          if (res.code === 200) {
            res.data.meterChangeRecord.map((v, i) => {
              v.theId = this.pageSize * (res.data.currentPages - 1) + i + 1;
            });
            this.changeRecordTableData = res.data.meterChangeRecord;
            if (this.changeRecordTableData.length > 0) {
              this.changeRecordTableData.forEach((item) => {
                item.createTime = item.createTime.replace("T", " ");
              });
            }
            this.total = res.data.totalElements;
            this.currentPage = res.data.currentPages;
          } else {
            ElMessage.error(res.msg);
          }
        })
        .catch((err) => {
          ElMessage.error(err);
          console.error("查询失败:", err);
        });
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
    reflush() {
      this.clear();
      let url = "";
      if (this.companyId === 1) {
        if (this.changeRecordeData.companyId) {
          url = `/userManage/meterRead/showChangeMeterRecords/${this.currentPage}?companyId=${this.changeRecordeData.companyId}`;
        } else {
          url = `/userManage/meterRead/showChangeMeterRecords/${this.currentPage}`;
        }
      } else {
        url = `/userManage/meterRead/showChangeMeterRecords/${this.currentPage}?companyId=${this.companyId}`;
      }
      service
        .get(url)
        .then((res) => {
          if (res.code === 200) {
            res.data.meterChangeRecord.map((v, i) => {
              v.theId = this.pageSize * (res.data.currentPages - 1) + i + 1;
            });
            this.changeRecordTableData = res.data.meterChangeRecord;
            if (this.changeRecordTableData.length > 0) {
              this.changeRecordTableData.forEach((item) => {
                item.createTime = item.createTime.replace("T", " ");
              });
            }
            this.total = res.data.totalElements;
            this.currentPage = 1;
          } else {
            ElMessage.error(res.msg);
          }
        })
        .catch((err) => {
          ElMessage.error(err);
        });
    },
    clear() {
      this.changeRecordeData = {
        region: "",
        userId: "",
        time: {
          type: "",
          accurateTime: "",
        },
        userName: "",
        meterCode: "",
        imei: "",
        companyId: null, // 清空水厂选择
      };
    },
    // 过滤掉值为空的参数
    filterNonEmptyParams(params) {
      if (this.companyId === 1) {
        if (this.changeRecordeData.companyId) {
        } else {
          this.changeRecordeData.companyId = "";
        }
      } else {
        this.changeRecordeData.companyId = this.companyId;
      }
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
      const nonEmptyParams = this.filterNonEmptyParams(this.changeRecordeData);
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
        const url = `/userManage/meterRead/showChangeMeterRecords/${this.currentPage}${queryString}`;
        service
          .get(url)
          .then((response) => {
            if (response.code === 200) {
              console.log(response.data);
              response.data.meterChangeRecord.map((v, i) => {
                v.theId = this.pageSize * (response.data.currentPages - 1) + i + 1;
              });
              this.changeRecordTableData = response.data.meterChangeRecord;
              if (this.changeRecordTableData.length > 0) {
                this.changeRecordTableData.forEach((item) => {
                  item.createTime = item.createTime.replace("T", " ");
                });
              }
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
    download() {
      let url = "/userManage/userCharge/importMeterChangeRecordTemplate";
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
          link.download = "换表记录导入模板.xlsx"; // 设置下载文件名
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
    triggerFileInput() {
      this.$refs.fileInput.value = "";
      this.$refs.fileInput.click();
    },
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
      const companyId = this.companyId;
      formData.append("file", file);
      formData.append("companyId", companyId);

      try {
        const response = await service.post("/userManage/userCharge/importMeterChangeRecord", formData);
        if (response.code === 200) {
          if (Array.isArray(response.data) && response.data.length) {
            // 按 index 升序排序，再拼接
            const tips = response.data
              .sort((a, b) => a.index - b.index)
              .map((item) => `第 ${item.index} 条数据因 ${item.errMsg} 导入失败`)
              .join("；");
            ElMessage.warning(tips);
          } else {
            ElMessage.success("导入成功");
          }
        }
        fileInput.value = ""; // 清空文件输入框
        this.reflush();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "未知错误";
        ElMessage.error("导入失败: " + errorMessage);
        console.error("上传失败:", error);
      }
    },
    exportExcel() {
      let companyId = "";
      if (this.companyId === 1) {
        if (this.changeRecordeData.companyId) {
          companyId = this.changeRecordeData.companyId;
        } else {
          companyId = "";
        }
      } else {
        companyId = this.companyId;
      }
      // 调用后端接口
      axios({
        url: "/userManage/meterRead/exportChangeMeterRecord", // 后端接口地址
        method: "GET",
        responseType: "blob", // 指定响应类型为二进制流
        params: {
          companyId: companyId,
          userId: this.data.userId,
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
          link.download = "换表记录.xlsx"; // 设置下载文件名
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
.change-record-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.change-record-dialog-content {
  width: 85%;
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

.change-record-content {
  width: 100%;
  min-height: 42vh;
  margin-top: 0px;
  margin-bottom: 5px;
  overflow-y: auto;
  background: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-wrap: nowrap;
  padding: 1%;
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
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  /* align-items: center;  */
  flex-direction: column;
  width: 12%;
  height: 100%;
  margin-right: 20px;
}

.search-input > span {
  font-size: 14px;
  margin-bottom: 5px;
  white-space: nowrap;
  /* text-align: center; */
}

.time-input {
  display: flex;
  width: 100%;
}

.time-input > * {
  width: 50%;
  margin-right: 20px;
}

.change-record-content > .serach-box {
  background-color: #fff;
  border-radius: 5px;
  width: 96%;
  height: 100px;
  margin-top: 5px;
  margin-bottom: 5px;
  padding: 0 10px;
}

.change-record-content > .change-record-list {
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

.change-record-table {
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

.delete-content {
  width: 94%;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.delete-content {
  height: 150px;
}

.buttons {
  display: flex;
  width: 240px;
  height: 100%;
  margin-left: 15%;
  align-items: center;
}

.buttons > * {
  width: 120px;
  margin-right: 30px;
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
}
.clear-btn {
  background-color: #fff;
  border: 2px solid #f2f2f2;
}

.page-box {
  width: 100%;
  height: 62px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 0;
}
</style>
