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
              <!-- 阀门控制 -->
              <el-form
                v-if="node.label === '阀门控制'"
                ref="valveForm"
                :model="params_set_tai"
                :rules="valveRules"
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

              <!-- 写累计流量 -->
              <el-form
                v-else-if="node.label === '写累计流量'"
                ref="trafficForm"
                :model="params_set_tai"
                :rules="trafficRules"
                class="param-form"
              >
                <div class="param-field">
                  <span class="param-label">累计流量</span>
                  <el-form-item prop="cumulativeTraffic">
                    <el-input
                      v-model="params_set_tai.cumulativeTraffic"
                      placeholder="请输入累计流量"
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
  name: "CommandShengxinBase",
  props: {
    meterData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    const validateValve = (rule, value, callback) => {
      if (!value && value !== 0) {
        callback(new Error("请选择阀门状态"));
      } else { callback(); }
    };
    const validateTraffic = (rule, value, callback) => {
      if (value === "" || value === undefined || value === null) {
        callback(new Error("累计流量不能为空"));
      } else if (isNaN(value) || Number(value) < 0) {
        callback(new Error("累计流量必须为非负数值"));
      } else { callback(); }
    };
    return {
      commandFilterText: "",
      node: { label: "", id: "", value: "" },
      commandProps: { children: "children", label: "label" },
      command_data: [
        {
          id: 1, value: 1, label: "下发控制命令",
          children: [
            { id: 2, value: 2, label: "阀门控制" },
            { id: 3, value: 3, label: "写累计流量" },
          ],
        },
      ],
      params_set_tai: {
        famenstate: "",
        cumulativeTraffic: "",
      },
      valveRules: {
        famenstate: [{ validator: validateValve, trigger: "change" }],
      },
      trafficRules: {
        cumulativeTraffic: [{ validator: validateTraffic, trigger: "blur" }],
      },
    };
  },
  computed: {
    isValidCommandNode() {
      const parent = this.command_data[0];
      if (!parent || !parent.children) return false;
      return parent.children.some((c) => c.id === this.node.id);
    },
  },
  watch: {
    commandFilterText(val) { this.$refs.commandTreeRef.filter(val); },
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
    commit() {
      const p = this.meterData.apiPrefix;
      if (this.node.label === "阀门控制") {
        if (!this.$refs.valveForm) { ElMessage.error("表单未加载完成，请稍后重试"); return; }
        this.$refs.valveForm.validate((valid) => {
          if (!valid) return;
          const meterCode = this.meterData.meterCode;
          const status = this.params_set_tai.famenstate;
          service
            .get(`/command/${p}/${p}ValveCommand?meterCode=${meterCode}&status=${status}`)
            .then((res) => {
              if (res.code === 200) { ElMessage.success("阀门控制成功"); }
              else { ElMessage.error(res.msg || res.code); }
            })
            .catch((err) => { ElMessage.error(err.msg || "阀门控制失败"); console.log(err); });
        });
      } else if (this.node.label === "写累计流量") {
        if (!this.$refs.trafficForm) { ElMessage.error("表单未加载完成，请稍后重试"); return; }
        this.$refs.trafficForm.validate((valid) => {
          if (!valid) return;
          const meterCode = this.meterData.meterCode;
          const cumulativeTraffic = this.params_set_tai.cumulativeTraffic;
          const cap = p.charAt(0).toUpperCase() + p.slice(1);
          service
            .get(`/command/${p}/send${cap}CumulativeTrafficCommand?meterCode=${meterCode}&cumulativeTraffic=${cumulativeTraffic}`)
            .then((res) => {
              if (res.code === 200) { ElMessage.success("写累计流量成功"); }
              else { ElMessage.error(res.msg || res.code); }
            })
            .catch((err) => { ElMessage.error(err.msg || "写累计流量失败"); console.log(err); });
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
  max-width: 480px;
}

.param-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
