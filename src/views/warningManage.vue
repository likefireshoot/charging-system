<template>
  <div class="jinggao-container">
    <div class="serach-box">
      <div class="search-input" style="margin-left: 10px; width: 15%">
        <span>警告类型</span>
        <el-select v-model="params.warningType">
          <el-option label="欠费用户" value="欠费用户"></el-option>
          <el-option label="水表0用量用户" value="水表0用量用户"></el-option>
          <el-option label="大用量异常用户" value="大用量异常用户"></el-option>
          <el-option label="数据持续未上报" value="数据持续未上报"></el-option>
          <el-option label="设备异常" value="设备异常"></el-option>
        </el-select>
      </div>
      <div class="search-input" style="margin-left: 10px">
        <span>用户名称</span>
        <el-input v-model="params.userName" placeholder="请输入..." />
      </div>
      <div class="search-input">
        <span>IMEI号</span>
        <el-input v-model="params.imei" placeholder="请输入..." />
      </div>
      <div class="search-input">
        <span>表号</span>
        <el-input v-model="params.deviceNumber" placeholder="请输入..." />
      </div>
      <div class="buttons">
        <div class="sercah-btn" @click="getWaringData">
          <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: 12px" />
          <span style="font-size: 16px; margin-left: 10px">搜索</span>
        </div>
        <div class="clear-btn" @click="clear">
          <img src="@/assets/yonghu/icon4.png" alt="" style="margin-left: 12px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">清空</span>
        </div>
      </div>
    </div>
    <div class="jinggao-info">
      <div class="command-box">
        <!-- <div class="export-in-btn" style="margin-left: 10px">
          <img src="@/assets/fapiao/icon3.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">导入</span>
        </div> -->
        <div class="add-btn" style="margin-left: 10px; width: 110px" @click="add_dialogFormVisible = true">
          <img src="@/assets/yuangong/icon6.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">警告配置</span>
        </div>
        <div class="export-out-btn" style="margin-left: 10px" @click="exportExcel">
          <img src="@/assets/fapiao/icon5.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">导出</span>
        </div>
        <div class="reflush" style="margin-left: 10px" @click="reflush">
          <img src="@/assets/yonghu/icon15.png" alt="" />
        </div>
      </div>
      <div class="jinggao-list">
        <div class="quyu-box">
          <el-input v-model="filterText" placeholder="请输入关键字进行过滤" style="height: 32px; margin-bottom: 10px" />
          <el-tree
            ref="treeRef"
            style="max-width: 600px"
            class="filter-tree"
            :data="quyu_data"
            node-key="id"
            :props="defaultProps"
            default-expand-all
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
          />
        </div>
        <div class="jinggao-table">
          <el-table
            ref="multipleTableRef"
            :data="jinggaoData"
            row-key="index"
            style="width: auto; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
            border
            :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
            @selection-change="handleSelectionChange"
            id="jinggao-table"
          >
            <el-table-column type="selection" :width="selectionWidth" align="center" fixed="left" />
            <el-table-column property="index" label="序号" :width="idWidth" align="center" fixed="left" />
            <el-table-column property="userName" label="用户名称" :width="userNameWidth" align="center" />
            <el-table-column property="userAddress" label="用户地址" :width="addressWidth" align="center" />
            <el-table-column property="region" label="所属区域" :width="quyuWidth" align="center" />
            <el-table-column property="phone" label="联系电话" :width="phoneWidth" align="center" />
            <el-table-column property="deviceNumber" label="表号" :width="biaohaoWidth" align="center" />
            <el-table-column property="imei" label="IMEI号" :width="imeihaoWidth" align="center" />
            <el-table-column property="createTime" label="警告时间" :width="warningTimeWidth" align="center" />
            <el-table-column property="warningType" label="警告类型" :width="warningTypeWidth" align="center" />
          </el-table>
        </div>
      </div>
      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination v-model:current-page="params.pageNo" v-model:page-size="params.pageSize" :page-sizes="[5, 10, 15]" layout="total,  prev, pager, next, jumper" :total="total" />
        </div>
      </div>
    </div>
    <!-- 警告配置 -->
    <div class="add-dialog" v-if="add_dialogFormVisible">
      <div class="add-dialog-content">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/fapiao/icon8.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 18px">警告配置</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="add_dialogFormVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="add-content">
          <div class="add-input">
            <span>大用量额度（吨）</span>
            <el-input v-model="warningProperty.amountQuota" placeholder="请输入..." />
          </div>
          <div class="add-input">
            <span>数据持续未上报天数（天）</span>
            <el-input v-model="warningProperty.delayDays" placeholder="请输入..." />
          </div>
        </div>
        <div class="btn">
          <div class="confirm-btn" @click="confirm">
            <el-icon style="margin-left: 15%"><Check /></el-icon>
            <span style="font-size: 16px; margin-left: 15%">确认</span>
          </div>
          <div class="cancel-btn" @click="add_dialogFormVisible = false">
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
import { useWarningStore } from "@/store/warningStore.js";
import { mapState } from "pinia";

export default {
  data() {
    return {
      params: {
        warningType: "",
        userName: "",
        imei: "",
        deviceNumber: "",
        pageNo: 1,
        pageSize: 50,
      },
      region: "",
      total: null,
      filterText: "",
      treeRef: null,
      defaultProps: {
        label: "label",
      },
      quyu_data: [],
      quyu_selected: "",
      jinggaoData: [],

      // 每列的实际宽度
      selectionWidth: 0,
      idWidth: 0,
      userNameWidth: 0,
      addressWidth: 0,
      quyuWidth: 0,
      phoneWidth: 0,
      biaohaoWidth: 0,
      imeihaoWidth: 0,
      warningTimeWidth: 0,
      warningTypeWidth: 0,
      // 父容器元素
      parentContainer: null,
      // ResizeObserver 实例
      resizeObserver: null,

      add_dialogFormVisible: false,
      warningProperty: {
        amountQuota: null,
        delayDays: null,
      },
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
    // region() {
    //   this.getWaringDataByRegion();
    // },
    "params.pageNo"() {
      this.getWaringDataByPage();
    },
  },
  computed: {
    ...mapState(useWarningStore, ["currentWarningType", "isFromHomeClick"]),
    // 计算属性，判断是否应该从 Pinia 读取数据
    shouldReadFromPinia() {
      return this.isFromHomeClick;
    },
    // 定义每列的百分比宽度
    columnPercentages() {
      return {
        selection: 5,
        id: 6,
        userName: 10,
        address: 13,
        quyu: 10,
        phone: 10,
        biaohao: 10,
        imeihao: 10,
        warningTime: 13,
        warningType: 10,
      };
      // return {
      //   selection: 5,
      //   id: 6,
      //   userName: 10,
      //   address: 13,
      //   quyu: 12,
      //   phone: 12,
      //   imeihao: 12,
      //   warningTime: 15,
      //   warningType: 12,
      // };
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.treeRef = this.$refs.treeRef;
    });
    if (this.shouldReadFromPinia) {
      this.params.warningType = this.currentWarningType;
    }
    // 获取父容器元素
    this.parentContainer = document.querySelector(".jinggao-table");
    // 初始化列宽
    this.calculateColumnWidths();

    // 创建 ResizeObserver 实例并监听父容器宽度变化
    this.resizeObserver = new ResizeObserver(this.calculateColumnWidths);
    if (this.parentContainer) {
      this.resizeObserver.observe(this.parentContainer);
    }
    this.getRegionData();
    this.getWaringData();
  },
  beforeUnmount() {
    // 组件卸载时取消监听
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.label.includes(value);
    },
    handleNodeClick(data) {
      this.quyu_selected = data;
      this.region = this.quyu_selected.label;
      const region = this.quyu_selected.label;
      console.log(this.params);
      const nonEmptyParams = this.filterNonEmptyParams(this.params);
      nonEmptyParams.region = region;
      console.log(nonEmptyParams);
      service
        .post("/queryWarnings", nonEmptyParams)
        .then((response) => {
          if (response.code === 200) {
            this.jinggaoData = response.data.records;
            this.total = response.data.total;
            this.params.pageNo = response.data.current;
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          //ElMessage.error(error);
          console.log(error);
        });
    },
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
        this.idWidth = (this.columnPercentages.id / 100) * parentWidth;
        this.userNameWidth = (this.columnPercentages.userName / 100) * parentWidth;
        this.addressWidth = (this.columnPercentages.address / 100) * parentWidth;
        this.quyuWidth = (this.columnPercentages.quyu / 100) * parentWidth;
        this.phoneWidth = (this.columnPercentages.phone / 100) * parentWidth;
        this.biaohaoWidth = (this.columnPercentages.biaohao / 100) * parentWidth;
        this.imeihaoWidth = (this.columnPercentages.imeihao / 100) * parentWidth;
        this.warningTimeWidth = (this.columnPercentages.warningTime / 100) * parentWidth;
        this.warningTypeWidth = (this.columnPercentages.warningType / 100) * parentWidth;
      }
    },
    getRegionData() {
      service
        .get("/device_display/getAllTown")
        .then((response) => {
          if (response.code === 200) {
            this.quyu_data = response.data.map((item) => {
              return {
                id: item.id,
                value: item.id,
                label: item.name,
              };
            });
            console.log(this.quyu_data);
          }
        })
        .catch((error) => {
          ElMessage.error("获取区域数据失败");
        });
    },
    getWaringData() {
      let params = this.filterNonEmptyParams(this.params);
      console.log("this.region 的值:", this.region);
      console.log("this.region 的长度:", this.region.length);

      if (this.region != null && this.region != "") {
        params.region = this.region;
      }
      console.log(params);
      service
        .post("/queryWarnings", params)
        .then((response) => {
          if (response.code === 200) {
            this.jinggaoData = response.data.records;
            this.total = response.data.total;
            this.params.pageNo = response.data.current;
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          //ElMessage.error(error);
          console.log(error);
        });
    },
    // getWaringDataByRegion() {
    //   const nonEmptyParams = this.filterNonEmptyParams(this.params);
    //   nonEmptyParams.region = this.region;
    //   // let params = { region: this.region, pageNo: this.params.pageNo, pageSize: this.params.pageSize };
    //   service
    //     .post("/queryWarnings", nonEmptyParams)
    //     .then((response) => {
    //       if (response.code === 200) {
    //         this.jinggaoData = response.data.records;
    //         this.total = response.data.total;
    //         this.params.pageNo = response.data.current;
    //       } else {
    //         ElMessage.error(response.msg);
    //       }
    //     })
    //     .catch((error) => {
    //       //ElMessage.error(error);
    //       console.log(error);
    //     });
    // },
    getWaringDataByPage() {
      let params = this.filterNonEmptyParams(this.params);
      if (this.region != null && this.region != "") {
        params.region = this.region;
      }
      service
        .post("/queryWarnings", params)
        .then((response) => {
          if (response.code === 200) {
            this.jinggaoData = response.data.records;
            this.total = response.data.total;
            this.params.pageNo = response.data.current;
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          //ElMessage.error(error);
          console.log(error);
        });
    },
    filterNonEmptyParams(params) {
      const filteredParams = {};
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          const value = params[key];
          if (value !== "") {
            filteredParams[key] = value;
          }
        }
      }
      return filteredParams;
    },
    reflush() {
      this.$refs.treeRef.setCurrentKey(null);
      let params = { pageNo: 1, pageSize: 50 };
      this.region = "";
      service
        .post("/queryWarnings", params)
        .then((response) => {
          if (response.code === 200) {
            this.jinggaoData = response.data.records;
            this.total = response.data.total;
            this.params.pageNo = response.data.current;
            this.quyu_selected = null;
            // this.region = "";
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    clear() {
      this.params.warningType = "";
      this.params.userName = "";
      this.params.imei = "";
      this.params.deviceNumber = "";
      this.params.region = "";
    },
    exportExcel() {
      axios({
        url: "/exportWarningsReport", // 后端接口地址
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
            alert("内容为空，无法下载");
            return;
          }

          // 创建一个链接元素
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob); // 创建 Blob URL
          link.download = "警告数据列表.xlsx"; // 设置下载文件名
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
    confirm() {
      const validations = [
        {
          condition: this.warningProperty.amountQuota === null,
          message: "大用量额度不能为空",
        },
        {
          condition: this.warningProperty.delayDays === null,
          message: "数据持续未上报天数不能为空",
        },
        {
          condition: isNaN(parseInt(this.warningProperty.delayDays)) || parseInt(this.warningProperty.delayDays) < 0,
          message: "数据持续未上报天数必须为正整数",
        },
      ];

      for (const validation of validations) {
        if (validation.condition) {
          ElMessage.error(validation.message);
          return;
        }
      }
      service
        .get(`/setWarningConfig?amountQuota=${this.warningProperty.amountQuota}&delayDays=${this.warningProperty.delayDays}`)
        .then((response) => {
          if (response.code === 200) {
            ElMessage.success("设置成功");
            this.add_dialogFormVisible = false;
            this.reflush();
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
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

:deep(.el-select-dropdown .el-scrollbar .el-select-dropdown__wrap .el-select-dropdown__list li.selected span) {
  color: #46b97e;
}

:deep(.el-pagination) {
  --el-color-primary: #46b97e;
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

.jinggao-container {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  width: 100%;
  height: 98%;
  padding: 0px 20px;
}

.jinggao-container > * {
  padding: 0px 10px;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  width: 99.3%;
  background-color: #fff;
}

.serach-box {
  margin-top: 10px;
  margin-bottom: 10px;
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
  width: 15%;
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
  margin-right: 50px;
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

.jinggao-info {
  height: calc(100% - 120px);
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
  margin-bottom: 20px;
  position: absolute;
  top: 15px;
}

.command-box > * {
  margin-right: 20px;
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

.jinggao-list {
  width: 100%;
  height: calc(100% - 150px);
  display: flex;
  margin-top: 10px;
  margin-bottom: 5px;
}

.quyu-box {
  width: 220px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fafafa;
  border-radius: 5px;
  padding: 10px;
  margin-right: 1%;
}

.quyu-box > * {
  width: 100%;
  margin-bottom: 5px;
}

.quyu-box > .el-tree {
  height: 100%;
}

.quyu-box > .el-input ::placeholder {
  text-align: center;
}

.jinggao-table {
  width: 90%;
  /* flex-grow: 1; */
  height: calc(100%-10px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.page-box {
  width: 100%;
  height: 65px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 5px;
  position: absolute;
  bottom: 0;
}

.add-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.add-dialog {
  z-index: 200;
}

.add-dialog-content {
  width: 40%;
  height: 270px;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-top: -135px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  width: 100%;
  height: 45px;
  line-height: 45px;
  background-color: #fff;
  border-radius: 5px 5px 0 0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  text-align: center;
  display: flex;
  justify-content: space-between;
}

.add-content {
  border: 1px solid #fff;
  background-color: #fff;
  border-radius: 5px;
  width: 90%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 0 3%;
}

.add-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 40%;
  height: 100%;
}

.add-input > span {
  font-size: 15px;
  margin-bottom: 5px;
  color: #575556;
}

.add-input > .el-input {
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
