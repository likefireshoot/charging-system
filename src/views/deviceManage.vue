<template>
  <div class="jinggao-container">
    <div class="serach-box">
      <div class="search-input" style="margin-left: 10px" v-if="companyId === 1">
        <span>所属水厂</span>
        <el-select v-model="params.companyId"  placeholder="请选择..." >
          <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </div>
      <div class="search-input" style="margin-left: 10px">
        <span>所属厂商</span>
        <el-select v-model="params.meterVendor" placeholder="请选择...">
          <el-option v-for="item in changshang_list" :key="item.id" :label="item.label" :value="item.label"></el-option>
        </el-select>
      </div>
      <div class="search-input">
        <span>表号</span>
        <el-input v-model="params.meterCode" placeholder="请输入..." />
      </div>
      <div class="search-input">
        <span>IMEI号</span>
        <el-input v-model="params.imei" placeholder="请输入..." />
      </div>
      <div class="search-input">
        <span>产品ID</span>
        <el-input v-model="params.productId" placeholder="请输入..." />
      </div>
      <div class="search-input" style="margin-left: 10px">
        <span>设备ID</span>
        <el-input v-model="params.deviceId" placeholder="请输入..." />
      </div>
      <!-- <div class="search-input" style="margin-left: 10px">
        <span>设备名称</span>
        <el-input v-model="params.meterName" placeholder="请输入..." />
      </div> -->
      <div class="search-input" style="margin-left: 10px">
        <span>水表类型</span>
        <el-select v-model="params.meterType" placeholder="请选择水表类型">
          <el-option v-for="item in shuibiao_list" :key="item.id" :value="item.label"></el-option>
        </el-select>
      </div>
      <div class="buttons">
        <div class="sercah-btn" @click="getDeviceData">
          <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: 12px" />
          <span style="font-size: 18px; margin-left: 10px">搜索</span>
        </div>
        <div class="clear-btn" @click="clear">
          <img src="@/assets/yonghu/icon4.png" alt="" style="margin-left: 12px" />
          <span style="font-size: 18px; margin-left: 10px; color: #5a5a5a">清空</span>
        </div>
      </div>
    </div>
    <div class="device-info">
      <div class="command-box">
        <div class="add-btn" style="margin-left: 10px; width: 130px" @click="add_dialogFormVisible = true"
          v-if="companyId === 1">
          <img src="@/assets/yuangong/icon6.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">新增设备</span>
        </div>
        <div class="delete-btn" style="margin-left: 5px" :class="{ 'is-disabled': deleteDisabled }"
          @click="!deleteDisabled && delete_btn_click()">
          <img src="@/assets/yonghu/icon4.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 20px; margin-left: 8px; color: #5a5a5a">删除</span>
        </div>
        <div class="add-btn" style="margin-left: 10px; width: 130px" :class="{ 'is-disabled': singleSelectionDisabled }"
          @click="!singleSelectionDisabled && handleEdit()">
          <img src="@/assets/yuangong/icon3.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">编辑设备</span>
        </div>
        <div class="command-btn" style="margin-left: 10px; width: 130px" :class="{ 'is-disabled': singleSelectionDisabled }"
          @click="!singleSelectionDisabled && handleCommand()">
          <img src="@/assets/yonghu/icon5.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 20px; margin-left: 8px; color: #5a5a5a">命令下发</span>
        </div>
        <div class="export-out-btn" style="margin-left: 10px; width: 130px" @click="download">
          <img src="@/assets/yonghu/icon1.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">模板下载</span>
        </div>
        <div class="export-in-btn" style="margin-left: 10px" @click="triggerFileInput">
          <img src="@/assets/yonghu/icon1.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">导入</span>
          <input ref="fileInput" type="file" accept=".xls,.xlsx" style="display: none" @change="exportIn" />
        </div>
        <div class="export-out-btn" style="margin-left: 10px" @click="exportExcel">
          <img src="@/assets/fapiao/icon5.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">导出</span>
        </div>
        <div class="reflush" style="margin-left: 10px" @click="reflush">
          <img src="@/assets/yonghu/icon15.png" alt="" />
        </div>
      </div>
      <div class="device-list">
        <div class="device-table">
          <el-table ref="multipleTableRef" :data="deviceData" row-key="imei"
            style="width: 100%; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto" border
            :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }" @selection-change="handleSelectionChange"
            id="device-table">
            <el-table-column type="selection" min-width="55" align="center" fixed="left" />
<!--            <el-table-column label="序号" min-width="80" align="center" fixed="left" #default="scope">-->
<!--              {{ scope.$index + 1 + (params.page - 1) * params.pageSize }}-->
<!--            </el-table-column>-->
            <el-table-column property="meterCode" label="表号" min-width="130" align="center" fixed="left" />
            <el-table-column property="newReading" label="水表读数/吨" min-width="110" align="center" />
            <el-table-column property="valveStatus" label="阀门状态" min-width="90" align="center" />
            <el-table-column property="battery" label="电量" min-width="70" align="center" />
            <el-table-column property="signalValue" label="信号值" min-width="70" align="center" />
            <el-table-column property="updateTime" label="抄表时间" min-width="155" align="center"> </el-table-column>
            <el-table-column property="imei" label="imei号" min-width="140" align="center" />
            <el-table-column property="productId" label="产品ID" min-width="140" align="center" />
            <el-table-column property="deviceId" label="设备ID" min-width="150" align="center" />
            <el-table-column property="masterKey" label="masterKey" min-width="150" align="center" />
            <el-table-column property="meterName" label="设备名称" min-width="90" align="center" />
            <el-table-column property="meterType" label="水表类型" min-width="90" align="center" />
            <el-table-column property="meterVendor" label="所属厂商" min-width="90" align="center" />
            <el-table-column property="companyName" label="所属水厂" min-width="90" align="center" />
          </el-table>
        </div>
      </div>
      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination v-model:current-page="params.page" v-model:page-size="params.pageSize" :page-sizes="[5, 10, 15]" layout="total,  prev, pager, next, jumper" :total="total"
          @current-change="handlePageChange"/>
        </div>
      </div>
    </div>
    <!-- 新增按钮弹出框 -->
    <addVue v-if="add_dialogFormVisible" :add_dialogFormVisible="add_dialogFormVisible" :companyList="companyList"
      @close="closeAddDialog"></addVue>

    <!-- 删除按钮弹出框 -->
    <deleteVue v-if="delete_dialogFormVisible" :delete_dialogFormVisible="delete_dialogFormVisible"
      :data="multipleSelection" @close="closeDeleteDialog"></deleteVue>

    <!-- 编辑按钮弹出框 -->
    <editVue v-if="edit_dialogFormVisible" :edit_dialogFormVisible="edit_dialogFormVisible" :companyList="companyList"
      :data="multipleSelection[0]" @close="closeEditDialog"></editVue>
  </div>

  <!-- 命令下发弹出框-太阳能 -->
  <commandTaiYangNengVue v-if="command_dialogFormVisible_taiyangneng"
    :command_dialogFormVisible="command_dialogFormVisible_taiyangneng" :commandType="commandType"
    :data="multipleSelection[0]" @close="closeCommandDialog"></commandTaiYangNengVue>

  <!-- 命令下发弹出框-信驰 -->
  <commandXinchiVue v-if="command_dialogFormVisible_xinchi"
    :command_dialogFormVisible="command_dialogFormVisible_xinchi" :commandType="commandType"
    :data="multipleSelection[0]" @close="closeCommandDialog"></commandXinchiVue>

  <!-- 命令下发弹出框-旧信驰/旧信驰KF01 -->
  <commandOldXinchi v-if="command_dialogFormVisible_old_xinchi"
    :command_dialogFormVisible="command_dialogFormVisible_old_xinchi" :commandType="commandType"
    :data="multipleSelection[0]" @close="closeCommandDialog"></commandOldXinchi>

  <!-- 命令下发弹出框-4G信驰 -->
  <command4GXinchi v-if="command_dialogFormVisible_4g_xinchi"
    :command_dialogFormVisible="command_dialogFormVisible_4g_xinchi" :commandType="commandType"
    :data="multipleSelection[0]" @close="closeCommandDialog"></command4GXinchi>

  <!-- 命令下发弹出框-集万讯 -->
  <commandJiWanXun v-if="command_dialogFormVisible_jiwanxun"
    :command_dialogFormVisible="command_dialogFormVisible_jiwanxun" :commandType="commandType"
    :data="multipleSelection[0]" @close="closeCommandDialog"></commandJiWanXun>

  <!-- 命令下发弹出框-千宝通 -->
  <commandQianBaoTong v-if="command_dialogFormVisible_qianbaotong"
    :command_dialogFormVisible="command_dialogFormVisible_qianbaotong" :commandType="commandType"
    :data="multipleSelection[0]" @close="closeCommandDialog"></commandQianBaoTong>

  <!-- 命令下发弹出框-圣鑫 -->
  <commandShengXin v-if="command_dialogFormVisible_shengxin"
    :command_dialogFormVisible="command_dialogFormVisible_shengxin" :commandType="commandType"
    :data="multipleSelection[0]" @close="closeCommandDialog"></commandShengXin>

  <!-- 命令下发弹出框-旧圣鑫 -->
  <commandOldShengXin v-if="command_dialogFormVisible_old_shengxin"
    :command_dialogFormVisible="command_dialogFormVisible_old_shengxin" :commandType="commandType"
    :data="multipleSelection[0]" @close="closeCommandDialog"></commandOldShengXin>
</template>

<script>
import service from "@/api/request";
import { ElMessage } from "element-plus";
import axios from "axios";
import deleteVue from "@/components/deviceManage/delete.vue";
import addVue from "@/components/deviceManage/add.vue";
import editVue from "@/components/deviceManage/edit.vue";
import commandTaiYangNengVue from "@/components/userManage/commandDialog/command_taiyangneng.vue";
import commandXinchiVue from "@/components/userManage/commandDialog/command_xinchi.vue";
import commandJiWanXun from "@/components/userManage/commandDialog/command_jiwanxun.vue";
import commandQianBaoTong from "@/components/userManage/commandDialog/command_qianbaotong.vue";
import commandShengXin from "@/components/userManage/commandDialog/command_shengxin.vue";
import commandOldXinchi from "@/components/userManage/commandDialog/command_old_xinchi.vue";
import command4GXinchi from "@/components/userManage/commandDialog/command_4g_xinchi.vue";
import commandOldShengXin from "@/components/userManage/commandDialog/command_oldshengxin.vue";

export default {
  components: {
    commandTaiYangNengVue,
    commandXinchiVue,
    commandJiWanXun,
    commandQianBaoTong,
    commandShengXin,
    commandOldXinchi,
    command4GXinchi,
    commandOldShengXin,
    deleteVue,
    addVue,
    editVue,
  },
  data() {
    return {
      params: {
        meterCode: "",
        imei: "",
        productId: "",
        deviceId: "",
        meterName: "",
        meterType: "",
        meterVendor: "",
        page: 1,
        pageSize: 50,
        companyId: null,
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      region: "",
      total: null,

      deviceData: [],
      companyList: [],
      changshang_list: [
        { id: 1, label: "信驰", value: 1 },
        { id: 2, label: "集万讯", value: 2 },
        { id: 3, label: "千宝通", value: 3 },
        { id: 4, label: "太阳能", value: 4 },
        { id: 5, label: "圣鑫", value: 5 },
        { id: 6, label: "旧信驰", value: 6 },
        { id: 7, label: "旧信驰KF01", value: 7 },
        { id: 8, label: "4G信驰", value: 8 },
        { id: 9, label: "旧圣鑫", value: 9 }
      ],
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
      multipleSelection: [],

      // 每列的实际宽度
      selectionWidth: 0,
      idWidth: 0,
      meterCodeWidth: 0,
      imeiWidth: 0,
      productIdWidth: 0,
      deviceIdWidth: 0,
      meterNameWidth: 0,
      vendorWidth: 0,
      // 父容器元素
      parentContainer: null,
      // ResizeObserver 实例
      resizeObserver: null,

      commandType: "",

      add_dialogFormVisible: false,
      delete_dialogFormVisible: false,
      edit_dialogFormVisible: false,
      command_dialogFormVisible_taiyangneng: false,
      command_dialogFormVisible_xinchi: false,
      command_dialogFormVisible_jiwanxun: false,
      command_dialogFormVisible_qianbaotong: false,
      command_dialogFormVisible_shengxin: false,
      command_dialogFormVisible_old_xinchi: false,
      command_dialogFormVisible_4g_xinchi: false,
      command_dialogFormVisible_old_shengxin: false,

      // ****** 锁
      isLoading: false
    };
  },
  watch: {
    // "params.page"() {
    //   this.getDeviceData();
    // },
  },
  computed: {
     // 删除按钮在未选时禁用
    deleteDisabled() {
      return this.multipleSelection.length === 0;
    },
    // 仅支持单选的按钮在多选或未选时禁用
    singleSelectionDisabled() {
      return this.multipleSelection.length !== 1;
    },

    // 定义每列的百分比宽度
    columnPercentages() {
      return {
        selection: 6,
        id: 10,
        meterCode: 15,
        imei: 15,
        productId: 15,
        deviceId: 15,
        meterName: 13,
        vendor: 11,
      };
    },
  },
  mounted() {
    // 获取父容器元素
    this.parentContainer = document.querySelector(".device-table");
    // 初始化列宽
    this.calculateColumnWidths();

    // 创建 ResizeObserver 实例并监听父容器宽度变化
    this.resizeObserver = new ResizeObserver(this.calculateColumnWidths);
    if (this.parentContainer) {
      this.resizeObserver.observe(this.parentContainer);
    }
    this.getDeviceData();
    this.getCompanyList();
  },
  beforeUnmount() {
    // 组件卸载时取消监听
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  methods: {
    // ****** 手动处理分页变化，避免 watch 循环 ******
    handlePageChange(page) {
      if (this.isLoading) return;
      // this.isLoading = true;
      this.params.page = page;
      this.getDeviceData();
    },

    filterNode(value, data) {
      if (!value) return true;
      return data.label.includes(value);
    },

    selectable() {
      return true; // 目前允许所有行选择，你可以加上你的业务逻辑
    },
    async handleSelectionChange(val) {
      this.multipleSelection = val;
      // if (this.multipleSelection.length > 0) {
      //   const firstRow = this.multipleSelection[0];
      //   service.get(`/userManage/meterRead/getMeterVendor?imei=${firstRow.imei}`).then((response) => {
      //     if (response.code === 200) {
      //       this.commandType = response.msg;
      //     } else {
      //       ElMessage.error(response.msg);
      //     }
      //   });
      // }
    },
    // 计算列宽的函数
    calculateColumnWidths() {
      if (this.parentContainer) {
        const parentWidth = this.parentContainer.offsetWidth;
        this.selectionWidth = (this.columnPercentages.selection / 100) * parentWidth;
        this.idWidth = (this.columnPercentages.id / 100) * parentWidth;
        this.meterCodeWidth = (this.columnPercentages.meterCode / 100) * parentWidth;
        this.imeiWidth = (this.columnPercentages.imei / 100) * parentWidth;
        this.productIdWidth = (this.columnPercentages.productId / 100) * parentWidth;
        this.deviceIdWidth = (this.columnPercentages.deviceId / 100) * parentWidth;
        this.meterNameWidth = (this.columnPercentages.meterName / 100) * parentWidth;
        this.vendorWidth = (this.columnPercentages.vendor / 100) * parentWidth;
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
    closeEditDialog() {
      this.edit_dialogFormVisible = false;
      this.multipleSelection = [];
      this.getDeviceData();
    },
    closeCommandDialog() {
      this.command_dialogFormVisible_taiyangneng = false;
      this.command_dialogFormVisible_xinchi = false;
      this.command_dialogFormVisible_jiwanxun = false;
      this.command_dialogFormVisible_qianbaotong = false;
      this.command_dialogFormVisible_shengxin = false;
      this.command_dialogFormVisible_old_xinchi = false;
      this.command_dialogFormVisible_4g_xinchi = false;
      this.command_dialogFormVisible_old_shengxin = false;
      this.multipleSelection = [];
      this.commandType = "";
      this.reflush();
    },
    delete_btn_click() {
      this.delete_dialogFormVisible = true;
    },
    getCompanyList() {
      service
        .get("/getAllUnblockCompany")
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

    handleEdit() {
      this.edit_dialogFormVisible = true;
    },
    async fetchCommandType() {
      if (this.multipleSelection.length === 0) {
        ElMessage.error("请选择要操作的数据");
        return false;
      }

      const firstRow = this.multipleSelection[0];
      try {
        const response = await service.get(`/userManage/meterRead/getMeterVendor?imei=${firstRow.imei}`);
        if (response.code === 200) {
          this.commandType = response.msg;
          return true;
        } else {
          ElMessage.error(response.msg);
          return false;
        }
      } catch (error) {
        ElMessage.error("获取设备类型失败");
        return false;
      }
    },
    async handleCommand() {
      this.commandType = this.multipleSelection[0].meterVendor;
      console.log(this.commandType);

      switch (this.commandType) {
        case "太阳能":
          this.command_dialogFormVisible_taiyangneng = true;
          break;
        case "信驰":
          this.command_dialogFormVisible_xinchi = true;
          break;
        case "旧信驰":
        case "旧信驰KF01":
          this.command_dialogFormVisible_old_xinchi = true;
          break;
        case "4G信驰":
          this.command_dialogFormVisible_4g_xinchi = true;
          break;
        case "卓正":
          this.command_dialogFormVisible_zhuozheng = true;
          break;
        case "千宝通":
          this.command_dialogFormVisible_qianbaotong = true;
          break;
        case "集万讯":
          this.command_dialogFormVisible_jiwanxun = true;
          break;
        case "圣鑫":
          this.command_dialogFormVisible_shengxin = true;
          break;
        case "旧圣鑫":
          this.command_dialogFormVisible_old_shengxin = true;
          break;
        default:
          ElMessage.error(this.commandType + " 为未知设备厂商，无法下发命令");
      }
    },
    getDeviceData() {
      if (this.isLoading) return
      this.isLoading = true
      if (this.companyId === 1) {
      } else {
        this.params.companyId = this.companyId; // 所属水厂ID
      }
      let nonEmptyParams = this.filterNonEmptyParams(this.params);
      // if (this.region != null && this.region != "") {
      //   params.regionName = this.region;
      // }
      console.log(nonEmptyParams);
      // 从sessionStorage获取token
      let token = "";
      const userData = sessionStorage.getItem("userData");
      if (userData) {
        try {
          token = JSON.parse(userData).token;
        } catch (e) {
          console.error("解析userData失败", e);
        }
      }
      // 初始化查询字符串
      let queryString = "";
      // 如果有非空参数，则发起请求
      if (Object.keys(nonEmptyParams).length > 0) {
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
      }
      service
        .post("/userManage/meterRead/showMeters", nonEmptyParams, {
          headers: {
            Authorization: token,
            token: token,
          },
        })
        .then((response) => {
          if (response.code === 200) {
            this.deviceData = response.data.list;
            if (this.deviceData.length > 0) {
              this.deviceData.forEach((item) => {
                item.updateTime = item.updateTime.replace("T", " "); // 替换T为空格
              });
            }
            this.total = response.data.total;
            // this.params.page = response.data.currentPages;
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          //ElMessage.error(error);
          console.log(error);
        }).finally(()=>{
          this.isLoading = false
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
      this.clear();
      this.params.page = 1;
      this.params.pageSize = 50;
      let params = {
        page: 1,
        pageSize: 50,
      };
      if (this.companyId === 1) {
        if (this.params.company) {
          params.companyId = this.params.company; // 所属水厂ID
        }
      } else {
        params.companyId = this.companyId; // 所属水厂ID
      }
      let token = "";
      const userData = sessionStorage.getItem("userData");
      if (userData) {
        try {
          token = JSON.parse(userData).token;
        } catch (e) {
          console.error("解析userData失败", e);
        }
      }
      service
        .post("/userManage/meterRead/showMeters", params, {
          headers: {
            Authorization: token,
            token: token,
          },
        })
        .then((response) => {
          if (response.code === 200) {
            this.deviceData = response.data.list;
            if (this.deviceData.length > 0) {
              this.deviceData.forEach((item) => {
                item.updateTime = item.updateTime.replace("T", " "); // 替换T为空格
              });
            }
            this.total = response.data.total;
            this.params.page = response.data.currentPages;
            // this.quyu_selected = null;
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
      this.params.imei = "";
      this.params.meterCode = "";
      this.params.productId = "";
      this.params.deviceId = "";
      this.params.meterName = "";
      this.params.meterType = "";
      this.params.meterVendor = "";
      this.params.companyId = null;
    },
    exportExcel() {
      const exportParams = Object.fromEntries(
        Object.entries({
          ...this.params,
          companyId: this.companyId === 1 ? this.params.companyId : this.companyId,
        }).filter(([key, value]) => !["page", "pageSize"].includes(key) && value !== "" && value !== null && value !== undefined)
      );
      let url = "/userManage/meterRead/exportMeters";
      let companyId =  this.companyId
      const postData = {
        "companyId":null
      };
      if(companyId!=1){//副水厂，需要带参数
        postData.companyId = companyId
      }
      axios({
        url: url, // 后端接口地址
        method: "POST",
        responseType: "blob", // 指定响应类型为二进制流
        data: exportParams
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
          link.download = "设备数据列表.xlsx"; // 设置下载文件名
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
    download() {
      let url = "/userManage/meterRead/importMeterTemplate";
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
          link.download = "设备数据导入模板.xlsx"; // 设置下载文件名
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

      // 文件大小限制（例如 10MB）
      // const maxSize = 10 * 1024 * 1024; // 10MB
      // if (file.size > maxSize) {
      //   ElMessage.warning("文件大小不能超过 10MB");
      //   return;
      // }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await service.post("/userManage/meterRead/importMeter", formData, { responseType: "blob" });
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
        link.download = "设备导入数据失败列表.xlsx"; // 设置下载文件名
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
  justify-content: center;
  /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 11.5%;
  height: 100%;
  margin-right: 10px;
}

.search-input>span {
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

.device-info {
  height: calc(100% - 120px);
  /* width: 98%; */
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

.command-box>* {
  margin-right: 20px;
}

.add-btn.is-disabled,
.delete-btn.is-disabled,
.command-btn.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
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
  width: 80px;
  /* 设置按钮的宽度 */
  height: 32px;
  /* 设置按钮的高度 */
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
  width: 35px;
  /* 设置按钮的宽度 */
  height: 32px;
  /* 设置按钮的高度 */
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 20px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
}

.device-list {
  width: 100%;
  height: calc(100% - 150px);
  display: flex;
  justify-content: center;
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

.quyu-box>* {
  width: 100%;
  margin-bottom: 5px;
}

.quyu-box>.el-tree {
  height: 100%;
}

.quyu-box>.el-input ::placeholder {
  text-align: center;
}

.device-table {
  width: 98%;
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

.add-dialog,
.delete-dialog {
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
  justify-content: center;
  /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 40%;
  height: 100%;
}

.add-input>span {
  font-size: 18px;
  margin-bottom: 5px;
  color: #575556;
}

.add-input>.el-input {
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
    >.el-tree-node__content {
      background-color: var(--el-tree-node-hover-bg-color);
      color: white;
    }
  }
}
</style>
