<template>
  <div class="quick-meter-report">
    <!-- 搜索区域 -->
    <div class="search-area">
      <div class="search-item">
        <span>表号</span>
        <div style="display: flex; gap: 10px; align-items: center;">
          <el-input v-model="formData.meterCode" placeholder="请输入表号" clearable @blur="handleMeterCodeBlur" />
          <el-button type="primary" size="small" @click="handleQueryMeter" :loading="queryLoading">
            查询水表
          </el-button>
        </div>
        <div v-if="meterInfo.userName" class="meter-info-tip">
          <el-icon style="color: #46b97e"><Check /></el-icon>
          <span v-if="meterInfo.userId">{{ meterInfo.userName }} (用户号: {{ meterInfo.userId }})</span>
          <span v-else>{{ meterInfo.userName }}</span>
        </div>
      </div>
      <div class="search-item">
        <span>止码</span>
        <el-input v-model="formData.endRead" placeholder="请输入本次读数" type="number" clearable />
      </div>
      <div class="buttons">
        <div class="btn-group">
          <el-button 
            type="success" 
            size="large"
            @click="handleCalculate"
            :loading="isLoading && !isSubmitted"
            class="action-btn calculate-btn"
          >
            <el-icon><Search /></el-icon>
            <span>计算费用</span>
          </el-button>
          
          <el-button 
            type="primary" 
            size="large"
            @click="handleSubmit"
            :disabled="!canSubmit"
            :loading="isLoading && isSubmitted"
            class="action-btn submit-btn"
          >
            <el-icon><Check /></el-icon>
            <span>提交扣费</span>
          </el-button>
        </div>
        
        <el-button 
          size="large"
          @click="handleClear"
          class="action-btn clear-btn"
        >
          <el-icon><RefreshRight /></el-icon>
          <span>清空</span>
        </el-button>
      </div>
    </div>

    <!-- 结果展示区域 -->
    <div class="result-area" v-if="showResult">
      <div class="result-title">
        <img src="@/assets/yonghu/icon10.png" alt="" style="margin-right: 8px" />
        <span>抄表计费详情</span>
      </div>
      
      <div class="result-content">
        <!-- 基本信息 -->
        <div class="info-section">
          <div class="section-title">基本信息</div>
          <div class="info-row">
            <div class="info-item">
              <span class="label">表号：</span>
              <span class="value">{{ resultData.meterCode || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">用户名：</span>
              <span class="value">{{ resultData.userName || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 读数信息 -->
        <div class="info-section">
          <div class="section-title">读数信息</div>
          <div class="info-row">
            <div class="info-item">
              <span class="label">起码：</span>
              <span class="value">{{ formatNumber(resultData.startRead) }} 吨</span>
            </div>
            <div class="info-item">
              <span class="label">止码：</span>
              <span class="value highlight">{{ formatNumber(resultData.endRead) }} 吨</span>
            </div>
            <div class="info-item">
              <span class="label">本次用水量：</span>
              <span class="value highlight">{{ formatNumber(resultData.billedWater) }} 吨</span>
            </div>
          </div>
        </div>

        <!-- 费用信息 -->
        <div class="info-section">
          <div class="section-title">费用明细</div>
          <div class="info-row">
            <div class="info-item">
              <span class="label">水费：</span>
              <span class="value">{{ formatMoney(resultData.waterFee) }} 元</span>
            </div>
            <div class="info-item">
              <span class="label">污水处理费：</span>
              <span class="value">{{ formatMoney(resultData.sewageFee) }} 元</span>
            </div>
            <div class="info-item total-fee">
              <span class="label">本次扣费：</span>
              <span class="value money">{{ formatMoney(resultData.chargeAmount) }} 元</span>
            </div>
          </div>
        </div>

        <!-- 余额信息 -->
        <div class="info-section">
          <div class="section-title">余额信息</div>
          <div class="info-row">
            <div class="info-item">
              <span class="label">扣费前余额：</span>
              <span class="value">{{ formatMoney(resultData.currentBalance) }} 元</span>
            </div>
            <div class="info-item">
              <span class="label">扣费后余额：</span>
              <span :class="['value', resultData.newBalance < 0 ? 'warning' : '']">
                {{ formatMoney(resultData.newBalance) }} 元
              </span>
            </div>
          </div>
          <div class="warning-tip" v-if="resultData.warning">
            ⚠️ {{ resultData.warning }}
          </div>
        </div>
      </div>

      <div class="result-footer" v-if="isSubmitted">
        <div class="success-message">
          <el-icon style="font-size: 24px; color: #46b97e"><Check /></el-icon>
          <span>{{ resultData.message || '提交成功' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Check, RefreshRight } from '@element-plus/icons-vue';
import service from '@/api/request';

// 表单数据
const formData = reactive({
  meterCode: '',
  endRead: ''
});

// 结果数据
const resultData = reactive({
  meterCode: '',
  userName: '',
  startRead: 0,
  endRead: 0,
  billedWater: 0,
  chargeAmount: 0,
  waterFee: 0,
  sewageFee: 0,
  currentBalance: 0,
  newBalance: 0,
  warning: '',
  message: ''
});

// 状态控制
const showResult = ref(false);
const isSubmitted = ref(false);
const isLoading = ref(false);
const queryLoading = ref(false);

// 水表信息
const meterInfo = reactive({
  userName: '',
  userId: ''
});

// 是否可以提交
const canSubmit = computed(() => {
  return formData.meterCode && formData.endRead && showResult.value && !isLoading.value;
});

// 格式化数字
const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const num = parseFloat(value);
  return isNaN(num) ? value : num.toFixed(2);
};

// 格式化金额
const formatMoney = (value) => {
  if (value === null || value === undefined || value === '') return '0.00';
  const num = parseFloat(value);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

// 验证输入
const validateInput = () => {
  if (!formData.meterCode || formData.meterCode.trim() === '') {
    ElMessage.error('请输入表号');
    return false;
  }

  if (!formData.endRead || formData.endRead.trim() === '') {
    ElMessage.error('请输入止码');
    return false;
  }

  const endRead = parseFloat(formData.endRead);
  if (isNaN(endRead) || endRead < 0) {
    ElMessage.error('止码格式不正确');
    return false;
  }

  return true;
};

// 计算费用
const handleCalculate = async () => {
  if (!validateInput()) return;

  isLoading.value = true;
  isSubmitted.value = false;

  try {
    const res = await service.post('/manual/charge/calculate', {
      meterCode: formData.meterCode.trim(),
      endRead: formData.endRead.trim()
    });

    if (res.code === 200) {
      Object.assign(resultData, res.data);
      showResult.value = true;
      ElMessage.success('费用计算成功');
    } else {
      // 处理具体的错误信息
      if (res.msg && res.msg.includes('未找到')) {
        ElMessage.error('该表号未找到绑定信息，请检查表号是否正确');
      } else if (res.msg && res.msg.includes('价格配置')) {
        ElMessage.error('水表价格配置缺失，请联系管理员');
      } else if (res.msg && res.msg.includes('止码')) {
        ElMessage.error(res.msg);
      } else {
        ElMessage.error(res.msg || '计算失败');
      }
      showResult.value = false;
    }
  } catch (error) {
    console.error('计算费用错误:', error);
    ElMessage.error('网络请求失败，请检查网络连接');
    showResult.value = false;
  } finally {
    isLoading.value = false;
  }
};

// 提交扣费
const handleSubmit = async () => {
  if (!validateInput()) return;

  // 如果没有先计算，提示用户
  if (!showResult.value) {
    ElMessage.warning('请先点击"计算费用"查看计费详情');
    return;
  }

  isLoading.value = true;

  try {
    const res = await service.post('/manual/charge/submit', {
      meterCode: formData.meterCode.trim(),
      endRead: formData.endRead.trim()
    });

    if (res.code === 200) {
      Object.assign(resultData, res.data);
      showResult.value = true;
      isSubmitted.value = true;
      ElMessage.success(res.data.message || '提交成功');
    } else {
      // 处理具体的错误信息
      if (res.msg && res.msg.includes('余额')) {
        ElMessage.warning('用户余额不足，请先充值');
      } else if (res.msg && res.msg.includes('未找到')) {
        ElMessage.error('该表号未找到绑定信息，请检查表号是否正确');
      } else {
        ElMessage.error(res.msg || '提交失败');
      }
    }
  } catch (error) {
    console.error('提交扣费错误:', error);
    ElMessage.error('网络请求失败，请检查网络连接');
  } finally {
    isLoading.value = false;
  }
};

// 清空表单
const handleClear = () => {
  formData.meterCode = '';
  formData.endRead = '';
  showResult.value = false;
  isSubmitted.value = false;
  
  // 重置结果数据
  Object.assign(resultData, {
    meterCode: '',
    startRead: 0,
    endRead: 0,
    billedWater: 0,
    chargeAmount: 0,
    waterFee: 0,
    sewageFee: 0,
    currentBalance: 0,
    newBalance: 0,
    warning: '',
    message: ''
  });
  
  // 重置水表信息
  Object.assign(meterInfo, {
    userName: '',
    userId: ''
  });
};

// 查询水表信息
const handleQueryMeter = async () => {
  if (!formData.meterCode || formData.meterCode.trim() === '') {
    ElMessage.warning('请先输入表号');
    return;
  }

  queryLoading.value = true;

  try {
    // 简单验证：只显示表号已输入，引导用户继续操作
    meterInfo.userName = '待查询';
    meterInfo.userId = '';
    ElMessage.success('表号已输入，请输入止码后点击“计算费用”');
    
    // 如果需要真实用户信息，可以调用专门的查询接口（需后端提供）
    // const res = await service.get(`/userManage/userCharge/getMeterInfo/${formData.meterCode.trim()}`);
    // if (res.code === 200) {
    //   meterInfo.userName = res.data.userName || '未知用户';
    //   meterInfo.userId = res.data.userId || '';
    //   ElMessage.success('查询成功');
    // } else {
    //   meterInfo.userName = '';
    //   meterInfo.userId = '';
    //   ElMessage.error(res.msg || '查询失败');
    // }
  } catch (error) {
    console.error('查询水表错误:', error);
    meterInfo.userName = '';
    meterInfo.userId = '';
    ElMessage.error('查询失败，请检查网络连接');
  } finally {
    queryLoading.value = false;
  }
};

// 表号失去焦点时自动查询
const handleMeterCodeBlur = () => {
  if (formData.meterCode && formData.meterCode.trim() !== '') {
    handleQueryMeter();
  }
};
</script>

<style lang="scss" scoped>
:deep(.el-input) {
  --el-color-primary: #46b97e;
}

.quick-meter-report {
  padding: 20px;
  background-color: #fafafa;
  min-height: calc(100vh - 60px);

  .search-area {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;

    .search-item {
      display: flex;
      flex-direction: column;
      gap: 8px;

      span {
        font-size: 16px;
        color: #585657;
        font-weight: 500;
      }

      :deep(.el-input) {
        width: 200px;
      }

      .meter-info-tip {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        background-color: #f0f9ff;
        border: 1px solid #d1e7ff;
        border-radius: 4px;
        font-size: 13px;
        color: #46b97e;
        margin-top: 4px;
      }
    }

    .buttons {
      display: flex;
      gap: 200px;
      justify-content: flex-end;

      .btn-group {
        display: flex;
        gap: 8px;
      }

      .action-btn {
        height: 48px;
        padding: 0 24px;
        font-size: 16px;
        font-weight: 500;
        border-radius: 8px;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        &:active:not(:disabled) {
          transform: translateY(0);
        }

        .el-icon {
          font-size: 18px;
        }
      }

      .calculate-btn {
        background: linear-gradient(135deg, #46b97e 0%, #3da56f 100%);
        border: none;
        color: #fff;

        &:hover:not(:disabled) {
          background: linear-gradient(135deg, #3da56f 0%, #359161 100%);
          box-shadow: 0 6px 16px rgba(70, 185, 126, 0.3);
        }
      }

      .submit-btn {
        background: linear-gradient(135deg, #409eff 0%, #3a8ee6 100%);
        border: none;
        color: #fff;

        &:hover:not(:disabled) {
          background: linear-gradient(135deg, #3a8ee6 0%, #337ecc 100%);
          box-shadow: 0 6px 16px rgba(64, 158, 255, 0.3);
        }

        &:disabled {
          background: #c0c4cc;
          cursor: not-allowed;
          opacity: 0.6;
        }
      }

      .clear-btn {
        background: #fff;
        border: 2px solid #dcdfe6;
        color: #606266;

        &:hover:not(:disabled) {
          border-color: #46b97e;
          color: #46b97e;
          background: #f0f9ff;
        }
      }
    }
  }

  .result-area {
    margin-top: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .result-title {
      padding: 15px 20px;
      background-color: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;
      display: flex;
      align-items: center;
      font-size: 18px;
      font-weight: bold;
      color: #303133;
    }

    .result-content {
      padding: 20px;

      .info-section {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }

        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #46b97e;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid #f0f0f0;
        }

        .info-row {
          display: flex;
          gap: 30px;
          flex-wrap: wrap;

          .info-item {
            flex: 1;
            min-width: 200px;
            display: flex;
            align-items: center;
            padding: 10px 15px;
            background-color: #f9f9f9;
            border-radius: 6px;

            .label {
              font-size: 15px;
              color: #909399;
              margin-right: 8px;
            }

            .value {
              font-size: 16px;
              color: #303133;
              font-weight: 500;

              &.highlight {
                color: #46b97e;
                font-weight: bold;
              }

              &.money {
                color: #f56c6c;
                font-size: 18px;
                font-weight: bold;
              }

              &.warning {
                color: #e6a23c;
                font-weight: bold;
              }
            }

            &.total-fee {
              background-color: #fef0f0;
              border: 1px solid #fde2e2;
            }
          }
        }

        .warning-tip {
          margin-top: 12px;
          padding: 10px 15px;
          background-color: #fdf6ec;
          border: 1px solid #faecd8;
          border-radius: 6px;
          color: #e6a23c;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }

    .result-footer {
      padding: 15px 20px;
      background-color: #f0f9ff;
      border-top: 1px solid #e4e7ed;

      .success-message {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #46b97e;
        font-size: 16px;
        font-weight: 500;
      }
    }
  }
}
</style>
