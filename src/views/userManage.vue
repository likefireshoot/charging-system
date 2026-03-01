<template>
  <div class="user-container">
    <div class="serach-box">
      <div class="search-input" v-if="companyId === 1">
        <span>所属水厂</span>
        <el-select v-model="param.company" placeholder="请选择所属水厂">
          <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </div>
      <!-- <div class="search-input">
        <span>IMEI号</span>
        <el-input v-model="param.imei" placeholder="请输入..." />
      </div> -->
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
      <div class="search-input">
        <span>水表类型</span>
        <el-select v-model="param.meterType" placeholder="请选择水表类型">
          <el-option v-for="item in shuibiao_list" :key="item.id" :value="item.label"></el-option>
        </el-select>
      </div>

      <div class="buttons">
        <div class="sercah-btn" @click="search">
          <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: 12px" />
          <span style="font-size: 16px; margin-left: 15%">搜索</span>
        </div>
        <div class="clear-btn" @click="clear">
          <img src="@/assets/yonghu/icon4.png" alt="" style="margin-left: 12px" />
          <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">清空</span>
        </div>
      </div>
    </div>
    <div class="user-info">
      <div class="command-box">
        <!-- <div class="add-btn" style="margin-left: 10px" @click="add_dialogFormVisible = true">
          <img src="@/assets/yonghu/icon13.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 8px; color: #5a5a5a">新增</span>
        </div> -->
        <div class="delete-btn" style="margin-left: 5px" @click="delete_btn_click"
          v-if="staffPermissionIds.includes(6)">
          <img src="@/assets/yonghu/icon4.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 8px; color: #5a5a5a">删除</span>
        </div>
        <div class="command-btn" style="margin-left: 10px; width: 110px" :class="{ 'btn-single-only-disabled': multipleSelection.length !== 1 }" @click="multipleSelection.length === 1 && handleCommand()">
          <img src="@/assets/yonghu/icon5.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 8px; color: #5a5a5a">命令下发</span>
        </div>
        <div class="command-btn" style="margin-left: 5px; width: 110px" @click="valveOpen_dialogFormVisible = true"
          v-if="staffPermissionIds.includes(7)">
          <img src="@/assets/yonghu/icon18.png" alt="" style="margin-left: 8px; margin-top: 3px" />
          <span style="font-size: 16px; margin-left: 8px; color: #5a5a5a">开阀控制</span>
        </div>
        <div class="command-btn" style="margin-left: 5px; width: 110px" @click="valve_dialogFormVisible = true"
          v-if="staffPermissionIds.includes(8)">
          <img src="@/assets/yonghu/icon17.png" alt="" style="margin-left: 8px; margin-top: 3px" />
          <span style="font-size: 16px; margin-left: 8px; color: #5a5a5a">关阀控制</span>
        </div>
        <div class="recharge-btn" style="margin-left: 5px; width: 110px" :class="{ 'btn-single-only-disabled': multipleSelection.length !== 1 }" @click="multipleSelection.length === 1 && change_balance_btn_click()"
          v-if="staffPermissionIds.includes(9)">
          <img src="@/assets/yonghu/icon20.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 8px; color: #5a5a5a">余额调整</span>
        </div>
        <div class="recharge-btn" style="margin-left: 5px" :class="{ 'btn-single-only-disabled': multipleSelection.length !== 1 }" @click="multipleSelection.length === 1 && recharge_btn_click()"
          v-if="staffPermissionIds.includes(10)">
          <img src="@/assets/yonghu/icon6.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 8px; color: #5a5a5a">充值</span>
        </div>
        <div class="recharge-record-btn" style="margin-left: 5px; width: 110px" @click="recharge_record_btn_click"
          v-if="staffPermissionIds.includes(11)">
          <img src="@/assets/yonghu/icon7.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 8px; color: #5a5a5a">充值记录</span>
        </div>
        <div class="water-meter-btn" style="margin-left: 5px" :class="{ 'btn-single-only-disabled': multipleSelection.length !== 1 }" @click="multipleSelection.length === 1 && change_btn_click()"
          v-if="staffPermissionIds.includes(13)">
          <img src="@/assets/yonghu/icon8.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 8px; color: #5a5a5a">换表</span>
        </div>
        <div class="water-meter-record-btn" style="margin-left: 5px; width: 110px" @click="change_record_btn_click"
          v-if="staffPermissionIds.includes(14)">
          <img src="@/assets/yonghu/icon9.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 16px; margin-left: 8px; color: #5a5a5a">换表记录</span>
        </div>
        <!-- <div class="export-out-btn" style="margin-left: 5px; width: 110px" @click="download">
          <img src="@/assets/yonghu/icon1.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">模板下载</span>
        </div>
        <div class="export-in-btn" style="margin-left: 5px" @click="triggerFileInput">
          <img src="@/assets/yonghu/icon1.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 5px; color: #5a5a5a">导入</span>
          <input ref="fileInput" type="file" accept=".xls,.xlsx" style="display: none" @change="exportIn" />
        </div> -->
        <div class="export-out-btn" style="margin-left: 5px" @click="exportExcel">
          <img src="@/assets/yonghu/icon2.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">导出</span>
        </div>
        <div class="export-out-btn" style="margin-left: 5px; width: 155px" @click="common_meter_template_click">
          <img src="@/assets/yonghu/icon1.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">普表用水量模板</span>
        </div>
        <div class="export-in-btn" style="margin-left: 5px; width: 150px" @click="triggerCommonMeterImport">
          <img src="@/assets/yonghu/icon1.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 5px; color: #5a5a5a">普表用水量导入</span>
          <input ref="commonMeterInput" type="file" accept=".xls,.xlsx" style="display: none"
            @change="common_meter_click" />
        </div>
        <div class="export-in-btn" style="margin-left: 5px; width: 150px" @click="multi_edit_meter_price">
          <img src="@/assets/jiage/icon3.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 5px; color: #5a5a5a">批量修改水价</span>
        </div>

        <div class="reflush" style="margin-left: 5px" @click="reflush">
          <img src="@/assets/yonghu/icon15.png" alt="" />
        </div>
      </div>
      <div class="user-list">
        <div class="quyu-box">
          <el-input v-model="filterText" placeholder="请输入关键字检索" style="height: 32px; margin-bottom: 10px" />
          <el-tree ref="treeRef" node-key="id" :data="quyu_data" :props="defaultProps" default-expand-all
            :filter-node-method="filterNode" @node-click="handleNodeClick" />
        </div>
        <div class="user-table">
          <el-table ref="multipleTableRef" :data="yonghuData" row-key="imei"
            style="width: auto; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto" border
            :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }" @selection-change="handleSelectionChange"
            id="yonghu-table">
            <el-table-column type="selection" :selectable="selectable" min-width="40" align="center" fixed="left" />
            <!-- <el-table-column label="序号" width="160" align="center" fixed="left" #default="scope">
              {{ scope.$index + 1 + (currentPage - 1) * pageSize }}
            </el-table-column> -->
            <el-table-column property="userId" label="用户号" min-width="50" align="center" fixed="left" />
            <el-table-column label="用户名称" min-width="70" align="center">
              <template #default="scope">
                <span @click="handleUserInfo(scope.row)"
                  style="color: #46b97e; display: block; width: 100%; text-align: center">{{ scope.row.userName
                  }}</span>
              </template>
            </el-table-column>
            <el-table-column property="meterCode" label="表号" min-width="100" align="center" />
            <el-table-column label="余额/元" min-width="70" align="center">
              <template #default="scope">
                <span @click="handleYue(scope.row)"
                  style="color: #46b97e; display: block; width: 100%; text-align: center">{{ scope.row.balance }}</span>
              </template></el-table-column>
            <el-table-column property="newReading" label="水表读数/吨" min-width="70" align="center" />
            <el-table-column property="valveStatus" label="阀门状态" min-width="70" align="center" />
            <el-table-column property="battery" label="电池电量" min-width="70" align="center" />
            <el-table-column label="抄表时间" min-width="100" align="center">
              <template #header>
                <div style="display: flex; align-items: center; justify-content: center">
                  <span>抄表时间</span>
                  <div style="display: flex; flex-direction: column; margin-left: 10px; border: none">
                    <div :class="['asc-icon', { active: sortOrder === 'asc' }]"
                      style="cursor: pointer; width: 12px; height: 12px; border: none" @click="ascClick" />
                    <div :class="['desc-icon', { active: sortOrder === 'desc' }]"
                      style="cursor: pointer; width: 12px; height: 12px; border: none" @click="descClick" />
                  </div>
                </div>
              </template>
              <template #default="scope">
                <span @click="handleChaoBiaoTime(scope.row)"
                  style="color: #46b97e; display: block; width: 100%; text-align: center">{{ scope.row.updateTime
                  }}</span>
              </template>
            </el-table-column>
            <!-- <el-table-column property="imei" label="IMEI号" width="280" align="center" /> -->
            <el-table-column property="meterType" label="水表类型" min-width="70" align="center" />
            <el-table-column property="priceName" label="价格类型" min-width="100" align="center" />
            <el-table-column property="smsConfigName" label="短信配置" min-width="70" align="center"></el-table-column>

            <el-table-column property="userAddr" label="用户地址" min-width="100" align="center" />
            <!-- <el-table-column property="companyName" label="所属水厂" width="280" align="center" /> -->
            <el-table-column property="regionName" label="所属区域" min-width="70" align="center" />
            <el-table-column property="phone" label="联系电话" min-width="100" align="center" />
            <!-- <el-table-column property="approver1" label="开户审批人1" width="180" align="center" />
            <el-table-column property="approver2" label="开户审批人2" width="180" align="center" />
            <el-table-column property="approver3" label="开户审批人3" width="180" align="center" /> -->
          </el-table>
        </div>
      </div>
      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 15]"
            layout="total, prev, pager, next, jumper" :total="total" />
        </div>
      </div>
    </div>

    <!-- 点击用户名称弹出框 -->
    <userInfoVue v-if="user_info_dialogFormVisible" :user_info_dialogFormVisible="user_info_dialogFormVisible"
      :quyu_data="quyu_data" :data="multipleSelection[0]" @close="closeUserInfoDialog"></userInfoVue>

    <!-- 抄表记录弹出框 -->
    <chabiaoRecord v-if="chaobiao_dialogFormVisible" :chaobiao_dialogFormVisible="chaobiao_dialogFormVisible"
      :data="multipleSelection[0]" @close="chaobiao_dialogFormVisible = false"></chabiaoRecord>

    <!-- 交易记录弹出框 -->
    <transactionRecord v-if="transaction_dialogFormVisible"
      :transaction_dialogFormVisible="transaction_dialogFormVisible" :data="multipleSelection[0]"
      @close="closeTransaction"></transactionRecord>

    <!-- 新增按钮弹出框 -->
    <addVue v-if="add_dialogFormVisible" :add_dialogFormVisible="add_dialogFormVisible" :quyu_data="quyu_data"
      @close="closeAddDialog"></addVue>

    <!-- 删除按钮弹出框 -->
    <deleteVue v-if="delete_dialogFormVisible" :delete_dialogFormVisible="delete_dialogFormVisible"
      :data="multipleSelection" @close="closeDeleteDialog"></deleteVue>

    <!-- 开阀控制弹出框 -->
    <valueOpenVue v-if="valveOpen_dialogFormVisible" :valveOpen_dialogFormVisible="valveOpen_dialogFormVisible"
      :quyu_data="quyu_data" @close="closeValveOpenDialog"></valueOpenVue>

    <!-- 关阀控制弹出框 -->
    <valveVue v-if="valve_dialogFormVisible" :valve_dialogFormVisible="valve_dialogFormVisible" :quyu_data="quyu_data"
      @close="closeValveDialog"></valveVue>

    <!-- 换表弹出框 -->
    <changeVue v-if="change_dialogFormVisible" :change_dialogFormVisible="change_dialogFormVisible"
      :data="multipleSelection[0]" @close="closeChangeDialog"></changeVue>

    <!-- 换表记录弹出框 -->
    <changeRecord v-if="change_record_dialogFormVisible"
      :change_record_dialogFormVisible="change_record_dialogFormVisible" :quyu_data="quyu_data"
      :data="multipleSelection[0]" @close="closeChangeRecordDialog"></changeRecord>

    <!-- 余额调整弹出框 -->
    <changeBalanceVue v-if="changeBalance_dialogFormVisible"
      :changeBalance_dialogFormVisible="changeBalance_dialogFormVisible" :data="multipleSelection[0]"
      @close="closeChangeBalanceDialog"></changeBalanceVue>

    <!-- 充值弹出框 -->
    <rechargeVue v-if="recharge_dialogFormVisible" :recharge_dialogFormVisible="recharge_dialogFormVisible"
      :data="multipleSelection[0]" @close="closeRechargeDialog"></rechargeVue>

    <!-- 充值记录弹出框 -->
    <rechargeRecordVue v-if="recharge_record_dialogFormVisible"
      :recharge_record_dialogFormVisible="recharge_record_dialogFormVisible" :quyu_data="quyu_data"
      :data="multipleSelection[0]" @close="closeRechargeRecordDialog"></rechargeRecordVue>

    <!-- 命令下发弹出框-太阳能 -->
    <commandTaiYangNengVue v-if="command_dialogFormVisible_taiyangneng"
      :command_dialogFormVisible="command_dialogFormVisible_taiyangneng" :commandType="commandType"
      :data="multipleSelection[0]" @close="closeCommandDialog"></commandTaiYangNengVue>

    <!-- 命令下发弹出框-信驰 -->
    <commandXinchiVue v-if="command_dialogFormVisible_xinchi"
      :command_dialogFormVisible="command_dialogFormVisible_xinchi" :commandType="commandType"
      :data="multipleSelection[0]" @close="closeCommandDialog"></commandXinchiVue>

    <!-- 命令下发弹出框-旧信驰 -->
    <commandOldXinchi v-if="command_dialogFormVisible_old_xinchi"
      :command_dialogFormVisible="command_dialogFormVisible_old_xinchi" :commandType="commandType"
      :data="multipleSelection[0]" @close="closeCommandDialog"></commandOldXinchi>

    <!-- 命令下发弹出框-集万讯 -->
    <commandJiWanXun v-if="command_dialogFormVisible_jiwanxun"
      :command_dialogFormVisible="command_dialogFormVisible_jiwanxun" :commandType="commandType"
      :data="multipleSelection[0]" @close="closeCommandDialog"></commandJiWanXun>

    <!-- 命令下发弹出框-圣鑫 -->
    <commandShengXin v-if="command_dialogFormVisible_shengxin"
      :command_dialogFormVisible="command_dialogFormVisible_shengxin" :commandType="commandType"
      :data="multipleSelection[0]" @close="closeCommandDialog"></commandShengXin>

    <!-- 命令下发弹出框-卓正 -->
    <commandZhuoZheng v-if="command_dialogFormVisible_zhuozheng"
      :command_dialogFormVisible="command_dialogFormVisible_zhuozheng" :commandType="commandType"
      :data="multipleSelection[0]" @close="closeCommandDialog"></commandZhuoZheng>

    <!-- 命令下发弹出框-千宝通 -->
    <commandQianBaoTong v-if="command_dialogFormVisible_qianbaotong"
      :command_dialogFormVisible="command_dialogFormVisible_qianbaotong" :commandType="commandType"
      :data="multipleSelection[0]" @close="closeCommandDialog"></commandQianBaoTong>

    <!-- 批量修改用户水价 弹出框（样式与其他页面统一）-->
    <div class="add-dialog" v-if="priceDialogVisible">
      <div class="add-dialog-content">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/jiage/icon3.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 18px">批量修改用户水价</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="priceDialogVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="add-content">
          <div class="add-input" style="width: 100%">
            <span>水价类型</span>
            <el-select v-model="selectedPriceId" placeholder="请选择水价类型" style="width: 100%">
              <el-option v-for="item in price_list" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </div>
        </div>
        <div class="btn">
          <div class="confirm-btn" @click="confirm_edit_price">
            <el-icon style="margin-left: 15%"><Check /></el-icon>
            <span style="font-size: 16px; margin-left: 15%">确认</span>
          </div>
          <div class="cancel-btn" @click="priceDialogVisible = false">
            <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
            <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">取消</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { queryPriceMg } from "@/api/price/price";
import { multiEditUserBindMeterInfo } from "@/api/userMeterBind/userMeterBind";
import commandTaiYangNengVue from "@/components/userManage/command_taiyangneng.vue";
import commandXinchiVue from "@/components/userManage/command_xinchi.vue";
import commandQianBaoTong from "@/components/userManage/command_qianbaotong.vue";
import commandZhuoZheng from "@/components/userManage/command_zhuozheng.vue";
import commandJiWanXun from "@/components/userManage/command_jiwanxun.vue";
import commandShengXin from "@/components/userManage/command_shengxin.vue";
import commandOldXinchi from "@/components/userManage/command_old_xinchi.vue";
import rechargeVue from "@/components/userManage/recharge.vue";
import rechargeRecordVue from "@/components/userManage/rechargeRecord.vue";
import changeVue from "@/components/userManage/change.vue";
import addVue from "@/components/userManage/add.vue";
import deleteVue from "@/components/userManage/delete.vue";
import valveVue from "@/components/userManage/valve.vue";
import valueOpenVue from "@/components/userManage/valveOpen.vue";
import changeRecord from "@/components/userManage/changeRecord.vue";
import userInfoVue from "@/components/userManage/userInfo.vue";
import chabiaoRecord from "@/components/userManage/chaobiaoRecord.vue";
import transactionRecord from "@/components/userManage/transactionRecord.vue";
import changeBalanceVue from "@/components/userManage/changeBalance.vue";

import service from "@/api/request";
import { ElMessage } from "element-plus";
import { Check, Close } from "@element-plus/icons-vue";
import axios from "axios";

export default {
  components: {
    Check,
    Close,
    rechargeVue,
    rechargeRecordVue,
    changeVue,
    changeRecord,
    addVue,
    deleteVue,
    userInfoVue,
    chabiaoRecord,
    transactionRecord,
    valveVue,
    valueOpenVue,
    changeBalanceVue,
    commandTaiYangNengVue,
    commandXinchiVue,
    commandShengXin,
    commandZhuoZheng,
    commandQianBaoTong,
    commandJiWanXun,
    commandOldXinchi,
  },
  data() {
    return {
      param: {
        userName: "",
        userId: "",
        imei: "",
        meterCode: null,
        meterType: "", // 水表类型
        time: {
          type: "",
          accurateTime: "",
        },
        company: null, // 新增所属水厂参数
        companyId: null, // 所属水厂ID
        order: 0,
      },
      price_list: [],
      priceDialogVisible: false,
      selectedPriceId: null,

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

      sortOrder: null,

      //弹出框显示与否
      user_info_dialogFormVisible: false,
      chaobiao_dialogFormVisible: false,
      transaction_dialogFormVisible: false,
      add_dialogFormVisible: false,
      delete_dialogFormVisible: false,
      change_dialogFormVisible: false,
      change_record_dialogFormVisible: false,
      recharge_dialogFormVisible: false,
      recharge_record_dialogFormVisible: false,
      command_dialogFormVisible_taiyangneng: false,
      command_dialogFormVisible_xinchi: false,
      command_dialogFormVisible_qianbaotong: false,
      command_dialogFormVisible_zhuozheng: false,
      command_dialogFormVisible_jiwanxun: false,
      command_dialogFormVisible_shengxin: false,
      command_dialogFormVisible_old_xinchi: false,
      valve_dialogFormVisible: false,
      valveOpen_dialogFormVisible: false,
      changeBalance_dialogFormVisible: false,
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
    multi_edit_meter_price() {
      console.log(this.multipleSelection.length);
      if (!this.multipleSelection || this.multipleSelection.length === 0) {
        return ElMessage.warning("请先选择用户！");
      }

      // 有选择数据 → 加载水价 → 打开弹窗
      this.getPriceList();
      this.priceDialogVisible = true;
    },
    // 获取水价列表
    getPriceList() {
      let params = {
        pageNo: 1,
        pageSize: 1000,
        companyId: this.companyId,
      };

      queryPriceMg(params)
        .then((res) => {
          this.price_list = res.data.records.map((item) => ({
            id: item.priceId,
            label: item.priceName,
          }));
        })
        .catch(() => {
          ElMessage.error("获取价格类型失败");
        });
    },
    // 点击弹框中的确定按钮
    confirm_edit_price() {
      if (!this.selectedPriceId) {
        return ElMessage.warning("请选择水价类型！");
      }

      // 提取 userId 数组
      const imeis = this.multipleSelection.map((item) => item.imei);

      const params = {
        priceId: this.selectedPriceId,
        imeiList: imeis,
      };

      multiEditUserBindMeterInfo(params)
        .then((res) => {
          ElMessage.success("批量修改成功");
          this.priceDialogVisible = false;
          this.search();
          this.selectedPriceId = "";
        })
        .catch(() => {
          ElMessage.error("批量修改失败");
          this.selectedPriceId = "";
        });
    },
    triggerCommonMeterImport() {
      this.$refs.commonMeterInput.value = "";
      this.$refs.commonMeterInput.click();
    },
    common_meter_template_click() {
      //普通水表用水量导入模板
      let url = "/userManage/userCharge/importCommonMeterDataTemplate";
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
          link.download = "普表用水量导入.xlsx"; // 设置下载文件名
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
    async common_meter_click() {
      const fileInput = this.$refs.commonMeterInput;
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
        const response = await service.post("/userManage/userCharge/importCommonMeterData", formData, { responseType: "blob" });
        console.log(response);
        // 获取 Blob 对象
        const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

        if (blob.size === 0) {
          ElMessage.success("导入成功");
          fileInput.value = ""; // 清空文件输入框
          this.reflush();
          return;
        }

        ElMessage.warning("用户用水量导入成功，详细查看下载列表");

        // 创建一个链接元素
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob); // 创建 Blob URL
        link.download = "普表用水量导入详情列表.xlsx"; // 设置下载文件名
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
    filterNode(value, data) {
      if (!value) return true;
      return data.label.includes(value);
    },
    handleNodeClick(data) {
      this.quyu_selected = data;
      console.log(this.quyu_selected);
      let region = data.label;
      if (this.companyId === 1) {
        if (this.param.companyId) {
        } else {
          this.param.companyId = ""; // 如果没有选择水厂，则不传水厂ID
        }
      } else {
        this.param.companyId = this.companyId; // 所属水厂ID
      }
      const nonEmptyParams = this.filterNonEmptyParams({ ...this.param, region });
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
      // 拼接完整的 URL
      const url = `/userManage/userCharge/showUserMeters/${this.currentPage}${queryString}`;
      console.log(url);
      service
        .get(url, {
          headers: {
            Authorization: this.token,
          },
        })
        .then((response) => {
          if (response.code === 200) {
            this.yonghuData = response.data.userInfoData;
            this.yonghuData.forEach((item) => {
              item.updateTime = item.updateTime.replace("T", " ");
            });
            this.total = response.data.totalElements;
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
    handleUserInfo(row) {
      if (this.staffPermissionIds.includes(17)) {
        this.user_info_dialogFormVisible = true;
        this.multipleSelection[0] = row;
      }
    },
    handleChaoBiaoTime(row) {
      this.chaobiao_dialogFormVisible = true;
      this.multipleSelection[0] = row;
    },
    handleYue(row) {
      this.transaction_dialogFormVisible = true;
      this.multipleSelection[0] = row;
    },
    delete_btn_click() {
      if (this.multipleSelection.length > 0) {
        this.delete_dialogFormVisible = true;
      } else {
        ElMessage.warning("请选择要删除的数据");
      }
    },
    change_balance_btn_click() {
      if (this.multipleSelection.length > 0) {
        this.changeBalance_dialogFormVisible = true;
      } else {
        ElMessage.warning("请选择要调整余额的数据");
      }
    },
    recharge_btn_click() {
      if (this.multipleSelection.length > 0) {
        this.recharge_dialogFormVisible = true;
      } else {
        ElMessage.warning("请选择要充值的数据");
      }
    },
    recharge_record_btn_click() {
      this.recharge_record_dialogFormVisible = true;
    },
    change_btn_click() {
      if (this.multipleSelection.length > 0) {
        this.change_dialogFormVisible = true;
      } else {
        ElMessage.warning("请选择要换表的数据");
        return;
      }
    },
    change_record_btn_click() {
      this.change_record_dialogFormVisible = true;
    },
    async handleCommand() {
      // const ok = await this.fetchCommandType();
      // if (!ok) return;
      if (this.multipleSelection.length === 0) {
        ElMessage.warning("请选择要下发命令的数据");
        return;
      }
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
          this.command_dialogFormVisible_old_xinchi = true;
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
        default:
          ElMessage.error(this.commandType + " 为未知设备厂商，无法下发命令");
      }
    },
    closeCommandDialog() {
      this.command_dialogFormVisible_taiyangneng = false;
      this.command_dialogFormVisible_xinchi = false;
      this.command_dialogFormVisible_qianbaotong = false;
      this.command_dialogFormVisible_zhuozheng = false;
      this.command_dialogFormVisible_jiwanxun = false;
      this.command_dialogFormVisible_shengxin = false;
      this.command_dialogFormVisible_old_xinchi = false;
      this.multipleSelection = [];
      this.commandType = "";
      this.reflush();
    },
    closeUserInfoDialog() {
      this.user_info_dialogFormVisible = false;
      this.multipleSelection = [];
      this.reflush();
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
    closeValveDialog() {
      this.valve_dialogFormVisible = false;
      this.multipleSelection = [];
      this.reflush();
    },
    closeValveOpenDialog() {
      this.valveOpen_dialogFormVisible = false;
      this.multipleSelection = [];
      this.reflush();
    },
    closeChangeDialog() {
      this.change_dialogFormVisible = false;
      this.multipleSelection = [];
      this.reflush();
    },
    closeChangeRecordDialog() {
      this.change_record_dialogFormVisible = false;
      this.multipleSelection = [];
      this.reflush();
    },
    closeChangeBalanceDialog() {
      this.changeBalance_dialogFormVisible = false;
      this.multipleSelection = [];
      this.reflush();
    },
    closeRechargeDialog() {
      this.recharge_dialogFormVisible = false;
      this.multipleSelection = [];
      this.reflush();
    },
    closeRechargeRecordDialog() {
      this.recharge_record_dialogFormVisible = false;
      this.multipleSelection = [];
      this.reflush();
    },
    closeTransaction() {
      this.transaction_dialogFormVisible = false;
      this.multipleSelection = [];
      this.reflush();
    },
    ascClick() {
      this.sortOrder = "asc";
      this.param.order = 1; // 设置升序
      this.search();
    },
    descClick() {
      this.sortOrder = "desc";
      this.param.order = 0; // 设置降序
      this.search();
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
      if (this.companyId === 1) {
        if (this.param.companyId) {
        } else {
          this.param.companyId = ""; // 如果没有选择水厂，则不传水厂ID
        }
      } else {
        this.param.companyId = this.companyId; // 所属水厂ID
      }
      service
        .get(`/userManage/userCharge/showUserMeters/${this.currentPage}?companyId=${this.param.companyId}&order=0`, {
          headers: {
            Authorization: this.token,
          },
        })
        .then((response) => {
          if (response.code === 200) {
            this.yonghuData = response.data.userInfoData;
            this.yonghuData.forEach((item) => {
              item.updateTime = item.updateTime.replace("T", " ");
            });
            this.total = response.data.totalElements;
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
      this.clear(1);//不搜
      this.filterText = "";
      this.$refs.treeRef.setCurrentKey(null);
      this.quyu_selected = null;
      if (this.companyId === 1) {
        if (this.param.companyId) {
        } else {
          this.param.companyId = ""; // 如果没有选择水厂，则不传水厂ID
        }
      } else {
        this.param.companyId = this.companyId; // 所属水厂ID
      }
      service
        .get(`/userManage/userCharge/showUserMeters/1?companyId=${this.param.companyId}&order=0`, {
          headers: {
            Authorization: this.token,
          },
        })
        .then((response) => {
          this.yonghuData = response.data.userInfoData;
          this.yonghuData.forEach((item) => {
            item.updateTime = item.updateTime.replace("T", " ");
          });
          this.total = response.data.totalElements;
          this.currentPage = 1;
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
        imei: "",
        meterCode: null,
        meterType: "", // 水表类型
        time: {
          type: "",
          accurateTime: "",
        },
        company: null, // 新增所属水厂参数
        companyId: null, // 所属水厂ID
        order: 0,
      };
      this.sortOrder = null; // 清除排序状态
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
        nonEmptyParams.region = this.quyu_selected.label;
      }
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
        const url = `/userManage/userCharge/showUserMeters/${this.currentPage}${queryString}`;
        console.log(url);
        service
          .get(url, {
            headers: {
              Authorization: this.token,
            },
          })
          .then((response) => {
            if (response.code === 200) {
              console.log(response.data.userInfoData);
              this.yonghuData = response.data.userInfoData;
              this.yonghuData.forEach((item) => {
                item.updateTime = item.updateTime.replace("T", " ");
              });
              this.total = response.data.totalElements;
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
      } else {
        ElMessage.error("请输入搜索条件");
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
          link.download = "导入模板.xlsx"; // 设置下载文件名
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
        const response = await service.post("/userManage/userCharge/importUserMetersList", formData);
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
      let url = "";
      if (this.companyId === 1) {
        if (this.param.companyId) {
          url = `/userManage/userCharge/exportUserMeterBind?companyId=${this.param.companyId}`; // 所属水厂ID
        } else {
          url = `/userManage/userCharge/exportUserMeterBind`; // 所属水厂ID
        }
      } else {
        url = `/userManage/userCharge/exportUserMeterBind?companyId=${this.companyId}`; // 所属水厂ID
      }
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

          if (blob.size === 0) {
            ElMessage.warning("内容为空，无法下载");
            return;
          }

          // 创建一个链接元素
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob); // 创建 Blob URL
          link.download = "用户数据列表.xlsx"; // 设置下载文件名
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

.user-container {
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  min-width: 94%;
  height: 98%;
  padding: 0px 20px;
}

.serach-box,
.user-info {
  padding: 0px 10px;
  border: 1px solid #e9e9e9;
  border-radius: 5px;
  width: 99.3%;
  background-color: #fff;
}

/* 自定义el-dialog的遮罩层背景色 */
.el-overlay {
  background: rgba(0, 0, 0, 0.5) !important;
  /* 半透明黑色 */
}

/* 确保el-dialog弹出框本身不被覆盖 */
.el-dialog__wrapper {
  background: rgba(255, 255, 255, 0.9) !important;
  /* 半透明白色背景 */
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
  justify-content: center;
  /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 14%;
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

.buttons {
  display: flex;
  width: 240px;
  height: 100%;
  align-items: center;
  position: absolute;
  right: 20px;
}

.buttons>* {
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
  height: 80px;
  /* margin-top: 20px; */
  margin-bottom: 20px;
  position: absolute;
  top: 20px;
  flex-wrap: wrap;
  /* 允许换行 */
}

.command-box>* {
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

.user-list {
  width: 100%;
  height: calc(100% - 190px);
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

.quyu-box>* {
  width: 100%;
  margin-bottom: 5px;
}

.quyu-box>.el-tree {
  height: 100%;
  width: 100%;
  align-items: center;
}

.quyu-box>.el-input ::placeholder {
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

.btn-single-only-disabled {
  opacity: 0.5;
  cursor: not-allowed !important;
  pointer-events: none;
}

.add-dialog-content {
  width: 400px;
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
  padding-bottom: 20px;
}

.add-dialog-content .add-content {
  border: 1px solid #fff;
  background-color: #fff;
  border-radius: 5px;
  width: 90%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-top: 20px;
  padding: 15px 3%;
  flex-wrap: wrap;
}

.add-dialog-content .add-input {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.add-dialog-content .add-input > span {
  font-size: 15px;
  margin-bottom: 5px;
  color: #575556;
}

.add-dialog-content .add-input .el-select {
  width: 100%;
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
    >.el-tree-node__content {
      background-color: var(--el-tree-node-hover-bg-color);
      color: white;
    }
  }
}

.asc-icon {
  background-image: url("@/assets/yonghu/icon25.png");
  background-repeat: no-repeat;
  background-size: contain;
}

.asc-icon:hover {
  background-image: url("@/assets/yonghu/icon24.png");
  background-repeat: no-repeat;
  background-size: contain;
}

.asc-icon.active {
  background-image: url("@/assets/yonghu/icon24.png");
  background-repeat: no-repeat;
  background-size: contain;
}

.desc-icon {
  background-image: url("@/assets/yonghu/icon23.png");
  background-repeat: no-repeat;
  background-size: contain;
}

.desc-icon:hover {
  background-image: url("@/assets/yonghu/icon22.png");
  background-repeat: no-repeat;
  background-size: contain;
}

.desc-icon.active {
  background-image: url("@/assets/yonghu/icon22.png");
  background-repeat: no-repeat;
  background-size: contain;
}
</style>
