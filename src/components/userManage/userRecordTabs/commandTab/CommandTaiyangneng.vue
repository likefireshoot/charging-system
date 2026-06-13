<template>
  <div class="command-panel">
    <div class="command-body">
      <div class="tree-panel">
        <div class="tree-header">
          <img src="@/assets/yonghu/icon5.png" alt="" class="tree-header-icon" />
          <span>命令列表</span>
        </div>
        <el-input v-model="commandFilterText" placeholder="搜索命令..." prefix-icon="Search" class="tree-search" />
        <el-tree ref="commandTreeRef" :data="command_taiyangneng_data" :props="commandProps" default-expand-all
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
            <div v-if="!isValidCommandNode && !node.id" class="empty-state">
              <img src="@/assets/yonghu/0.png" alt="" />
              <span class="empty-text">请在左侧命令树中选择一条命令</span>
            </div>
            <div v-else>
              <!-- 设置心跳上报间隔 -->
              <el-form v-if="node.label == '设置心跳上报间隔'" ref="heartIntervalForm" :model="params_set_tai" :rules="heartIntervalRules" class="param-form">
                <div class="param-field"><span class="param-label">心跳上报间隔(秒)</span><el-form-item prop="heartInterval"><el-input v-model="params_set_tai.heartInterval" class="param-input" /></el-form-item></div>
              </el-form>
              <!-- 设置网络参数 -->
              <el-form v-else-if="node.label === '设置网络参数'" ref="wangluoForm" :model="params_set_tai.wangluo" :rules="wangluoRules" class="param-form">
                <div class="param-field"><span class="param-label">IP地址</span><el-form-item prop="ip"><el-input v-model="params_set_tai.wangluo.ip" class="param-input" /></el-form-item></div>
                <div class="param-field"><span class="param-label">端口号</span><el-form-item prop="port"><el-input v-model="params_set_tai.wangluo.port" class="param-input" /></el-form-item></div>
              </el-form>
              <!-- 设置抄表配置 -->
              <el-form v-else-if="node.label === '设置抄表配置'" ref="chaobiaoPeizhiForm" :model="params_set_tai.chaobiaoPeizhi" :rules="chaobiaoPeizhiRules" class="param-form">
                <div class="param-field"><span class="param-label">上传方式</span><el-form-item prop="way"><el-select v-model="params_set_tai.chaobiaoPeizhi.way" class="param-select"><el-option label="历史上传" value="0" /><el-option label="实时上传" value="1" /></el-select></el-form-item></div>
                <div class="param-field"><span class="param-label">抄表间隔(小时)</span><el-form-item prop="chaobiaoHour"><el-input v-model="params_set_tai.chaobiaoPeizhi.chaobiaoHour" class="param-input" /></el-form-item></div>
                <div class="param-field"><span class="param-label">抄表间隔(分钟)</span><el-form-item prop="chaobiaoMinute"><el-input v-model="params_set_tai.chaobiaoPeizhi.chaobiaoMinute" class="param-input" /></el-form-item></div>
                <div class="param-field"><span class="param-label">上传间隔(天)</span><el-form-item prop="uploadDate"><el-input v-model="params_set_tai.chaobiaoPeizhi.uploadDate" class="param-input" /></el-form-item></div>
                <div class="param-field"><span class="param-label">上传间隔(小时)</span><el-form-item prop="uploadHour"><el-input v-model="params_set_tai.chaobiaoPeizhi.uploadHour" class="param-input" /></el-form-item></div>
              </el-form>
              <!-- 设置阀门维护配置 -->
              <el-form v-else-if="node.label === '设置阀门维护配置'" ref="famenWeihuForm" :model="params_set_tai.famenWeihu" :rules="famenWeihuRules" class="param-form--block">
                <div class="param-field"><span class="param-label">月洗阀次数</span><el-form-item prop="count"><el-select v-model="params_set_tai.famenWeihu.count" class="param-select"><el-option label="1次" value="1" /><el-option label="2次" value="2" /><el-option label="3次" value="3" /><el-option label="4次" value="4" /></el-select></el-form-item></div>
                <template v-for="level in ['first','second','third','fourth']">
                  <div v-if="params_set_tai.famenWeihu.count >= (level==='first'?1:level==='second'?2:level==='third'?3:4)" :key="level" class="param-field--row">
                    <span class="param-label">{{ {first:'第一次',second:'第二次',third:'第三次',fourth:'第四次'}[level] }}洗阀时间</span>
                    <div class="datetime-row">
                      <el-form-item :prop="level+'.day'"><el-input v-model="params_set_tai.famenWeihu[level].day" placeholder="日" class="param-input-inline" /></el-form-item>
                      <el-form-item :prop="level+'.hour'"><el-input v-model="params_set_tai.famenWeihu[level].hour" placeholder="时" class="param-input-inline" /></el-form-item>
                      <el-form-item :prop="level+'.minute'"><el-input v-model="params_set_tai.famenWeihu[level].minute" placeholder="分" class="param-input-inline" /></el-form-item>
                    </div>
                  </div>
                </template>
              </el-form>
              <!-- 设置水表配置 -->
              <el-form v-else-if="node.label === '设置水表配置'" ref="beilvForm" :model="params_set_tai" :rules="beilvRules" class="param-form">
                <div class="param-field"><span class="param-label">倍率</span><el-form-item prop="beilv"><el-select v-model="params_set_tai.beilv" class="param-select"><el-option label="0.1" value="0.1" /><el-option label="1" value="1" /><el-option label="10" value="10" /><el-option label="100" value="100" /><el-option label="1000" value="1000" /></el-select></el-form-item></div>
              </el-form>
              <!-- 设置读数 -->
              <el-form v-else-if="node.label === '设置读数'" ref="countForm" :model="params_set_tai" :rules="countRules" class="param-form">
                <div class="param-field"><span class="param-label">读数</span><el-form-item prop="count"><el-input v-model="params_set_tai.count" class="param-input" /></el-form-item></div>
              </el-form>
              <!-- 阀门控制 -->
              <el-form v-else-if="node.label === '阀门控制'" ref="famenstateForm" :model="params_set_tai" :rules="famenstateRules" class="param-form">
                <div class="param-field"><span class="param-label">阀门状态</span><el-form-item prop="famenstate"><el-select v-model="params_set_tai.famenstate" class="param-select"><el-option label="开阀" value="1" /><el-option label="关阀" value="0" /></el-select></el-form-item></div>
              </el-form>
              <!-- 校时 -->
              <el-form v-else-if="node.label === '校时'" ref="jiaoshiForm" :model="params_set_tai.jiaoshi"
                :rules="jiaoshiRules" class="param-form--block">
                <div class="param-field--wide">
                  <span class="param-label">校准的时间</span>
                  <div class="datetime-row">
                    <template v-for="k in ['year', 'month', 'day', 'hour', 'minute', 'second']" :key="k">
                      <el-form-item :prop="k">
                        <el-input v-model="params_set_tai.jiaoshi[k]"
                          :placeholder="{ year: '年', month: '月', day: '日', hour: '时', minute: '分', second: '秒' }[k]"
                          class="param-input-inline" />
                      </el-form-item>
                    </template>
                  </div>
                </div>
              </el-form>
              <!-- 设置关阀圈数 -->
              <el-form v-else-if="node.label === '设置关阀圈数'" ref="guanfaForm" :model="params_set_tai.guanfa" :rules="guanfaRules" class="param-form">
                <div class="param-field"><span class="param-label">关阀圈数</span><el-form-item prop="count"><el-input v-model="params_set_tai.guanfa.count" class="param-input" /></el-form-item></div>
                <div class="param-field"><span class="param-label">系列号</span><el-form-item prop="xiliehao"><el-input v-model="params_set_tai.guanfa.xiliehao" class="param-input" /></el-form-item></div>
              </el-form>
              <!-- 设备还原 / 无参数获取命令 -->
              <div v-else-if="node.label === '设备还原'" class="empty-state"><span class="empty-text">设备还原将立即执行</span></div>
              <div v-else-if="isGetCommand" class="empty-state"><span class="empty-text">获取类命令无需参数，点击确认即可下发</span></div>
              <!-- 其他非匹配 -->
              <div v-else class="empty-state"><img src="@/assets/yonghu/0.png" alt="" /><span class="empty-text">暂无参数...</span></div>
            </div>
          </div>
          <div class="btn-row">
            <button class="confirm-btn" @click="commit_taiyangneng"><el-icon><Check /></el-icon><span>确认下发</span></button>
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
  name: "CommandTaiyangneng",
  props: { meterData: { type: Object, default: () => ({}) } },
  data() {
    const validateHeartInterval = (rule, value, callback) => {
      if (value === null || value === undefined || value === "") { callback(new Error("心跳上报间隔不能为空")); }
      else if (!/^\d+$/.test(value) || Number(value) <= 0) { callback(new Error("心跳上报间隔必须为正整数")); }
      else { callback(); }
    };
    const validateIp = (rule, value, callback) => {
      if (value === "") { callback(new Error("IP地址不能为空")); }
      else if (!/^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(value)) { callback(new Error("请输入合法的IP地址")); }
      else { callback(); }
    };
    const validatePort = (rule, value, callback) => {
      if (value === "") { callback(new Error("端口号不能为空")); }
      else if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 65535) { callback(new Error("端口号必须为1-65535的整数")); }
      else { callback(); }
    };
    const validateChaobiaoPeizhi = (rule, value, callback) => {
      if (value === "" || value === undefined || value === null) { callback(new Error(rule.field === 'way' ? "上传方式不能为空" : "该字段不能为空")); }
      else if (['chaobiaoHour', 'chaobiaoMinute', 'uploadDate', 'uploadHour'].includes(rule.field) && (!/^\d+$/.test(value) || Number(value) < 0)) { callback(new Error("该字段必须为非负整数")); }
      else { callback(); }
    };
    const validateFamenWeihu = (rule, value, callback) => {
      const count = this.params_set_tai.famenWeihu.count;
      const fieldMap = {
        'first.day':{min:1,max:31,msg:"日必须为1-31的整数"},'first.hour':{min:0,max:23,msg:"时必须为0-23的整数"},'first.minute':{min:0,max:59,msg:"分必须为0-59的整数"},
        'second.day':{min:1,max:31,msg:"日必须为1-31的整数"},'second.hour':{min:0,max:23,msg:"时必须为0-23的整数"},'second.minute':{min:0,max:59,msg:"分必须为0-59的整数"},
        'third.day':{min:1,max:31,msg:"日必须为1-31的整数"},'third.hour':{min:0,max:23,msg:"时必须为0-23的整数"},'third.minute':{min:0,max:59,msg:"分必须为0-59的整数"},
        'fourth.day':{min:1,max:31,msg:"日必须为1-31的整数"},'fourth.hour':{min:0,max:23,msg:"时必须为0-23的整数"},'fourth.minute':{min:0,max:59,msg:"分必须为0-59的整数"},
      };
      if (rule.field === 'count' && (value === "" || value === undefined)) { callback(new Error("月洗阀次数不能为空")); }
      else if (fieldMap[rule.field]) {
        const level = rule.field.split('.')[0]; const levelMap = { first:1, second:2, third:3, fourth:4 };
        if (count >= levelMap[level] && (value === "" || value === undefined)) { callback(new Error(`${level==='first'?'第一':level==='second'?'第二':level==='third'?'第三':'第四'}次洗阀${rule.field.split('.')[1]}不能为空`)); }
        else if (count >= levelMap[level] && (!/^\d+$/.test(value) || Number(value) < fieldMap[rule.field].min || Number(value) > fieldMap[rule.field].max)) { callback(new Error(fieldMap[rule.field].msg)); }
        else { callback(); }
      } else { callback(); }
    };
    const validateBeilv = (rule, value, callback) => { if (value === "") { callback(new Error("倍率不能为空")); } else { callback(); } };
    const validateCount = (rule, value, callback) => { if (value === null || value === undefined || value === "") { callback(new Error("读数不能为空")); } else if (isNaN(value) || Number(value) <= 0) { callback(new Error("读数必须为正数")); } else { callback(); } };
    const validateFamenstate = (rule, value, callback) => { if (!value && value !== 0) { callback(new Error("请选择阀门状态")); } else { callback(); } };
    const validateJiaoshi = (rule, value, callback) => {
      if (value === "") { callback(new Error(`${rule.field==='year'?'年':rule.field==='month'?'月':rule.field==='day'?'日':rule.field==='hour'?'时':rule.field==='minute'?'分':'秒'}不能为空`)); }
      else {
        const rangeMap = { year:{min:2000,max:2100,msg:"年必须为2000-2100的整数"},month:{min:1,max:12,msg:"月必须为1-12的整数"},day:{min:1,max:31,msg:"日必须为1-31的整数"},hour:{min:0,max:23,msg:"时必须为0-23的整数"},minute:{min:0,max:59,msg:"分必须为0-59的整数"},second:{min:0,max:59,msg:"秒必须为0-59的整数"} };
        if (!/^\d+$/.test(value) || Number(value) < rangeMap[rule.field].min || Number(value) > rangeMap[rule.field].max) { callback(new Error(rangeMap[rule.field].msg)); }
        else { callback(); }
      }
    };
    const validateGuanfa = (rule, value, callback) => {
      if (value === "") { callback(new Error(rule.field === 'count' ? "关阀圈数不能为空" : "系列号不能为空")); }
      else if (rule.field === 'count' && (!/^\d+$/.test(value) || Number(value) <= 0)) { callback(new Error("关阀圈数必须为正整数")); }
      else { callback(); }
    };
    return {
      commandFilterText: "", node: { label: "", id: "", value: "" }, commandProps: { children: "children", label: "label" },
      command_taiyangneng_data: [{ id: 1, value: 1, label: "下发控制命令", children: [
        { id: 5, value: 5, label: "设置抄表配置" }, { id: 6, value: 6, label: "设置阀门维护配置" },
        { id: 7, value: 7, label: "设置水表配置" }, { id: 8, value: 8, label: "设置读数" },
        { id: 9, value: 9, label: "阀门控制" }, { id: 10, value: 10, label: "校时" },
        { id: 11, value: 11, label: "设置关阀圈数" }, { id: 12, value: 12, label: "设备还原" },
      ]}],
      params_set_tai: {
        heartInterval: null,
        wangluo: { ip: "", port: "" },
        chaobiaoPeizhi: { way: "", chaobiaoHour: null, chaobiaoMinute: null, uploadDate: null, uploadHour: null },
        famenWeihu: { count: "", first: { day: "", hour: "", minute: "" }, second: { day: "", hour: "", minute: "" }, third: { day: "", hour: "", minute: "" }, fourth: { day: "", hour: "", minute: "" } },
        beilv: "", count: null, famenstate: "",
        jiaoshi: { year: "", month: "", day: "", hour: "", minute: "", second: "" },
        guanfa: { count: "", xiliehao: "" },
      },
      params_get_tai: {
        heartInterval: "", wangluo: { ip: "", port: "" },
        xintiaoshuju: { dianya: "", imsi: "", lanya: "", uploadtime: { year: "", month: "", day: "", hour: "", minute: "", second: "" } },
        chaobiaoPeizhi: { way: "", chaobiaoMinute: "", uploadHour: "" },
        chaobiaodata: { count: "", first: { year: "", month: "", day: "", hour: "", minute: "", second: "", count: "", rollbackcount: "" }, second: { year: "", month: "", day: "", hour: "", minute: "", second: "", count: "", rollbackcount: "" } },
        famenstate: "", localtime: { year: "", month: "", day: "", hour: "", minute: "", second: "" },
        famenWeihu: { count: "", first: { day: "", hour: "", minute: "" }, second: { day: "", hour: "", minute: "" }, third: { day: "", hour: "", minute: "" }, fourth: { day: "", hour: "", minute: "" } },
        reboot: "",
      },
      heartIntervalRules: { heartInterval: [{ validator: validateHeartInterval, trigger: 'blur' }] },
      wangluoRules: { ip: [{ validator: validateIp, trigger: 'blur' }], port: [{ validator: validatePort, trigger: 'blur' }] },
      chaobiaoPeizhiRules: { way: [{ validator: validateChaobiaoPeizhi, trigger: 'change' }], chaobiaoHour: [{ validator: validateChaobiaoPeizhi, trigger: 'blur' }], chaobiaoMinute: [{ validator: validateChaobiaoPeizhi, trigger: 'blur' }], uploadDate: [{ validator: validateChaobiaoPeizhi, trigger: 'blur' }], uploadHour: [{ validator: validateChaobiaoPeizhi, trigger: 'blur' }] },
      famenWeihuRules: { count: [{ validator: validateFamenWeihu, trigger: 'change' }], 'first.day':[{ validator: validateFamenWeihu, trigger: 'blur' }], 'first.hour':[{ validator: validateFamenWeihu, trigger: 'blur' }], 'first.minute':[{ validator: validateFamenWeihu, trigger: 'blur' }], 'second.day':[{ validator: validateFamenWeihu, trigger: 'blur' }], 'second.hour':[{ validator: validateFamenWeihu, trigger: 'blur' }], 'second.minute':[{ validator: validateFamenWeihu, trigger: 'blur' }], 'third.day':[{ validator: validateFamenWeihu, trigger: 'blur' }], 'third.hour':[{ validator: validateFamenWeihu, trigger: 'blur' }], 'third.minute':[{ validator: validateFamenWeihu, trigger: 'blur' }], 'fourth.day':[{ validator: validateFamenWeihu, trigger: 'blur' }], 'fourth.hour':[{ validator: validateFamenWeihu, trigger: 'blur' }], 'fourth.minute':[{ validator: validateFamenWeihu, trigger: 'blur' }] },
      beilvRules: { beilv: [{ validator: validateBeilv, trigger: 'change' }] },
      countRules: { count: [{ validator: validateCount, trigger: 'blur' }] },
      famenstateRules: { famenstate: [{ validator: validateFamenstate, trigger: 'change' }] },
      jiaoshiRules: { year:[{ validator: validateJiaoshi, trigger:'blur' }], month:[{ validator: validateJiaoshi, trigger:'blur' }], day:[{ validator: validateJiaoshi, trigger:'blur' }], hour:[{ validator: validateJiaoshi, trigger:'blur' }], minute:[{ validator: validateJiaoshi, trigger:'blur' }], second:[{ validator: validateJiaoshi, trigger:'blur' }] },
      guanfaRules: { count: [{ validator: validateGuanfa, trigger: 'blur' }], xiliehao: [{ validator: validateGuanfa, trigger: 'blur' }] },
    };
  },
  computed: {
    isValidCommandNode() {
      const parent = this.command_taiyangneng_data[0];
      if (!parent || !parent.children) return false;
      return parent.children.some((c) => c.id === this.node.id);
    },
    isGetCommand() { return ['获取心跳上报间隔','获取网络参数','获取心跳数据','获取抄表配置','获取抄表数据','获取阀门状态','获取本地时间','获取阀门维护配置','获取设备状态'].includes(this.node.label); },
  },
  watch: { commandFilterText(val) { this.$refs.commandTreeRef.filter(val); } },
  mounted() { this.$nextTick(() => { this.commandTreeRef = this.$refs.commandTreeRef; }); },
  methods: {
    command_filterNode(value, data) { if (!value) return true; return data.label.includes(value); },
    handleNodeClick(node) { this.node.id = node.id; this.node.value = node.value; this.node.label = node.label; },
    formatDateTime(year, month, day, hour, minute, second) { const pad = (n) => n.toString().padStart(2, "0"); return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(second)}`; },
    commit_taiyangneng() {
      const imei = this.meterData.imei;
      if (this.node.label === "设置心跳上报间隔") {
        if (!this.$refs.heartIntervalForm) { ElMessage.error('表单未加载完成，请稍后重试'); return; }
        this.$refs.heartIntervalForm.validate((valid) => {
          if (!valid) return;
          const fd = new FormData(); fd.append("imei", imei); fd.append("interval", parseInt(this.params_set_tai.heartInterval, 10));
          service.post("/solarEnergy/waterMeterSetBeatInterval80H", fd).then((res) => { if (res.code === 200) { ElMessage.success("设置心跳上报间隔成功"); } else { ElMessage.error(res.msg); } }).catch((e) => { ElMessage.error(e); });
        });
      } else if (this.node.label === "设置网络参数") {
        if (!this.$refs.wangluoForm) { ElMessage.error('表单未加载完成，请稍后重试'); return; }
        this.$refs.wangluoForm.validate((valid) => { if (!valid) return; ElMessage.error("暂未开通"); });
      } else if (this.node.label === "设置抄表配置") {
        if (!this.$refs.chaobiaoPeizhiForm) { ElMessage.error('表单未加载完成，请稍后重试'); return; }
        this.$refs.chaobiaoPeizhiForm.validate((valid) => {
          if (!valid) return;
          const c = this.params_set_tai.chaobiaoPeizhi;
          service.get(`/command/solarEnergy/solarEnergySetReadConfig?imei=${imei}&uploadForm=${c.way}&readHour=${c.chaobiaoHour}&readMinute=${c.chaobiaoMinute}&uploadDay=${c.uploadDate}&uploadHour=${c.uploadHour}`).then((res) => { if (res.code === 200) { ElMessage.success("设置抄表配置成功"); } else { ElMessage.error(res.msg); } }).catch((e) => { ElMessage.error(e); });
        });
      } else if (this.node.label === "设置阀门维护配置") {
        if (!this.$refs.famenWeihuForm) { ElMessage.error('表单未加载完成，请稍后重试'); return; }
        this.$refs.famenWeihuForm.validate((valid) => {
          if (!valid) return;
          const w = this.params_set_tai.famenWeihu;
          const req = { imei, washingFrequency: w.count };
          const empty = { day: 0, hour: 0, minute: 0 };
          req.firstWashingTime = w.count >= 1 ? { day: w.first.day, hour: w.first.hour, minute: w.first.minute } : empty;
          req.secondWashingTime = w.count >= 2 ? { day: w.second.day, hour: w.second.hour, minute: w.second.minute } : empty;
          req.thirdWashingTime = w.count >= 3 ? { day: w.third.day, hour: w.third.hour, minute: w.third.minute } : empty;
          req.fourthWashingTime = w.count >= 4 ? { day: w.fourth.day, hour: w.fourth.hour, minute: w.fourth.minute } : empty;
          service.post("/command/solarEnergy/solarEnergySetMaintenance", req).then((res) => { if (res.code === 200) { ElMessage.success("设置阀门维护配置成功"); } else { ElMessage.error(res.msg); } }).catch((e) => { ElMessage.error(e); });
        });
      } else if (this.node.label === "设置水表配置") {
        if (!this.$refs.beilvForm) { ElMessage.error('表单未加载完成，请稍后重试'); return; }
        this.$refs.beilvForm.validate((valid) => {
          if (!valid) return;
          service.get(`/command/solarEnergy/solarEnergySetMultiplier?imei=${imei}&multiplier=${this.params_set_tai.beilv}`).then((res) => { if (res.code === 200) { ElMessage.success("设置水表配置成功"); } else { ElMessage.error(res.msg); } }).catch((e) => { ElMessage.error(e); });
        });
      } else if (this.node.label === "设置读数") {
        if (!this.$refs.countForm) { ElMessage.error('表单未加载完成，请稍后重试'); return; }
        this.$refs.countForm.validate((valid) => {
          if (!valid) return;
          service.get(`/command/solarEnergy/solarEnergySetReadCount?imei=${imei}&count=${this.params_set_tai.count}`).then((res) => { if (res.code === 200) { ElMessage.success("设置读数成功"); } else { ElMessage.error(res.msg); } }).catch((e) => { ElMessage.error(e); });
        });
      } else if (this.node.label === "阀门控制") {
        if (!this.$refs.famenstateForm) { ElMessage.error('表单未加载完成，请稍后重试'); return; }
        this.$refs.famenstateForm.validate((valid) => {
          if (!valid) return;
          service.get(`/command/solarEnergy/solarEnergyValveCommand?imei=${imei}&status=${this.params_set_tai.famenstate}`).then((res) => { if (res.code === 200) { ElMessage.success("设置阀门状态成功"); } else { ElMessage.error(res.msg); } }).catch((e) => { ElMessage.error(e); });
        });
      } else if (this.node.label === "校时") {
        if (!this.$refs.jiaoshiForm) { ElMessage.error('表单未加载完成，请稍后重试'); return; }
        this.$refs.jiaoshiForm.validate((valid) => {
          if (!valid) return;
          const j = this.params_set_tai.jiaoshi;
          service.get(`/command/solarEnergy/solarEnergySetCalibrationTime?imei=${imei}&time=${this.formatDateTime(j.year,j.month,j.day,j.hour,j.minute,j.second)}`).then((res) => { if (res.code === 200) { ElMessage.success("设置校时成功"); } else { ElMessage.error(res.msg); } }).catch((e) => { ElMessage.error(e); });
        });
      } else if (this.node.label === "设置关阀圈数") {
        if (!this.$refs.guanfaForm) { ElMessage.error('表单未加载完成，请稍后重试'); return; }
        this.$refs.guanfaForm.validate((valid) => {
          if (!valid) return;
          service.get(`/command/solarEnergy/solarEnergySetCloseCycle?imei=${imei}&closeCircle=${this.params_set_tai.guanfa.count}&serialNumber=${this.params_set_tai.guanfa.xiliehao}`).then((res) => { if (res.code === 200) { ElMessage.success("设置关阀圈数成功"); } else { ElMessage.error(res.msg); } }).catch((e) => { ElMessage.error(e); });
        });
      } else if (this.node.label === "设备还原") {
        service.get(`/command/solarEnergy/solarEnergyReSetDevice?imei=${imei}`).then((res) => { if (res.code === 200) { ElMessage.success("设备还原成功"); } else { ElMessage.error(res.msg); } }).catch((e) => { ElMessage.error(e); });
      } else if (this.node.label === "获取心跳上报间隔") {
        const fd1 = new FormData(); fd1.append("imei", imei); fd1.append("command_type", 1);
        const fd2 = new FormData(); fd2.append("imei", imei);
        service.post("/solarEnergy/waterMeterGetGeneralCommand", fd1).then((res) => { if (res.code === 200) { ElMessage.success("获取心跳上报间隔成功"); } else { ElMessage.error(res.msg); } }).catch((e) => { ElMessage.error(e); });
        service.post("/solarEnergy/waterMeterGetBeatInterval00H", fd2).then((res) => { if (res.code === 200) { ElMessage.success("获取心跳上报间隔成功"); this.params_get_tai.heartInterval = res.data[0].intervalSecs; } else { ElMessage.error(res.msg); } });
      } else if (this.node.label === "获取网络参数") { ElMessage.error("暂未开通");
      } else if (this.node.label === "获取心跳数据") {
        const fd1 = new FormData(); fd1.append("imei", imei); fd1.append("command_type", 3);
        const fd2 = new FormData(); fd2.append("imei", imei);
        service.post("/solarEnergy/waterMeterGetGeneralCommand", fd1).then((res) => { if (res.code === 200) { ElMessage.success("获取心跳数据成功"); } else { ElMessage.error(res.msg); } }).catch((e) => { ElMessage.error(e); });
        service.post("/solarEnergy/waterMeterGetBeatData06H", fd2).then((res) => { if (res.code === 200) { ElMessage.success("获取心跳数据成功"); this.params_get_tai.xintiaoshuju.dianya = res.data[0].batteryVoltage; this.params_get_tai.xintiaoshuju.lanya = res.data[0].bluetoothAddress; } else { ElMessage.error(res.msg); } });
      } else if (this.node.label === "获取抄表配置") { ElMessage.error("暂未开通");
      } else if (this.node.label === "获取抄表数据") { ElMessage.error("暂未开通");
      } else if (this.node.label === "获取阀门状态") {
        const fd1 = new FormData(); fd1.append("imei", imei); fd1.append("command_type", 6);
        const fd2 = new FormData(); fd2.append("imei", imei);
        service.post("/solarEnergy/waterMeterGetGeneralCommand", fd1).then((res) => { if (res.code === 200) { ElMessage.success("获取阀门状态成功"); } else { ElMessage.error(res.msg); } }).catch((e) => { ElMessage.error(e); });
        service.post("/solarEnergy/waterMeterGetOpenClose0EH", fd2).then((res) => { if (res.code === 200) { ElMessage.success("获取阀门状态成功"); this.params_get_tai.famenstate = res.data[0].valveStatus; } else { ElMessage.error(res.msg); } }).catch((e) => { ElMessage.error(e); });
      } else if (this.node.label === "获取本地时间") { ElMessage.error("暂未开通");
      } else if (this.node.label === "获取阀门维护配置") { ElMessage.error("暂未开通");
      } else if (this.node.label === "获取设备状态") { ElMessage.error("暂未开通"); }
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
.param-form { display: flex; flex-wrap: wrap; gap: 16px 24px; max-width: 900px; }
.param-form--block { display: flex; flex-direction: column; gap: 16px; max-width: 900px; }
.param-field { display: flex; flex-direction: column; gap: 8px; width: 220px; }
.param-field--wide { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.param-field--row { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.param-label { font-size: 20px; font-weight: 600; color: #606266; }
.param-field :deep(.el-form-item), .param-field--wide :deep(.el-form-item), .param-field--row :deep(.el-form-item) { margin-bottom: 0; }
.param-field :deep(.el-form-item__error) { font-size: 16px; padding-top: 4px; }
.param-select { width: 100%; }
.param-select :deep(.el-select__wrapper), .param-select :deep(.el-input__inner), .param-select :deep(.el-input) { height: 50px; min-height: 50px; font-size: 20px; }
.param-select :deep(.el-input__inner) { padding: 0 16px; line-height: 50px; }
.param-select :deep(.el-select__wrapper) { box-shadow: 0 0 0 1px #dcdfe6 inset; border-radius: 6px; }
.param-input { width: 100%; }
.param-input :deep(.el-input__wrapper), .param-input :deep(.el-input__inner), .param-input :deep(.el-input) { height: 50px; min-height: 50px; font-size: 20px; }
.param-input :deep(.el-input__wrapper) { box-shadow: 0 0 0 1px #dcdfe6 inset; border-radius: 6px; }
.param-input-inline { width: 100px; flex-shrink: 0; }
.param-input-inline :deep(.el-input__wrapper), .param-input-inline :deep(.el-input__inner) { height: 50px; min-height: 50px; font-size: 20px; }
.param-input-inline :deep(.el-input__wrapper) { box-shadow: 0 0 0 1px #dcdfe6 inset; border-radius: 6px; }
.datetime-row { display: flex; gap: 8px; }
.btn-row { display: flex; justify-content: flex-end; margin-top: 20px; flex-shrink: 0; padding: 0 28px 20px; }
.confirm-btn { display: flex; align-items: center; justify-content: center; gap: 8px; min-width: 200px; height: 52px; padding: 0 36px; background: linear-gradient(135deg,#46b97e 0%,#3da06b 100%); color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:22px; font-weight:600; letter-spacing:2px; box-shadow:0 4px 14px rgba(70,185,126,0.3); transition:all 0.25s ease; }
.confirm-btn:hover { background: linear-gradient(135deg,#3da06b 0%,#338c59 100%); box-shadow:0 6px 20px rgba(70,185,126,0.4); transform:translateY(-1px); }
.confirm-btn:active { transform:translateY(0); box-shadow:0 2px 8px rgba(70,185,126,0.3); }
.confirm-btn .el-icon { font-size: 22px; }
</style>
