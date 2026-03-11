<template>
  <div class="account-container">
    <div class="serach-box">
      <div class="search-input" v-if="companyId === 1">
        <span>所属水厂</span>
        <el-select class="big-font-el-select" v-model="param.company" placeholder="请选择所属水厂">
          <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </div>
      <div class="search-input" style="margin-left: 10px">
        <span>用户号</span>
        <el-input v-model="param.userId" placeholder="请输入..." />
      </div>
      <div class="search-input" style="margin-left: 10px">
        <span>用户名称</span>
        <el-input v-model="param.userName" placeholder="请输入..." />
      </div>
      <div class="search-input">
        <span>表号</span>
        <el-input v-model="param.meterCode" type="number" placeholder="请输入..." />
      </div>
      <div class="buttons">
        <div class="sercah-btn" @click="search">
          <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: 10px" />
          <span style="font-size: 20px; margin-left: 15%">搜索</span>
        </div>
        <div class="clear-btn" @click="clear">
          <img src="@/assets/yonghu/icon4.png" alt="" style="margin-left: 10px" />
          <span style="font-size: 20px; margin-left: 15%; color: #5a5a5a">清空</span>
        </div>
      </div>
    </div>
    <div class="user-info">
      <div class="command-box">
        <div class="add-btn" style="margin-left: 5px" @click="add_dialogFormVisible = true" v-if="staffPermissionIds.includes(2)">
          <img src="@/assets/yonghu/icon13.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 20px; margin-left: 8px; color: #5a5a5a">开户</span>
        </div>
        <div class="export-out-btn" style="margin-left: 5px;width:130px" @click="deviceBinding_dialogFormVisible = true" v-if="staffPermissionIds.includes(3)">
          <img src="@/assets/yonghu/icon21.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">设备绑定</span>
        </div>
        <div class="delete-btn" style="margin-left: 5px" @click="delete_btn_click" v-if="staffPermissionIds.includes(4)">
          <img src="@/assets/yonghu/icon4.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 20px; margin-left: 8px; color: #5a5a5a">删除</span>
        </div>
        <div class="export-out-btn" style="margin-left: 5px; width: 165px" @click="download" v-if="staffPermissionIds.includes(5)">
          <img src="@/assets/yonghu/icon1.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">用户导入模板</span>
        </div>
        <div class="export-in-btn" style="margin-left: 5px; width: 130px" @click="triggerUserImport" v-if="staffPermissionIds.includes(5)">
          <img src="@/assets/yonghu/icon1.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 20px; margin-left: 5px; color: #5a5a5a">用户导入</span>
          <input ref="userFileInput" type="file" accept=".xls,.xlsx" style="display: none" @change="exportIn" />
        </div>
        <div class="export-out-btn" style="margin-left: 5px; width: 165px" @click="bindingDownload" v-if="staffPermissionIds.includes(5)">
          <img src="@/assets/yonghu/icon1.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">绑定导入模板</span>
        </div>
        <div class="export-in-btn" style="margin-left: 5px; width: 130px" @click="triggerBindImport" v-if="staffPermissionIds.includes(5)">
          <img src="@/assets/yonghu/icon1.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 20px; margin-left: 5px; color: #5a5a5a">绑定导入</span>
          <input ref="bindFileInput" type="file" accept=".xls,.xlsx" style="display: none" @change="bindingExportIn" />
        </div>
        <div class="export-out-btn" style="margin-left: 5px" @click="exportExcel">
          <img src="@/assets/yonghu/icon2.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">导出</span>
        </div>
        <div class="reflush" style="margin-left: 5px" @click="reflush">
          <img src="@/assets/yonghu/icon15.png" alt="" />
        </div>
      </div>
      <div class="user-list">
        <div class="quyu-box">
          <el-input v-model="filterText" placeholder="请输入关键字检索" style="height: 32px; margin-bottom: 10px" />
          <el-tree ref="treeRef" node-key="id" :data="quyu_data" :props="defaultProps" default-expand-all :filter-node-method="filterNode" @node-click="handleNodeClick" />
        </div>
        <div class="user-table">
          <el-table
            ref="multipleTableRef"
            :data="yonghuData"
            row-key="theId"
            style="width: auto; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
            border
            :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
            @selection-change="handleSelectionChange"
            id="yonghu-table"
          >
            <el-table-column type="selection" :selectable="selectable" min-width="40" align="center" fixed="left" />
            <!-- <el-table-column property="theId" label="序号" width="100" align="center" fixed="left" /> -->
            <el-table-column property="userId" label="用户号" min-width="50" align="center" fixed="left" />
            <el-table-column property="userName" label="用户名称" min-width="70" align="center"> </el-table-column>
            <el-table-column property="userPhone" label="联系电话" min-width="100" align="center" />
            <el-table-column property="meterCode" label="表号" min-width="100" align="center" />
            <el-table-column property="meterType" label="水表类型" min-width="70" align="center" />
            <el-table-column property="priceName" label="价格类型" min-width="90" align="center" />
            <el-table-column property="smsConfigName" label="短信配置" min-width="90" align="center"></el-table-column>
            <el-table-column property="userAddr" label="用户地址" min-width="100" align="center" />
            <el-table-column property="companyName" label="所属水厂" min-width="70" align="center" />
            <el-table-column property="regionName" label="所属区域" min-width="80" align="center" />
            <el-table-column property="approver1" label="开户审批人1" min-width="70" align="center" />
            <el-table-column property="approver2" label="开户审批人2" min-width="70" align="center" />
            <el-table-column property="approver3" label="开户审批人3" min-width="70" align="center" />
            <el-table-column property="createTime" label="开户时间" min-width="100" align="center"> </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 15]" layout="total, prev, pager, next, jumper" :total="total" />
        </div>
      </div>
    </div>

    <!-- 新增按钮弹出框 -->
    <addVue v-if="add_dialogFormVisible" :add_dialogFormVisible="add_dialogFormVisible" @close="closeAddDialog"></addVue>

    <!-- 删除按钮弹出框 -->
    <deleteVue v-if="delete_dialogFormVisible" :delete_dialogFormVisible="delete_dialogFormVisible" :data="multipleSelection" @close="closeDeleteDialog"></deleteVue>
    <!-- 设备绑定弹出框 -->
    <deviceBindingVue v-if="deviceBinding_dialogFormVisible" :deviceBinding_dialogFormVisible="deviceBinding_dialogFormVisible" @close="closeDeviceBindingDialog"></deviceBindingVue>
  </div>
</template>

<script>
import addVue from "@/components/accountManage/add.vue";
import deleteVue from "@/components/accountManage/delete.vue";
import deviceBindingVue from "@/components/accountManage/deviceBinding.vue";

import service from "@/api/request";
import { ElMessage } from "element-plus";
import axios from "axios";

export default {
  components: {
    addVue,
    deleteVue,
    deviceBindingVue,
  },
  data() {
    return {
      param: {
        userName: "",
        userId: "",
        meterCode: null,
        company: null, // 新增所属水厂参数
        companyId: null, // 所属水厂ID
        regionId: null, // 区域ID
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId, // 公司ID
      staffPermissionIds: JSON.parse(sessionStorage.getItem("userData")).staffPermissionIds,
      token: JSON.parse(sessionStorage.getItem("userData")).token, // 用户token
      currentPage: 1,
      pageSize: 50,
      total: null,

      shuibiao_list: [
        {
          id: 1,
          label: "NB-IoT表",
        },
        {
          id: 2,
          label: "普通水表",
        },
      ],

      filterText: "",
      treeRef: null,
      commandTreeRef: null,
      defaultProps: {
        label: "label",
      },
      quyu_data: [],

      quyu_selected: null,

      yonghuData: [],

      multipleSelection: [], //存储当前勾选的行的数据信息
      commandType: "",
      companyList: [],

      //导出数据文件名称
      fileName: "用户数据列表",

      //弹出框显示与否

      add_dialogFormVisible: false,
      delete_dialogFormVisible: false,
      deviceBinding_dialogFormVisible: false,
    };
  },
  watch: {
    filterText(val) {
      if (this.treeRef) {
        this.$nextTick(() => {
          this.treeRef.filter(val);
        });
      }
    },
    currentPage() {
      this.search();
    },
    multipleSelection() {
      console.log(this.multipleSelection);
    },
    "param.company"() {
      this.quyu_selected = null;
      this.$refs.treeRef.setCurrentKey(null);
      this.getRegionData();
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.treeRef = this.$refs.treeRef;
    });
    this.getUserInfo();
    this.getRegionData();
    this.getCompanyList();
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.label.includes(value);
    },
    handleNodeClick(data) {
      this.quyu_selected = data;
      console.log(this.quyu_selected);
      let regionId = data.id;
      this.param.regionId = regionId;
      if (this.companyId === 1) {
        if (this.param.companyId) {
        } else {
          this.param.companyId = ""; // 如果没有选择水厂，则不传水厂ID
        }
      } else {
        this.param.companyId = this.companyId; // 所属水厂ID
      }
      let nonEmptyParams = this.filterNonEmptyParams({ ...this.param, regionId });
      nonEmptyParams.page = this.currentPage; // 添加当前页码
      nonEmptyParams.pageSize = this.pageSize; // 添加每页条数

      service
        .post("/userManage/userCharge/showUsers", nonEmptyParams, {
          headers: {
            Authorization: this.token,
          },
        })
        .then((response) => {
          if (response.code === 200) {
            response.data.list.map((v, i) => {
              v.theId = this.pageSize * (response.data.currentPages - 1) + i + 1;
            });
            this.yonghuData = response.data.list;
            this.total = response.data.total;
            this.currentPage = response.data.currentPages;
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          // 提取错误信息
          const errorMessage = error.response?.data?.msg || "请求发生错误";
          ElMessage.error(errorMessage);
        });
    },
    selectable() {
      return true; // 目前允许所有行选择，你可以加上你的业务逻辑
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },

    delete_btn_click() {
      if (this.multipleSelection.length > 0) {
        this.delete_dialogFormVisible = true;
      } else {
        ElMessage.warning("请选择要删除的数据");
      }
    },

    closeAddDialog() {
      this.add_dialogFormVisible = false;
      this.multipleSelection = [];
      this.reflush();
    },
    closeDeleteDialog() {
      this.delete_dialogFormVisible = false;
      this.multipleSelection = [];
      this.reflush();
    },
    closeDeviceBindingDialog() {
      this.deviceBinding_dialogFormVisible = false;
      this.multipleSelection = [];
      this.reflush();
    },
    getCompanyList() {
      service
        .get("/getAllCompany", {
          headers: {
            Authorization: this.token,
          },
        })
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
    getUserInfo() {
      let param = {
        page: 1,
        pageSize: 50,
      };
      if (this.companyId === 1) {
      } else {
        param.companyId = this.companyId; // 所属水厂ID
      }
      service
        .post("/userManage/userCharge/showUsers", param, {
          headers: {
            Authorization: this.token,
          },
        })
        .then((response) => {
          if (response.code === 200) {
            response.data.list.map((v, i) => {
              v.theId = this.pageSize * (response.data.currentPages - 1) + i + 1;
            });
            this.yonghuData = response.data.list;
            // this.yonghuData.forEach((item) => {
            //   item.updateTime = item.updateTime.replace("T", " ");
            // });
            this.total = response.data.total;
            this.currentPage = response.data.currentPages;
            console.log(this.yonghuData);
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    reflush() {
      this.clear(1);
      this.filterText = "";
      this.$refs.treeRef.setCurrentKey(null);
      this.quyu_selected = null;
      let param = {
        page: 1,
        pageSize: 50,
      };
      if (this.companyId === 1) {
      } else {
        param.companyId = this.companyId; // 所属水厂ID
      }
      service
        .post("/userManage/userCharge/showUsers", param, {
          headers: {
            Authorization: this.token,
          },
        })
        .then((response) => {
          if (response.code === 200) {
            response.data.list.map((v, i) => {
              v.theId = this.pageSize * (response.data.currentPages - 1) + i + 1;
            });
            this.yonghuData = response.data.list;
            // this.yonghuData.forEach((item) => {
            //   item.updateTime = item.updateTime.replace("T", " ");
            // });
            this.total = response.data.total;
            this.currentPage = 1;
          }
        })
        .catch((error) => {
          ElMessage.error("获取用户数据失败");
        });
    },
    getRegionData() {
      let url = "";
      if (this.companyId === 1) {
        if (this.param.company) {
          url = `/getRegion?companyId=${this.param.company}`; // 所属水厂ID
        } else {
          url = `/getRegion`; // 所属水厂ID
        }
      } else {
        url = `/getRegion?companyId=${this.companyId}`; // 所属水厂ID
      }
      console.log(url);
      service
        .get(`${url}`, {
          headers: {
            Authorization: this.token,
          },
        })
        .then((response) => {
          if (response.code === 200) {
            this.quyu_data = response.data.map((item) => {
              return {
                id: item.regionId,
                value: item.regionId,
                label: item.regionName,
              };
            });
            console.log(this.quyu_data);
          }
        })
        .catch((error) => {
          ElMessage.error("获取区域数据失败");
        });
    },
    clear(isSearch) {
      this.param = {
        userName: "",
        userId: "",
        meterCode: null,
        company: null, // 新增所属水厂参数
        companyId: null, // 所属水厂ID
        regionId: null, // 区域ID
      };
      // 用户点击清空时，重置区域选择和树，并自动请求数据
      if (typeof isSearch != 'number' || isNaN(isSearch)) {
        this.filterText = "";
        if (this.$refs.treeRef) {
          this.$refs.treeRef.setCurrentKey(null);
        }
        this.quyu_selected = null;
        this.currentPage = 1;
        this.search();
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
      if (this.companyId === 1) {
        if (this.param.company) {
          this.param.companyId = this.param.company; // 所属水厂ID
        }
      } else {
        this.param.companyId = this.companyId; // 所属水厂ID
      }
      const nonEmptyParams = this.filterNonEmptyParams(this.param);
      if (this.quyu_selected !== null) {
        nonEmptyParams.regionId = this.quyu_selected.id;
      }
      nonEmptyParams.page = this.currentPage; // 添加当前页码
      nonEmptyParams.pageSize = this.pageSize; // 添加每页条数
      service
        .post("/userManage/userCharge/showUsers", nonEmptyParams, {
          headers: {
            Authorization: this.token,
          },
        })
        .then((response) => {
          if (response.code === 200) {
            response.data.list.map((v, i) => {
              v.theId = this.pageSize * (response.data.currentPages - 1) + i + 1;
            });
            this.yonghuData = response.data.list;
            // this.yonghuData.forEach((item) => {
            //   item.updateTime = item.updateTime.replace("T", " ");
            // });
            this.total = response.data.total;
            this.currentPage = 1;
            this.yonghuData = response.data.list;
            // this.yonghuData.forEach((item) => {
            //   item.updateTime = item.updateTime.replace("T", " ");
            // });
            this.total = response.data.total;
            this.currentPage = response.data.currentPages;
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          // 提取错误信息
          const errorMessage = error.response?.data?.msg || "请求发生错误";
          ElMessage.error(errorMessage);
        });
    },
    download() {
      let url = "/userManage/userCharge/importUserTemplate";
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
          link.download = "用户数据导入模板.xlsx"; // 设置下载文件名
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
    bindingDownload() {
      let url = "/userManage/userCharge/importUserMeterBindTemplate";
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
          link.download = "绑定数据导入模板.xlsx"; // 设置下载文件名
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
    // 触发文件输入框点击
    triggerUserImport() {
      this.$refs.userFileInput.value = "";
      this.$refs.userFileInput.click();
    },

    triggerBindImport() {
      this.$refs.bindFileInput.value = "";
      this.$refs.bindFileInput.click();
    },
    // 处理文件上传
    async exportIn() {
      const fileInput = this.$refs.userFileInput;
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
      const companyId = this.companyId;
      formData.append("file", file);
      formData.append("companyId", companyId);
      try {
        const response = await service.post("/userManage/userCharge/importUser", formData, { responseType: "blob" });
        console.log(response);
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
        link.download = "开户导入数据失败列表.xlsx"; // 设置下载文件名
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
    async bindingExportIn() {
      const fileInput = this.$refs.bindFileInput;
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
        const response = await service.post("/userManage/userCharge/importUserMeterBind", formData, { responseType: "blob" });

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
        link.download = "绑定导入数据失败列表.xlsx"; // 设置下载文件名
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
    exportExcel() {
      let queryParams = {
        // regionId: this.param.regionId,
        // userId: this.param.userId,
        // meterCode: this.param.meterCode,
        // userName: this.param.userName,
        companyId: null,
      };
      if (this.companyId === 1) {
        if (this.param.company) {
          queryParams.companyId = this.param.company;
        }
      } else {
        queryParams.companyId = this.companyId;
      }
      // const filteredParams = Object.fromEntries(Object.entries(queryParams).filter(([_, value]) => value !== null && value !== ""));
      // 调用后端接口
      axios({
        url: "/userManage/userCharge/exportUserInfo", // 后端接口地址
        method: "POST",
        responseType: "blob", // 指定响应类型为二进制流
        headers: {
          Authorization: this.token,
        },
        data: queryParams,
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
          link.download = "开户数据列表.xlsx"; // 设置下载文件名
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

/* 修改分页整体字号（包括“共 x 条”） */
:deep(.el-pagination) {
  font-size: 16px;
}

/* 修改页码数字按钮的大小 */
:deep(.el-pagination .el-pager li) {
  font-size: 16px;
  min-width: 35px; /* 数字变大后，按钮也要相应加宽 */
  height: 35px;
  line-height: 35px;
}

/* 如果有下拉选择每页条数，修改其内部文字 */
:deep(.el-pagination .el-select .el-input) {
  font-size: 16px;
}

:deep(.el-tree) {
  --el-fill-color-light: #46b97e;
  --el-fill-color-blank: #e8f3ed;
  --el-text-color-primary: #fff;
  overflow-y: auto;
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

.account-container {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  min-width: 94%;
  height: 98%;
  padding: 0px 20px;
}

.account-container > * {
  padding: 0px 10px;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  width: 99.3%;
  background-color: #fff;
}

.serach-box {
  margin-top: 15px;
  margin-bottom: 20px;
  height: 98px;
  display: flex;
  align-items: center;
  position: relative;
}

.search-input {
  display: flex;
  justify-content: flex-start;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 14%;
  height: 100%;
  margin-right: 20px;
}

.search-input > span {
  font-size: 18px;
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

.buttons {
  display: flex;
  width: 240px;
  height: 100%;
  align-items: center;
  position: absolute;
  right: 20px;
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
  margin-right: 0px;
}

.user-info {
  height: calc(100% - 135px);
  margin-bottom: 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.command-box {
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  /* margin-top: 20px; */
  margin-bottom: 20px;
  position: absolute;
  top: 20px;
}

.command-box > * {
  margin-right: 15px;
}

.add-btn,
.delete-btn,
.command-btn,
.recharge-btn,
.recharge-record-btn,
.water-meter-btn,
.water-meter-record-btn,
.export-in-btn,
.export-out-btn {
  display: flex;
  align-items: center;
  width: 90px; /* 设置按钮的宽度 */
  height: 35px; /* 设置按钮的高度 */
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 20px;
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
  font-size: 20px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
}

.user-list {
  width: 100%;
  height: calc(100% - 150px);
  display: flex;
  margin-top: 15px;
}

.quyu-box {
  width: 200px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fafafa;
  border-radius: 5px;
  padding: 10px;
  margin-right: 20px;
}

.quyu-box > * {
  width: 100%;
  margin-bottom: 5px;
}

.quyu-box > .el-tree {
  height: 100%;
  width: 100%;
  align-items: center;
}

.quyu-box > .el-input ::placeholder {
  text-align: center;
}

.user-table {
  width: 80%;
  height: calc(100%-10px);
  flex-grow: 1;
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

.delete-dialog,
.add-dialog,
.user-info-dialog,
.change-dialog,
.change-record-dialog,
.recharge-dialog,
.recharge-record-dialog,
.chaobiao-record-dialog,
.transaction-record-dialog,
.command-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}
</style>

<style lang="scss" scoped>
:deep(.el-tree) {
  .is-current {
    > .el-tree-node__content {
      background-color: var(--el-tree-node-hover-bg-color);
      color: white;
    }
  }
}
</style>
