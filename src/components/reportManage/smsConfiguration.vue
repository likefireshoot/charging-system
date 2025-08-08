<template>
  <div class="duanxin-container">
    <div class="search-box">
      <div class="search-content">
        <div class="search-input" style="margin-left: 10px">
          <span>短信配置编号</span>
          <el-input v-model="params.configId" placeholder="请输入..." />
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>短信配置名称</span>
          <el-input v-model="params.configName" placeholder="请输入..." />
        </div>
      </div>
      <div class="buttons">
        <div class="sercah-btn" @click="search">
          <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 15%">搜索</span>
        </div>
        <div class="clear-btn" @click="clear">
          <img src="@/assets/yuangong/icon4.png" alt="" style="margin-left: 10px" />
          <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">清空</span>
        </div>
      </div>
    </div>
    <div class="duanxin-info">
      <div class="command-box">
        <div class="add-btn" style="margin-left: 10px" @click="add_dialogFormVisible = true">
          <img src="@/assets/yuangong/icon6.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">新增</span>
        </div>
        <div class="delete-btn" style="margin-left: 10px" @click="delete_click">
          <img src="@/assets/yuangong/icon4.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">删除</span>
        </div>
        <div class="edit-btn" style="margin-left: 10px" @click="edit_click">
          <img src="@/assets/yuangong/icon3.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">编辑</span>
        </div>
        <div class="export-in-btn" style="margin-left: 10px" @click="triggerFileInput">
          <img src="@/assets/yuangong/icon1.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">导入</span>
          <input ref="fileInput" type="file" accept=".xls,.xlsx" style="display: none" @change="exportIn" />
        </div>
        <div class="export-out-btn" style="margin-left: 10px" @click="exportExcel">
          <img src="@/assets/yuangong/icon2.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">导出</span>
        </div>
        <div class="reflush" style="margin-left: 10px" @click="reflush">
          <img src="@/assets/yonghu/icon15.png" alt="" />
        </div>
      </div>
      <div class="duanxin-table">
        <el-table
          ref="multipleTableRef"
          :data="smsData"
          row-key="index"
          style="width: auto; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
          border
          :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
          @selection-change="handleSelectionChange"
          id="duanxin-table"
        >
          <el-table-column type="selection" :selectable="selectable" :width="selectionWidth" align="center" />
          <el-table-column property="index" label="序号" :width="indexWidth" align="center" />
          <el-table-column property="id" label="短信配置编号" :width="idWidth" align="center" />
          <el-table-column property="smsConfigName" label="短信配置名称" :width="nameWidth" align="center" />
          <el-table-column property="smsSendType" label="发送方式" :width="sendTypeWidth" align="center" />
          <el-table-column property="smsSendScheduledTime" label="短信定时发送时间" :width="sendTimeWidth" align="center" />
          <el-table-column property="smsSendBound" label="余额不足发送预警值" :width="warningValueWidth" align="center" />
          <el-table-column property="smsSendWarningTotalDays" label="余额不足短信提醒天数" :width="warningDayWidth" align="center" />
        </el-table>
      </div>
      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination v-model:current-page="params.pageNo" v-model:page-size="params.pageSize" :page-sizes="[5, 10, 15]" layout="total,  prev, pager, next, jumper" :total="total" />
        </div>
      </div>
    </div>
    <!-- 新增按钮弹出框 -->
    <div class="test-dialog" v-if="add_dialogFormVisible">
      <div class="test-dialog-content">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/yuangong/icon6.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 18px">新增</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="add_dialogFormVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="test-content">
          <div class="test-input">
            <span>短信配置名称</span>
            <el-input v-model="addData.smsConfigName" />
          </div>
          <div class="test-input">
            <span>发送方式</span>
            <el-select v-model="addData.smsSendType" style="height: 35px">
              <el-option label="实时发送" value="实时发送"></el-option>
              <el-option label="定时发送" value="定时发送"></el-option>
            </el-select>
          </div>
          <div class="test-input" style="margin-right: 0">
            <span>定时发送时间</span>
            <el-input v-model="addData.smsSendScheduledTime" placeholder="请输入定时发送时间（0~23）" :disabled="isAddSendTimeDisabled"></el-input>
          </div>
          <div class="test-input">
            <span>余额不足发送预警值（元）</span>
            <el-input v-model="addData.smsSendBound" />
          </div>
          <div class="test-input">
            <span>余额不足短信提醒天数</span>
            <el-input v-model="addData.smsSendWarningTotalDays" />
          </div>
        </div>
        <div class="btn">
          <div class="confirm-btn" @click="addConfirm">
            <el-icon style="margin-left: 15%"><Check /></el-icon>
            <span style="font-size: 16px; margin-left: 15%">确认</span>
          </div>
          <div class="cancel-btn" @click="add_cancel">
            <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
            <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">取消</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 删除按钮弹出框 -->
    <div class="delete-dialog" v-if="delete_dialogFormVisible">
      <div class="delete-dialog-content">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/yuangong/icon4.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 18px">删除</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="delete_dialogFormVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="delete-content">
          <el-icon style="margin-right: 10px; margin-top: 35px; font-size: 40px; color: #f33125" align-self="center"><WarningFilled /></el-icon>
          <span style="margin-top: 5px">删除后不可恢复，确认删除数据吗？</span>
        </div>
        <div class="btn">
          <div class="confirm-btn" @click="deleteConfirm">
            <el-icon style="margin-left: 15%"><Check /></el-icon>
            <span style="font-size: 16px; margin-left: 15%">确认</span>
          </div>
          <div class="cancel-btn" @click="delete_dialogFormVisible = false">
            <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
            <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">取消</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 编辑按钮弹出框 -->
    <div class="test-dialog" v-if="edit_dialogFormVisible">
      <div class="test-dialog-content">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/yuangong/icon3.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 18px">编辑</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="edit_dialogFormVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="test-content">
          <div class="test-input">
            <span>短信配置名称</span>
            <el-input v-model="editData.smsConfigName" />
          </div>
          <div class="test-input">
            <span>发送方式</span>
            <el-select v-model="editData.smsSendType">
              <el-option label="实时发送" value="实时发送"></el-option>
              <el-option label="定时发送" value="定时发送"></el-option>
            </el-select>
          </div>
          <div class="test-input" style="margin-right: 0">
            <span>定时发送时间</span>
            <el-input v-model="editData.smsSendScheduledTime" placeholder="请输入定时发送时间（0~23）" :disabled="isEditSendTimeDisabled"></el-input>
          </div>
          <div class="test-input">
            <span>余额不足发送预警值（元）</span>
            <el-input v-model="editData.smsSendBound" />
          </div>
          <div class="test-input">
            <span>余额不足短信提醒天数</span>
            <el-input v-model="editData.smsSendWarningTotalDays" />
          </div>
        </div>
        <div class="btn">
          <div class="confirm-btn" @click="editConfirm">
            <el-icon style="margin-left: 15%"><Check /></el-icon>
            <span style="font-size: 16px; margin-left: 15%">确认</span>
          </div>
          <div class="cancel-btn" @click="edit_dialogFormVisible = false">
            <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
            <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">取消</span>
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
  data() {
    return {
      params: {
        configName: null,
        configId: null,
        pageNo: 1,
        pageSize: 50,
      },
      postsList: [
        {
          id: 1,
          name: "经理",
        },
        {
          id: 2,
          name: "员工",
        },
      ],
      rolesList: [
        {
          id: 1,
          name: "管理员",
        },
        {
          id: 2,
          name: "普通员工",
        },
      ],
      smsData: [],
      multipleSelection: [],
      addData: {
        smsConfigName: null,
        smsSendType: null,
        smsSendScheduledTime: null,
        smsSendBound: null,
        smsSendWarningTotalDays: null,
      },
      editData: {
        smsConfigName: null,
        smsSendType: null,
        smsSendScheduledTime: null,
        smsSendBound: null,
        smsSendWarningTotalDays: null,
      },

      total: 100,

      // 每列实际宽度
      selectionWidth: 0,
      indexWidth: 0,
      idWidth: 0,
      nameWidth: 0,
      sendTypeWidth: 0,
      sendTimeWidth: 0,
      warningValueWidth: 0,
      warningDayWidth: 0,

      // 父容器元素
      parentContainer: null,
      // ResizeObserver 实例
      resizeObserver: null,

      //弹出框显示与否
      delete_dialogFormVisible: false,
      add_dialogFormVisible: false,
      edit_dialogFormVisible: false,

      //表格勾选行
      selection: [],
    };
  },
  watch: {
    "params.pageNo": {
      handler() {
        this.getSmsConfigDataByPage();
      },
    },
    "addData.smsSendType": {
      handler() {
        if (this.isAddSendTimeDisabled) {
          this.addData.smsSendScheduledTime = null;
        }
      },
    },
    "editData.smsSendType": {
      handler() {
        if (this.isEditSendTimeDisabled) {
          this.editData.smsSendScheduledTime = null;
        }
      },
    },
  },
  computed: {
    // 每列的百分比宽度
    columnPercentages() {
      return {
        selection: 5,
        index: 8,
        id: 12,
        name: 15,
        sendType: 10,
        sendTime: 18,
        warningValue: 15,
        warningDay: 15,
      };
    },
    isAddSendTimeDisabled() {
      return this.addData.smsSendType === "实时发送";
    },
    isEditSendTimeDisabled() {
      return this.editData.smsSendType === "实时发送";
    },
  },
  mounted() {
    // 获取父容器元素
    this.parentContainer = document.querySelector(".duanxin-table");
    // 初始化列宽
    this.calculateColumnWidths();

    // 创建 ResizeObserver 实例并监听父容器宽度变化
    this.resizeObserver = new ResizeObserver(this.calculateColumnWidths);
    if (this.parentContainer) {
      this.resizeObserver.observe(this.parentContainer);
    }

    this.getSmsConfigData();
  },
  beforeUnmount() {
    // 组件卸载时取消监听
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  methods: {
    selectable() {
      return true; // 目前允许所有行选择，你可以加上你的业务逻辑
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 计算列宽的函数
    calculateColumnWidths() {
      if (this.parentContainer) {
        const parentWidth = this.parentContainer.offsetWidth;
        this.selectionWidth = (this.columnPercentages.selection / 100) * parentWidth;
        this.indexWidth = (this.columnPercentages.index / 100) * parentWidth;
        this.idWidth = (this.columnPercentages.id / 100) * parentWidth;
        this.nameWidth = (this.columnPercentages.name / 100) * parentWidth;
        this.sendTypeWidth = (this.columnPercentages.sendType / 100) * parentWidth;
        this.sendTimeWidth = (this.columnPercentages.sendTime / 100) * parentWidth;
        this.warningValueWidth = (this.columnPercentages.warningValue / 100) * parentWidth;
        this.warningDayWidth = (this.columnPercentages.warningDay / 100) * parentWidth;
      }
    },

    getSmsConfigData() {
      const filteredParams = Object.fromEntries(Object.entries(this.params).filter(([_, value]) => value !== null && value !== ""));
      service
        .post("/querySmsConfig", filteredParams)
        .then((response) => {
          if (response.code === 200) {
            this.smsData = response.data.records;
            this.smsData.forEach((item) => {
              if (item.smsSendType === "实时发送") {
                item.smsSendScheduledTime = "";
              }
            });
            this.total = response.data.total;
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },

    getSmsConfigDataByPage() {
      const params = {
        pageNo: this.params.pageNo,
        pageSize: this.params.pageSize,
      };
      console.log(params);
      service
        .post("/querySmsConfig", params)
        .then((response) => {
          if (response.code === 200) {
            this.smsData = response.data.records;
            this.smsData.forEach((item) => {
              if (item.smsSendType === "实时发送") {
                item.smsSendScheduledTime = "";
              }
            });
            this.total = response.data.total;
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },

    reflush() {
      let params = { pageNo: 1, pageSize: 50 };
      console.log(params);
      service
        .post("/querySmsConfig", params)
        .then((response) => {
          if (response.code === 200) {
            this.smsData = response.data.records;
            this.smsData.forEach((item) => {
              if (item.smsSendType === "实时发送") {
                item.smsSendScheduledTime = "";
              }
            });
            this.total = response.data.total;
            this.params.pageNo = 1;
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },

    delete_click() {
      if (this.multipleSelection.length > 0) {
        this.delete_dialogFormVisible = true;
      } else {
        ElMessage.error("请选择需要删除的数据");
      }
    },

    edit_click() {
      if (this.multipleSelection.length > 0) {
        this.editData = this.multipleSelection[0];
        this.edit_dialogFormVisible = true;
      } else {
        ElMessage.error("请选择需要编辑的数据");
      }
    },

    search() {
      this.getSmsConfigData();
    },

    clear() {
      this.params.configName = null;
      this.params.configId = null;
    },

    addConfirm() {
      const validations = [
        { condition: this.addData.smsConfigName === null || this.addData.smsConfigName === "", message: "短信配置名称不能为空！" },
        { condition: this.addData.smsSendType === null || this.addData.smsSendType === "", message: "发送方式不能为空！" },
        {
          condition: this.addData.smsSendType === "定时发送" && (this.addData.smsSendScheduledTime === null || this.addData.smsSendScheduledTime === ""),
          message: "定时发送时间不能为空！",
        },
        {
          condition:
            this.addData.smsSendType === "定时发送" &&
            (isNaN(parseInt(this.addData.smsSendScheduledTime)) || parseInt(this.addData.smsSendScheduledTime) < 0 || parseInt(this.addData.smsSendScheduledTime) > 23),
          message: "定时发送时间必须为0 - 23的整数！",
        },
        {
          condition: this.addData.smsSendBound === null || this.addData.smsSendBound === "",
          message: "余额不足发送预警值不能为空！",
        },
        {
          condition: isNaN(parseFloat(this.addData.smsSendBound)) || parseFloat(this.addData.smsSendBound) < 0,
          message: "余额不足发送预警值必须为正数",
        },
        {
          condition: this.addData.smsSendWarningTotalDays === null || this.addData.smsSendWarningTotalDays === "",
          message: "余额不足短信提醒天数不能为空！",
        },
        {
          condition: isNaN(parseInt(this.addData.smsSendWarningTotalDays)) || parseInt(this.addData.smsSendWarningTotalDays) < 0,
          message: "余额不足短信提醒天数必须为正整数",
        },
      ];

      for (const validation of validations) {
        if (validation.condition) {
          ElMessage.error(validation.message);
          return;
        }
      }
      const filteredParams = Object.fromEntries(Object.entries(this.addData).filter(([_, value]) => value !== null && value !== ""));
      service
        .post("/smsAddConfig", filteredParams)
        .then((response) => {
          if (response.code === 200) {
            ElMessage.success("添加成功");
            this.add_dialogFormVisible = false;
            this.addData = {
              smsConfigName: null,
              smsSendType: null,
              smsSendScheduledTime: null,
              smsSendBound: null,
              smsSendWarningTotalDays: null,
            };
            this.getSmsConfigData();
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },

    add_cancel() {
      this.add_dialogFormVisible = false;
      this.addData = {
        smsConfigName: null,
        smsSendType: null,
        smsSendScheduledTime: null,
        smsSendBound: null,
        smsSendWarningTotalDays: null,
      };
    },

    editConfirm() {
      const validations = [
        { condition: this.editData.smsConfigName === null || this.editData.smsConfigName === "", message: "短信配置名称不能为空！" },
        { condition: this.editData.smsSendType === null || this.editData.smsSendType === "", message: "发送方式不能为空！" },
        {
          condition: this.editData.smsSendType === "定时发送" && (this.editData.smsSendScheduledTime === null || this.editData.smsSendScheduledTime === ""),
          message: "定时发送时间不能为空！",
        },
        {
          condition:
            this.editData.smsSendType === "定时发送" &&
            (isNaN(parseInt(this.editData.smsSendScheduledTime)) || parseInt(this.editData.smsSendScheduledTime) < 0 || parseInt(this.editData.smsSendScheduledTime) > 23),
          message: "定时发送时间必须为0 - 23的整数！",
        },
        {
          condition: this.editData.smsSendBound === null || this.editData.smsSendBound === "",
          message: "余额不足发送预警值不能为空！",
        },
        {
          condition: isNaN(parseFloat(this.editData.smsSendBound)) || parseFloat(this.editData.smsSendBound) < 0,
          message: "余额不足发送预警值必须为正数",
        },
        {
          condition: this.editData.smsSendWarningTotalDays === null || this.editData.smsSendWarningTotalDays === "",
          message: "余额不足短信提醒天数不能为空！",
        },
        {
          condition: isNaN(parseInt(this.editData.smsSendWarningTotalDays)) || parseInt(this.editData.smsSendWarningTotalDays) < 0,
          message: "余额不足短信提醒天数必须为正整数",
        },
      ];

      for (const validation of validations) {
        if (validation.condition) {
          ElMessage.error(validation.message);
          return;
        }
      }
      console.log(this.editData);
      service
        .post("/smsUpdateConfig", this.editData)
        .then((response) => {
          if (response.code === 200) {
            ElMessage.success("修改成功");
            this.edit_dialogFormVisible = false;
            this.getSmsConfigData();
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });

      this.edit_dialogFormVisible = false;
    },

    deleteConfirm() {
      let hasDefault = false;
      for (let item of this.multipleSelection) {
        if (item.id === 29) {
          hasDefault = true;
          break;
        }
      }

      if (hasDefault) {
        ElMessage.warning("该配置为默认短信配置，无法删除！");
        this.delete_dialogFormVisible = false;
        this.multipleSelection = [];
        this.reflush();
        return;
      }

      // 若没有默认配置，再收集id并发送请求
      let ids = this.multipleSelection.map((item) => item.id);
      service
        .post("/smsDeleteConfig", ids)
        .then((response) => {
          if (response.code === 200) {
            ElMessage.success("删除成功");
            this.delete_dialogFormVisible = false;
            this.multipleSelection = [];
            this.reflush();
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },

    // 触发文件输入框点击
    triggerFileInput() {
      this.$refs.fileInput.value = ""; // 清空文件输入框，确保每次点击都能触发 @change
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

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await service.post("/uploadSmsConfig", formData);
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
      // 调用后端接口
      axios({
        url: "/exportSmsConfig", // 后端接口地址
        method: "POST",
        responseType: "blob", // 指定响应类型为二进制流
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
          link.download = "短信配置数据列表.xlsx"; // 设置下载文件名
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

.duanxin-container {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  width: 90%;
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
  width: 70%;
  height: 100%;
}

.search-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 25%;
  height: 100%;
  margin-right: 20px;
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
  align-self: center;
  margin-left: 5px;
  margin-right: 5px;
}

.buttons {
  display: flex;
  width: 240px;
  height: 100%;
  align-items: center;
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

.duanxin-info {
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

.add-btn,
.delete-btn,
.edit-btn,
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

.duanxin-table,
.page-box {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.duanxin-table {
  height: calc(98% - 110px);
}

.page-box {
  height: 65px;
  position: absolute;
  bottom: 0;
}

/* 删除弹出框 */
.delete-dialog,
.test-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.delete-dialog-content,
.test-dialog-content {
  width: 35%;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 20%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.delete-dialog-content {
  height: 300px;
  top: 50%;
  margin-top: -150px;
}

.test-dialog-content {
  height: 350px;
  width: 70%;
  top: 50%;
  margin-top: -175px;
}

.title {
  width: 100%;
  background-color: #fff;
  border-radius: 5px 5px 0 0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  height: 45px;
  line-height: 40px;
  text-align: center;
  display: flex;
  justify-content: space-between;
}

.delete-content,
.test-content {
  width: 94%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
}

.delete-content {
  height: 150px;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 25px;
}

.test-content {
  width: 90%;
  height: 200px;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 15px;
  margin-bottom: 5px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: 1%;
}

.test-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 31%;
  height: 80px;
  margin-right: 3.5%;
}

.test-input > span {
  font-size: 16px;
  margin-bottom: 5px;
}

.test-input > .el-input {
  height: 35px;
  width: 100%;
}

.btn {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 15px;
  margin-bottom: 15px;
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
