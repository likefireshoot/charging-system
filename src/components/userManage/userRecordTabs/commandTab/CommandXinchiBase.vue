<template>
  <div class="command-panel">
    <div class="command-body">
      <!-- 左侧：命令树 -->
      <div class="tree-panel">
        <div class="tree-header">
          <img src="@/assets/yonghu/icon5.png" alt="" class="tree-header-icon" />
          <span>命令列表</span>
        </div>
        <el-input
          v-model="commandFilterText"
          placeholder="搜索命令..."
          prefix-icon="Search"
          class="tree-search"
        />
        <el-tree
          ref="commandTreeRef"
          :data="command_data"
          :props="commandProps"
          default-expand-all
          :filter-node-method="command_filterNode"
          highlight-current
          @node-click="handleNodeClick"
        />
      </div>

      <!-- 右侧：参数面板 -->
      <div class="params-panel">
        <div class="params-card">
          <div class="card-header">
            <span class="card-title">设置参数</span>
            <div class="title-divider">
              <span class="dot dark"></span>
              <span class="dot mid"></span>
              <span class="dot light"></span>
              <span class="line"></span>
            </div>
          </div>

          <div class="card-body">
            <!-- 未选中命令 -->
            <div v-if="!isValidCommandNode" class="empty-state">
              <img src="@/assets/yonghu/0.png" alt="" />
              <span class="empty-text">请在左侧命令树中选择一条命令</span>
            </div>

            <div v-else>
              <!-- 设置周期上报参数 -->
              <el-form
                v-if="node.label === '设置周期上报参数'"
                ref="cycleReportForm"
                :model="params_set_tai.zhouqishangbao"
                :rules="cycleReportRules"
                class="param-form"
              >
                <div class="param-field">
                  <span class="param-label">周期单位</span>
                  <el-form-item prop="way">
                    <el-select v-model="params_set_tai.zhouqishangbao.way" placeholder="请选择" class="param-select">
                      <el-option label="每小时" value="5" />
                      <el-option label="每天" value="6" />
                      <el-option label="每周" value="7" />
                      <el-option label="每月" value="8" />
                    </el-select>
                  </el-form-item>
                </div>
                <div class="param-field">
                  <span class="param-label">间隔数量</span>
                  <el-form-item prop="interval">
                    <el-input
                      v-model="params_set_tai.zhouqishangbao.interval"
                      placeholder="请输入间隔数量"
                      class="param-input"
                    />
                  </el-form-item>
                </div>
                <div v-if="params_set_tai.zhouqishangbao.way == '7'" class="param-field">
                  <span class="param-label">周几上报</span>
                  <el-form-item prop="week">
                    <el-select v-model="params_set_tai.zhouqishangbao.week" placeholder="请选择" class="param-select">
                      <el-option label="星期一" :value="1" />
                      <el-option label="星期二" :value="2" />
                      <el-option label="星期三" :value="3" />
                      <el-option label="星期四" :value="4" />
                      <el-option label="星期五" :value="5" />
                      <el-option label="星期六" :value="6" />
                      <el-option label="星期日" :value="7" />
                    </el-select>
                  </el-form-item>
                </div>
                <div class="param-field param-field--wide">
                  <span class="param-label">周期起始时间</span>
                  <el-form-item prop="year">
                    <el-date-picker
                      v-model="cycleReportDateTimeStr"
                      type="datetime"
                      placeholder="选择周期起始时间"
                      format="YYYY-MM-DD HH:mm:ss"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      class="param-datetime"
                    />
                  </el-form-item>
                </div>

                <!-- 周期上报预览卡片 -->
                <div class="cycle-preview-card">
                  <div class="preview-text">
                    <span class="preview-label">将上报设置为从 </span>
                    <span v-if="cycleReportDateTimeStr" class="preview-filled">{{ cycleReportDateTimeStr }}</span>
                    <span v-else class="preview-placeholder">选择时间</span>
                    <span class="preview-label"> 开始，每 </span>
                    <span v-if="params_set_tai.zhouqishangbao.interval" class="preview-filled">{{ params_set_tai.zhouqishangbao.interval }}</span>
                    <span v-else class="preview-placeholder">间隔</span>
                    <span class="preview-label"> </span>
                    <span v-if="cycleReportUnit" class="preview-filled">{{ cycleReportUnit }}</span>
                    <span v-else class="preview-placeholder">单位</span>
                    <span class="preview-label"> 上报一次</span>
                  </div>
                </div>
              </el-form>

              <!-- 阀门控制 -->
              <el-form
                v-else-if="node.label === '阀门控制'"
                ref="valveControlForm"
                :model="params_set_tai"
                :rules="valveControlRules"
                class="param-form"
              >
                <div class="param-field">
                  <span class="param-label">阀门状态</span>
                  <el-form-item prop="famenstate">
                    <el-select v-model="params_set_tai.famenstate" placeholder="请选择阀门状态" class="param-select">
                      <el-option label="开阀" value="1" />
                      <el-option label="关阀" value="0" />
                    </el-select>
                  </el-form-item>
                </div>
              </el-form>

              <!-- 设置读数 -->
              <el-form
                v-else-if="node.label === '设置读数'"
                ref="readCountForm"
                :model="params_set_tai"
                :rules="readCountRules"
                class="param-form"
              >
                <div class="param-field">
                  <span class="param-label">读数</span>
                  <el-form-item prop="count">
                    <el-input
                      v-model="params_set_tai.count"
                      type="number"
                      placeholder="请输入读数"
                      class="param-input"
                    />
                  </el-form-item>
                </div>
              </el-form>
            </div>
          </div>

          <!-- 确认按钮 -->
          <div class="btn-row">
            <button class="confirm-btn" @click="commit">
              <el-icon><Check /></el-icon>
              <span>确认下发</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import service from "@/api/request";
import { ElMessage } from "element-plus";

export default {
  name: "CommandXinchiBase",
  props: {
    meterData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    const validateWay = (rule, value, callback) => {
      if (!value) { callback(new Error("周期单位不能为空")); }
      else { callback(); }
    };
    const validateWeek = (rule, value, callback) => {
      if (value === "" || value === undefined || value === null) {
        callback(new Error("请选择周几上报"));
      } else if (!/^\d+$/.test(String(value)) || Number(value) < 0 || Number(value) > 7) {
        callback(new Error("请选择有效的星期（星期一~星期日）"));
      } else if (this.params_set_tai.zhouqishangbao.way === "7" && Number(value) === 0) {
        callback(new Error("每周模式下请选择具体星期（星期一~星期日）"));
      } else { callback(); }
    };
    const validateInterval = (rule, value, callback) => {
      if (value === "" || value === undefined || value === null) {
        callback(new Error("间隔数量不能为空"));
      } else if (!/^\d+$/.test(value) || Number(value) <= 0) {
        callback(new Error("间隔数量必须为正整数"));
      } else { callback(); }
    };
    const validateYear = (rule, value, callback) => {
      if (value === "" || value === undefined || value === null) {
        callback(new Error("年份不能为空"));
      } else if (!/^\d+$/.test(value) || Number(value) < 1970 || Number(value) > 2099) {
        callback(new Error("年份必须为1970~2099的整数"));
      } else { callback(); }
    };
    const validateMonth = (rule, value, callback) => {
      if (value === "" || value === undefined || value === null) {
        callback(new Error("月份不能为空"));
      } else if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 12) {
        callback(new Error("月份必须为1~12的整数"));
      } else { callback(); }
    };
    const validateDay = (rule, value, callback) => {
      if (value === "" || value === undefined || value === null) {
        callback(new Error("日期不能为空"));
      } else if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 31) {
        callback(new Error("日期必须为1~31的整数"));
      } else { callback(); }
    };
    const validateHour = (rule, value, callback) => {
      if (value === "" || value === undefined || value === null) {
        callback(new Error("小时不能为空"));
      } else if (!/^\d+$/.test(value) || Number(value) < 0 || Number(value) > 23) {
        callback(new Error("小时必须为0~23的整数"));
      } else { callback(); }
    };
    const validateMinute = (rule, value, callback) => {
      if (value === "" || value === undefined || value === null) {
        callback(new Error("分钟不能为空"));
      } else if (!/^\d+$/.test(value) || Number(value) < 0 || Number(value) > 59) {
        callback(new Error("分钟必须为0~59的整数"));
      } else { callback(); }
    };
    const validateSecond = (rule, value, callback) => {
      if (value === "" || value === undefined || value === null) {
        callback(new Error("秒数不能为空"));
      } else if (!/^\d+$/.test(value) || Number(value) < 0 || Number(value) > 59) {
        callback(new Error("秒数必须为0~59的整数"));
      } else { callback(); }
    };
    const validateFamenstate = (rule, value, callback) => {
      if (!value && value !== 0) { callback(new Error("请选择阀门状态")); }
      else { callback(); }
    };
    const validateCount = (rule, value, callback) => {
      if (value === "" || value === undefined || value === null) {
        callback(new Error("读数不能为空"));
      } else if (isNaN(value) || value <= 0) {
        callback(new Error("读数必须为正整数"));
      } else { callback(); }
    };
    return {
      commandFilterText: "",
      cycleReportDateTimeStr: "",
      node: { label: "", id: "", value: "" },
      commandProps: { children: "children", label: "label" },
      command_data: [
        {
          id: 1, value: 1, label: "下发控制命令",
          children: [
            { id: 2, value: 2, label: "设置周期上报参数" },
            { id: 3, value: 3, label: "阀门控制" },
            { id: 4, value: 4, label: "设置读数" },
          ],
        },
      ],
      params_set_tai: {
        famenstate: "",
        zhouqishangbao: {
          way: "", week: 0, interval: null,
          year: "", month: "", day: "", hour: "", minute: "", second: "",
        },
        count: "",
      },
      cycleReportRules: {
        way: [{ validator: validateWay, trigger: "change" }],
        week: [{ validator: validateWeek, trigger: "change" }],
        interval: [{ validator: validateInterval, trigger: "blur" }],
        year: [{ validator: validateYear, trigger: "blur" }],
        month: [{ validator: validateMonth, trigger: "blur" }],
        day: [{ validator: validateDay, trigger: "blur" }],
        hour: [{ validator: validateHour, trigger: "blur" }],
        minute: [{ validator: validateMinute, trigger: "blur" }],
        second: [{ validator: validateSecond, trigger: "blur" }],
      },
      valveControlRules: {
        famenstate: [{ validator: validateFamenstate, trigger: "change" }],
      },
      readCountRules: {
        count: [{ validator: validateCount, trigger: "blur" }],
      },
    };
  },
  computed: {
    apiPrefix() {
      return this.meterData.apiPrefix || "";
    },
    /** 动态判断当前选中节点是否为有效命令（树中 children 的某一项） */
    isValidCommandNode() {
      const parent = this.command_data[0];
      if (!parent || !parent.children) return false;
      return parent.children.some((c) => c.id === this.node.id);
    },
    cycleReportUnit() {
      const unitMap = { "5": "小时", "6": "天", "7": "周", "8": "月" };
      return unitMap[this.params_set_tai.zhouqishangbao.way] || "";
    },
  },
  watch: {
    commandFilterText(val) { this.$refs.commandTreeRef.filter(val); },
    cycleReportDateTimeStr(val) {
      if (val) {
        const parts = val.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
        if (parts) {
          const p = this.params_set_tai.zhouqishangbao;
          p.year = parts[1]; p.month = parts[2]; p.day = parts[3];
          p.hour = parts[4]; p.minute = parts[5]; p.second = parts[6];
        }
      } else {
        const p = this.params_set_tai.zhouqishangbao;
        p.year = ""; p.month = ""; p.day = "";
        p.hour = ""; p.minute = ""; p.second = "";
      }
    },
    "params_set_tai.zhouqishangbao.way"(newVal) {
      if (newVal !== "7") { this.params_set_tai.zhouqishangbao.week = 0; }
    },
  },
  mounted() {
    this.$nextTick(() => { this.commandTreeRef = this.$refs.commandTreeRef; });
  },
  methods: {
    command_filterNode(value, data) {
      if (!value) return true;
      return data.label.includes(value);
    },
    handleNodeClick(node) {
      this.node.id = node.id;
      this.node.value = node.value;
      this.node.label = node.label;
    },
    formatDateTime(year, month, day, hour, minute, second) {
      const pad = (n) => n.toString().padStart(2, "0");
      return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
    },
    commit() {
      const p = this.meterData.apiPrefix;
      if (this.node.label === "设置周期上报参数") {
        if (!this.$refs.cycleReportForm) { ElMessage.error("表单未加载完成，请稍后重试"); return; }
        this.$refs.cycleReportForm.validate((valid) => {
          if (valid) {
            const imei = this.meterData.imei;
            const status = this.params_set_tai.zhouqishangbao.way;
            const weeks = this.params_set_tai.zhouqishangbao.week;
            const cycleIntervals = this.params_set_tai.zhouqishangbao.interval;
            const { year, month, day, hour, minute, second } = this.params_set_tai.zhouqishangbao;
            const time = this.formatDateTime(year, month, day, hour, minute, second);
            service
              .get(`/command/${p}/${p}SetCycleParametersCommand?imei=${imei}&status=${status}&weeks=${weeks}&cycleIntervals=${cycleIntervals}&time=${time}`)
              .then((res) => {
                if (res.code === 200) { ElMessage.success("周期上报参数设置成功！"); }
                else { ElMessage.error(res.msg); }
              })
              .catch((error) => { ElMessage.error(error.message || "设置周期上报参数失败!"); });
          }
        });
      } else if (this.node.label === "阀门控制") {
        if (!this.$refs.valveControlForm) { ElMessage.error("表单未加载完成，请稍后重试"); return; }
        this.$refs.valveControlForm.validate((valid) => {
          if (valid) {
            const imei = this.meterData.imei;
            const status = this.params_set_tai.famenstate;
            service
              .get(`/command/${p}/${p}ValveCommand?imei=${imei}&status=${status}`)
              .then((res) => {
                if (res.code === 200) { ElMessage.success("阀门设置成功"); }
                else { ElMessage.error(res.msg); }
              })
              .catch((error) => { ElMessage.error(error.msg); });
          }
        });
      } else if (this.node.label === "设置读数") {
        if (!this.$refs.readCountForm) { ElMessage.error("表单未加载完成，请稍后重试"); return; }
        this.$refs.readCountForm.validate((valid) => {
          if (valid) {
            const imei = this.meterData.imei;
            const count = this.params_set_tai.count;
            service
              .get(`/command/${p}/${p}SetReadCount?imei=${imei}&count=${count}`)
              .then((res) => {
                if (res.code === 200) { ElMessage.success("表读数设置成功"); }
                else { ElMessage.error(res.msg); }
              })
              .catch((error) => { ElMessage.error(error.msg); });
          }
        });
      }
    },
  },
};
</script>

<style scoped>
.command-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  bottom: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.command-body {
  flex: 1;
  display: flex;
  min-height: 0;
  gap: 24px;
}

/* ========== 左侧树面板 ========== */
.tree-panel {
  width: 340px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.tree-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 30px 20px 20px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 27px;
  font-weight: 600;
  color: #303133;
}

.tree-header-icon {
  width: 25px;
  height: 25px;
}

.tree-search {
  margin: 12px 16px;
  width: 92%;
}

.tree-panel :deep(.el-tree) {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding: 0 8px 12px;
  background: transparent;
}

.tree-panel :deep(.el-tree-node__content) {
  height: 52px;
  padding: 0 12px;
  margin: 2px 4px;
  border-radius: 6px;
  font-size: 20px;
  transition: all 0.15s ease;
  border-left: 3px solid transparent;
}

.tree-panel :deep(.el-tree-node__content:hover) {
  background-color: #f0f7f3;
}

.tree-panel :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: #eaf7ef;
  border-left-color: #46b97e;
  color: #2d8a5e;
  font-weight: 600;
}

.tree-panel :deep(.el-tree-node__label) {
  font-size: 20px;
}

.tree-panel :deep(.el-tree-node:not(.is-leaf) > .el-tree-node__content .el-tree-node__label) {
  font-weight: 600;
  font-size: 21px;
  color: #303133;
}

.tree-panel :deep(.el-tree-node.is-leaf > .el-tree-node__content) {
  padding-left: 28px;
}

.tree-panel :deep(.el-tree-node__expand-icon) {
  font-size: 18px;
  padding: 6px;
  color: #909399;
}

.tree-panel :deep(.el-input__inner) {
  height: 44px;
  font-size: 18px;
}

.tree-panel :deep(.el-input__prefix) {
  font-size: 18px;
}

/* ========== 右侧参数面板 ========== */
.params-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.params-card {
  flex: 1;
  min-height: 0;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-header {
  padding: 30px 28px 0;
  flex-shrink: 0;
}

.card-title {
  font-size: 27px;
  font-weight: 700;
  color: #303133;
}

.title-divider {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.title-divider .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 6px;
  flex-shrink: 0;
}

.title-divider .dot.dark  { background-color: #46b97e; }
.title-divider .dot.mid   { background-color: #90d5b2; }
.title-divider .dot.light { background-color: #c7ead7; }

.title-divider .line {
  flex: 1;
  height: 1px;
  background-color: #e9e9e9;
}

.card-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 24px 28px;
  overflow-y: auto;
}

/* ========== 空状态 ========== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 24px;
}

.empty-state img {
  height: 160px;
  opacity: 0.35;
}

.empty-text {
  font-size: 24px;
  color: #b0b3b8;
  letter-spacing: 2px;
}

/* ========== 参数表单 ========== */
.param-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  max-width: 900px;
}

.param-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 220px;
}

.param-field--wide {
  width: 100%;
}

.param-label {
  font-size: 20px;
  font-weight: 600;
  color: #606266;
}

.param-field :deep(.el-form-item) {
  margin-bottom: 0;
}

.param-field :deep(.el-form-item__error) {
  font-size: 16px;
  padding-top: 4px;
}

.param-select {
  width: 100%;
}

.param-select :deep(.el-select__wrapper),
.param-select :deep(.el-input__inner),
.param-select :deep(.el-input) {
  height: 50px;
  min-height: 50px;
  font-size: 20px;
}

.param-select :deep(.el-input__inner) {
  padding: 0 16px;
  line-height: 50px;
}

.param-select :deep(.el-select__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  border-radius: 6px;
}

.param-input {
  width: 100%;
}

.param-input :deep(.el-input__wrapper),
.param-input :deep(.el-input__inner),
.param-input :deep(.el-input) {
  height: 50px;
  min-height: 50px;
  font-size: 20px;
}

.param-input :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  border-radius: 6px;
}

.param-datetime {
  width: 100%;
}

.param-datetime :deep(.el-input__wrapper),
.param-datetime :deep(.el-input__inner),
.param-datetime :deep(.el-input) {
  height: 50px;
  min-height: 50px;
  font-size: 20px;
}

.param-datetime :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  border-radius: 6px;
}

/* ========== 周期上报预览卡片 ========== */
.cycle-preview-card {
  width: 100%;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 14px 16px;
  margin-top: 4px;
}

.cycle-preview-card .preview-text {
  font-size: 22px;
  color: #333;
  line-height: 1.8;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
}

.cycle-preview-card .preview-label {
  font-weight: normal;
  color: #555;
  font-size: 22px;
}

.cycle-preview-card .preview-filled {
  color: #45ba7e;
  font-weight: bold;
  font-size: 24px;
}

.cycle-preview-card .preview-placeholder {
  display: inline-block;
  min-width: 70px;
  padding: 2px 10px;
  background: #fff;
  border: 1px dashed #c0c4cc;
  border-radius: 4px;
  color: #b0b3b8;
  font-size: 20px;
  text-align: center;
}

/* ========== 确认按钮 ========== */
.btn-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  flex-shrink: 0;
  padding: 0 28px 20px;
}

.confirm-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 200px;
  height: 52px;
  padding: 0 36px;
  background: linear-gradient(135deg, #46b97e 0%, #3da06b 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 2px;
  box-shadow: 0 4px 14px rgba(70, 185, 126, 0.3);
  transition: all 0.25s ease;
}

.confirm-btn:hover {
  background: linear-gradient(135deg, #3da06b 0%, #338c59 100%);
  box-shadow: 0 6px 20px rgba(70, 185, 126, 0.4);
  transform: translateY(-1px);
}

.confirm-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(70, 185, 126, 0.3);
}

.confirm-btn .el-icon {
  font-size: 22px;
}
</style>
