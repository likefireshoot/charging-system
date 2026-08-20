<template>
  <div class="user-container">
    <div class="serach-box">
      <template v-for="field in availableFilterFields" :key="field.key">
        <div class="search-input">
          <span>{{ field.label }}</span>
          <el-select
            v-if="field.type === 'select'"
            class="big-font-el-select"
            v-model="param[field.key]"
            :placeholder="field.placeholder || '请选择'"
            :clearable="field.clearable || false"
          >
            <el-option
              v-for="item in getFilterOptions(field.key)"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-input
            v-else
            v-model="param[field.key]"
            :type="field.inputType || 'text'"
            :placeholder="field.placeholder || '请输入...'"
          />
        </div>
      </template>

      <div class="buttons">
        <div class="sercah-btn" @click="search">
          <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: 10px" />
          <span style="font-size: 18px; margin-left: 10%">搜索</span>
        </div>
        <div class="clear-btn" @click="clear">
          <img src="@/assets/yonghu/icon4.png" alt="" style="margin-left: 10px" />
          <span style="font-size: 18px; margin-left: 10%; color: #5a5a5a">清空</span>
        </div>
      </div>
    </div>
    <div class="user-info">
      <div class="command-box">
        <div class="delete-btn"  @click="delete_btn_click"
          v-if="staffPermissionIds.includes(6)">
          <img src="@/assets/yonghu/icon4.png" alt="" />
          <span>删除</span>
        </div>
        <div class="command-btn"
             :class="{ 'btn-single-only-disabled': multipleSelection.length === 0 || hasPauseUserSelected }"
             @click="(multipleSelection.length > 0 && !hasPauseUserSelected) && openBatchPauseDialog()"
             v-if="staffPermissionIds.includes(63)">
          <img src="@/assets/menu/icon19.png" alt="" />
          <span>停户</span>
        </div>
        <div class="water-meter-record-btn" @click="pause_record_btn_click"
             v-if="staffPermissionIds.includes(64)">
          <img src="@/assets/menu/icon19.png" alt="" />
          <span>停户列表</span>
        </div>
        <div class="command-btn"
             :class="{ 'btn-single-only-disabled': multipleSelection.length === 0 }"
             @click="multipleSelection.length > 0 && openBatchCloseDialog()"
             v-if="staffPermissionIds.includes(65)">
          <img src="@/assets/menu/icon3.png" alt="" />
          <span>销户</span>
        </div>
        <div class="water-meter-record-btn" @click="close_record_btn_click"
             v-if="staffPermissionIds.includes(66)">
          <img src="@/assets/menu/icon3.png" alt="" />
          <span>销户列表</span>
        </div>
        <div class="command-btn" :class="{ 'btn-single-only-disabled': multipleSelection.length !== 1 || hasPauseUserSelected }" @click="(multipleSelection.length === 1 && !hasPauseUserSelected) && handleCommand()"
          v-if="staffPermissionIds.includes(89)">
          <img src="@/assets/yonghu/icon5.png" alt="" />
          <span>命令下发</span>
        </div>
        <div class="recharge-btn" :class="{ 'btn-single-only-disabled': multipleSelection.length !== 1 || hasPauseUserSelected }" @click="(multipleSelection.length === 1 && !hasPauseUserSelected) && change_balance_btn_click()"
          v-if="staffPermissionIds.includes(9)">
          <img src="@/assets/yonghu/icon20.png" alt="" />
          <span>余额调整</span>
        </div>
        <div class="recharge-btn" :class="{ 'btn-single-only-disabled': multipleSelection.length !== 1 || hasPauseUserSelected }" @click="(multipleSelection.length === 1 && !hasPauseUserSelected) && change_tonnage_btn_click()">
          <img src="@/assets/jiage/icon3.png" alt="" />
          <span>吨数调整</span>
        </div>
        <div class="recharge-btn" :class="{ 'btn-single-only-disabled': multipleSelection.length !== 1 || hasPauseUserSelected }" @click="(multipleSelection.length === 1 && !hasPauseUserSelected) && recharge_btn_click()"
          v-if="staffPermissionIds.includes(10)">
          <img src="@/assets/yonghu/icon6.png" alt="" />
          <span>充值</span>
        </div>
        <div class="recharge-record-btn" @click="recharge_record_btn_click"
             v-if="staffPermissionIds.includes(11)">
          <img src="@/assets/yonghu/icon7.png" alt="" />
          <span>充值记录</span>
        </div>
        <div class="recharge-record-btn" @click="recharge_cancel_record_btn_click"
             v-if="staffPermissionIds.includes(69)">
          <img src="@/assets/yonghu/icon7.png" alt="" />
          <span>充值撤销记录</span>
        </div>
        <div class="water-meter-btn" :class="{ 'btn-single-only-disabled': multipleSelection.length !== 1 || hasPauseUserSelected }" @click="(multipleSelection.length === 1 && !hasPauseUserSelected) && change_btn_click()"
          v-if="staffPermissionIds.includes(13)">
          <img src="@/assets/yonghu/icon8.png" alt="" />
          <span>换表</span>
        </div>
        <div class="water-meter-record-btn" @click="change_record_btn_click"
          v-if="staffPermissionIds.includes(14)">
          <img src="@/assets/yonghu/icon9.png" alt="" />
          <span>换表记录</span>
        </div>
        <div class="export-in-btn" @click="multi_edit_meter_price"
          v-if="staffPermissionIds.includes(90)">
          <img src="@/assets/jiage/icon3.png" alt="" />
          <span>修改水价</span>
        </div>
        <div class="command-btn" @click="openAddRegionDialog"
             v-if="staffPermissionIds.includes(31)">
          <img src="@/assets/yuangong/icon6.png" alt="" />
          <span>新增区域</span>
        </div>
        <div class="command-btn" @click="openDeleteRegionDialog"
             v-if="staffPermissionIds.includes(32)">
          <img src="@/assets/yuangong/icon4.png" alt="" />
          <span>删除区域</span>
        </div>
        <div class="command-btn" @click="valveOpen_dialogFormVisible = true"
             v-if="staffPermissionIds.includes(7)">
          <img src="@/assets/yonghu/icon18.png" alt="" />
          <span>区域开阀设置</span>
        </div>
        <div class="command-btn" @click="valve_dialogFormVisible = true"
             v-if="staffPermissionIds.includes(8)">
          <img src="@/assets/yonghu/icon17.png" alt="" />
          <span>区域关阀设置</span>
        </div>
        <div class="water-meter-record-btn" @click="post_pay_list_btn_click"
             v-if="staffPermissionIds.includes(67)">
          <img src="@/assets/yonghu/icon7.png" alt="" />
          <span>欠费不关阀列表（后付费）</span>
        </div>
        <div class="water-meter-record-btn" @click="can_close_no_arrears_btn_click"
             v-if="staffPermissionIds.includes(68)">
          <img src="@/assets/yonghu/icon7.png" alt="" />
          <span>不欠费可关阀列表</span>
        </div>
        <!-- <div class="export-out-btn" @click="common_meter_template_click">
          <img src="@/assets/yonghu/icon1.png" alt="" />
          <span>普表用水量模板下载</span>
        </div>
        <div class="export-in-btn" @click="triggerCommonMeterImport">
          <img src="@/assets/yonghu/icon2.png" alt="" />
          <span>普表用水量信息导入</span>
          <input ref="commonMeterInput" type="file" accept=".xls,.xlsx" style="display: none"
            @change="common_meter_click" />
        </div> -->
        <div class="export-out-btn" @click="exportExcel">
          <img src="@/assets/yonghu/icon1.3.png" alt="" />
          <span>导出</span>
        </div>

        <div class="reflush" @click="reflush">
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
          <el-table ref="multipleTableRef" :data="yonghuData" row-key="imei" v-loading="isLoading"
            style="width: auto; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto" border
            :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }" @selection-change="handleSelectionChange"
            id="yonghu-table">
            <el-table-column type="selection" :selectable="selectable" min-width="35" align="center" fixed="left" />
            <el-table-column label="序号" min-width="80" align="center" fixed="left" #default="scope">
              {{ scope.$index + 1 + (currentPage - 1) * pageSize }}
            </el-table-column>
            <el-table-column property="userId" label="用户号" min-width="110" align="center" fixed="left">
              <template #header="scope">
                <div class="sortable-header" @click="toggleSort('userId')">
                  <span>{{ scope.column.label }}</span>
                  <div class="sort-icons">
                    <div :class="['asc-icon', { active: isSortActive('userId', 'asc') }]" />
                    <div :class="['desc-icon', { active: isSortActive('userId', 'desc') }]" />
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="用户名" min-width="90" align="center">
              <template #default="scope">
                <span @click="handleUserInfo(scope.row)"
                  style="color: #46b97e; display: block; width: 100%; text-align: center">{{ scope.row.userName
                  }}</span>
                <!-- 当isPause=1 显示暂停气泡 -->
                <span v-if="scope.row.isPause === 1" style="font-size: 12px;padding: 1px 8px; border-radius: 10px; line-height: 20px; white-space: nowrap;color: #b47500;background-color: #fff7cc;border: 1px solid #ffdd80;">
                暂停使用
                </span>
              </template>
            </el-table-column>
            <el-table-column property="meterCode" label="表号" min-width="90" align="center" />
            <el-table-column label="余额" min-width="105" align="center">
              <template #default="scope">
                <span @click="handleYue(scope.row)"
                  style="color: #46b97e; display: block; width: 100%; text-align: center">{{ scope.row.balance }}</span>
              </template></el-table-column>
            <el-table-column property="newReading" label="读数" min-width="110" align="center" />
            <el-table-column property="valveStatus" label="阀门" min-width="65" align="center" />
            <el-table-column property="battery" label="电量" min-width="65" align="center" />
            <el-table-column label="抄表" min-width="110" align="center">
              <template #header="scope">
                <div class="sortable-header" @click="toggleSort('time')">
                  <span>{{ scope.column.label }}</span>
                  <div class="sort-icons">
                    <div :class="['asc-icon', { active: isSortActive('time', 'asc') }]" />
                    <div :class="['desc-icon', { active: isSortActive('time', 'desc') }]" />
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
<!--            <el-table-column property="meterType" label="表类型" min-width="70" align="center" />-->
            <el-table-column property="meterVendor" label="品牌" min-width="75" align="center" />
            <el-table-column property="priceName" label="价格" min-width="90" align="center">
              <template #default="scope">
    <span
      v-if="scope.row.priceId"
      @click="showPriceDetail(scope.row)"
      style="color: #46b97e; cursor: pointer;display: inline-block;">
      {{ scope.row.priceName }}
    </span>
                <span v-else>{{ scope.row.priceName }}</span>
              </template>
            </el-table-column>
            <el-table-column property="smsConfigName" label="短信" min-width="95" align="center">
              <template #default="scope">
    <span
      v-if="scope.row.smsConfigId"
      @click="showSmsDetail(scope.row)"
      style="color: #46b97e; cursor: pointer;display: inline-block;">
      {{ scope.row.smsConfigName }}
    </span>
                <span v-else>{{ scope.row.smsConfigName }}</span>
              </template>
            </el-table-column>
             <el-table-column property="companyName" label="水厂" min-width="85" align="center" />
            <el-table-column property="userAddr" label="地址" min-width="95" align="center" />
            <el-table-column property="regionName" label="区域" min-width="85" align="center" />
            <el-table-column property="phone" label="电话" min-width="80" align="center" />
<!--            <el-table-column property="meterVendor" label="水表品牌" min-width="100" align="center" />-->
            <!-- <el-table-column property="approver1" label="开户审批人1" width="180" align="center" />
            <el-table-column property="approver2" label="开户审批人2" width="180" align="center" />
            <el-table-column property="approver3" label="开户审批人3" width="180" align="center" /> -->
          </el-table>
        </div>
      </div>
      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5, 10, 15]"
            layout="total, prev, pager, next, jumper" :total="total" @current-change="handlePageChange" />
        </div>
      </div>
    </div>

    <!-- 点击用户名称弹出框 -->
    <userInfoVue v-if="user_info_dialogFormVisible" :user_info_dialogFormVisible="user_info_dialogFormVisible"
      :quyu_data="quyu_data" :data="multipleSelection[0]" @close="closeUserInfoDialog"></userInfoVue>

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

    <!-- ========== 新增 暂停记录弹窗 ========== -->
    <pauseRecord v-if="pause_record_dialogFormVisible"
                 :pause_record_dialogFormVisible="pause_record_dialogFormVisible" :quyu_data="quyu_data"
                 :data="multipleSelection[0]" @close="closePauseRecordDialog"></pauseRecord>

    <!-- ========== 新增 销户记录弹窗 ========== -->
    <closeRecord v-if="close_record_dialogFormVisible"
                 :close_record_dialogFormVisible="close_record_dialogFormVisible" :quyu_data="quyu_data"
                 :data="multipleSelection[0]" @close="closeCloseRecordDialog"></closeRecord>

    <!-- 余额调整弹出框 -->
    <changeBalanceVue v-if="changeBalance_dialogFormVisible"
      :changeBalance_dialogFormVisible="changeBalance_dialogFormVisible" :data="multipleSelection[0]"
      @close="closeChangeBalanceDialog"></changeBalanceVue>

    <!-- 吨数调整弹出框 -->
    <changeTonnageVue v-if="changeTonnage_dialogFormVisible"
      :changeTonnage_dialogFormVisible="changeTonnage_dialogFormVisible" :data="multipleSelection[0]"
      @close="closeChangeTonnageDialog"></changeTonnageVue>

    <!-- 充值弹出框 -->
    <rechargeVue v-if="recharge_dialogFormVisible" :recharge_dialogFormVisible="recharge_dialogFormVisible"
      :data="multipleSelection[0]" @close="closeRechargeDialog"></rechargeVue>

    <!-- 充值记录弹出框 -->
    <rechargeRecordVue v-if="recharge_record_dialogFormVisible"
      :recharge_record_dialogFormVisible="recharge_record_dialogFormVisible" :quyu_data="quyu_data"
      :data="multipleSelection[0]" @close="closeRechargeRecordDialog"></rechargeRecordVue>

    <!-- 充值撤销记录弹窗 -->
    <rechargeCancelRecordVue v-if="recharge_cancel_record_dialogFormVisible"
                             :recharge_cancel_record_dialogFormVisible="recharge_cancel_record_dialogFormVisible" :quyu_data="quyu_data"
                             :data="multipleSelection[0]" @close="closeRechargeCancelRecordDialog"></rechargeCancelRecordVue>

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

    <command4GXinchi v-if="command_dialogFormVisible_4g_xinchi"
      :command_dialogFormVisible="command_dialogFormVisible_4g_xinchi" :commandType="commandType"
      :data="multipleSelection[0]" @close="closeCommandDialog"></command4GXinchi>

    <!-- 命令下发弹出框-集万讯 -->
    <commandJiWanXun v-if="command_dialogFormVisible_jiwanxun"
      :command_dialogFormVisible="command_dialogFormVisible_jiwanxun" :commandType="commandType"
      :data="multipleSelection[0]" @close="closeCommandDialog"></commandJiWanXun>

    <!-- 命令下发弹出框-圣鑫 -->
    <commandShengXin v-if="command_dialogFormVisible_shengxin"
      :command_dialogFormVisible="command_dialogFormVisible_shengxin" :commandType="commandType"
      :data="multipleSelection[0]" @close="closeCommandDialog"></commandShengXin>

    <!-- 命令下发弹出框-旧圣鑫 -->
    <commandOldShengXin v-if="command_dialogFormVisible_old_shengxin"
      :command_dialogFormVisible="command_dialogFormVisible_old_shengxin" :commandType="commandType"
      :data="multipleSelection[0]" @close="closeCommandDialog"></commandOldShengXin>

    <!-- 命令下发弹出框-卓正 -->
    <commandZhuoZheng v-if="command_dialogFormVisible_zhuozheng"
      :command_dialogFormVisible="command_dialogFormVisible_zhuozheng" :commandType="commandType"
      :data="multipleSelection[0]" @close="closeCommandDialog"></commandZhuoZheng>

    <!-- 命令下发弹出框-千宝通 -->
    <commandQianBaoTong v-if="command_dialogFormVisible_qianbaotong"
      :command_dialogFormVisible="command_dialogFormVisible_qianbaotong" :commandType="commandType"
      :data="multipleSelection[0]" @close="closeCommandDialog"></commandQianBaoTong>

    <!-- ========== 新增 后付费列表弹窗 ========== -->
    <postPayUserList v-if="post_pay_list_dialogFormVisible"
                     :post_pay_list_dialogFormVisible="post_pay_list_dialogFormVisible" :quyu_data="quyu_data"
                     :data="multipleSelection[0]" @close="closePostPayListDialog"></postPayUserList>

    <!-- ========== 新增 不欠费可关阀列表弹窗 ========== -->
    <canCloseNoArrears v-if="can_close_no_arrears_dialogFormVisible"
                       :can_close_no_arrears_dialogFormVisible="can_close_no_arrears_dialogFormVisible" :quyu_data="quyu_data"
                       :data="multipleSelection[0]" @close="closeCanCloseNoArrearsDialog"></canCloseNoArrears>

    <!-- 批量修改用户水价 弹出框（样式与其他页面统一）-->
    <div class="add-dialog" v-if="priceDialogVisible">
      <div class="add-dialog-content">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/jiage/icon3.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 20px">批量修改用户水价</span>
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
            <span style="font-size: 20px; margin-left: 15%">确认</span>
          </div>
          <div class="cancel-btn" @click="priceDialogVisible = false">
            <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
            <span style="font-size: 20px; margin-left: 15%; color: #5a5a5a">取消</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 价格详情弹窗 -->
  <div class="test-dialog" v-if="view_dialogFormVisible">
    <div class="test-dialog-content" style="min-height: 500px">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/jiage/icon5.png" alt="" style="margin-right: 10px" />
          <span style="font-size: 20px">价格详情</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="view_dialogFormVisible = false">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="test-content" style="min-height: 500px">
        <div class="test-item">
          <div class="test-input" style="margin-right: 1%">
            <span>价格名称</span>
            <el-input v-model="viewData.priceName" disabled />
          </div>
          <div class="test-input" style="margin-right: 1%">
            <span>保底数值/吨</span>
            <el-input v-model="viewData.amountZeroEnd" disabled />
          </div>
          <div class="test-input">
            <span>保底价格/元</span>
            <el-input v-model="viewData.priceZero" disabled />
          </div>
          <div class="test-input" style="margin-right: 1%">
            <span>阶梯数</span>
            <el-input v-model="viewData.stepNumber" disabled />
          </div>
          <div class="test-input" style="margin-right: 1%">
            <span>附加费用/元</span>
            <el-input v-model="viewData.additionPrice" disabled />
          </div>
        </div>
        <div class="test-item-jieti" v-if="viewData.stepNumber >= 1">
          <span style="font-size: 16px; color: #47b97e; margin-bottom: 10px">第一阶梯</span>
          <div class="jieti-content">
            <div class="jieti-item" style="width: 60%">
              <span>水量范围</span>
              <div class="jieti-range">
                <el-input v-model="viewData.amountFirstStart" disabled />
                <span style="font-size: 20px; margin-bottom: 5px; align-self: center; margin: 0 5px">至</span>
                <el-input v-model="viewData.amountFirstEnd" disabled />
              </div>
            </div>
            <div class="jieti-item" style="width: 35%">
              <span>价格（元/吨）</span>
              <el-input v-model="viewData.priceFirst" disabled />
            </div>
          </div>
        </div>
        <div class="test-item-jieti" v-if="viewData.stepNumber >= 2">
          <span style="font-size: 16px; color: #47b97e; margin-bottom: 10px">第二阶梯</span>
          <div class="jieti-content">
            <div class="jieti-item" style="width: 60%">
              <span>水量范围</span>
              <div class="jieti-range">
                <el-input v-model="viewData.amountSecondStart" disabled />
                <span style="font-size: 20px; margin-bottom: 5px; align-self: center; margin: 0 5px">至</span>
                <el-input v-model="viewData.amountSecondEnd" disabled />
              </div>
            </div>
            <div class="jieti-item" style="width: 35%">
              <span>价格（元/吨）</span>
              <el-input v-model="viewData.priceSecond" disabled />
            </div>
          </div>
        </div>
        <div class="test-item-jieti" v-if="viewData.stepNumber >= 3">
          <span style="font-size: 16px; color: #47b97e; margin-bottom: 10px">第三阶梯</span>
          <div class="jieti-content">
            <div class="jieti-item" style="width: 60%">
              <span>水量范围</span>
              <div class="jieti-range">
                <el-input v-model="viewData.amountThirdStart" disabled />
                <span style="font-size: 20px; margin-bottom: 5px; align-self: center; margin: 0 5px">至</span>
                <el-input v-model="viewData.amountThirdEnd" disabled />
              </div>
            </div>
            <div class="jieti-item" style="width: 35%">
              <span>价格（元/吨）</span>
              <el-input v-model="viewData.priceThird" disabled />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 短信配置详情弹窗 -->
  <div class="test-dialog" v-if="smsView_dialogFormVisible">
    <div class="test-dialog-content" style="min-height: 400px">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/jiage/icon5.png" alt="" style="margin-right: 10px" />
          <span style="font-size: 20px">短信配置详情</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="smsView_dialogFormVisible = false">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="test-content" style="min-height: 400px">
        <div class="test-item">
          <div class="test-input" style="margin-right: 1%; width: 100%">
            <span>短信配置名称</span>
            <el-input v-model="smsViewData.smsConfigName" disabled />
          </div>
          <div class="test-input" style="margin-right: 1%; width: 100%">
            <span>发送方式</span>
            <el-input :value="smsViewData.smsSendType || ''" disabled />
          </div>
          <div class="test-input" style="margin-right: 1%; width: 100%" v-if="smsViewData.smsSendType === '定时发送' && smsViewData.smsSendTime != null">
            <span>短信定时发送时间</span>
            <el-input :value="smsViewData.smsSendTime + ':00'" disabled />
          </div>
          <div class="test-input" style="margin-right: 1%; width: 100%">
            <span>余额不足发送预警值（元）</span>
            <el-input :value="smsViewData.minimumBalanceThreshold !== null && smsViewData.minimumBalanceThreshold !== undefined ? smsViewData.minimumBalanceThreshold : ''" disabled />
          </div>
          <div class="test-input" style="margin-right: 1%; width: 100%">
            <span>所属水厂</span>
            <el-input :value="smsViewData.companyName || ''" disabled />
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 批量停户确认弹窗 -->
  <el-dialog v-model="batchPauseDialogVisible" title="批量暂停用户确认" width="620" :lock-scroll="false">
    <div style="font-size: 20px; text-align: center; line-height: 2.2; padding:10px 0;">
      确定要将选中 <span style="color:#45ba7e;font-weight:bold">{{ multipleSelection.length }}</span> 户用户暂停使用吗？<br/>
      暂停后不再收取保底费，并自动下达水表关阀命令。
    </div>
    <template #footer>
      <div style="display:flex;justify-content:center;gap:24px;">
        <el-button @click="batchPauseDialogVisible = false">取消</el-button>
        <el-button @click="handleBatchPause" style="background-color:#45ba7e;color:#fff" :loading="batchLoading">确认暂停</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 批量销户确认弹窗 -->
  <el-dialog v-model="batchCloseDialogVisible" title="批量销户确认" width="1000" :lock-scroll="false">
    <div style="font-size: 20px; line-height: 1.8; padding:10px 14px;">
      <p>确定永久销户选中 <span style="color:#45ba7e;font-weight:bold">{{ batchCloseTipInfo.total }}</span> 户用户？</p>
      <p style="color:#e6a23c">销户后用户水表绑定关系全部清除，操作无法恢复！</p>

      <div v-if="batchCloseTipInfo.arrearsList.length > 0" style="margin-top:12px;padding:10px;background:#fef0f0;border-radius:6px;">
        <p style="color:#f56c6c;font-weight:bold">⚠️ 存在 <b>{{ batchCloseTipInfo.arrearsList.length }}</b> 户欠费用户：</p>
        <div style="max-height:200px;overflow-y:auto;margin-top:6px;color:#c03636;font-size:20px;">
        <div v-for="u in batchCloseTipInfo.arrearsList" :key="u.imei">
          用户名：{{u.userName}}，用户号：{{u.userId}}，表号：{{u.meterCode}}，余额{{u.balance}}元；
        </div>
        </div>
      </div>

      <div v-if="batchCloseTipInfo.hasBalanceList.length > 0" style="margin-top:12px;padding:10px;background:#f0f9ff;border-radius:6px;">
        <p style="color:#409eff;font-weight:bold">ℹ️ 存在 <b>{{ batchCloseTipInfo.hasBalanceList.length }}</b> 户尚有余额用户：</p>
        <div style="max-height:200px;overflow-y:auto;margin-top:6px;color:#2b7bcd;font-size:20px;">
        <div v-for="u in batchCloseTipInfo.hasBalanceList" :key="u.imei"  style="display:flex;align-items:center;justify-content: space-between;margin:4px 0;">
          <span>用户名：{{u.userName}}，用户号：{{u.userId}}，表号：{{u.meterCode}}，余额{{u.balance}}元；</span>
          <div
              v-if="staffPermissionIds.includes(70) && Number(u.balance) > 0"
              class="refund-mini-btn"
              @click="!u.isRefundBtnDisabled && openSingleRefund(u)"
              :disabled="u.isRefundBtnDisabled"
          >
            余额退款
          </div>
        </div>
        </div>
      </div>
    </div>
    <template #footer>
      <div style="display:flex;justify-content:center;gap:24px;">
        <el-button @click="batchCloseDialogVisible = false">取消</el-button>
        <el-button @click="handleBatchClose" style="background-color:#45ba7e;color:#fff" :loading="batchLoading">确认销户</el-button>
      </div>
    </template>
  </el-dialog>
  <!-- 单行用户余额退款弹窗 -->
  <el-dialog v-model="singleRefundDialogVisible" title="余额退款确认" width="620" :lock-scroll="false">
    <div style="font-size: 20px; text-align: center; line-height: 2.2; padding:10px 0;">
      确定要将用户【{{ singleRefundRow?.userName }}】账户内 {{ singleRefundRow?.balance }} 元余额全部返还？<br/>
      操作后用户账号保留，仅清空账户余额。
    </div>
    <template #footer>
      <div style="display:flex;justify-content:center;gap:24px;">
        <el-button @click="singleRefundDialogVisible = false">取消</el-button>
        <el-button @click="handleSingleRefund" style="background-color:#45ba7e;color:#fff" :loading="singleRefundLoading">确认退款</el-button>
      </div>
    </template>
  </el-dialog>
  <!-- 新增区域 -->
  <div class="add-region-dialog" v-if="addRegion_dialogFormVisible">
    <div class="add-region-dialog-content add-region">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/fapiao/icon8.png" alt="" style="margin-right: 10px" />
          <span style="font-size: 20px">新增区域</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="closeAddRegionDialog">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="add-region-content" style="flex-direction: column">
        <div class="add-region-input" v-if="companyId === 1" style="margin-right: 7%">
          <span>水厂名称</span>
          <el-select v-model="addRegion.companyId">
            <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </div>

        <!-- 已有区域列表【两列布局】 -->
        <div class="region-list-box">
          <span style="color: #575556; font-size: 20px; margin-bottom: 8px; display:block">已有区域列表</span>
          <div class="region-table-scroll" style="border: 1px solid #e6e6e6; padding: 8px 15px">
            <div class="region-grid-wrap">
              <div class="region-item" v-for="item in addRegionQuYuList" :key="item.regionId">
                {{ item.regionName }}
              </div>
              <!-- 空数据提示 -->
              <div v-if="addRegionQuYuList.length === 0" class="empty-box">
                暂无数据
              </div>
            </div>
          </div>
        </div>

        <div class="add-region-input">
          <span>新增区域名称</span>
          <el-input v-model="addRegion.regionName" placeholder="请输入..." />
        </div>
      </div>
      <div class="btn">
        <div class="confirm-btn" @click="addRegion_confirm">
          <el-icon style="margin-left: 15%"><Check /></el-icon>
          <span style="font-size: 20px; margin-left: 15%">确认</span>
        </div>
        <div class="cancel-btn" @click="closeAddRegionDialog">
          <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
          <span style="font-size: 20px; margin-left: 15%; color: #5a5a5a">取消</span>
        </div>
      </div>
    </div>
  </div>
  <!-- 删除区域 -->
  <div class="add-region-dialog" v-if="deleteRegion_dialogFormVisible">
    <div class="add-region-dialog-content add-region">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yuangong/icon4.png" alt="" style="margin-right: 10px" />
          <span style="font-size: 20px">删除区域</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="cancelDeleteRegion">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="add-region-content">
        <div class="add-region-input" v-if="companyId === 1" style="margin-right: 7%">
          <span>水厂名称</span>
          <el-select v-model="deleteRegion.companyId">
            <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </div>

        <!-- 已有区域列表【两列布局】 -->
        <div class="region-list-box-delete">
          <div style="display: flex;justify-content: space-between;align-items: center;margin-bottom: 8px">
            <span style="color: #575556; font-size: 20px;">已有区域列表</span>
            <div>
              <el-checkbox v-model="checkAll" :indeterminate="indeterminate" @change="handleCheckAll"></el-checkbox>
              <span style="font-size: 20px; color: #575556; margin-left: 5px">全选</span>
            </div>
          </div>
          <div class="region-table-scroll" style="border: 1px solid #e6e6e6; padding: 8px 15px">
            <div class="region-grid-wrap">
              <div
                  class="region-item"
                  :class="{active: deleteRegion.regionIds.includes(item.id)}"
                  v-for="item in regionList"
                  :key="item.id"
                  @click="toggleRegionItem(item.id)"
              >
                {{ item.label }}
              </div>
              <!-- 空数据提示 -->
              <div v-if="regionList.length === 0" class="empty-box">
                暂无数据
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="btn">
        <div class="confirm-btn" @click="deleteRegion_confirm">
          <el-icon style="margin-left: 15%"><Check /></el-icon>
          <span style="font-size: 20px; margin-left: 15%">确认</span>
        </div>
        <div class="cancel-btn" @click="cancelDeleteRegion">
          <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
          <span style="font-size: 20px; margin-left: 15%; color: #5a5a5a">取消</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { queryPriceMg, getPriceDetail } from "@/api/price/price";
import { getSmsConfigDetail } from "@/api/sms/sms";
import { multiEditUserBindMeterInfo } from "@/api/userMeterBind/userMeterBind";
import commandTaiYangNengVue from "@/components/userManage/commandDialog/command_taiyangneng.vue";
import commandXinchiVue from "@/components/userManage/commandDialog/command_xinchi.vue";
import commandQianBaoTong from "@/components/userManage/commandDialog/command_qianbaotong.vue";
import commandZhuoZheng from "@/components/userManage/commandDialog/command_zhuozheng.vue";
import commandJiWanXun from "@/components/userManage/commandDialog/command_jiwanxun.vue";
import commandShengXin from "@/components/userManage/commandDialog/command_shengxin.vue";
import commandOldXinchi from "@/components/userManage/commandDialog/command_old_xinchi.vue";
import command4GXinchi from "@/components/userManage/commandDialog/command_4g_xinchi.vue";
import commandOldShengXin from "@/components/userManage/commandDialog/command_oldshengxin.vue";
import rechargeVue from "@/components/userManage/recharge.vue";
import rechargeRecordVue from "@/components/userManage/rechargeRecord.vue";
import changeVue from "@/components/userManage/change.vue";
import addVue from "@/components/userManage/add.vue";
import deleteVue from "@/components/userManage/delete.vue";
import valveVue from "@/components/userManage/valve.vue";
import valueOpenVue from "@/components/userManage/valveOpen.vue";
import changeRecord from "@/components/userManage/changeRecord.vue";
import userInfoVue from "@/components/userManage/userInfo.vue";
import transactionRecord from "@/components/userManage/transactionRecord.vue";
import changeBalanceVue from "@/components/userManage/changeBalance.vue";
import changeTonnageVue from "@/components/userManage/changeTonnage.vue";
import rechargeCancelRecordVue from "@/components/userManage/RechargeCancelRecord.vue";
import pauseRecord from "@/components/userManage/pauseRecord.vue";
import closeRecord from "@/components/userManage/closeRecord.vue";
import postPayUserList from "@/components/userManage/postPayUserList.vue";
import canCloseNoArrears from "@/components/userManage/canCloseNoArrears.vue";

import service from "@/api/request";
import { ElMessage } from "element-plus";
import { Check, Close } from "@element-plus/icons-vue";
import axios from "axios";
import { useDetailNavigation } from "@/composables/useDetailNavigation";

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
    transactionRecord,
    valveVue,
    valueOpenVue,
    changeBalanceVue,
    changeTonnageVue,
    commandTaiYangNengVue,
    commandXinchiVue,
    commandShengXin,
    commandZhuoZheng,
    commandQianBaoTong,
    commandJiWanXun,
    commandOldXinchi,
    command4GXinchi,
    commandOldShengXin,
    // 充值撤销记录
    rechargeCancelRecordVue,
    // 新增
    pauseRecord,
    closeRecord,
    postPayUserList,
    canCloseNoArrears,
  },
  setup() {
    const { navigateToDetail } = useDetailNavigation();
    return { navigateToDetail };
  },
  data() {
    return {
      param: {
        userName: "",
        userId: "",
        imei: "",
        meterCode: null,
        meterType: "", // 水表类型
        meterVendor: "", // 厂商
        battery: "", // 电量
        valveStatus: "", // 阀门状态
        time: {
          type: "",
          accurateTime: "",
        },
        company: null, // 新增所属水厂参数
        companyId: null, // 所属水厂ID
        userPhone: "", // 联系电话
        userAddr: "", // 新增地址搜索参数
        order: 0,   // ****** 默认按照时间顺序倒叙排列表格 ******
      },
      price_list: [],
      priceDialogVisible: false,
      selectedPriceId: null,

      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId, // 公司ID
      staffPermissionIds: JSON.parse(sessionStorage.getItem("userData")).staffPermissionIds,
      token: JSON.parse(sessionStorage.getItem("userData")).token, // 用户token
      currentPage: 1,
      pageSize: 30,
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

      sortField: "time",
      sortOrder: "desc",

      // 标记是否需要自动点击抄表时间（从异常数据页面跳转时使用）
      autoClickNextTime: false,
      //弹出框显示与否
      user_info_dialogFormVisible: false,
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
      command_dialogFormVisible_4g_xinchi: false,
      command_dialogFormVisible_old_shengxin: false,
      valve_dialogFormVisible: false,
      valveOpen_dialogFormVisible: false,
      changeBalance_dialogFormVisible: false,
      changeTonnage_dialogFormVisible: false,
      // 充值撤销记录
      recharge_cancel_record_dialogFormVisible: false,
      // 新增暂停、销户弹窗标记
      pause_record_dialogFormVisible: false,
      close_record_dialogFormVisible: false,
      post_pay_list_dialogFormVisible: false,
      can_close_no_arrears_dialogFormVisible: false,

      // 价格详情弹窗
      view_dialogFormVisible: false,
      viewData: {
        priceName: null,
        amountZeroEnd: null,
        priceZero: null,
        stepNumber: null,
        additionPrice: null,
        amountFirstStart: null,
        amountFirstEnd: null,
        priceFirst: null,
        amountSecondStart: null,
        amountSecondEnd: null,
        priceSecond: null,
        amountThirdStart: null,
        amountThirdEnd: null,
        priceThird: null,
      },

      // 短信配置详情弹窗
      smsView_dialogFormVisible: false,
      smsViewData: {
        smsConfigName: null,
        smsSendType: null,
        smsSendTime: null,
        minimumBalanceThreshold: null,
        balanceWarningDays: null,
        companyId: null,
        companyName: null,
      },
      // ****** 请求锁，避免重复请求 ******
      isLoading: false,
      listRequestSeq: 0,

      // ****** 功能按钮配置 ******
      featureButtonConfigs: [
        { key: 'delete', label: '删除', permission: 6 },
        { key: 'command', label: '命令下发', permission: 89 },
        { key: 'valveOpen', label: '区域开阀设置', permission: 7 },
        { key: 'valveClose', label: '区域关阀设置', permission: 8 },
        { key: 'balance', label: '余额调整', permission: 9 },
        { key: 'recharge', label: '充值', permission: 10 },
        { key: 'changeMeter', label: '换表', permission: 13 },
        { key: 'rechargeRecord', label: '充值记录', permission: 11 },
        { key: 'rechargeCancelRecord', label: '充值撤销记录', permission: 69 },
        { key: 'changeRecord', label: '换表记录', permission: 14 },
        // 新增暂停记录
        { key: 'pauseRecord', label: '停户列表', permission: 64 },
        // 新增销户记录
        { key: 'closeRecord', label: '销户列表', permission: 66 },
        { key: 'export', label: '导出', permission: null },
        { key: 'batchPrice', label: '修改水价', permission: 90, defaultVisible: false },
        { key: 'commonMeterTemplate', label: '普表用水量模板下载', permission: null, defaultVisible: false },
        { key: 'commonMeterImport', label: '普表用水量信息导入', permission: null, defaultVisible: false },
        { key: 'batchPause', label: '停户', permission: 63 },
        { key: 'batchClose', label: '销户', permission: 65 },
        { key: 'postPayList', label: '欠费不关阀列表（后付费）', permission: 67 },
        { key: 'canCloseNoArrears', label: '不欠费可关阀列表', permission: 68 },
      ],

      // ****** 筛选栏配置 ******
      filterFieldConfigs: [
        { key: "company", label: "所属水厂", type: "select", placeholder: "请选择所属水厂", optionsKey: "companyList" },
        { key: "userId", label: "用户号", type: "input" },
        { key: "userName", label: "用户名", type: "input" },
        // 新增地址筛选
        { key: "userAddr", label: "地址", type: "input" },
        { key: "meterCode", label: "表号", type: "input" },
        { key: "userPhone", label: "电话", type: "input" },
        // { key: "meterVendor", label: "厂商", type: "input" },
        {
          key: "meterVendor",
          label: "品牌",
          type: "select",
          clearable: true,
          options: [
            { label: "圣鑫", value: "圣鑫" },
            { label: "旧圣鑫", value: "旧圣鑫" },
            { label: "太阳能", value: "太阳能" },
            { label: "信驰", value: "信驰" },
            { label: "旧信驰", value: "旧信驰" },
            { label: "旧信驰KF01", value: "旧信驰KF01" },
            { label: "4G信驰", value: "4G信驰" },
            { label: "集万讯", value: "集万讯" },
            { label: "千宝通", value: "千宝通" }
          ]
        },
        { key: "meterType", label: "水表类型", type: "select", optionsKey: "shuibiao_list", defaultVisible: false },
        { key: "battery", label: "电量", type: "select", clearable: true, options: [{ label: "正常", value: "正常" }, { label: "异常", value: "异常" }] },
        { key: "valveStatus", label: "阀门", type: "select", clearable: true, options: [{ label: "开阀", value: "开阀" }, { label: "关阀", value: "关阀" }, { label: "故障", value: "故障" }] },
      ],
      batchPauseDialogVisible: false,
      batchCloseDialogVisible: false,
      batchLoading: false,

      //批量销户提示
      batchCloseTipInfo: {
        total: 0,
        arrearsList: [], //欠费 balance<0
        hasBalanceList: [], //有余额 balance>0
      },
      singleRefundRow: null,
      singleRefundDialogVisible: false,
      singleRefundLoading: false,

      addRegion_dialogFormVisible: false,
      deleteRegion_dialogFormVisible: false,
      addRegion: {
        companyId: null,
        regionName: null,
      },
      deleteRegion: {
        companyId: "",
        regionIds: [],
      },
      checkAll: false,
      indeterminate: false,
      regionList: [],
      flag: 0,
      addRegionQuYuList: [],
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
    // currentPage() {
    //   this.fetchUserList(this.currentPage);
    // },
    multipleSelection() {
      console.log(this.multipleSelection);
    },
    "param.company"() {
      this.quyu_selected = null;
      this.$refs.treeRef.setCurrentKey(null);
      this.getRegionData();
    },
    // 监听 yonghuData 变化，处理从异常页面跳转后的自动点击抄表时间
    yonghuData: {
      handler(newData) {
        if (this.autoClickNextTime && newData && newData.length > 0) {
          // 清除标记，避免重复点击
          this.autoClickNextTime = false;
          // 等待 DOM 更新
          this.$nextTick(() => {
            // 再次等待表格渲染完成
            setTimeout(() => {
              this.handleChaoBiaoTime(newData[0]);
            }, 300);
          });
        }
      },
      immediate: false,
      deep: false,
    },
    "deleteRegion.regionIds": {
      handler(val) {
        if (val.length === 0) {
          this.checkAll = false;
          this.indeterminate = false;
        } else if (val.length === this.regionList.length) {
          this.checkAll = true;
          this.indeterminate = false;
        } else {
          this.indeterminate = true;
        }
      },
    },
    "deleteRegion.companyId": {
      handler() {
        if (this.flag == 0) {
          this.deleteRegion.regionIds = [];
          this.checkAll = false;
          this.indeterminate = false;
          this.regionList = [];
          this.getRegionDataForDelete();
        }
      },
    },
    "addRegion.companyId": {
      handler(newVal) {
        this.addRegionQuYuList = []
        this.loadRegionListForAdd();
      }
    },
  },
  computed: {
    availableFilterFields() {
      return this.filterFieldConfigs.filter((f) => {
        if (f.key === "company") return this.companyId === 1;
        return true;
      });
    },
    hasPauseUserSelected() {
      // 判断选中项中是否存在暂停用户 isPause === 1
      return this.multipleSelection.some(row => row.isPause === 1)
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.treeRef = this.$refs.treeRef;
    });

    // 检查是否需要恢复页面状态（从 userRecordDetail 返回时）
    const restore = this.$route.query.restore;

    const searchUserAndMeter = this.$route.query.searchUserAndMeter === 'true';
    const userIdFromQuery = this.$route.query.userId;
    const meterCodeFromQuery = this.$route.query.meterCode;
    const searchUserName = this.$route.query.searchUserName === 'true';
    const userNameFromQuery = this.$route.query.userName;


    // 标记是否需要自动点击抄表时间
    this.autoClickNextTime = false;
    if (searchUserAndMeter && (userIdFromQuery || meterCodeFromQuery)) {
      // 设置搜索参数
      if (userIdFromQuery) {
        this.param.userId = userIdFromQuery;
      }
      if (meterCodeFromQuery) {
        this.param.meterCode = meterCodeFromQuery;
      }
      // 设置标记，等待数据加载完成后自动点击
      this.autoClickNextTime = true;
      // 获取区域数据后执行搜索
      this.getRegionData();
      this.$nextTick(() => {
        this.fetchUserList(1, { force: true });
        // 搜索完成后，查找第一行数据并自动点击抄表时间
        this.$nextTick(() => {
          if (this.yonghuData && this.yonghuData.length > 0) {
            const firstRow = this.yonghuData[0];
            // 自动调用抄表时间点击事件
            this.handleChaoBiaoTime(firstRow);
          }
        });
      });
    }
    // 检查是否从异常数据页面跳转过来，需要自动搜索特定用户
    else if (searchUserName && userNameFromQuery) {
      // 设置搜索参数中的 userName
      this.param.userName = userNameFromQuery;
      // 获取区域数据后执行搜索
      this.getRegionData();
      this.$nextTick(() => {
        this.fetchUserList(1, { force: true });
      });
    } else if (restore === 'true') {
      // 恢复页面状态
      this.currentPage = parseInt(this.$route.query.currentPage) || 1;
      this.pageSize = parseInt(this.$route.query.pageSize) || 30;
      this.sortField = this.$route.query.sortField || 'time';
      this.sortOrder = this.$route.query.sortOrder || 'desc';

      // 恢复搜索参数
      if (this.$route.query.param) {
        try {
          const param = JSON.parse(this.$route.query.param);
          this.param = { ...this.param, ...param };
        } catch (e) {
          console.error('恢复搜索参数失败', e);
        }
      }

      // 清除 sessionStorage 中的保存状态
      sessionStorage.removeItem('userManagePageState');

      // 先获取区域数据，再恢复区域选择
      this.getRegionData();

      // 等待区域数据加载完成后恢复区域选择
      this.$nextTick(() => {
        // 恢复区域选择
        if (this.$route.query.quyu_selected) {
          try {
            const quyuSelected = JSON.parse(this.$route.query.quyu_selected);
            this.quyu_selected = quyuSelected;
            // 等待树组件渲染后选中并触发点击事件
            setTimeout(() => {
              if (this.treeRef && this.quyu_selected) {
                this.treeRef.setCurrentKey(this.quyu_selected.id);
                // 直接调用fetchUserList，不经过handleNodeClick的页码判断
                this.fetchUserList(this.currentPage);
              } else {
                // 如果树组件未就绪或没有区域选择，直接获取用户列表
                this.fetchUserList(this.currentPage);
              }
            }, 300);
          } catch (e) {
            console.error('恢复区域选择失败', e);
            this.fetchUserList(this.currentPage);
          }
        } else {
          // 如果没有区域选择，直接获取用户列表
          this.fetchUserList(this.currentPage);
        }
      });
    } else {
      this.getUserInfo();
      this.getRegionData();
    }

    this.getCompanyList();
  },
  methods: {
    // 打开批量停户弹窗
    openBatchPauseDialog() {
      this.batchPauseDialogVisible = true;
    },
// 执行批量停户
    async handleBatchPause() {
      this.batchLoading = true;
      try {
        const imeiList = this.multipleSelection.map(item => item.imei);
        // const params = {
        //   imeiList,
        //   staffId: JSON.parse(sessionStorage.getItem("userData")).staffId
        // };
        // const res = await service.post("/userManage/userCharge/batchPauseMeter", params);
        const res = await service.post("/userManage/userCharge/batchPauseMeter", imeiList);
        if (res.code === 200) {
          ElMessage.success("批量暂停操作成功");
          this.batchPauseDialogVisible = false;
          this.multipleSelection = [];
          this.reflush();
        } else {
          ElMessage.error(res.msg || "批量暂停失败");
        }
      } catch (err) {
        console.error(err);
        ElMessage.error("请求异常，批量暂停失败");
      } finally {
        this.batchLoading = false;
      }
    },

// 打开批量销户弹窗
    openBatchCloseDialog() {
      const list = this.multipleSelection;
      const arrearsList = list.filter(item => Number(item.balance) < 0);
      const hasBalanceList = list.filter(item => Number(item.balance) > 0);

      this.batchCloseTipInfo = {
        total: list.length,
        arrearsList,
        hasBalanceList
      };
      this.batchCloseDialogVisible = true;
    },
// 执行批量销户
    async handleBatchClose() {
      this.batchLoading = true;
      try {
        const imeiList = this.multipleSelection.map(item => item.imei);
        const res = await service.post("/userManage/userCharge/batchCancelMeter", imeiList);
        if (res.code === 200) {
          ElMessage.success("批量销户操作成功");
          this.batchCloseDialogVisible = false;
          this.multipleSelection = [];
          this.reflush();
        } else {
          ElMessage.error(res.msg || "批量销户失败");
        }
      } catch (err) {
        console.error(err);
        ElMessage.error("请求异常，批量销户失败");
      } finally {
        this.batchLoading = false;
      }
    },

    getFilterOptions(key) {
      const field = this.filterFieldConfigs.find((f) => f.key === key);
      if (!field) return [];
      if (field.options) return field.options;
      if (field.optionsKey === "companyList") {
        return (this.companyList || []).map((item) => ({ label: item.name, value: item.id }));
      }
      if (field.optionsKey === "shuibiao_list") {
        return (this.shuibiao_list || []).map((item) => ({ label: item.label, value: item.label }));
      }
      return [];
    },
    // ****** 手动处理分页变化，避免 watch 循环 ******
    handlePageChange(page) {
      // 防抖：如果当前正在请求，直接返回，避免重复点击
      if (this.isLoading) return;
      // this.isLoading = true;
      this.currentPage = page;
      this.fetchUserList(page);
    },

    syncCompanyIdParam() {
      if (this.companyId === 1) {
        this.param.companyId = this.param.company || "";
      } else {
        this.param.companyId = this.companyId;
      }
    },
    buildQueryString(params) {
      let queryString = "";
      for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
          const value = params[key];
          if (queryString) {
            queryString += `&${key}=${encodeURIComponent(value)}`;
          } else {
            queryString += `?${key}=${encodeURIComponent(value)}`;
          }
        }
      }
      return queryString;
    },
    fetchUserList(page = this.currentPage || 1, options = {}) {
      if (this.isLoading && !options.force) return;
      const requestSeq = ++this.listRequestSeq;
      this.isLoading = true;
      this.syncCompanyIdParam();
      const nonEmptyParams = this.filterNonEmptyParams(this.param);
      if (this.quyu_selected !== null) {
        nonEmptyParams.region = this.quyu_selected.label;
      }
      const url = `/userManage/userCharge/showUserMeters/${page}${this.buildQueryString(nonEmptyParams)}`;
      console.log(url);
      return service
        .get(url, {
          headers: {
            Authorization: this.token,
          },
        })
        .then((response) => {
          if (requestSeq !== this.listRequestSeq) return;
          if (response.code === 200) {
            this.yonghuData = response.data.userInfoData;
            this.yonghuData.forEach((item) => {
              item.updateTime = item.updateTime.replace("T", " ");
            });
            this.total = response.data.totalElements;
            // if (this.currentPage !== response.data.currentPages) {
            //   this.currentPage = response.data.currentPages;
            // }
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          if (requestSeq !== this.listRequestSeq) return;
          const errorMessage = error.response?.data?.msg || "请求发生错误!!";
          ElMessage.error(errorMessage);
        }).finally(() => {
          // ✅ finally 放在最后，无论成功/失败，都会执行
          if (requestSeq === this.listRequestSeq) {
            this.isLoading = false;
          }
        });
    },
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
    // handleNodeClick(data) {
    //   this.quyu_selected = data;
    //   console.log(this.quyu_selected);
    //   let region = data.label;
    //   if (this.companyId === 1) {
    //     if (this.param.companyId) {
    //     } else {
    //       this.param.companyId = ""; // 如果没有选择水厂，则不传水厂ID
    //     }
    //   } else {
    //     this.param.companyId = this.companyId; // 所属水厂ID
    //   }
    //   const nonEmptyParams = this.filterNonEmptyParams({ ...this.param, region });
    //   // 初始化查询字符串
    //   let queryString = "";
    //   // 如果有非空参数，则发起请求
    //   if (Object.keys(nonEmptyParams).length > 0) {
    //     // 遍历 nonEmptyParams 对象，将键值对拼接成查询字符串
    //     for (const key in nonEmptyParams) {
    //       if (nonEmptyParams.hasOwnProperty(key)) {
    //         const value = nonEmptyParams[key];
    //         // 如果查询字符串不为空，添加 & 符号分隔参数
    //         if (queryString) {
    //           queryString += `&${key}=${encodeURIComponent(value)}`;
    //         } else {
    //           // 第一个参数前添加 ? 符号
    //           queryString += `?${key}=${encodeURIComponent(value)}`;
    //         }
    //       }
    //     }
    //   }
    //   // 拼接完整的 URL
    //   const url = `/userManage/userCharge/showUserMeters/${this.currentPage}${queryString}`;
    //   console.log(url);
    //   service
    //     .get(url, {
    //       headers: {
    //         Authorization: this.token,
    //       },
    //     })
    //     .then((response) => {
    //       if (response.code === 200) {
    //         this.yonghuData = response.data.userInfoData;
    //         this.yonghuData.forEach((item) => {
    //           item.updateTime = item.updateTime.replace("T", " ");
    //         });
    //         this.total = response.data.totalElements;
    //         this.currentPage = response.data.currentPages;
    //       } else {
    //         ElMessage.error(response.msg);
    //       }
    //     })
    //     .catch((error) => {
    //       // 提取错误信息
    //       const errorMessage = error.response?.data?.msg || "请求发生错误";
    //       ElMessage.error(errorMessage);
    //     });
    // },
    selectable(row) {
      return true; // 目前允许所有行选择，你可以加上你的业务逻辑
      // isPause=1 暂停用户，返回false禁止勾选
      // return row.isPause !== 1;
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
      this.navigateToDetail(row, {
        source: 'userManage',
        tab: 'meter',
        pageState: {
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          param: this.param,
          quyu_selected: this.quyu_selected,
          sortField: this.sortField,
          sortOrder: this.sortOrder,
        },
      });
    },
    handleYue(row) {
      this.navigateToDetail(row, {
        source: 'userManage',
        pageState: {
          currentPage: this.currentPage,
          pageSize: this.pageSize,
          param: this.param,
          quyu_selected: this.quyu_selected,
          sortField: this.sortField,
          sortOrder: this.sortOrder,
        },
      });
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
    change_tonnage_btn_click() {
      if (this.multipleSelection.length > 0) {
        this.changeTonnage_dialogFormVisible = true;
      } else {
        ElMessage.warning("请选择要调整吨数的数据");
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
    // 充值撤销记录
    recharge_cancel_record_btn_click() {
      this.recharge_cancel_record_dialogFormVisible = true;
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
    closeCommandDialog() {
      this.command_dialogFormVisible_taiyangneng = false;
      this.command_dialogFormVisible_xinchi = false;
      this.command_dialogFormVisible_qianbaotong = false;
      this.command_dialogFormVisible_zhuozheng = false;
      this.command_dialogFormVisible_jiwanxun = false;
      this.command_dialogFormVisible_shengxin = false;
      this.command_dialogFormVisible_old_xinchi = false;
      this.command_dialogFormVisible_4g_xinchi = false;
      this.command_dialogFormVisible_old_shengxin = false;
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
    closeChangeTonnageDialog() {
      this.changeTonnage_dialogFormVisible = false;
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
    closeRechargeCancelRecordDialog() {
      this.recharge_cancel_record_dialogFormVisible = false;
      this.multipleSelection = [];
      this.reflush();
    },
    // 打开后付费列表弹窗
    post_pay_list_btn_click() {
      this.post_pay_list_dialogFormVisible = true;
    },
// 关闭后付费列表弹窗
    closePostPayListDialog() {
      this.post_pay_list_dialogFormVisible = false;
      this.multipleSelection = [];
      this.reflush();
    },

// 打开不欠费可关阀列表弹窗
    can_close_no_arrears_btn_click() {
      this.can_close_no_arrears_dialogFormVisible = true;
    },
// 关闭不欠费可关阀列表弹窗
    closeCanCloseNoArrearsDialog() {
      this.can_close_no_arrears_dialogFormVisible = false;
      this.multipleSelection = [];
      this.reflush();
    },
    closeTransaction() {
      this.transaction_dialogFormVisible = false;
      this.multipleSelection = [];
      this.reflush();
    },
    getOrderValue(field, direction) {
      const orderMap = {
        time: {
          asc: 1,
          desc: 0,
        },
        userId: {
          asc: 2,
          desc: 3,
        },
      };
      return orderMap[field][direction];
    },
    isSortActive(field, direction) {
      return this.sortField === field && this.sortOrder === direction;
    },
    toggleSort(field) {
      if (this.sortField === field) {
        this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
      } else {
        this.sortField = field;
        this.sortOrder = "asc";
      }
      this.param.order = this.getOrderValue(field, this.sortOrder);
      this.search();
    },
    getCompanyList() {
      service
        .get("/getAllUnblockCompany", {
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
    // getUserInfo() {
    //   if (this.companyId === 1) {
    //     if (this.param.companyId) {
    //     } else {
    //       this.param.companyId = ""; // 如果没有选择水厂，则不传水厂ID
    //     }
    //   } else {
    //     this.param.companyId = this.companyId; // 所属水厂ID
    //   }
    //   service
    //     .get(`/userManage/userCharge/showUserMeters/${this.currentPage}?companyId=${this.param.companyId}&order=0`, {
    //       headers: {
    //         Authorization: this.token,
    //       },
    //     })
    //     .then((response) => {
    //       if (response.code === 200) {
    //         this.yonghuData = response.data.userInfoData;
    //         this.yonghuData.forEach((item) => {
    //           item.updateTime = item.updateTime.replace("T", " ");
    //         });
    //         this.total = response.data.totalElements;
    //         this.currentPage = response.data.currentPages;
    //         console.log(this.yonghuData);
    //       } else {
    //         ElMessage.error(response.msg);
    //       }
    //     })
    //     .catch((error) => {
    //       ElMessage.error(error);
    //     });
    // },
    // reflush() {
    //   this.clear(1);//不搜
    //   this.filterText = "";
    //   this.$refs.treeRef.setCurrentKey(null);
    //   this.quyu_selected = null;
    //   if (this.companyId === 1) {
    //     if (this.param.companyId) {
    //     } else {
    //       this.param.companyId = ""; // 如果没有选择水厂，则不传水厂ID
    //     }
    //   } else {
    //     this.param.companyId = this.companyId; // 所属水厂ID
    //   }
    //   service
    //     .get(`/userManage/userCharge/showUserMeters/1?companyId=${this.param.companyId}&order=0`, {
    //       headers: {
    //         Authorization: this.token,
    //       },
    //     })
    //     .then((response) => {
    //       this.yonghuData = response.data.userInfoData;
    //       this.yonghuData.forEach((item) => {
    //         item.updateTime = item.updateTime.replace("T", " ");
    //       });
    //       this.total = response.data.totalElements;
    //       this.currentPage = 1;
    //     })
    //     .catch((error) => {
    //       ElMessage.error("获取用户数据失败");
    //     });
    // },
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
    // clear(isSearch) {
    //   this.param = {
    //     userName: "",
    //     userId: "",
    //     imei: "",
    //     meterCode: null,
    //     meterType: "", // 水表类型
    //     time: {
    //       type: "",
    //       accurateTime: "",
    //     },
    //     company: null, // 新增所属水厂参数
    //     companyId: null, // 所属水厂ID
    //     order: 0,
    //   };
    //   this.sortOrder = null; // 清除排序状态
    //   if (typeof isSearch != 'number' || isNaN(isSearch)) {
    //     this.filterText = "";
    //     if (this.$refs.treeRef) {
    //       this.$refs.treeRef.setCurrentKey(null);
    //     }
    //     this.quyu_selected = null;
    //     this.currentPage = 1;
    //     this.search();
    //   }
    // },
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
    // search() {
    //   if (this.companyId === 1) {
    //     if (this.param.company) {
    //       this.param.companyId = this.param.company; // 所属水厂ID
    //     }
    //   } else {
    //     this.param.companyId = this.companyId; // 所属水厂ID
    //   }
    //   const nonEmptyParams = this.filterNonEmptyParams(this.param);
    //   if (this.quyu_selected !== null) {
    //     nonEmptyParams.region = this.quyu_selected.label;
    //   }
    //   // 如果有非空参数，则发起请求
    //   if (Object.keys(nonEmptyParams).length > 0) {
    //     // 初始化查询字符串
    //     let queryString = "";
    //     // 遍历 nonEmptyParams 对象，将键值对拼接成查询字符串
    //     for (const key in nonEmptyParams) {
    //       if (nonEmptyParams.hasOwnProperty(key)) {
    //         const value = nonEmptyParams[key];
    //         // 如果查询字符串不为空，添加 & 符号分隔参数
    //         if (queryString) {
    //           queryString += `&${key}=${encodeURIComponent(value)}`;
    //         } else {
    //           // 第一个参数前添加 ? 符号
    //           queryString += `?${key}=${encodeURIComponent(value)}`;
    //         }
    //       }
    //     }
    //     // 拼接完整的 URL
    //     const url = `/userManage/userCharge/showUserMeters/${this.currentPage}${queryString}`;
    //     console.log(url);
    //     service
    //       .get(url, {
    //         headers: {
    //           Authorization: this.token,
    //         },
    //       })
    //       .then((response) => {
    //         if (response.code === 200) {
    //           console.log(response.data.userInfoData);
    //           this.yonghuData = response.data.userInfoData;
    //           this.yonghuData.forEach((item) => {
    //             item.updateTime = item.updateTime.replace("T", " ");
    //           });
    //           this.total = response.data.totalElements;
    //           this.currentPage = response.data.currentPages;
    //         } else {
    //           ElMessage.error(response.msg);
    //         }
    //       })
    //       .catch((error) => {
    //         // 提取错误信息
    //         const errorMessage = error.response?.data?.msg || "请求发生错误";
    //         ElMessage.error(errorMessage);
    //       });
    //   } else {
    //     ElMessage.error("请输入搜索条件");
    //   }
    // },
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
      const exportParams = {
        ...this.param,
        companyId: this.companyId === 1 ? this.param.company || null : this.companyId,
      };
      const params = Object.fromEntries(
        Object.entries(this.filterNonEmptyParams(exportParams)).filter(([_, value]) => value !== null && value !== undefined && value !== "")
      );
      if (this.quyu_selected !== null) {
        params.region = this.quyu_selected.label;
      }
      axios({
        url: "/userManage/userCharge/exportUserMeterBind",
        method: "GET",
        responseType: "blob",
        params,
        headers: {
          Authorization: this.token,
        },
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error("导出失败: " + response.statusText);
          }

          const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

          if (blob.size === 0) {
            ElMessage.warning("内容为空，无法下载");
            return;
          }

          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = "用户数据列表.xlsx";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(link.href);
        })
        .catch((error) => {
          console.error("导出失败:", error);
          ElMessage.error("导出失败: " + error.message);
        });
      return;
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
    handleNodeClick(data) {
      this.quyu_selected = data;
      console.log(this.quyu_selected);
      this.currentPage = 1;
      this.fetchUserList(1, { force: true });
    },
    getUserInfo() {
      this.param.order = this.getOrderValue(this.sortField, this.sortOrder);
      this.fetchUserList(1);
    },
    reflush() {
      this.fetchUserList(this.currentPage || 1);
    },
    clear(isSearch) {
      this.param = {
        userName: "",
        userId: "",
        imei: "",
        meterCode: null,
        meterType: "",
        meterVendor: "",
        battery: "",
        valveStatus: "",
        time: {
          type: "",
          accurateTime: "",
        },
        company: null,
        companyId: null,
        userPhone: "",
        userAddr: "", // 重置地址
        order: 0,
      };
      this.sortField = "time";
      this.sortOrder = "desc";
      if (typeof isSearch !== "number" || isNaN(isSearch)) {
        this.filterText = "";
        if (this.$refs.treeRef) {
          this.$refs.treeRef.setCurrentKey(null);
        }
        this.quyu_selected = null;
        this.currentPage = 1;
        this.fetchUserList(1, { force: true });
      }
    },
    search() {
      this.currentPage = 1;
      this.fetchUserList(1, { force: true });
    },
    // 显示价格详情
    showPriceDetail(row) {
      if (!row.priceId) {
        return ElMessage.warning("该用户未设置价格类型");
      }

      getPriceDetail(row.priceId)
        .then((res) => {
          if (res.code === 200) {
            this.viewData = res.data;
            this.view_dialogFormVisible = true;
          } else {
            ElMessage.error(res.msg || "获取价格详情失败");
          }
        })
        .catch((error) => {
          console.error("获取价格详情失败:", error);
          ElMessage.error("获取价格详情失败");
        });
    },


    // 显示短信配置详情
    showSmsDetail(row) {
      if (!row.smsConfigId) {
        return ElMessage.warning("该用户未设置短信配置");
      }

      console.log('查询短信配置ID:', row.smsConfigId);

      getSmsConfigDetail(row.smsConfigId)
        .then((res) => {
          console.log('API完整响应:', res);
          console.log('响应data:', res.data);

          if (res.code === 200) {
            this.smsViewData = res.data;
            console.log('smsViewData赋值后:', this.smsViewData);
            console.log('minimumBalanceThreshold值:', this.smsViewData.minimumBalanceThreshold);
            console.log('smsSendTime值:', this.smsViewData.smsSendTime);

            this.smsView_dialogFormVisible = true;
          } else {
            ElMessage.error(res.msg || "获取短信配置详情失败");
          }
        })
        .catch((error) => {
          console.error("获取短信配置详情失败:", error);
          ElMessage.error("获取短信配置详情失败");
        });
    },
    // 打开暂停记录弹窗
    pause_record_btn_click() {
      this.pause_record_dialogFormVisible = true;
    },
    // 关闭暂停记录弹窗
    closePauseRecordDialog() {
      this.pause_record_dialogFormVisible = false;
      this.multipleSelection = [];
      this.reflush();
    },

    // 打开销户记录弹窗
    close_record_btn_click() {
      this.close_record_dialogFormVisible = true;
    },
    // 关闭销户记录弹窗
    closeCloseRecordDialog() {
      this.close_record_dialogFormVisible = false;
      this.multipleSelection = [];
      this.reflush();
    },
    openSingleRefund(row) {
      this.singleRefundRow = row;
      this.singleRefundDialogVisible = true;
    },
    async handleSingleRefund() {
      this.singleRefundLoading = true;
      try {
        const form = {
          imei: this.singleRefundRow.imei,
          userId: this.singleRefundRow.userId,
          companyId: this.singleRefundRow.companyId,
          meterCode: this.singleRefundRow.meterCode,
          staffId: JSON.parse(sessionStorage.getItem("userData")).staffId
        };
        const res = await service.post("/userManage/userCharge/cancelRefund", form);
        if (res.code === 200) {
          ElMessage.success("余额退款成功");
          // 直接找到弹窗列表中当前这一行，修改禁用状态
          // 只修改弹窗内当前行对象，不请求接口刷新列表
          const target = this.batchCloseTipInfo.hasBalanceList.find(item => item.meterCode === this.singleRefundRow.meterCode);
          if (target) {
            target.isRefundBtnDisabled = true;
          }
          this.singleRefundDialogVisible = false;
        } else {
          ElMessage.error(res.msg || "退款失败");
        }
      } catch (err) {
        console.error(err);
        ElMessage.error("退款请求异常");
      } finally {
        this.singleRefundLoading = false;
      }
    },
    openAddRegionDialog() {
      this.addRegion_dialogFormVisible = true;
      this.addRegion.regionName = "";
      this.addRegionQuYuList = [];
      if (this.companyId !== 1) {
        this.addRegion.companyId = this.companyId;
        this.loadRegionListForAdd();
      } else {
        this.addRegion.companyId = null;
      }
    },
    closeAddRegionDialog() {
      this.addRegion_dialogFormVisible = false;
      this.addRegion.regionName = "";
      this.addRegionQuYuList = [];
    },
    async loadRegionListForAdd() {
      if (!this.addRegion.companyId) {
        this.addRegionQuYuList = [];
        return;
      }
      let url = `/getRegion?companyId=${this.addRegion.companyId}`;
      try {
        const response = await service.get(url);
        if (response.code === 200) {
          this.addRegionQuYuList = response.data.map(item => {
            return {
              regionId: item.regionId,
              regionName: item.regionName
            }
          })
        }
      } catch (error) {
        ElMessage.error("获取区域数据失败");
      }
    },
    openDeleteRegionDialog(){
      this.deleteRegion_dialogFormVisible = true;
      this.deleteRegion.regionIds = [];
      this.checkAll = false;
      this.indeterminate = false;
      this.regionList = [];
      if (this.companyId !== 1) {
        this.deleteRegion.companyId = this.companyId;
        this.getRegionDataForDelete();
      }else{
        this.deleteRegion.companyId = null;
      }
    },
    toggleRegionItem(regionId) {
      const index = this.deleteRegion.regionIds.indexOf(regionId)
      if (index > -1) {
        this.deleteRegion.regionIds.splice(index, 1)
      } else {
        this.deleteRegion.regionIds.push(regionId)
      }
    },
    handleCheckAll(val) {
      this.indeterminate = false;
      if (val) {
        this.deleteRegion.regionIds = this.regionList.map((_) => _.id);
      } else {
        this.deleteRegion.regionIds = [];
      }
    },
    getRegionDataForDelete() {
      if (!this.deleteRegion.companyId) {
        this.regionList = [];
        return;
      }
      let url = `/getRegion?companyId=${this.deleteRegion.companyId}`;
      service
          .get(`${url}`, {
            headers: {
              Authorization: this.token,
            },
          })
          .then((response) => {
            if (response.code === 200) {
              this.regionList = response.data.map((item) => {
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
    addRegion_confirm() {
      if (this.companyId != 1) {
        this.addRegion.companyId = this.companyId;
      }
      if (this.addRegion.companyId == null || this.addRegion.companyId == "") {
        ElMessage.error("所属水厂不能为空！");
        return;
      }
      if (this.addRegion.regionName == null || this.addRegion.regionName == "") {
        ElMessage.error("区域名称不能为空！");
        return;
      }
      this.addRegion.regionName = this.addRegion.regionName ? this.addRegion.regionName.trim() : this.addRegion.regionName;
      service
          .get(`/addRegion?companyId=${this.addRegion.companyId}&regionName=${this.addRegion.regionName}`)
          .then((response) => {
            if (response.code == 200) {
              ElMessage.success("区域添加成功");
              this.addRegion_dialogFormVisible = false;
              // 添加完刷新左侧树
              this.getRegionData();
            }
          })
          .catch((err) => {
            ElMessage.error("区域添加失败");
          });
    },
    deleteRegion_confirm() {
      this.flag = 1;
      if (!this.deleteRegion.regionIds || this.deleteRegion.regionIds.length === 0) {
        ElMessage.error("请选择要删除的区域！");
        this.flag = 1;
        return;
      }
      service
          .get(`/deleteRegion?regionIds=${this.deleteRegion.regionIds}`)
          .then((res) => {
            if (res.code == 200) {
              ElMessage.success("删除成功");
              this.deleteRegion_dialogFormVisible = false;
              this.deleteRegion.companyId = null;
              this.deleteRegion.regionIds = [];
              // 删除完刷新左侧区域树
              this.getRegionData();
            }
          })
          .catch((err) => {
            ElMessage.error("删除失败");
          })
          .finally(() => {
            this.flag = 1;
          });
    },
    cancelDeleteRegion() {
      this.flag = 1;
      this.deleteRegion_dialogFormVisible = false;
      this.deleteRegion.companyId = null;
      this.deleteRegion.regionIds = [];
      this.regionList = [];
      this.checkAll = false;
      this.indeterminate = false;
      this.$nextTick(() => {
        this.flag = 0;
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
  padding-bottom: 8px;
}

:deep(.el-tree-node__content) {
  height: 40px;
  line-height: 40px;
  border-radius: 5px;
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
  height: 100%;
  padding: 0px 15px;
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
  margin-top: 5px;
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
  width: 8%;
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

.time-input>* {
  width: 50%;
  margin-right: 20px;
}

.buttons {
  display: flex;
  width: 220px;
  height: 100%;
  align-items: center;
  position: absolute;
  right: 10px;
}

.buttons>* {
  width: 100px;
  margin-right: 10px;
}

.more-filter-btn {
  display: flex;
  justify-content: flex-start;
  justify-content: center;
  flex-direction: column;
  margin-right: 10px;
  flex-shrink: 0;
}

.more-filter-btn > span {
  font-size: 18px;
  margin-bottom: 5px;
}

.more-filter-trigger {
  font-size: 18px !important;
  font-weight: 550 !important;
  padding: 10px 20px !important;
  height: auto !important;
}

.filter-popover-content .el-checkbox {
  display: flex;
  margin: 6px 0;
}

.more-feature-btn {
  flex-shrink: 0;
}

.more-feature-trigger {
  font-size: 18px !important;
  font-weight: 550 !important;
  padding: 10px 20px !important;
  height: auto !important;
}

.feature-popover-content .el-checkbox {
  display: flex;
  margin: 6px 0;
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
  height: calc(100% - 120px);
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
  height: auto;
  margin-bottom: 0px;
  top: 5px;
  padding-left: 0px;
  gap: 10px;
  flex-wrap: wrap;
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
  justify-content: center;
  width: auto;
  min-width: 50px;
  height: 35px;
  padding: 0 8px;
  color: #5a5a5a;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 18px;
  background-color: #fff;
  border: 2px solid #f2f2f2;
}

.add-btn img,
.delete-btn img,
.command-btn img,
.recharge-btn img,
.recharge-record-btn img,
.water-meter-btn img,
.water-meter-record-btn img,
.export-in-btn img,
.export-out-btn img {
  margin-right: 6px;
  flex-shrink: 0;
}

.add-btn span,
.delete-btn span,
.command-btn span,
.recharge-btn span,
.recharge-record-btn span,
.water-meter-btn span,
.water-meter-record-btn span,
.export-in-btn span,
.export-out-btn span {
  color: #5a5a5a;
  white-space: nowrap;
}

.reflush {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fff;
  border: 2px solid #f2f2f2;
  flex-shrink: 0;
}

.user-list {
  width: 100%;
  height: calc(100% - 120px);
  display: flex;
  margin-top: 8px;
}

.quyu-box {
  width: 170px;
  height: 98%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fafafa;
  border-radius: 5px;
  padding: 10px;
  margin-right: 10px;
}

.quyu-box>* {
  width: 100%;
  margin-bottom: 5px;
}

.quyu-box>.el-tree {
  flex: 1;
  min-height: 0;
  width: 100%;
}

.quyu-box>.el-input ::placeholder {
  text-align: center;
}

.user-table {
  width: 80%;
  height: calc(100% - 30px);
  flex-grow: 1;
}

.page-box {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 0;
  pointer-events: none;
}

.page-box > * {
  pointer-events: auto;
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
  font-size: 20px;
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

/* 价格详情和短信配置详情弹窗样式 */
.test-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1999;
  background-color: rgb(31 33 38 / 15%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.test-dialog-content {
  width: 500px;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20px;
  max-height: 90vh;
  overflow-y: auto;
}

.test-dialog-content .test-content {
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
  min-height: 200px;
}

.test-item {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 20px;
}

.test-item-jieti {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 20px;
}

.jieti-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.jieti-item {
  display: flex;
  width: 100%;
  gap: 10px;
}

.jieti-range {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.test-input {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.test-input > span {
  font-size: 18px;
  margin-bottom: 5px;
  color: #575556;
}

.test-input .el-input {
  width: 100%;
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
</style>

// ... existing code ...


<style lang="scss" scoped>
:deep(.el-tree) {
  .is-current {
    >.el-tree-node__content {
      background-color: var(--el-tree-node-hover-bg-color);
      color: white;
    }
  }
}

.sortable-header {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
}

.sort-icons {
  display: flex;
  flex-direction: column;
  margin-left: 10px;
}

.asc-icon {
  background-image: url("@/assets/yonghu/icon25.png");
  background-repeat: no-repeat;
  background-size: contain;
  width: 12px;
  height: 12px;
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
  width: 12px;
  height: 12px;
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
.refund-mini-btn {
  display: inline-block;
  padding:2px 8px;
  background:#409eff;
  color:#fff;
  border-radius:4px;
  cursor:pointer;
  font-size:16px;
  transition: background 0.2s;
}
.refund-mini-btn:hover {
  background:#66b1ff;
}
.refund-mini-btn[disabled] {
  background:#c0c4cc;
  cursor:not-allowed;
}
.add-region-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.add-region-dialog-content{
  width: 35%;
  height: 20%;
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
.add-region {
  height: 100vh;
}
.add-region-content {
  border: 1px solid #fff;
  background-color: #fff;
  border-radius: 5px;
  width: 90%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-top: 20px;
  padding: 0 3%;
}
.add-region-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 45%;
}
.add-region-input > span {
  font-size: 20px;
  margin-bottom: 5px;
  color: #575556;
}
.add-region-input > .el-input {
  height: 35px;
  width: 100%;
}
.region-list-box {
  width:100%;
  flex:1;
  min-height:0;
  margin:10px 0;
  display:flex;
  flex-direction:column;
  max-height: 60vh;
}

.region-list-box-delete {
  width:100%;
  flex:1;
  min-height:0;
  margin:10px 0;
  display:flex;
  flex-direction:column;
  max-height: 70vh;
}

.region-table-scroll {
  flex:1;
  min-height:0;
  overflow-y:auto;
}

.region-grid-wrap {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 固定两列 */
  gap: 10px 16px; /* 上下间距10，左右间距16 */
}
.region-item {
  padding: 6px 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  text-align: center;
  background: #fff;
  color: #575556;
  transition: all 0.2s;
}

.region-item.active {
  background-color: #45ba7e;
  color: #ffffff;
  border-color: #45ba7e;
}
.region-item:hover:not(.active) {
  background: #f0f0f0;
}

.empty-box {
  grid-column: 1 / -1; /* 横跨整行两列 */
  text-align: center;
  color: #909399;
  padding: 20px 0;
}
</style>

<style scoped>
:deep(.el-input__inner) {
  font-size: 16px !important;
  font-size: 16px !important;
}
:deep(.el-select__wrapper .el-select__placeholder) {
  font-size: 16px !important;
}
:deep(.el-select__wrapper .el-select__selected-item) {
  font-size: 16px !important;
}
</style>
