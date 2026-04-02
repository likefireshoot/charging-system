<template>
  <div class="fapiao-container">
    <div class="search-box">
      <div class="search-content">
        <div class="search-input" style="margin-left: 10px">
          <span>用户号</span>
          <el-input v-model="params.userAccount" placeholder="请输入..." />
        </div>
        <div class="search-input">
          <span>用户名称</span>
          <el-input v-model="params.userName" placeholder="请输入..." />
        </div>
        <!-- <div class="search-input" style="width: 25%">
          <span>表号</span>
          <el-input v-model="params.deviceNumber" placeholder="请输入..." />
        </div> -->
        <div class="search-input" style="width: 45%">
          <span>时间</span>
          <div class="time-input">
            <el-date-picker
              v-model="params.startDate"
              type="date"
              placeholder="选择日期"
              style="flex-grow: 0; width: 140px; flex-basis: auto; margin-right: 5px; height: 35px"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
            <span>至</span>
            <el-date-picker
              v-model="params.endDate"
              type="date"
              placeholder="选择日期"
              style="flex-grow: 0; width: 140px; flex-basis: auto; height: 35px"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </div>
        </div>
      </div>
      <div class="buttons">
        <div class="sercah-btn" @click="getInvoiceData">
          <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 15%">搜索</span>
        </div>
        <div class="clear-btn" @click="clear">
          <img src="@/assets/fapiao/icon9.png" alt="" style="margin-left: 10px" />
          <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">清空</span>
        </div>
      </div>
    </div>
    <div class="fapiao-info">
      <div class="command-box">
        <div class="add-btn" style="margin-left: 10px" :class="{ 'btn-single-only-disabled': !multipleSelection || multipleSelection.length !== 1 }" @click="multipleSelection && multipleSelection.length === 1 && handleInvoice()">
          <img src="@/assets/fapiao/icon1.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">开票</span>
        </div>
        <!-- <div class="export-in-btn" style="margin-left: 10px" @click="triggerFileInput">
          <img src="@/assets/fapiao/icon3.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">导入</span>
          <input ref="fileInput" type="file" accept=".xls,.xlsx" style="display: none" @change="exportIn" />
        </div> -->
        <div class="export-out-btn" style="margin-left: 10px" @click="exportExcel">
          <img src="@/assets/fapiao/icon5.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">导出</span>
        </div>
        <div class="reflush" style="margin-left: 10px" @click="reflush">
          <img src="@/assets/yonghu/icon15.png" alt="" />
        </div>
      </div>
      <div class="fapiao-table">
        <el-table
          ref="multipleTableRef"
          :data="fapiaoData"
          row-key="index"
          style="width: auto; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto"
          border
          :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }"
          @selection-change="handleSelectionChange"
          id="fapiao-table"
        >
          <el-table-column type="selection" :selectable="selectable" :width="selectionWidth" align="center" fixed="left" />
          <el-table-column property="index" label="序号" :width="idWidth" align="center" fixed="left" />
          <el-table-column property="userAccount" label="用户号" :width="yonghuhaoWidth" align="center" />
          <el-table-column property="userName" label="用户名称" :width="nameWidth" align="center" />
          <!--<el-table-column property="deviceNumber" label="表号" :width="biaohaoWidth" align="center" />-->
          <el-table-column property="createTime" label="交易时间" :width="jiaoyitimeWidth" align="center" />
          <el-table-column property="tradeForm" label="交易形式" :width="jiaoyitypeWidth" align="center" />
          <el-table-column property="amount" label="交易金额/元" :width="jiaoyijineWidth" align="center" />
          <el-table-column property="status" label="发票状态" :width="fapiaostateWidth" align="center" />
        </el-table>
      </div>
      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination v-model:current-page="params.pageNo" v-model:page-size="params.pageSize" :page-sizes="[5, 10, 15]" layout="total,  prev, pager, next, jumper" :total="total" />
        </div>
      </div>
    </div>
    <!-- 开票  -->
    <div class="invoice-dialog" v-if="invoiceDialogVisible">
      <div class="invoice-dialog-content">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/fapiao/icon1.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 18px">开票</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="invoiceDialogVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="invoice-form">
          <div class="invoice-content">
            <div class="invoice-item">
              <div class="invoice-item-input">
                <span style="font-size: 16px; color: #47b97e; margin-bottom: 10px">购买方信息</span>
                <div class="invoice-item-content">
                  <div class="content">
                    <div v-for="(field, index) in buyer_info_fields" :key="index" class="invoice-input">
                      <span>{{ field.label }}</span>
                      <el-input v-model="field.value"></el-input>
                    </div>
                  </div>
                </div>
              </div>
              <div class="invoice-btn">
                <div class="addProperty-btn" @click="handleAddInfo('buyer')">
                  <el-icon style="margin-left: 10%"><Check /></el-icon>
                  <span style="font-size: 16px; margin-left: 10%">新增属性</span>
                </div>
                <div class="deleteProperty-btn" @click="handleDeleteInfo('buyer')">
                  <img src="@/assets/fapiao/icon7.png" alt="" style="margin-left: 7px" />
                  <span style="font-size: 16px; margin-left: 10%">删除属性</span>
                </div>
              </div>
            </div>
          </div>
          <div class="invoice-content">
            <div class="invoice-item">
              <div class="invoice-item-input">
                <span style="font-size: 16px; color: #47b97e; margin-bottom: 10px">开票方信息</span>
                <div class="invoice-item-content">
                  <div class="content">
                    <div v-for="(field, index) in gongsi_info_fields" :key="index" class="invoice-input">
                      <span>{{ field.label }}</span>
                      <el-input v-model="field.value"></el-input>
                    </div>
                  </div>
                </div>
              </div>
              <div class="invoice-btn">
                <div class="addProperty-btn" @click="handleAddInfo('gongsi')">
                  <el-icon style="margin-left: 10%"><Check /></el-icon>
                  <span style="font-size: 16px; margin-left: 10%">新增属性</span>
                </div>
                <div class="deleteProperty-btn" @click="handleDeleteInfo('gongsi')">
                  <img src="@/assets/fapiao/icon7.png" alt="" style="margin-left: 7px" />
                  <span style="font-size: 16px; margin-left: 10%">删除属性</span>
                </div>
              </div>
            </div>
          </div>
          <div class="invoice-content">
            <div class="invoice-item">
              <div class="invoice-item-input">
                <span style="font-size: 16px; color: #47b97e; margin-bottom: 10px">发票内容信息</span>
                <div class="invoice-item-content">
                  <div class="content">
                    <div v-for="(field, index) in invoice_content_fields" :key="index" class="invoice-input">
                      <span>{{ field.label }}</span>
                      <el-input v-model="field.value"></el-input>
                    </div>
                  </div>
                </div>
              </div>
              <div class="invoice-btn">
                <div class="addProperty-btn" @click="handleAddInfo('invoice')">
                  <el-icon style="margin-left: 10%"><Check /></el-icon>
                  <span style="font-size: 16px; margin-left: 10%">新增属性</span>
                </div>
                <div class="deleteProperty-btn" @click="handleDeleteInfo('invoice')">
                  <img src="@/assets/fapiao/icon7.png" alt="" style="margin-left: 7px" />
                  <span style="font-size: 16px; margin-left: 10%">删除属性</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="btn">
          <div class="confirm-btn" @click="submit">
            <el-icon style="margin-left: 15%"><Check /></el-icon>
            <span style="font-size: 16px; margin-left: 15%">确认</span>
          </div>
          <div class="cancel-btn" @click="submitClear">
            <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
            <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">取消</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 新增属性 -->
    <div class="add-dialog" v-if="add_dialogFormVisible">
      <div class="add-dialog-content">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/fapiao/icon8.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 18px">新增属性</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="add_dialogFormVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="add-content">
          <div class="add-input">
            <span>新增属性名称</span>
            <el-input v-model="addPropertyName" placeholder="请输入..." />
          </div>
        </div>
        <div class="btn">
          <div class="confirm-btn" @click="handleConfirmAddProperty">
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
    <!-- 删除属性 -->
    <div class="delete-dialog" v-if="delete_dialogFormVisible">
      <div class="delete-dialog-content">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/fapiao/icon9.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 18px">删除属性</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="delete_dialogFormVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="delete-content">
          <div v-if="deletePropertyType === 'buyer'" class="propertyContent">
            <div v-for="(field, index) in buyer_info_fields" :key="index" class="form-item">
              <el-checkbox v-model="field.checked" style="margin-right: 10px"></el-checkbox>
              <span>{{ field.label }}</span>
            </div>
          </div>
          <div v-else-if="deletePropertyType === 'gongsi'" class="propertyContent">
            <div v-for="(field, index) in gongsi_info_fields" :key="index" class="form-item">
              <el-checkbox v-model="field.checked" style="margin-right: 10px"></el-checkbox>
              <span>{{ field.label }}</span>
            </div>
          </div>
          <div v-else-if="deletePropertyType === 'invoice'" class="propertyContent">
            <div v-for="(field, index) in invoice_content_fields" :key="index" class="form-item">
              <el-checkbox v-model="field.checked" style="margin-right: 10px"></el-checkbox>
              <span>{{ field.label }}</span>
            </div>
          </div>
        </div>
        <div class="btn">
          <div class="confirm-btn" @click="handleConfirmDeleteProperty">
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
        userName: "",
        userAccount: "",
        deviceNumber: "",
        startDate: "",
        endDate: "",
        pageNo: 1,
        pageSize: 50,
      },
      fapiaoData: [],
      multipleSelection: [],

      total: null,

      // 每列实际宽度
      selectionWidth: 0,
      idWidth: 0,
      yonghuhaoWidth: 0,
      nameWidth: 0,
      biaohaoWidth: 0,
      jiaoyitimeWidth: 0,
      jiaoyitypeWidth: 0,
      jiaoyijineWidth: 0,
      fapiaostateWidth: 0,
      // 父容器元素
      parentContainer: null,
      // ResizeObserver 实例
      resizeObserver: null,

      //控制弹窗是否显示
      invoiceDialogVisible: false,
      add_dialogFormVisible: false,
      delete_dialogFormVisible: false,

      addPropertyName: "",
      addPropertyType: "", //用于记录目前新增按钮所属于的区域是哪一个
      deletePropertyType: "", //用于记录目前删除按钮所属于的区域是哪一个

      // 购买方信息所有表单字段，包括静态字段和动态新增字段
      buyer_info_fields: [
        { label: "单位名称", key: "danweiname", value: "", checked: false },
        { label: "纳税人识别号", key: "nashuirenshibiehao", value: "", checked: false },
        { label: "地址", key: "address", value: "", checked: false },
        { label: "电话", key: "phone", value: "", checked: false },
        { label: "开户银行", key: "kaihuhang", value: "", checked: false },
        { label: "银行账号", key: "yinhangzhanghao", value: "", checked: false },
      ],
      // 购买方信息所有表单字段，包括静态字段和动态新增字段
      gongsi_info_fields: [
        { label: "单位名称", key: "danweiname", value: "" },
        { label: "纳税人识别号", key: "nashuirenshibiehao", value: "" },
        { label: "地址", key: "address", value: "" },
        { label: "电话", key: "phone", value: "" },
        { label: "开户银行", key: "kaihuhang", value: "" },
        { label: "银行账号", key: "yinhangzhanghao", value: "" },
      ],
      // 购买方信息所有表单字段，包括静态字段和动态新增字段
      invoice_content_fields: [
        { label: "商品或服务名称", key: "shangpin", value: "" },
        { label: "数量", key: "count", value: "" },
        { label: "单价", key: "danjia", value: "" },
        { label: "金额", key: "jine", value: "" },
        { label: "税率", key: "shuilv", value: "" },
        { label: "税额", key: "shuie", value: "" },
      ],
    };
  },
  watch: {
    "params.startDate": {
      handler(newVal) {
        this.validateTimeRange();
      },
      immediate: true,
    },
    "params.endDate": {
      handler(newVal) {
        this.validateTimeRange();
      },
      immediate: true,
    },
    "params.pageNo": {
      handler() {
        this.getInvoiceData();
      },
    },
  },
  computed: {
    // 每列的百分比宽度
    columnPercentages() {
      // return {
      //   selection: 5,
      //   id: 5,
      //   yonghuhao: 10,
      //   name: 10,
      //   biaohao: 18,
      //   jiaoyitime: 18,
      //   jiaoyitype: 12,
      //   jiaoyijine: 10,
      //   fapiaostate: 10,
      // };
      return {
        selection: 7,
        id: 7,
        yonghuhao: 12,
        name: 12,
        jiaoyitime: 20,
        jiaoyitype: 14,
        jiaoyijine: 14,
        fapiaostate: 12,
      };
    },
  },
  mounted() {
    // 获取父容器元素
    this.parentContainer = document.querySelector(".fapiao-table");
    // 初始化列宽
    this.calculateColumnWidths();

    // 创建 ResizeObserver 实例并监听父容器宽度变化
    this.resizeObserver = new ResizeObserver(this.calculateColumnWidths);
    if (this.parentContainer) {
      this.resizeObserver.observe(this.parentContainer);
    }

    //获取发票的数据
    this.getInvoiceData();
    // 从 localStorage 中读取数据
    const buyer_info_fields = localStorage.getItem("buyer_info_fields");
    if (buyer_info_fields) {
      this.buyer_info_fields = JSON.parse(buyer_info_fields);
    }
    const gongsi_info_fields = localStorage.getItem("gongsi_info_fields");
    if (gongsi_info_fields) {
      this.gongsi_info_fields = JSON.parse(gongsi_info_fields);
    }
    const invoice_content_fields = localStorage.getItem("invoice_content_fields");
    if (invoice_content_fields) {
      this.invoice_content_fields = JSON.parse(invoice_content_fields);
    }
  },
  beforeUnmount() {
    // 组件卸载时取消监听
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  },
  methods: {
    validateTimeRange() {
      const startTime = new Date(this.params.startDate);
      const endTime = new Date(this.params.endDate);

      if (startTime && endTime && startTime > endTime) {
        this.params.startDate = this.params.endDate;
      }
    },
    selectable() {
      return true; // 目前允许所有行选择，你可以加上你的业务逻辑
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleInvoice() {
      if (this.multipleSelection && this.multipleSelection.length === 1 && this.multipleSelection[0].status != "已开票") {
        this.invoiceDialogVisible = true;
        this.buyer_info_fields.forEach((item) => {
          item.value = "";
        });
        this.gongsi_info_fields.forEach((item) => {
          item.value = "";
        });
        this.invoice_content_fields.forEach((item) => {
          item.value = "";
        });
      } else if (!this.multipleSelection || this.multipleSelection.length === 0) {
        ElMessage.error("请选择未开票的数据");
      } else if (this.multipleSelection.length > 1) {
        ElMessage.error("开票仅支持单选，请只选择一条记录");
      } else {
        ElMessage.error("请选择未开票的数据");
      }
    },
    // 计算列宽的函数
    calculateColumnWidths() {
      if (this.parentContainer) {
        const parentWidth = this.parentContainer.offsetWidth;
        this.selectionWidth = (this.columnPercentages.selection / 100) * parentWidth;
        this.idWidth = (this.columnPercentages.id / 100) * parentWidth;
        this.yonghuhaoWidth = (this.columnPercentages.yonghuhao / 100) * parentWidth;
        this.nameWidth = (this.columnPercentages.name / 100) * parentWidth;
        this.biaohaoWidth = (this.columnPercentages.biaohao / 100) * parentWidth;
        this.jiaoyitimeWidth = (this.columnPercentages.jiaoyitime / 100) * parentWidth;
        this.jiaoyitypeWidth = (this.columnPercentages.jiaoyitype / 100) * parentWidth;
        this.jiaoyijineWidth = (this.columnPercentages.jiaoyijine / 100) * parentWidth;
        this.fapiaostateWidth = (this.columnPercentages.fapiaostate / 100) * parentWidth;
      }
    },
    // 设置当前正在编辑的区域
    handleAddInfo(type) {
      this.addPropertyType = type; // 记录当前区域类型
      this.add_dialogFormVisible = true; // 打开新增属性弹框
    },
    // 确认新增属性
    handleConfirmAddProperty() {
      // 根据 addPropertyType 判断调用哪个函数
      if (this.addPropertyType === "buyer") {
        this.handleBuyerInfoConfirmAddProperty();
      } else if (this.addPropertyType === "gongsi") {
        this.handleGongsiInfoConfirmAddProperty();
      } else if (this.addPropertyType === "invoice") {
        this.handleInvoiceContentConfirmAddProperty();
      }
    },
    // 购买方信息新增动态属性
    handleBuyerInfoConfirmAddProperty() {
      this.buyer_info_fields.push({
        label: this.addPropertyName,
        key: "custom" + (this.buyer_info_fields.length + 1), // 动态生成唯一 key
        value: "", // 默认值为空
      });
      this.addPropertyName = "";
      this.add_dialogFormVisible = false;
      this.addPropertyType = "";
      localStorage.setItem("buyer_info_fields", JSON.stringify(this.buyer_info_fields));
    },
    // 公司方信息新增动态属性
    handleGongsiInfoConfirmAddProperty() {
      this.gongsi_info_fields.push({
        label: this.addPropertyName,
        key: "custom" + (this.gongsi_info_fields.length + 1), // 动态生成唯一 key
        value: "", // 默认值为空
      });
      this.addPropertyName = "";
      this.add_dialogFormVisible = false;
      this.addPropertyType = "";
      localStorage.setItem("gongsi_info_fields", JSON.stringify(this.gongsi_info_fields));
    },
    // 发票内容信息新增动态属性
    handleInvoiceContentConfirmAddProperty() {
      this.invoice_content_fields.push({
        label: this.addPropertyName,
        key: "custom" + (this.invoice_content_fields.length + 1), // 动态生成唯一 key
        value: "", // 默认值为空
      });
      this.addPropertyName = "";
      this.add_dialogFormVisible = false;
      this.addPropertyType = "";
      localStorage.setItem("invoice_content_fields", JSON.stringify(this.invoice_content_fields));
    },
    handleDeleteInfo(type) {
      this.deletePropertyType = type; // 记录当前区域类型
      this.delete_dialogFormVisible = true;
    },
    handleConfirmDeleteProperty() {
      // 根据 deletePropertyType 判断调用哪个函数
      if (this.deletePropertyType === "buyer") {
        this.handleBuyerInfoDeleteConfirmAddProperty();
      } else if (this.deletePropertyType === "gongsi") {
        this.handleGongsiInfoDeleteConfirmAddProperty();
      } else if (this.deletePropertyType === "invoice") {
        this.handleInvoiceContentDeleteConfirmAddProperty();
      }
    },
    handleBuyerInfoDeleteConfirmAddProperty() {
      this.buyer_info_fields = this.buyer_info_fields.filter((field) => !field.checked);
      this.delete_dialogFormVisible = false;
      this.deletePropertyType = "";
      localStorage.setItem("buyer_info_fields", JSON.stringify(this.buyer_info_fields));
    },
    handleGongsiInfoDeleteConfirmAddProperty() {
      this.gongsi_info_fields = this.gongsi_info_fields.filter((field) => !field.checked);
      this.delete_dialogFormVisible = false;
      this.deletePropertyType = "";
      localStorage.setItem("gongsi_info_fields", JSON.stringify(this.gongsi_info_fields));
    },
    handleInvoiceContentDeleteConfirmAddProperty() {
      this.invoice_content_fields = this.invoice_content_fields.filter((field) => !field.checked);
      this.delete_dialogFormVisible = false;
      this.deletePropertyType = "";
      localStorage.setItem("invoice_content_fields", JSON.stringify(this.invoice_content_fields));
    },
    filterNonEmptyParams(params) {
      const filteredParams = {};
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          const value = params[key];
          if (value !== "") {
            if (key === "startDate" || key === "endDate") {
              // 如果是 startDate 或 endDate 且非空，拼接时间
              filteredParams[key] = `${value} 00:00:00`;
            } else {
              filteredParams[key] = value;
            }
          }
        }
      }
      return filteredParams;
    },
    //查询发票数据
    getInvoiceData() {
      let params = this.filterNonEmptyParams(this.params);
      service
        .post("/queryInvoice", params)
        .then((response) => {
          if (response.code === 200) {
            this.fapiaoData = response.data.records;
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
      service
        .post("/queryInvoice", params)
        .then((response) => {
          if (response.code === 200) {
            this.fapiaoData = response.data.records;
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
    clear() {
      this.params.userName = "";
      this.params.userAccount = "";
      this.params.deviceNumber = "";
      this.params.startDate = "";
      this.params.endDate = "";
      this.params.pageNo = 1;
      this.getInvoiceData();
    },
    submitClear() {
      this.invoiceDialogVisible = false;
      this.buyer_info_fields.forEach((item) => {
        item.value = "";
      });
      this.gongsi_info_fields.forEach((item) => {
        item.value = "";
      });
      this.invoice_content_fields.forEach((item) => {
        item.value = "";
      });
    },
    submit() {
      let params = {
        invoiceId: "",
        buyerInfo: {
          property: [],
          value: [],
        },
        drawerInfo: {
          property: [],
          value: [],
        },
        invoiceInfo: {
          property: [],
          value: [],
        },
      };
      params.invoiceId = this.multipleSelection[0].invoicId;
      let buyer_info_fields = this.buyer_info_fields.filter((field) => field.value !== "");
      let gongsi_info_fields = this.gongsi_info_fields.filter((field) => field.value !== "");
      let invoice_content_fields = this.invoice_content_fields.filter((field) => field.value !== "");
      params.buyerInfo.property = buyer_info_fields.map((item) => {
        return item.label;
      });
      params.buyerInfo.value = buyer_info_fields.map((item) => {
        return item.value;
      });
      params.drawerInfo.property = gongsi_info_fields.map((item) => {
        return item.label;
      });
      params.drawerInfo.value = gongsi_info_fields.map((item) => {
        return item.label;
      });
      params.invoiceInfo.property = invoice_content_fields.map((item) => {
        return item.label;
      });
      params.invoiceInfo.value = invoice_content_fields.map((item) => {
        return item.value;
      });
      console.log(params);
      service
        .post("/updateInvoice", params)
        .then((response) => {
          if (response.code === 200) {
            this.invoiceDialogVisible = false;
            this.getInvoiceData();
            ElMessage.success("开票成功");
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
        this.getInvoiceData();
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "未知错误";
        ElMessage.error("导入失败: " + errorMessage);
        console.error("上传失败:", error);
      }
    },
    exportExcel() {
      // 调用后端接口
      axios({
        url: "/exportInvoiceReport", // 后端接口地址
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
          link.download = "发票数据列表.xlsx"; // 设置下载文件名
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

.fapiao-container {
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
  justify-content: flex-start;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 20%;
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
  margin-left: 120px;
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

.fapiao-info {
  width: 100%;
  height: calc(100% - 135px);
  margin-bottom: 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
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

.fapiao-table {
  width: 100%;
  height: calc(98% - 110px);
  display: flex;
  justify-content: center;
  align-items: center;
}
.page-box {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.page-box {
  position: absolute;
  bottom: 0;
  height: 65px;
}

/* 开票弹出框 */
.invoice-dialog,
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

.delete-dialog {
  z-index: 201;
}

.invoice-dialog-content,
.add-dialog-content {
  width: 80%;
  /* max-height: 600px; */
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 10%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.invoice-dialog-content {
  max-height: 70vh;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.add-dialog-content {
  height: 270px;
  top: 50%;
  width: 40%;
  margin-top: -135px;
}

.delete-dialog-content {
  width: 40%;
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

.invoice-form {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  /* height: 100%; */
  overflow-y: auto;
}

.invoice-content {
  width: 94%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 15px;
  margin-bottom: 5px;
}

.invoice-item {
  width: 96%;
  display: flex;
  flex-direction: space-between;
  align-items: center;
  padding: 1%;
}

.invoice-item-input {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.invoice-item-content {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.content {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  margin-right: 1%;
}

.content > div {
  width: 30%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.invoice-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 32.4%;
  height: 80px;
  margin-right: 2%;
}

.invoice-input > span {
  font-size: 14px;
  margin-bottom: 5px;
  color: #747374;
}

.invoice-input > .el-input {
  height: 35px;
  width: 100%;
}

.invoice-btn {
  width: 25%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.addProperty-btn,
.deleteProperty-btn {
  width: 110px;
  height: 35px;
  cursor: pointer;
  border-radius: 5px;
  display: flex;
  align-items: center;
}

.addProperty-btn {
  background-color: #edf8f2;
  color: #63c391;
  border: 1px solid #5ac08c;
  margin-right: 20px;
}

.deleteProperty-btn {
  background-color: #feeae9;
  color: #f23628;
  border: 1px solid #f68078;
}

.add-content {
  border: 1px solid #fff;
  background-color: #fff;
  border-radius: 5px;
  width: 94%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.add-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 50%;
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

.delete-content {
  border: 1px solid #fff;
  background-color: #fff;
  border-radius: 5px;
  width: 94%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.propertyContent {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  margin-right: 1%;
}

.form-item {
  width: 30%;
  height: 42px;
  display: flex;
  flex-direction: row !important;
  justify-content: flex-start;
  align-items: center;
}

/* 给每一行的第一个元素增加左边距 */
.form-item:nth-child(3n + 1) {
  margin-left: 10%; /* 左边距 */
}

.form-item > span {
  font-size: 14px;
  color: #747374;
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

.btn-single-only-disabled {
  opacity: 0.5;
  cursor: not-allowed !important;
  pointer-events: none;
}
</style>
