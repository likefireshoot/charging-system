<template>
  <div class="command-panel">
    <div class="command-body">
      <div class="tree-panel">
        <div class="tree-header">
          <img src="@/assets/yonghu/icon5.png" alt="" class="tree-header-icon" />
          <span>命令列表</span>
        </div>
        <el-input v-model="commandFilterText" placeholder="搜索命令..." prefix-icon="Search" class="tree-search" />
        <el-tree ref="commandTreeRef" :data="command_zhuozheng_data" :props="commandProps" default-expand-all
          :filter-node-method="command_filterNode" highlight-current @node-click="handleNodeClick" />
      </div>
      <div class="params-panel">
        <div class="params-card">
          <div class="card-header">
            <span class="card-title">设置参数</span>
            <div class="title-divider">
              <span class="dot dark"></span><span class="dot mid"></span><span class="dot light"></span><span class="line"></span>
            </div>
          </div>
          <div class="card-body">
            <div v-if="!isValidCommandNode" class="empty-state">
              <img src="@/assets/yonghu/0.png" alt="" />
              <span class="empty-text">请在左侧命令树中选择一条命令</span>
            </div>
            <div v-else>
              <div class="set-content-container" v-if="node.label === '设置周期上报参数'">
                <div class="param-field"><span class="param-label">上报周期（小时）</span><el-input v-model="params_set_tai.zhouqishangbao" placeholder="1~24" class="param-input" /></div>
              </div>
              <div class="set-content-container" v-if="node.label === '阀门控制'">
                <div class="param-field"><span class="param-label">阀门状态</span><el-select v-model="params_set_tai.famenstate" class="param-select"><el-option label="开阀" value="1" /><el-option label="关阀" value="2" /></el-select></div>
              </div>
              <div v-if="node.label && node.label.startsWith('获取') || node.label === '查询历史数据'" class="empty-state">
                <span class="empty-text">获取类命令无需参数，点击确认即可下发</span>
              </div>
            </div>
          </div>
          <div class="btn-row">
            <button class="confirm-btn" @click="commit_xinchi"><el-icon><Check /></el-icon><span>确认下发</span></button>
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
  name: "CommandZhuozheng",
  props: { meterData: { type: Object, default: () => ({}) } },
  data() {
    return {
      commandFilterText: "", node: { label: "", id: "", value: "" }, commandProps: { children: "children", label: "label" },
      command_zhuozheng_data: [
        { id: 1, value: 1, label: "下发控制命令", children: [
          { id: 3, value: 3, label: "设置周期上报参数" }, { id: 4, value: 4, label: "阀门控制" },
        ]},
        { id: 2, value: 2, label: "下发获取命令", children: [
          { id: 5, value: 5, label: "查询历史数据" }, { id: 6, value: 6, label: "获取当前表读数" },
          { id: 7, value: 7, label: "获取冻结数据起始时间" }, { id: 8, value: 8, label: "获取采集间隔" },
          { id: 9, value: 9, label: "获取冻结数据" }, { id: 10, value: 10, label: "获取模组版本号" },
          { id: 11, value: 11, label: "获取阀门状态" }, { id: 12, value: 12, label: "获取电压" },
          { id: 13, value: 13, label: "获取CIMI" }, { id: 14, value: 14, label: "获取IMEI" },
          { id: 15, value: 15, label: "获取ICCID" }, { id: 16, value: 16, label: "获取信号强度" },
        ]},
      ],
      params_set_tai: { zhouqishangbao: null, famenstate: "" },
      params_get_tai: {
        lishishuju: { dongjieshijian: { year: "", month: "", day: "" }, caijijiange: "", dongjieshuju: { number: "", data: [] } },
        count: "", dongjieshijian: { year: "", month: "", day: "" }, caijijiange: "", dongjieshuju: { number: "", data: [] },
        mozuhao: "", famenstate: "", dianya: "", CIMI: "", IMEI: "", ICCID: "", xinhaoqiangdu: "",
      },
    };
  },
  computed: {
    isValidCommandNode() {
      for (const parent of this.command_zhuozheng_data) {
        if (parent.children && parent.children.some((c) => c.id === this.node.id)) return true;
      }
      return false;
    },
  },
  watch: { commandFilterText(val) { this.$refs.commandTreeRef.filter(val); } },
  mounted() { this.$nextTick(() => { this.commandTreeRef = this.$refs.commandTreeRef; }); },
  methods: {
    command_filterNode(value, data) { if (!value) return true; return data.label.includes(value); },
    handleNodeClick(node) { this.node.id = node.id; this.node.value = node.value; this.node.label = node.label; },
    formatDateTime(year, month, day, hour, minute, second) { const pad = (n) => n.toString().padStart(2, "0"); return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`; },
    commit_xinchi() {
      if (this.node.label === "设置周期上报参数") {
        const imei = this.meterData.imei; const status = this.params_set_tai.zhouqishangbao && this.params_set_tai.zhouqishangbao.way;
        const weeks = this.params_set_tai.zhouqishangbao && this.params_set_tai.zhouqishangbao.week;
        const cycleIntervals = this.params_set_tai.zhouqishangbao && this.params_set_tai.zhouqishangbao.interval;
        const p = this.params_set_tai.zhouqishangbao || {};
        const { year, month, day, hour, minute, second } = p;
        if (status === "" || weeks == null || cycleIntervals == null || year === "" || month === "" || day === "" || hour === "" || minute === "" || second === "") { ElMessage.error("所有的参数均不能为空！"); return; }
        const time = this.formatDateTime(year, month, day, hour, minute, second);
        service.get(`/xinchi/xinChiSetCycleParametersCommand?imei=${imei}&status=${status}&weeks=${weeks}&cycleIntervals=${cycleIntervals}&time=${time}`).then((res) => {
          if (res.code === 200) { ElMessage.success("周期上报参数设置成功！"); } else { ElMessage.error(res.msg); }
        }).catch((error) => { ElMessage.error(error.message || "设置周期上报参数失败!"); });
      } else if (this.node.label === "阀门控制") { ElMessage.error("暂未开通"); }
    },
  },
};
</script>

<style scoped>
.command-panel { position: absolute; top: 20px; right: 20px; bottom: 20px; left: 20px; display: flex; flex-direction: column; overflow: hidden; }
.command-body { flex: 1; display: flex; min-height: 0; gap: 24px; }
.tree-panel { width: 340px; flex-shrink: 0; background: #fff; border-radius: 8px; border: 1px solid #e4e7ed; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.tree-header { display: flex; align-items: center; gap: 8px; padding: 30px 20px 20px; border-bottom: 1px solid #f0f0f0; font-size: 27px; font-weight: 600; color: #303133; }
.tree-header-icon { width: 25px; height: 25px; }
.tree-search { margin: 12px 16px; width: 92%; }
.tree-panel :deep(.el-tree) { flex: 1; overflow-y: auto; min-height: 0; padding: 0 8px 12px; background: transparent; }
.tree-panel :deep(.el-tree-node__content) { height: 52px; padding: 0 12px; margin: 2px 4px; border-radius: 6px; font-size: 20px; transition: all 0.15s ease; border-left: 3px solid transparent; }
.tree-panel :deep(.el-tree-node__content:hover) { background-color: #f0f7f3; }
.tree-panel :deep(.el-tree-node.is-current > .el-tree-node__content) { background-color: #eaf7ef; border-left-color: #46b97e; color: #2d8a5e; font-weight: 600; }
.tree-panel :deep(.el-tree-node__label) { font-size: 20px; }
.tree-panel :deep(.el-tree-node:not(.is-leaf) > .el-tree-node__content .el-tree-node__label) { font-weight: 600; font-size: 21px; color: #303133; }
.tree-panel :deep(.el-tree-node.is-leaf > .el-tree-node__content) { padding-left: 28px; }
.tree-panel :deep(.el-tree-node__expand-icon) { font-size: 18px; padding: 6px; color: #909399; }
.tree-panel :deep(.el-input__inner) { height: 44px; font-size: 18px; }
.tree-panel :deep(.el-input__prefix) { font-size: 18px; }
.params-panel { flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
.params-card { flex: 1; min-height: 0; background: #fff; border-radius: 8px; border: 1px solid #e4e7ed; box-shadow: 0 1px 4px rgba(0,0,0,0.04); display: flex; flex-direction: column; overflow: hidden; }
.card-header { padding: 30px 28px 0; flex-shrink: 0; }
.card-title { font-size: 27px; font-weight: 700; color: #303133; }
.title-divider { display: flex; align-items: center; margin-top: 10px; }
.title-divider .dot { width: 6px; height: 6px; border-radius: 50%; margin-right: 6px; flex-shrink: 0; }
.title-divider .dot.dark { background-color: #46b97e; } .title-divider .dot.mid { background-color: #90d5b2; } .title-divider .dot.light { background-color: #c7ead7; }
.title-divider .line { flex: 1; height: 1px; background-color: #e9e9e9; }
.card-body { flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 24px 28px; overflow-y: auto; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; gap: 24px; }
.empty-state img { height: 160px; opacity: 0.35; }
.empty-text { font-size: 24px; color: #b0b3b8; letter-spacing: 2px; }
.set-content-container { width: 100%; display: flex; flex-wrap: wrap; gap: 16px; }
.param-field { display: flex; flex-direction: column; gap: 8px; width: 220px; }
.param-label { font-size: 20px; font-weight: 600; color: #606266; }
.param-select { width: 100%; }
.param-select :deep(.el-select__wrapper), .param-select :deep(.el-input__inner), .param-select :deep(.el-input) { height: 50px; min-height: 50px; font-size: 20px; }
.param-select :deep(.el-input__inner) { padding: 0 16px; line-height: 50px; }
.param-select :deep(.el-select__wrapper) { box-shadow: 0 0 0 1px #dcdfe6 inset; border-radius: 6px; }
.param-input { width: 100%; }
.param-input :deep(.el-input__wrapper), .param-input :deep(.el-input__inner), .param-input :deep(.el-input) { height: 50px; min-height: 50px; font-size: 20px; }
.param-input :deep(.el-input__wrapper) { box-shadow: 0 0 0 1px #dcdfe6 inset; border-radius: 6px; }
.btn-row { display: flex; justify-content: flex-end; margin-top: 20px; flex-shrink: 0; padding: 0 28px 20px; }
.confirm-btn { display: flex; align-items: center; justify-content: center; gap: 8px; min-width: 200px; height: 52px; padding: 0 36px; background: linear-gradient(135deg,#46b97e 0%,#3da06b 100%); color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:22px; font-weight:600; letter-spacing:2px; box-shadow:0 4px 14px rgba(70,185,126,0.3); transition:all 0.25s ease; }
.confirm-btn:hover { background: linear-gradient(135deg,#3da06b 0%,#338c59 100%); box-shadow:0 6px 20px rgba(70,185,126,0.4); transform:translateY(-1px); }
.confirm-btn:active { transform:translateY(0); box-shadow:0 2px 8px rgba(70,185,126,0.3); }
.confirm-btn .el-icon { font-size: 22px; }
</style>
