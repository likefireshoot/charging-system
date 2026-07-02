<!--超级大文件，dialog全写里面了-->
<template>
  <div class="jiage-container">
    <div class="search-box">
      <div class="search-content">
        <div class="search-input" v-if="companyId === 1" style="margin-left: 10px">
          <span>所属水厂</span>
          <el-select class="big-font-el-select" v-model="params.company" placeholder="请选择所属水厂">
            <el-option v-for="item in companyList" :key="item.id" :value="item.id" :label="item.name"></el-option>
          </el-select>
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>价格编号</span>
          <el-input v-model="params.priceId" placeholder="请输入..." />
        </div>
        <div class="search-input" style="margin-left: 10px">
          <span>价格名称</span>
          <el-input v-model="params.priceName" placeholder="请输入..." />
        </div>
      </div>
      <div class="buttons">
        <div class="sercah-btn" @click="getPriceData">
          <img src="@/assets/yonghu/icon16.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 20px; margin-left: 15%">搜索</span>
        </div>
        <div class="clear-btn" @click="clear">
          <img src="@/assets/jiage/icon4.png" alt="" style="margin-left: 10px" />
          <span style="font-size: 20px; margin-left: 15%; color: #5a5a5a">清空</span>
        </div>
      </div>
    </div>
    <div class="jiage-info">
      <div class="command-box">
        <div class="add-btn" style="margin-left: 10px" @click="add_click" v-if="staffPermissionIds.includes(20)">
          <img src="@/assets/jiage/icon6.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">新增</span>
        </div>
        <div class="delete-btn" style="margin-left: 10px" @click="delete_click" v-if="staffPermissionIds.includes(21)">
          <img src="@/assets/jiage/icon4.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">删除</span>
        </div>
        <div class="edit-btn" style="margin-left: 10px" :class="{ 'btn-single-only-disabled': multipleSelection.length !== 1 }" @click="multipleSelection.length === 1 && edit_click()" v-if="staffPermissionIds.includes(22)">
          <img src="@/assets/jiage/icon3.png" alt="" style="margin-left: 8px" />
          <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">编辑</span>
        </div>
        <!-- <div class="export-in-btn" style="margin-left: 10px" @click="triggerFileInput">
          <img src="@/assets/jiage/icon1.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 16px; margin-left: 10px; color: #5a5a5a">导入</span>
          <input ref="fileInput" type="file" accept=".xls,.xlsx" style="display: none" @change="exportIn" />
        </div> -->
        <div class="export-out-btn" style="margin-left: 10px" @click="exportExcel">
          <img src="@/assets/yonghu/icon1.3.png" alt="" style="margin-left: 7px" />
          <span style="font-size: 20px; margin-left: 10px; color: #5a5a5a">导出</span>
        </div>
        <div class="reflush" style="margin-left: 10px" @click="reflush">
          <img src="@/assets/yonghu/icon15.png" alt="" />
        </div>
      </div>
      <div class="jiage-table">
        <el-table ref="multipleTableRef" :data="priceData" row-key="priceId"
          style="width: auto; height: 100%; table-layout: fixed; overflow-x: auto; overflow-y: auto" border
          :header-cell-style="{ background: '#46B97E', color: '#FFFFFF' }" @selection-change="handleSelectionChange"
          id="jiage-table" v-loading="isLoading">
          <el-table-column type="selection" :selectable="selectable" :width="selectionWidth" align="center" />
          <el-table-column label="序号" :width="idWidth" align="center" #default="scope">
            {{ scope.$index + 1 + (params.pageNo - 1) * params.pageSize }}
          </el-table-column>
          <el-table-column property="priceId" label="价格编号" :width="priceCodeWidth" align="center" />
          <el-table-column property="priceName" label="价格名称" :width="priceNameWidth" align="center" />
          <el-table-column property="amountZeroEnd" label="保底数值/吨" :width="baodiNumWidth" align="center" />
          <el-table-column property="priceZero" label="保底价格/元" :width="baodiPriceWidth" align="center" />
          <el-table-column property="stepNumber" label="阶梯数" :width="jietiNumWidth" align="center" />
          <el-table-column property="additionPrice" label="附加费/元" :width="fujiPriceWidth" align="center" />
          <el-table-column label="操作" :width="operationWidth" align="center">
            <template #default="scope">
              <span style="display: block; width: 100%; text-align: center; cursor: pointer"
                @click="viewDetail(scope.row)">
                <img src="@/assets/jiage/icon7.png" alt=""
                  style="margin-right: 15px; width: 20px; height: auto; cursor: pointer" />查看</span>
            </template>
          </el-table-column>
          <el-table-column property="companyName" label="所属水厂" :width="companyWidth" align="center" />
        </el-table>
      </div>
      <div class="page-box">
        <div class="demo-pagination-block">
          <el-pagination v-model:current-page="params.pageNo" v-model:page-size="params.pageSize"
            :page-sizes="[5, 10, 15]" layout="total,  prev, pager, next, jumper" :total="total"
          @current-change="handlePageChange"/>
        </div>
      </div>
    </div>
    <!-- 新增按钮弹出框 -->
    <div class="test-dialog" v-if="add_dialogFormVisible">
      <div class="test-dialog-content">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/jiage/icon6.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 20px">新增</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="add_dialogFormVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="test-content">
          <div class="test-item">
            <div class="test-input" style="margin-right: 1%">
              <span>价格名称</span>
              <el-input v-model="addData.priceName" />
            </div>
            <div class="test-input" style="margin-right: 1%">
              <span>保底数值/吨</span>
              <el-input v-model="addData.amountZeroEnd" />
            </div>
            <div class="test-input">
              <span>保底价格/元</span>
              <el-input v-model="addData.priceZero" />
            </div>
            <div class="test-input" style="margin-right: 1%">
              <span>阶梯数</span>
              <el-select v-model="addData.stepNumber">
                <el-option label="1" value="1"></el-option>
                <el-option label="2" value="2"></el-option>
                <el-option label="3" value="3"></el-option>
              </el-select>
            </div>
            <div class="test-input" style="margin-right: 1%">
              <span>附加费用/元</span>
              <el-input v-model="addData.additionPrice" />
            </div>
            <div class="test-input">
              <span>此日期后开户，开户当月不收保底费</span>
              <el-input v-model="addData.firstMonthNoBaseFeeDay" placeholder="请输入1-31" />
            </div>
          </div>
          <div class="test-item-jieti">
            <span style="font-size: 16px; color: #47b97e; margin-bottom: 10px">第一阶梯</span>
            <div class="jieti-content">
              <div class="jieti-item" style="width: 60%">
                <span>水量范围</span>
                <div class="jieti-range">
                  <el-input v-model="addData.amountFirstStart" :disabled="true" />
                  <span style="font-size: 20px; margin-bottom: 5px; align-self: center; margin: 0 5px">至</span>
                  <el-input v-model="addData.amountFirstEnd" />
                </div>
              </div>
              <div class="jieti-item" style="width: 35%">
                <span>价格（元/吨）</span>
                <el-input v-model="addData.priceFirst" />
              </div>
            </div>
          </div>
          <div class="test-item-jieti">
            <span style="font-size: 16px; color: #47b97e; margin-bottom: 10px">第二阶梯</span>
            <div class="jieti-content">
              <div class="jieti-item" style="width: 60%">
                <span>水量范围</span>
                <div class="jieti-range">
                  <!-- :disabled="addData.stepNumber === '1'" -->
                  <el-input v-model="addData.amountSecondStart" :disabled="true" />
                  <span style="font-size: 20px; margin-bottom: 5px; align-self: center; margin: 0 5px">至</span>
                  <el-input v-model="addData.amountSecondEnd" :disabled="addData.stepNumber === '1'" />
                </div>
              </div>
              <div class="jieti-item" style="width: 35%">
                <span>价格（元/吨）</span>
                <el-input v-model="addData.priceSecond" :disabled="addData.stepNumber === '1'" />
              </div>
            </div>
          </div>
          <div class="test-item-jieti">
            <span style="font-size: 16px; color: #47b97e; margin-bottom: 10px">第三阶梯</span>
            <div class="jieti-content">
              <div class="jieti-item" style="width: 60%">
                <span>水量范围</span>
                <div class="jieti-range">
                  <!-- :disabled="addData.stepNumber === '1' || addData.stepNumber === '2'" -->
                  <el-input v-model="addData.amountThirdStart" :disabled="true" />
                  <span style="font-size: 20px; margin-bottom: 5px; align-self: center; margin: 0 5px">至</span>
                  <el-input v-model="addData.amountThirdEnd"
                    :disabled="addData.stepNumber === '1' || addData.stepNumber === '2'" />
                </div>
              </div>
              <div class="jieti-item" style="width: 35%">
                <span>价格（元/吨）</span>
                <el-input v-model="addData.priceThird"
                  :disabled="addData.stepNumber === '1' || addData.stepNumber === '2'" />
              </div>
            </div>
          </div>
        </div>
        <div class="btn">
          <div class="confirm-btn" @click="addPrice">
            <el-icon style="margin-left: 15%">
              <Check />
            </el-icon>
            <span style="font-size: 20px; margin-left: 15%">确认</span>
          </div>
          <div class="cancel-btn" @click="add_cancel">
            <el-icon style="margin-left: 15%; color: #45ba7e">
              <Close />
            </el-icon>
            <span style="font-size: 20px; margin-left: 15%; color: #5a5a5a">取消</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 编辑按钮弹出框 -->
    <div class="test-dialog" v-if="edit_dialogFormVisible">
      <div class="test-dialog-content">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/jiage/icon3.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 20px">编辑</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="edit_dialogFormVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="test-content">
          <div class="test-item">
            <div class="test-input" style="margin-right: 1%">
              <span>价格名称</span>
              <el-input v-model="editData.priceName" />
            </div>
            <div class="test-input" style="margin-right: 1%">
              <span>保底数值/吨</span>
              <el-input v-model="editData.amountZeroEnd" />
            </div>
            <div class="test-input">
              <span>保底价格/元</span>
              <el-input v-model="editData.priceZero" />
            </div>
            <div class="test-input" style="margin-right: 1%">
              <span>阶梯数</span>
              <el-select v-model="editData.stepNumber">
                <el-option label="1" value="1"></el-option>
                <el-option label="2" value="2"></el-option>
                <el-option label="3" value="3"></el-option>
              </el-select>
            </div>
            <div class="test-input" style="margin-right: 1%">
              <span>附加费用/元</span>
              <el-input v-model="editData.additionPrice" />
            </div>
            <div class="test-input">
              <span>此日期后开户，开户当月不收保底费</span>
              <el-input v-model="editData.firstMonthNoBaseFeeDay" placeholder="请输入1-31" />
            </div>
            <!-- <div class="test-input" style="margin-right: 0">
              <span>所属水厂</span>
              <el-select v-model="editData.company" placeholder="请选择所属水厂">
                <el-option v-for="item in companyList" :key="item.id" :value="item.id" :label="item.name"></el-option>
              </el-select>
            </div> -->
          </div>
          <div class="test-item-jieti">
            <span style="font-size: 16px; color: #47b97e; margin-bottom: 10px">第一阶梯</span>
            <div class="jieti-content">
              <div class="jieti-item" style="width: 60%">
                <span>水量范围</span>
                <div class="jieti-range">
                  <el-input v-model="editData.amountFirstStart" />
                  <span style="font-size: 20px; margin-bottom: 5px; align-self: center; margin: 0 5px">至</span>
                  <el-input v-model="editData.amountFirstEnd" />
                </div>
              </div>
              <div class="jieti-item" style="width: 35%">
                <span>价格（元/吨）</span>
                <el-input v-model="editData.priceFirst" />
              </div>
            </div>
          </div>
          <div class="test-item-jieti">
            <span style="font-size: 16px; color: #47b97e; margin-bottom: 10px">第二阶梯</span>
            <div class="jieti-content">
              <div class="jieti-item" style="width: 60%">
                <span>水量范围</span>
                <div class="jieti-range">
                  <el-input v-model="editData.amountSecondStart" :disabled="editData.stepNumber === '1'" />
                  <span style="font-size: 20px; margin-bottom: 5px; align-self: center; margin: 0 5px">至</span>
                  <el-input v-model="editData.amountSecondEnd" :disabled="editData.stepNumber === '1'" />
                </div>
              </div>
              <div class="jieti-item" style="width: 35%">
                <span>价格（元/吨）</span>
                <el-input v-model="editData.priceSecond" :disabled="editData.stepNumber === '1'" />
              </div>
            </div>
          </div>
          <div class="test-item-jieti">
            <span style="font-size: 16px; color: #47b97e; margin-bottom: 10px">第三阶梯</span>
            <div class="jieti-content">
              <div class="jieti-item" style="width: 60%">
                <span>水量范围</span>
                <div class="jieti-range">
                  <el-input v-model="editData.amountThirdStart"
                    :disabled="editData.stepNumber === '1' || editData.stepNumber === '2'" />
                  <span style="font-size: 20px; margin-bottom: 5px; align-self: center; margin: 0 5px">至</span>
                  <el-input v-model="editData.amountThirdEnd"
                    :disabled="editData.stepNumber === '1' || editData.stepNumber === '2'" />
                </div>
              </div>
              <div class="jieti-item" style="width: 35%">
                <span>价格（元/吨）</span>
                <el-input v-model="editData.priceThird"
                  :disabled="editData.stepNumber === '1' || editData.stepNumber === '2'" />
              </div>
            </div>
          </div>
        </div>
        <div class="btn">
          <div class="confirm-btn" @click="editPrice">
            <el-icon style="margin-left: 15%">
              <Check />
            </el-icon>
            <span style="font-size: 20px; margin-left: 15%">确认</span>
          </div>
          <div class="cancel-btn" @click="edit_dialogFormVisible = false">
            <el-icon style="margin-left: 15%; color: #45ba7e">
              <Close />
            </el-icon>
            <span style="font-size: 20px; margin-left: 15%; color: #5a5a5a">取消</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 删除按钮弹出框 -->
    <div class="delete-dialog" v-if="delete_dialogFormVisible">
      <div class="delete-dialog-content-test">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/jiage/icon4.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 20px">删除</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="delete_dialogFormVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="delete-content">
          <el-icon style="margin-right: 10px; margin-top: 35px; font-size: 40px; color: #f33125" align-self="center">
            <WarningFilled />
          </el-icon>
          <span style="margin-top: 5px">删除后不可恢复，确认删除数据吗？</span>
        </div>
        <div class="btn">
          <div class="confirm-btn" @click="deletePrice">
            <el-icon style="margin-left: 5%">
              <Check />
            </el-icon>
            <span style="font-size: 20px; margin-left: 15%">确认</span>
          </div>
          <div class="cancel-btn" @click="delete_dialogFormVisible = false">
            <el-icon style="margin-left: 5%; color: #45ba7e">
              <Close />
            </el-icon>
            <span style="font-size: 20px; margin-left: 15%; color: #5a5a5a">取消</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 查看按钮弹出框 -->
    <div class="test-dialog" v-if="view_dialogFormVisible">
      <div class="test-dialog-content" style="min-height: 450px">
        <div class="title">
          <div style="margin-left: 10px; display: flex; align-items: center">
            <img src="@/assets/jiage/icon5.png" alt="" style="margin-right: 10px" />
            <span style="font-size: 20px">查看</span>
          </div>
          <div style="margin-right: 10px; cursor: pointer" @click="view_dialogFormVisible = false">
            <img src="@/assets/close.png" alt="" />
          </div>
        </div>
        <div class="test-content" style="min-height: 450px">
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
            <div class="test-input">
              <span>此日期后开户，开户当月不收保底费</span>
              <el-input v-model="viewData.firstMonthNoBaseFeeDay" disabled />
            </div>
            <!-- <div class="test-input" style="margin-right: 0">
              <span>所属水厂</span>
              <el-input v-model="viewData.company" disabled />
            </div> -->
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
        priceId: null,
        priceName: null,
        company: null,
        pageNo: 1,
        pageSize: 50,
        companyId: null,
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      staffPermissionIds: JSON.parse(sessionStorage.getItem("userData")).staffPermissionIds,
      priceData: [],
      multipleSelection: [],
      addData: {
        priceName: null,
        stepNumber: null,
        additionPrice: null,
        amountZeroStart: 0,
        amountZeroEnd: null,
        firstMonthNoBaseFeeDay: 25,
        priceZero: null,
        amountFirstStart: null,
        amountFirstEnd: null,
        priceFirst: null,
        amountSecondStart: null,
        amountSecondEnd: null,
        priceSecond: null,
        amountThirdStart: null,
        amountThirdEnd: null,
        priceThird: null,
        companyId: null,
      },
      editData: {
        priceName: null,
        stepNumber: null,
        additionPrice: null,
        amountZeroStart: 0,
        amountZeroEnd: null,
        firstMonthNoBaseFeeDay: 25,
        priceZero: null,
        amountFirstStart: null,
        amountFirstEnd: null,
        priceFirst: null,
        amountSecondStart: null,
        amountSecondEnd: null,
        priceSecond: null,
        amountThirdStart: null,
        amountThirdEnd: null,
        priceThird: null,
        companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
        priceId: null,
      },
      viewData: {},
      total: null,

      // 每列实际宽度
      selectionWidth: 0,
      idWidth: 0,
      priceCodeWidth: 0,
      priceNameWidth: 0,
      baodiNumWidth: 0,
      baodiPriceWidth: 0,
      jietiNumWidth: 0,
      fujiPriceWidth: 0,
      operationWidth: 0,
      companyWidth: 0,
      // 父容器元素
      parentContainer: null,
      // ResizeObserver 实例
      resizeObserver: null,

      //弹出框显示与否
      delete_dialogFormVisible: false,
      add_dialogFormVisible: false,
      edit_dialogFormVisible: false,
      view_dialogFormVisible: false,

      //表格勾选行
      selection: [],
      companyList: [],

      // ****** 翻页状态锁，防止抖动 ******
      isLoading: false
    };
  },
  watch: {
    // "params.pageNo": {
    //   handler() {
    //     this.getPriceData();
    //   },
    // },
    "addData.amountZeroEnd": function (newVal) {
      if (parseFloat(newVal) === 0) {
        this.addData.amountFirstStart = "0";
      } else {
        this.addData.amountFirstStart = (parseFloat(newVal)).toFixed(2);
      }
    },
    "addData.amountFirstEnd": function (newVal) {
      if (parseInt(this.addData.stepNumber) > 1) {
        this.addData.amountSecondStart = (parseFloat(newVal)).toFixed(2);
      }
    },
    "addData.amountSecondEnd": function (newVal) {
      if (parseInt(this.addData.stepNumber) > 2) {
        this.addData.amountThirdStart = (parseFloat(newVal)).toFixed(2);
      }
    },
    "addData.stepNumber": function (newVal) {
      if (parseInt(newVal) === 1) {
        this.addData.amountSecondStart = null;
        this.addData.amountSecondEnd = null;
        this.addData.amountThirdStart = null;
        this.addData.amountThirdEnd = null;
      } else if (parseInt(newVal) === 2) {
        this.addData.amountThirdStart = null;
        this.addData.amountThirdEnd = null;
      }
    },
    "editData.amountZeroEnd": function (newVal) {
      if (!this.editData) return; // 如果 editData 还未初始化，直接返回
      if (parseFloat(newVal) === 0) {
        this.editData.amountFirstStart = "0";
      } else {
        this.editData.amountFirstStart = (parseFloat(newVal)).toFixed(2);
      }
    },
    "editData.amountFirstEnd": function (newVal) {
      if (!this.editData) return; // 如果 editData 还未初始化，直接返回
      if (parseInt(this.editData.stepNumber) > 1) {
        this.editData.amountSecondStart = (parseFloat(newVal)).toFixed(2);
      }
    },
    "editData.amountSecondEnd": function (newVal) {
      if (!this.editData) return; // 如果 editData 还未初始化，直接返回
      if (parseInt(this.editData.stepNumber) > 2) {
        this.editData.amountThirdStart = (parseFloat(newVal)).toFixed(2);
      }
    },
    "editData.stepNumber": function (newVal) {
      if (!this.editData) return; // 如果 editData 还未初始化，直接返回
      if (parseInt(newVal) === 1) {
        this.editData.amountSecondStart = 0;
        this.editData.amountSecondEnd = 0;
        this.editData.priceSecond = 0;
        this.editData.amountThirdStart = 0;
        this.editData.amountThirdEnd = 0;
        this.editData.priceThird = 0;
      } else if (parseInt(newVal) === 2) {
        this.editData.amountThirdStart = 0;
        this.editData.amountThirdEnd = 0;
        this.editData.priceThird = 0;
      }
    },
  },
  computed: {
    // 每列的百分比宽度
    columnPercentages() {
      return {
        selection: 5,
        id: 8,
        price_code: 10,
        price_name: 11,
        baodi_num: 10,
        baodi_price: 10,
        jieti_num: 10,
        fuji_price: 10,
        operation: 12,
        company: 12,
      };
    },
  },
  mounted() {
    // 获取父容器元素
    this.parentContainer = document.querySelector(".jiage-table");
    // 初始化列宽
    this.calculateColumnWidths();

    // 创建 ResizeObserver 实例并监听父容器宽度变化
    this.resizeObserver = new ResizeObserver(this.calculateColumnWidths);
    if (this.parentContainer) {
      this.resizeObserver.observe(this.parentContainer);
    }
    this.getCompanyList();
    this.getPriceData();
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
      this.params.pageNo = page;
      this.getPriceData();
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
    selectable() {
      return true; // 目前允许所有行选择，你可以加上你的业务逻辑
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    add_click() {
      this.addData = {
        priceName: null,
        stepNumber: null,
        additionPrice: null,
        amountZeroStart: 0,
        amountZeroEnd: null,
        firstMonthNoBaseFeeDay: 25,
        priceZero: null,
        amountFirstStart: null,
        amountFirstEnd: null,
        priceFirst: null,
        amountSecondStart: null,
        amountSecondEnd: null,
        priceSecond: null,
        amountThirdStart: null,
        amountThirdEnd: null,
        priceThird: null,
      };
      this.add_dialogFormVisible = true;
    },
    delete_click() {
      if (this.multipleSelection.length > 0) {
        this.delete_dialogFormVisible = true;
      } else {
        ElMessage.warning("请选择需要删除的数据");
      }
    },
    edit_click() {
      if (this.multipleSelection.length > 0) {
        const row = this.multipleSelection[0];
        this.editData = {
          ...row,
          firstMonthNoBaseFeeDay: row.firstMonthNoBaseFeeDay ?? 25,
          stepNumber: String(row.stepNumber ?? ''),
        };
        this.edit_dialogFormVisible = true;
      } else {
        ElMessage.warning("请选择需要编辑的数据");
      }
    },
    // 计算列宽的函数
    calculateColumnWidths() {
      if (this.parentContainer) {
        const parentWidth = this.parentContainer.offsetWidth;
        this.selectionWidth = (this.columnPercentages.selection / 100) * parentWidth;
        this.idWidth = (this.columnPercentages.id / 100) * parentWidth;
        this.priceCodeWidth = (this.columnPercentages.price_code / 100) * parentWidth;
        this.priceNameWidth = (this.columnPercentages.price_name / 100) * parentWidth;
        this.baodiNumWidth = (this.columnPercentages.baodi_num / 100) * parentWidth;
        this.baodiPriceWidth = (this.columnPercentages.baodi_price / 100) * parentWidth;
        this.jietiNumWidth = (this.columnPercentages.jieti_num / 100) * parentWidth;
        this.fujiPriceWidth = (this.columnPercentages.fuji_price / 100) * parentWidth;
        this.operationWidth = (this.columnPercentages.operation / 100) * parentWidth;
        this.companyWidth = (this.columnPercentages.company / 100) * parentWidth;
      }
    },
    viewDetail(row) {
      this.viewData = {
        ...row,
        firstMonthNoBaseFeeDay: row.firstMonthNoBaseFeeDay ?? 25,
      };
      this.view_dialogFormVisible = true;
    },
    add_cancel() {
      this.add_dialogFormVisible = false;
      this.addData = {
        priceName: null,
        stepNumber: null,
        additionPrice: null,
        amountZeroStart: 0,
        amountZeroEnd: null,
        firstMonthNoBaseFeeDay: 25,
        priceZero: null,
        amountFirstStart: null,
        amountFirstEnd: null,
        priceFirst: null,
        amountSecondStart: null,
        amountSecondEnd: null,
        priceSecond: null,
        amountThirdStart: null,
        amountThirdEnd: null,
        priceThird: null,
      };
    },
    getPriceData() {
      if (this.isLoading) return;
      this.isLoading = true;
      console.log(this.params);
      if (this.companyId === 1) {
        if (this.params.company) {
          this.params.companyId = this.params.company; // 所属水厂ID
        }
      } else {
        this.params.companyId = this.companyId; // 所属水厂ID
      }
      service
        .post("/price/queryPriceMg", this.params)
        .then((response) => {
          if (response.code === 200) {
            this.total = response.data.total;
            this.priceData = response.data.records;
            // this.params.pageNo = response.data.current;
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        }).finally(()=>{
          this.isLoading = false
      });
    },
    addPrice() {
      if (!this.validateAddData()) {
        return;
      }
      this.addData.companyId = JSON.parse(sessionStorage.getItem("userData")).companyId;
      console.log(this.addData);
      Object.keys(this.addData).forEach((key) => {
        if (typeof this.addData[key] === "string") {
          this.addData[key] = this.addData[key].trim();
        }
      });
      service
        .post("/price/addPriceMg", this.addData)
        .then((response) => {
          if (response.code === 200) {
            ElMessage.success("添加成功");
            this.getPriceData();
            this.add_dialogFormVisible = false;
            //this.getPriceData();
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error?.response?.data?.msg || error?.message || "操作失败");
        });
    },
    editPrice() {
      if (!this.validateEditData()) {
        return;
      }
      Object.keys(this.editData).forEach((key) => {
        if (typeof this.editData[key] === "string") {
          this.editData[key] = this.editData[key].trim();
        }
      });
      service
        .post("/price/editPriceMg", this.editData)
        .then((response) => {
          if (response.code === 200) {
            ElMessage.success("修改成功");
            this.getPriceData();
            this.edit_dialogFormVisible = false;
            //this.getPriceData();
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error?.response?.data?.msg || error?.message || "操作失败");
        });
    },
    deletePrice() {
      // 检查是否存在默认配置
      const hasDefault = this.multipleSelection.some((item) => item.priceId === 65);

      if (hasDefault) {
        ElMessage.warning("该配置为默认价格配置，无法删除！");
        this.delete_dialogFormVisible = false;
        this.multipleSelection = [];
        this.reflush();
        return; // 终止函数执行
      }

      // 若没有默认配置，继续处理删除逻辑
      const priceIds = this.multipleSelection.map((item) => item.priceId);
      console.log(priceIds);

      const requestBody = {
        priceIds: priceIds,
      };

      service
        .post("/price/deletePriceMg", requestBody)
        .then((response) => {
          if (response.code === 200) {
            ElMessage.success("删除成功");
            this.delete_dialogFormVisible = false;
            this.reflush();
            this.multipleSelection = [];
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error);
        });
    },
    clear(isSearch) {
      this.params.priceName = null;
      this.params.priceId = null;
      this.params.company = null;
      this.params.companyId = null;
      if (typeof isSearch != 'number' || isNaN(isSearch)) {//如果不是数字就搜索
        this.getPriceData();
      }
    },
    reflush() {
      this.clear(1);
      this.params.pageNo = 1;
      this.params.pageSize = 50;
      let params = { priceId: null, priceName: null, pageNo: 1, pageSize: 50 };
      if (this.companyId === 1) {
        if (this.params.company) {
          params.companyId = this.params.company; // 所属水厂ID
        }
      } else {
        params.companyId = this.companyId; // 所属水厂ID
      }
      service
        .post("/price/queryPriceMg", params)
        .then((response) => {
          if (response.code === 200) {
            this.total = response.data.total;
            this.priceData = response.data.records;
            this.params.pageNo = 1;
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
        const response = await service.post("/uploadPriceList", formData);
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
        ...this.params,
        companyId: this.companyId === 1 ? this.params.company || null : this.companyId,
      };
      delete exportParams.company;
      delete exportParams.pageNo;
      delete exportParams.pageSize;
      const requestParams = Object.fromEntries(Object.entries(exportParams).filter(([_, value]) => value !== null && value !== ""));
      axios({
        url: "/price/exportPriceReport",
        method: "POST",
        responseType: "blob",
        data: requestParams,
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
          link.download = "价格数据列表.xlsx";
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
      let url = "";
      let params = {};
      if (this.companyId === 1) {
        if (this.params.company) {
          params.companyId = this.params.company; // 所属水厂ID
          url = `/price/exportPriceReport?companyId=${params.companyId}`; // 后端接口地址
        } else {
          url = `/price/exportPriceReport`; // 后端接口地址
        }
      } else {
        params.companyId = this.companyId; // 所属水厂ID
        url = `/price/exportPriceReport?companyId=${params.companyId}`;
      }
      // 调用后端接口
      axios({
        url: url, // 后端接口地址
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
          link.download = "价格数据列表.xlsx"; // 设置下载文件名
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
    // validateAddData() {
    //   const { priceName, amountZeroEnd, priceZero, stepNumber, additionPrice, amountFirstStart, amountFirstEnd, amountSecondStart, amountSecondEnd, amountThirdStart, amountThirdEnd } = this.addData;


    //   // 非空校验
    //   if (!priceName) {
    //     this.$message.error("价格名称不能为空");
    //     return false;
    //   }
    //   if (!amountZeroEnd) {
    //     this.$message.error("保底数值不能为空");
    //     return false;
    //   }
    //   if(amountZeroEnd<0){
    //     this.$message.error("保底数值不能小于零");
    //     return false;
    //   }
    //   if (priceZero === null || priceZero === "" || isNaN(parseFloat(priceZero))) {
    //     this.$message.error("保底价格不能为空");
    //     return false;
    //   }
    //   if (!stepNumber) {
    //     this.$message.error("阶梯数不能为空");
    //     return false;
    //   }
    //   if (additionPrice === null || additionPrice === "" || isNaN(parseFloat(additionPrice))) {
    //     this.$message.error("附加费用不能为空");
    //     return false;
    //   }

    //   // 检查第一阶梯开始值是否不超过保底数值
    //   const zeroEndValue = parseFloat(this.addData.amountZeroEnd);
    //   const firstStartValue = parseFloat(this.addData.amountFirstStart);
    //   console.log(zeroEndValue, firstStartValue);
    //   console.log(typeof zeroEndValue, typeof firstStartValue);
    //   if (firstStartValue < zeroEndValue) {
    //     this.$message.error("第一阶梯开始值小于保底数值");
    //     return false;
    //   }

    //   // 检查每一阶梯开始值是否小于结束值
    //   if (parseFloat(amountFirstStart) >= parseFloat(amountFirstEnd)) {
    //     this.$message.error("第一阶梯开始值必须小于结束值");
    //     return false;
    //   }

    //   if (parseFloat(stepNumber) > 1) {
    //     const firstEnd = parseFloat(amountFirstEnd);
    //     this.addData.amountSecondStart = (firstEnd + 0.01).toFixed(2);

    //     if (firstEnd >= parseFloat(this.addData.amountSecondStart)) {
    //       this.$message.error("第一阶梯结束值必须小于第二阶梯开始值");
    //       return false;
    //     }

    //     if (parseFloat(this.addData.amountSecondStart) >= parseFloat(amountSecondEnd)) {
    //       this.$message.error("第二阶梯开始值必须小于结束值");
    //       return false;
    //     }
    //   }

    //   if (parseFloat(stepNumber) > 2) {
    //     const secondEnd = parseFloat(amountSecondEnd);
    //     this.addData.amountThirdStart = (secondEnd + 0.01).toFixed(2);

    //     if (secondEnd >= parseFloat(this.addData.amountThirdStart)) {
    //       this.$message.error("第二阶梯结束值必须小于第三阶梯开始值");
    //       return false;
    //     }

    //     if (parseFloat(this.addData.amountThirdStart) >= parseFloat(amountThirdEnd)) {
    //       this.$message.error("第三阶梯开始值必须小于结束值");
    //       return false;
    //     }
    //   }

    //   return true;
    // },
    // validateEditData() {
    //   const { priceName, amountZeroEnd, priceZero, stepNumber, additionPrice, amountFirstStart, amountFirstEnd, amountSecondStart, amountSecondEnd, amountThirdStart, amountThirdEnd } = this.editData;
    //   // 非空校验
    //   if (!priceName) {
    //     this.$message.error("价格名称不能为空");
    //     return false;
    //   }
    //   if (amountZeroEnd === null || amountZeroEnd === "" || isNaN(parseFloat(amountZeroEnd))) {
    //     this.$message.error("保底数值不能为空");
    //     return false;
    //   }
    //   if (priceZero === null || priceZero === "" || isNaN(parseFloat(priceZero))) {
    //     this.$message.error("保底价格不能为空");
    //     return false;
    //   }
    //   if (!stepNumber) {
    //     this.$message.error("阶梯数不能为空");
    //     return false;
    //   }
    //   if (additionPrice === null || additionPrice === "" || isNaN(parseFloat(additionPrice))) {
    //     this.$message.error("附加费用不能为空");
    //     return false;
    //   }

    //   // 检查第一阶梯开始值是否不超过保底数值
    //   const zeroEndValue = parseFloat(this.editData.amountZeroEnd);
    //   const firstStartValue = parseFloat(this.editData.amountFirstStart);
    //   if (firstStartValue < zeroEndValue) {
    //     this.$message.error("第一阶梯开始值小于保底数值");
    //     return false;
    //   }

    //   // 检查每一阶梯开始值是否小于结束值
    //   if (parseFloat(amountFirstStart) >= parseFloat(amountFirstEnd)) {
    //     this.$message.error("第一阶梯开始值必须小于结束值");
    //     return false;
    //   }

    //   if (parseFloat(stepNumber) > 1) {
    //     const firstEnd = parseFloat(amountFirstEnd);
    //     this.editData.amountSecondStart = (firstEnd + 0.01).toFixed(2);

    //     if (firstEnd >= parseFloat(this.editData.amountSecondStart)) {
    //       this.$message.error("第一阶梯结束值必须小于第二阶梯开始值");
    //       return false;
    //     }

    //     if (parseFloat(this.editData.amountSecondStart) >= parseFloat(amountSecondEnd)) {
    //       this.$message.error("第二阶梯开始值必须小于结束值");
    //       return false;
    //     }
    //   }

    //   if (parseFloat(stepNumber) > 2) {
    //     const secondEnd = parseFloat(amountSecondEnd);
    //     this.editData.amountThirdStart = (secondEnd + 0.01).toFixed(2);

    //     if (secondEnd >= parseFloat(this.editData.amountThirdStart)) {
    //       this.$message.error("第二阶梯结束值必须小于第三阶梯开始值");
    //       return false;
    //     }

    //     if (parseFloat(this.editData.amountThirdStart) >= parseFloat(amountThirdEnd)) {
    //       this.$message.error("第三阶梯开始值必须小于结束值");
    //       return false;
    //     }
    //   }

    //   return true;
    // },
    validateFirstMonthNoBaseFeeDay(day) {
      const dayVal = Number(day);
      if (!Number.isInteger(dayVal) || dayVal < 1 || dayVal > 31) {
        ElMessage.error("此日期后开户，开户当月不收保底费必须是1-31之间的整数");
        return false;
      }
      return true;
    },

    // ========== 1. 新增价格配置 - 增强参数校验 ==========
    validateAddData() {
      // 先统一去除所有字符串参数的首尾空格
      Object.keys(this.addData).forEach((key) => {
        if (typeof this.addData[key] === "string") {
          this.addData[key] = this.addData[key].trim();
        }
      });

      const {
        priceName, amountZeroEnd, priceZero, stepNumber, additionPrice, firstMonthNoBaseFeeDay,
        amountFirstStart, amountFirstEnd, priceFirst,
        amountSecondStart, amountSecondEnd, priceSecond,
        amountThirdStart, amountThirdEnd, priceThird
      } = this.addData;

      // ========== 基础非空+格式校验 ==========
      // 价格名称：非空 + 长度限制（2-50字）
      if (!priceName) {
        ElMessage.error("价格名称不能为空");
        return false;
      }
      if (priceName.length < 2 || priceName.length > 50) {
        ElMessage.error("价格名称长度需在2-50字之间");
        return false;
      }

      // 保底数值：非空 + 非负 + 数字 + 最多2位小数
      if (amountZeroEnd === null || amountZeroEnd === "" || isNaN(parseFloat(amountZeroEnd))) {
        ElMessage.error("保底数值不能为空且必须为有效数字");
        return false;
      }
      const amountZeroEndVal = parseFloat(amountZeroEnd);
      if (amountZeroEndVal < 0) {
        ElMessage.error("保底数值不能小于零");
        return false;
      }
      if (amountZeroEndVal.toString().split(".")[1]?.length > 2) {
        ElMessage.error("保底数值最多保留2位小数");
        return false;
      }

      // 保底价格：非空 + 非负 + 数字 + 最多2位小数
      if (priceZero === null || priceZero === "" || isNaN(parseFloat(priceZero))) {
        ElMessage.error("保底价格不能为空且必须为有效数字");
        return false;
      }
      const priceZeroVal = parseFloat(priceZero);
      if (priceZeroVal < 0) {
        ElMessage.error("保底价格不能小于零");
        return false;
      }
      if (priceZeroVal.toString().split(".")[1]?.length > 2) {
        ElMessage.error("保底价格最多保留2位小数");
        return false;
      }

      // 阶梯数：非空 + 只能是1/2/3
      if (!stepNumber || !["1", "2", "3"].includes(String(stepNumber))) {
        ElMessage.error("阶梯数不能为空且只能选择1、2、3");
        return false;
      }
      const stepNumberVal = parseInt(stepNumber);

      // 附加费：非空 + 非负 + 数字 + 最多2位小数
      if (additionPrice === null || additionPrice === "" || isNaN(parseFloat(additionPrice))) {
        ElMessage.error("附加费用不能为空且必须为有效数字");
        return false;
      }
      const additionPriceVal = parseFloat(additionPrice);
      if (additionPriceVal < 0) {
        ElMessage.error("附加费用不能小于零");
        return false;
      }
      if (additionPriceVal.toString().split(".")[1]?.length > 2) {
        ElMessage.error("附加费用最多保留2位小数");
        return false;
      }

      if (!this.validateFirstMonthNoBaseFeeDay(firstMonthNoBaseFeeDay)) {
        return false;
      }

      // ========== 第一阶梯校验（必选） ==========
      // 第一阶梯开始值：非空 + 数字 + ≥保底数值
      if (amountFirstStart === null || amountFirstStart === "" || isNaN(parseFloat(amountFirstStart))) {
        ElMessage.error("第一阶梯开始值不能为空且必须为有效数字");
        return false;
      }
      const amountFirstStartVal = parseFloat(amountFirstStart);
      if (amountFirstStartVal < amountZeroEndVal) {
        ElMessage.error("第一阶梯开始值不能小于保底数值");
        return false;
      }

      // 第一阶梯结束值：非空 + 数字 + >开始值 + 最多2位小数
      if (amountFirstEnd === null || amountFirstEnd === "" || isNaN(parseFloat(amountFirstEnd))) {
        ElMessage.error("第一阶梯结束值不能为空且必须为有效数字");
        return false;
      }
      const amountFirstEndVal = parseFloat(amountFirstEnd);
      if (amountFirstEndVal <= amountFirstStartVal) {
        ElMessage.error("第一阶梯开始值必须小于结束值");
        return false;
      }
      if (amountFirstEndVal.toString().split(".")[1]?.length > 2) {
        ElMessage.error("第一阶梯结束值最多保留2位小数");
        return false;
      }

      // 第一阶梯价格：非空 + 非负 + 数字 + 最多2位小数
      if (priceFirst === null || priceFirst === "" || isNaN(parseFloat(priceFirst))) {
        ElMessage.error("第一阶梯价格不能为空且必须为有效数字");
        return false;
      }
      const priceFirstVal = parseFloat(priceFirst);
      if (priceFirstVal < 0) {
        ElMessage.error("第一阶梯价格不能小于零");
        return false;
      }
      if (priceFirstVal.toString().split(".")[1]?.length > 2) {
        ElMessage.error("第一阶梯价格最多保留2位小数");
        return false;
      }

      // ========== 第二阶梯校验（阶梯数≥2时必选） ==========
      if (stepNumberVal > 1) {
        // 第二阶梯开始值：非空 + 数字 + >第一阶梯结束值
        if (amountSecondStart === null || amountSecondStart === "" || isNaN(parseFloat(amountSecondStart))) {
          ElMessage.error("第二阶梯开始值不能为空且必须为有效数字");
          return false;
        }
        const amountSecondStartVal = parseFloat(amountSecondStart);
        if (amountSecondStartVal < amountFirstEndVal) {
          ElMessage.error("第二阶梯开始值必须大于第一阶梯结束值");
          return false;
        }

        // 第二阶梯结束值：非空 + 数字 + >开始值 + 最多2位小数
        if (amountSecondEnd === null || amountSecondEnd === "" || isNaN(parseFloat(amountSecondEnd))) {
          ElMessage.error("第二阶梯结束值不能为空且必须为有效数字");
          return false;
        }
        const amountSecondEndVal = parseFloat(amountSecondEnd);
        if (amountSecondEndVal <= amountSecondStartVal) {
          ElMessage.error("第二阶梯开始值必须小于结束值");
          return false;
        }
        if (amountSecondEndVal.toString().split(".")[1]?.length > 2) {
          ElMessage.error("第二阶梯结束值最多保留2位小数");
          return false;
        }

        // 第二阶梯价格：非空 + 非负 + 数字 + 最多2位小数
        if (priceSecond === null || priceSecond === "" || isNaN(parseFloat(priceSecond))) {
          ElMessage.error("第二阶梯价格不能为空且必须为有效数字");
          return false;
        }
        const priceSecondVal = parseFloat(priceSecond);
        if (priceSecondVal < 0) {
          ElMessage.error("第二阶梯价格不能小于零");
          return false;
        }
        if (priceSecondVal.toString().split(".")[1]?.length > 2) {
          ElMessage.error("第二阶梯价格最多保留2位小数");
          return false;
        }
      }

      // ========== 第三阶梯校验（阶梯数≥3时必选） ==========
      if (stepNumberVal > 2) {
        // 第三阶梯开始值：非空 + 数字 + >第二阶梯结束值
        if (amountThirdStart === null || amountThirdStart === "" || isNaN(parseFloat(amountThirdStart))) {
          ElMessage.error("第三阶梯开始值不能为空且必须为有效数字");
          return false;
        }
        const amountThirdStartVal = parseFloat(amountThirdStart);
        if (amountThirdStartVal < parseFloat(amountSecondEnd)) {
          ElMessage.error("第三阶梯开始值必须大于第二阶梯结束值");
          return false;
        }

        // 第三阶梯结束值：非空 + 数字 + >开始值 + 最多2位小数
        if (amountThirdEnd === null || amountThirdEnd === "" || isNaN(parseFloat(amountThirdEnd))) {
          ElMessage.error("第三阶梯结束值不能为空且必须为有效数字");
          return false;
        }
        const amountThirdEndVal = parseFloat(amountThirdEnd);
        if (amountThirdEndVal <= amountThirdStartVal) {
          ElMessage.error("第三阶梯开始值必须小于结束值");
          return false;
        }
        if (amountThirdEndVal.toString().split(".")[1]?.length > 2) {
          ElMessage.error("第三阶梯结束值最多保留2位小数");
          return false;
        }

        // 第三阶梯价格：非空 + 非负 + 数字 + 最多2位小数
        if (priceThird === null || priceThird === "" || isNaN(parseFloat(priceThird))) {
          ElMessage.error("第三阶梯价格不能为空且必须为有效数字");
          return false;
        }
        const priceThirdVal = parseFloat(priceThird);
        if (priceThirdVal < 0) {
          ElMessage.error("第三阶梯价格不能小于零");
          return false;
        }
        if (priceThirdVal.toString().split(".")[1]?.length > 2) {
          ElMessage.error("第三阶梯价格最多保留2位小数");
          return false;
        }
      }

      return true;
    },

    // ========== 2. 编辑价格配置 - 增强参数校验 ==========
    validateEditData() {
      // 先统一去除所有字符串参数的首尾空格
      Object.keys(this.editData).forEach((key) => {
        if (typeof this.editData[key] === "string") {
          this.editData[key] = this.editData[key].trim();
        }
      });

      const {
        priceName, amountZeroEnd, priceZero, stepNumber, additionPrice, firstMonthNoBaseFeeDay,
        amountFirstStart, amountFirstEnd, priceFirst,
        amountSecondStart, amountSecondEnd, priceSecond,
        amountThirdStart, amountThirdEnd, priceThird
      } = this.editData;

      // ========== 基础非空+格式校验（同新增逻辑） ==========
      if (!priceName) {
        ElMessage.error("价格名称不能为空");
        return false;
      }
      if (priceName.length < 2 || priceName.length > 50) {
        ElMessage.error("价格名称长度需在2-50字之间");
        return false;
      }

      if (amountZeroEnd === null || amountZeroEnd === "" || isNaN(parseFloat(amountZeroEnd))) {
        ElMessage.error("保底数值不能为空且必须为有效数字");
        return false;
      }
      const amountZeroEndVal = parseFloat(amountZeroEnd);
      if (amountZeroEndVal < 0) {
        ElMessage.error("保底数值不能小于零");
        return false;
      }
      if (amountZeroEndVal.toString().split(".")[1]?.length > 2) {
        ElMessage.error("保底数值最多保留2位小数");
        return false;
      }

      if (priceZero === null || priceZero === "" || isNaN(parseFloat(priceZero))) {
        ElMessage.error("保底价格不能为空且必须为有效数字");
        return false;
      }
      const priceZeroVal = parseFloat(priceZero);
      if (priceZeroVal < 0) {
        ElMessage.error("保底价格不能小于零");
        return false;
      }
      if (priceZeroVal.toString().split(".")[1]?.length > 2) {
        ElMessage.error("保底价格最多保留2位小数");
        return false;
      }

      if (!stepNumber || !["1", "2", "3"].includes(String(stepNumber))) {
        ElMessage.error("阶梯数不能为空且只能选择1、2、3");
        return false;
      }
      const stepNumberVal = parseInt(stepNumber);

      if (additionPrice === null || additionPrice === "" || isNaN(parseFloat(additionPrice))) {
        ElMessage.error("附加费用不能为空且必须为有效数字");
        return false;
      }
      const additionPriceVal = parseFloat(additionPrice);
      if (additionPriceVal < 0) {
        ElMessage.error("附加费用不能小于零");
        return false;
      }
      if (additionPriceVal.toString().split(".")[1]?.length > 2) {
        ElMessage.error("附加费用最多保留2位小数");
        return false;
      }

      if (!this.validateFirstMonthNoBaseFeeDay(firstMonthNoBaseFeeDay)) {
        return false;
      }

      // ========== 第一阶梯校验（必选） ==========
      if (amountFirstStart === null || amountFirstStart === "" || isNaN(parseFloat(amountFirstStart))) {
        ElMessage.error("第一阶梯开始值不能为空且必须为有效数字");
        return false;
      }
      const amountFirstStartVal = parseFloat(amountFirstStart);
      if (amountFirstStartVal < amountZeroEndVal) {
        ElMessage.error("第一阶梯开始值不能小于保底数值");
        return false;
      }

      if (amountFirstEnd === null || amountFirstEnd === "" || isNaN(parseFloat(amountFirstEnd))) {
        ElMessage.error("第一阶梯结束值不能为空且必须为有效数字");
        return false;
      }
      const amountFirstEndVal = parseFloat(amountFirstEnd);
      if (amountFirstEndVal <= amountFirstStartVal) {
        ElMessage.error("第一阶梯开始值必须小于结束值");
        return false;
      }
      if (amountFirstEndVal.toString().split(".")[1]?.length > 2) {
        ElMessage.error("第一阶梯结束值最多保留2位小数");
        return false;
      }

      if (priceFirst === null || priceFirst === "" || isNaN(parseFloat(priceFirst))) {
        ElMessage.error("第一阶梯价格不能为空且必须为有效数字");
        return false;
      }
      const priceFirstVal = parseFloat(priceFirst);
      if (priceFirstVal < 0) {
        ElMessage.error("第一阶梯价格不能小于零");
        return false;
      }
      if (priceFirstVal.toString().split(".")[1]?.length > 2) {
        ElMessage.error("第一阶梯价格最多保留2位小数");
        return false;
      }

      // ========== 第二阶梯校验（阶梯数≥2时必选） ==========
      if (stepNumberVal > 1) {
        if (amountSecondStart === null || amountSecondStart === "" || isNaN(parseFloat(amountSecondStart))) {
          ElMessage.error("第二阶梯开始值不能为空且必须为有效数字");
          return false;
        }
        const amountSecondStartVal = parseFloat(amountSecondStart);
        if (amountSecondStartVal < amountFirstEndVal) {
          ElMessage.error("第二阶梯开始值必须大于第一阶梯结束值");
          return false;
        }

        if (amountSecondEnd === null || amountSecondEnd === "" || isNaN(parseFloat(amountSecondEnd))) {
          ElMessage.error("第二阶梯结束值不能为空且必须为有效数字");
          return false;
        }
        const amountSecondEndVal = parseFloat(amountSecondEnd);
        if (amountSecondEndVal <= amountSecondStartVal) {
          ElMessage.error("第二阶梯开始值必须小于结束值");
          return false;
        }
        if (amountSecondEndVal.toString().split(".")[1]?.length > 2) {
          ElMessage.error("第二阶梯结束值最多保留2位小数");
          return false;
        }

        if (priceSecond === null || priceSecond === "" || isNaN(parseFloat(priceSecond))) {
          ElMessage.error("第二阶梯价格不能为空且必须为有效数字");
          return false;
        }
        const priceSecondVal = parseFloat(priceSecond);
        if (priceSecondVal < 0) {
          ElMessage.error("第二阶梯价格不能小于零");
          return false;
        }
        if (priceSecondVal.toString().split(".")[1]?.length > 2) {
          ElMessage.error("第二阶梯价格最多保留2位小数");
          return false;
        }
      }

      // ========== 第三阶梯校验（阶梯数≥3时必选） ==========
      if (stepNumberVal > 2) {
        if (amountThirdStart === null || amountThirdStart === "" || isNaN(parseFloat(amountThirdStart))) {
          ElMessage.error("第三阶梯开始值不能为空且必须为有效数字");
          return false;
        }
        const amountThirdStartVal = parseFloat(amountThirdStart);
        if (amountThirdStartVal < parseFloat(amountSecondEnd)) {
          ElMessage.error("第三阶梯开始值必须大于第二阶梯结束值");
          return false;
        }

        if (amountThirdEnd === null || amountThirdEnd === "" || isNaN(parseFloat(amountThirdEnd))) {
          ElMessage.error("第三阶梯结束值不能为空且必须为有效数字");
          return false;
        }
        const amountThirdEndVal = parseFloat(amountThirdEnd);
        if (amountThirdEndVal <= amountThirdStartVal) {
          ElMessage.error("第三阶梯开始值必须小于结束值");
          return false;
        }
        if (amountThirdEndVal.toString().split(".")[1]?.length > 2) {
          ElMessage.error("第三阶梯结束值最多保留2位小数");
          return false;
        }

        if (priceThird === null || priceThird === "" || isNaN(parseFloat(priceThird))) {
          ElMessage.error("第三阶梯价格不能为空且必须为有效数字");
          return false;
        }
        const priceThirdVal = parseFloat(priceThird);
        if (priceThirdVal < 0) {
          ElMessage.error("第三阶梯价格不能小于零");
          return false;
        }
        if (priceThirdVal.toString().split(".")[1]?.length > 2) {
          ElMessage.error("第三阶梯价格最多保留2位小数");
          return false;
        }
      }

      return true;
    }
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

.jiage-container {
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
  width: 70%;
  height: 100%;
}

.search-input {
  display: flex;
  justify-content: center;
  /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 30%;
  height: 100%;
  margin-right: 20px;
}

.search-input>span {
  font-size: 20px;
  margin-bottom: 5px;
}

.time-input {
  display: flex;
}

.time-input>span {
  font-size: 18px;
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
  margin-right: 30px;
}

.buttons>* {
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

.jiage-info {
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

.command-box>* {
  margin-right: 20px;
}

.add-btn,
.delete-btn,
.edit-btn,
.export-in-btn,
.export-out-btn {
  display: flex;
  align-items: center;
  width: 90px;
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

.jiage-table,
.page-box {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.jiage-table {
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

.delete-dialog-content-test,
.test-dialog-content {
  width: 35%;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  /* 水平方向初始定位 */
  top: 50%;
  /* 垂直方向初始定位 */
  transform: translate(-50%, -50%);
  /* 同时处理水平和垂直偏移 */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.delete-dialog-content-test {
  /* top: 50%;
  margin-top: -150px;  */
  height: 300px;
}

.test-dialog-content {
  width: 70%;
  /* 覆盖之前的 35% 宽度 */
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
  width: 100%;
  /* height: 470px; */
  max-height: 70vh;
  background: none;
}

.test-item,
.test-item-jieti {
  height: 200px;
  width: 96%;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 15px;
  margin-bottom: 5px;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: 1%;
}

.test-input {
  display: flex;
  justify-content: center;
  /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 32.4%;
  height: 80px;
}

.test-input>span {
  font-size: 20px;
  margin-bottom: 5px;
}

.test-input>.el-input {
  height: 35px;
  width: 100%;
}

.test-item-jieti {
  flex-direction: column;
  height: 100px;
}

.jieti-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.jieti-item {
  display: flex;
  flex-direction: column;
}

.jieti-item>span {
  font-size: 20px;
  margin-bottom: 5px;
}

.jieti-range {
  display: flex;
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

.btn-single-only-disabled {
  opacity: 0.5;
  cursor: not-allowed !important;
  pointer-events: none;
}
</style>
