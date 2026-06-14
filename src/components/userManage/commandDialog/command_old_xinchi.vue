<template>
  <!-- 命令下发弹出框-旧信驰 -->
  <div class="command-dialog" v-if="command_dialogFormVisible">
    <div class="command-dialog-content" v-if="commandType === '旧信驰'">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon5.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 20px">命令下发</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer; width: 50px" @click="closeCommandDialog">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="command-content">
        <div class="command-body">
          <div class="command-select">
            <el-input v-model="commandFilterText" placeholder="请输入命令名称..."
                      style="height: 40px; margin-bottom: 10px; margin-top: 10px"></el-input>
            <el-tree ref="commandTreeRef" style="width: 100%; flex: 1; overflow-y: auto"
                     :data="command_xinchi_data" :props="commandProps" default-expand-all
                     :filter-node-method="command_filterNode" @node-click="handleNodeClick"></el-tree>
          </div>
          <div class="command-params">
            <div class="set-params">
            <span style="font-size: 25px; margin-top: 10px; margin-bottom: 5px">设置参数</span>
            <div class="flex-container">
              <div style="width: 4px; height: 4px; background-color: #46b87d; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #90d5b2; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #c7ead7; margin-right: 5px"></div>
              <div style="width: 94%; height: 1px; background-color: #e9e9e9"></div>
            </div>
            <div class="set-content">
              <div v-if="node.id == '' || node.id == 1 || node.id >= 5" class="set-content-container">
                <div class="set-input" style="width: 100%; height: 175px; justify-content: center; align-items: center">
                  <img src="@/assets/yonghu/0.png" alt="" style="width: auto; height: 75%" />
                  <span>暂无参数...</span>
                </div>
              </div>
              <div v-else>
                <!-- <div class="set-content-container" v-if="node.label === '设置周期上报参数'">
                  <div class="set-input">
                    <span>周期频率</span>
                    <el-select v-model="params_set_tai.zhouqishangbao.way">
                      <el-option label="每小时" value="5"></el-option>
                      <el-option label="每天" value="6"></el-option>
                      <el-option label="每周" value="7"></el-option>
                      <el-option label="每月" value="8"></el-option>
                    </el-select>
                  </div>
                  <div class="set-input">
                    <span>星期</span>
                    <el-input v-model="params_set_tai.zhouqishangbao.week" placeholder="有效值为0~7"></el-input>
                  </div>
                  <div class="set-input">
                    <span>周期间隔</span>
                    <el-input v-model="params_set_tai.zhouqishangbao.interval"></el-input>
                  </div>
                  <div class="set-input" style="width: 100%">
                    <span>开始时间</span>
                    <div style="width: 100%; display: flex; justify-content: space-between">
                      <el-input style="margin-right: 10px" v-model="params_set_tai.zhouqishangbao.year"
                        placeholder="年"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.zhouqishangbao.month"
                        placeholder="月"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.zhouqishangbao.day"
                        placeholder="日"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.zhouqishangbao.hour"
                        placeholder="时"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.zhouqishangbao.minute"
                        placeholder="分"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.zhouqishangbao.second"
                        placeholder="秒"></el-input>
                    </div>
                  </div>
                </div> -->
                <!-- <div class="set-content-container" v-if="node.label === '阀门控制'">
                  <div class="set-input">
                    <span>阀门状态</span>
                    <el-select v-model="params_set_tai.famenstate">
                      <el-option label="开阀" value="1"></el-option>
                      <el-option label="关阀" value="0"></el-option>
                    </el-select>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '设置读数'">
                  <div class="set-input">
                    <span>读数</span>
                    <el-input v-model="params_set_tai.count" type="number"></el-input>
                  </div>
                </div> -->

                <el-form :model="params_set_tai.zhouqishangbao" :rules="cycleReportRules" ref="cycleReportForm"
                  class="set-content-container" v-if="node.label === '设置周期上报参数'">
                  <div class="set-input">
                    <span>周期单位</span>
                    <el-form-item prop="way" style="margin: 0;">
                      <el-select v-model="params_set_tai.zhouqishangbao.way" class="big-font-el-select">
                        <el-option label="每小时" value="5"></el-option>
                        <el-option label="每天" value="6"></el-option>
                        <el-option label="每周" value="7"></el-option>
                        <el-option label="每月" value="8"></el-option>
                      </el-select>
                    </el-form-item>
                  </div>
                  <div class="set-input">
                    <span>间隔数量</span>
                    <el-form-item prop="interval" style="margin: 0;">
                      <el-input v-model="params_set_tai.zhouqishangbao.interval" placeholder="请输入间隔数量"></el-input>
                    </el-form-item>
                  </div>
                  <div class="set-input" v-if="params_set_tai.zhouqishangbao.way == '7'">
                    <span>周几上报</span>
                    <el-form-item prop="week" style="margin: 0;">
                      <el-select v-model="params_set_tai.zhouqishangbao.week" class="big-font-el-select">
                        <el-option label="星期一" :value="1"></el-option>
                        <el-option label="星期二" :value="2"></el-option>
                        <el-option label="星期三" :value="3"></el-option>
                        <el-option label="星期四" :value="4"></el-option>
                        <el-option label="星期五" :value="5"></el-option>
                        <el-option label="星期六" :value="6"></el-option>
                        <el-option label="星期日" :value="7"></el-option>
                      </el-select>
                    </el-form-item>
                  </div>
                  <div class="set-input" style="width: 100%">
                    <span>周期起始时间</span>
                    <el-form-item prop="year" style="margin: 0;">
                      <el-date-picker
                        v-model="cycleReportDateTimeStr"
                        type="datetime"
                        placeholder="选择周期起始时间"
                        format="YYYY-MM-DD HH:mm:ss"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </div>
                </el-form>

                <!-- 阀门控制：新增el-form包裹，绑定model和rules -->
                <el-form :model="params_set_tai" :rules="valveControlRules" ref="valveControlForm"
                  class="set-content-container" v-if="node.label === '阀门控制'">
                  <div class="set-input">
                    <span>阀门状态</span>
                    <el-form-item prop="famenstate" style="margin: 0;">
                      <el-select v-model="params_set_tai.famenstate" class="big-font-el-select">
                        <el-option label="开阀" value="1"></el-option>
                        <el-option label="关阀" value="0"></el-option>
                      </el-select>
                    </el-form-item>
                  </div>
                </el-form>

                <!-- 设置读数：新增el-form包裹，绑定model和rules -->
                <el-form :model="params_set_tai" :rules="readCountRules" ref="readCountForm"
                  class="set-content-container" v-if="node.label === '设置读数'">
                  <div class="set-input">
                    <span>读数</span>
                    <el-form-item prop="count" style="margin: 0;">
                      <el-input v-model="params_set_tai.count" type="number"></el-input>
                    </el-form-item>
                  </div>
                </el-form>
                <!-- 周期上报预览卡片（始终显示，填空式） -->
                <div class="cycle-preview-card" v-if="node.label === '设置周期上报参数'">
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
              </div>
            </div>
          </div>
          <div class="get-params">
            <span style="font-size: 25px; margin-top: 10px; margin-bottom: 5px">返回值</span>
            <div class="flex-container">
              <div style="width: 4px; height: 4px; background-color: #46b87d; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #90d5b2; margin-right: 5px"></div>
              <div style="width: 4px; height: 4px; background-color: #c7ead7; margin-right: 5px"></div>
              <div style="width: 94%; height: 1px; background-color: #e9e9e9"></div>
            </div>
            <div class="get-content">
              <div v-if="node.id <= 4" class="set-content-container">
                <div class="set-input" style="width: 100%; height: 175px; justify-content: center; align-items: center">
                  <img src="@/assets/yonghu/0.png" alt="" style="width: auto; height: 75%" />
                  <span>暂无返回值...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="btns">
        <div class="confirm-btn" @click="commit_xinchi">
          <el-icon style="margin-left: -3%">
            <Check />
          </el-icon>
          <span style="font-size: 20px; margin-left: 5%">确认</span>
        </div>
        <div class="cancel-btn" @click="closeCommandDialog">
          <el-icon style="margin-left: -3%; color: #45ba7e">
            <Close />
          </el-icon>
          <span style="font-size: 20px; margin-left: 5%; color: #5a5a5a">取消</span>
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
  props: {
    command_dialogFormVisible: {
      type: Boolean,
      default: false,
    },
    commandType: {
      type: String,
      default: "",
    },
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    // 周期频率校验：非空
    const validateWay = (rule, value, callback) => {
      if (!value) {
        callback(new Error('周期单位不能为空'));
      } else {
        callback();
      }
    };

    // 星期校验：非空 + 0~7整数
    const validateWeek = (rule, value, callback) => {
      // 星期映射规则：周几对应数值几（周一=1, 周二=2, ..., 周日=7），非周模式统一填 0
      if (value === '' || value === undefined || value === null) {
        callback(new Error('请选择周几上报'));
      } else if (!/^\d+$/.test(String(value)) || Number(value) < 0 || Number(value) > 7) {
        callback(new Error('请选择有效的星期（星期一~星期日）'));
      } else if (this.params_set_tai.zhouqishangbao.way === '7' && Number(value) === 0) {
        callback(new Error('每周模式下请选择具体星期（星期一~星期日）'));
      } else {
        callback();
      }
    };

    // 周期间隔校验：非空 + 正整数
    const validateInterval = (rule, value, callback) => {
      if (value === '' || value === undefined || value === null) {
        callback(new Error('间隔数量不能为空'));
      } else if (!/^\d+$/.test(value) || Number(value) <= 0) {
        callback(new Error('间隔数量必须为正整数'));
      } else {
        callback();
      }
    };

    // 年份校验：非空 + 合理范围（1970~2099）
    const validateYear = (rule, value, callback) => {
      if (value === '' || value === undefined || value === null) {
        callback(new Error('年份不能为空'));
      } else if (!/^\d+$/.test(value) || Number(value) < 1970 || Number(value) > 2099) {
        callback(new Error('年份必须为1970~2099的整数'));
      } else {
        callback();
      }
    };

    // 月份校验：非空 + 1~12
    const validateMonth = (rule, value, callback) => {
      if (value === '' || value === undefined || value === null) {
        callback(new Error('月份不能为空'));
      } else if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 12) {
        callback(new Error('月份必须为1~12的整数'));
      } else {
        callback();
      }
    };

    // 日期校验：非空 + 1~31
    const validateDay = (rule, value, callback) => {
      if (value === '' || value === undefined || value === null) {
        callback(new Error('日期不能为空'));
      } else if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 31) {
        callback(new Error('日期必须为1~31的整数'));
      } else {
        callback();
      }
    };

    // 小时校验：非空 + 0~23
    const validateHour = (rule, value, callback) => {
      if (value === '' || value === undefined || value === null) {
        callback(new Error('小时不能为空'));
      } else if (!/^\d+$/.test(value) || Number(value) < 0 || Number(value) > 23) {
        callback(new Error('小时必须为0~23的整数'));
      } else {
        callback();
      }
    };

    // 分钟校验：非空 + 0~59
    const validateMinute = (rule, value, callback) => {
      if (value === '' || value === undefined || value === null) {
        callback(new Error('分钟不能为空'));
      } else if (!/^\d+$/.test(value) || Number(value) < 0 || Number(value) > 59) {
        callback(new Error('分钟必须为0~59的整数'));
      } else {
        callback();
      }
    };

    // 秒数校验：非空 + 0~59
    const validateSecond = (rule, value, callback) => {
      if (value === '' || value === undefined || value === null) {
        callback(new Error('秒数不能为空'));
      } else if (!/^\d+$/.test(value) || Number(value) < 0 || Number(value) > 59) {
        callback(new Error('秒数必须为0~59的整数'));
      } else {
        callback();
      }
    };
    const validateFamenstate = (rule, value, callback) => {
      if (!value && value !== 0) { // 注意value是0（关阀）/1（开阀），需排除false但0是有效值
        callback(new Error('请选择阀门状态'));
      } else {
        callback();
      }
    };

    // ========== 新增：读数校验（非空 + 正整数） ==========
    const validateCount = (rule, value, callback) => {
      if (value === '' || value === undefined || value === null) {
        callback(new Error('读数不能为空'));
      } else if (isNaN(value) || value <= 0) {
        callback(new Error('读数必须为正整数'));
      } else {
        callback();
      }
    };
    return {
      commandFilterText: "",
      // 周期起始时间选择器绑定值（YYYY-MM-DD HH:mm:ss 格式字符串）
      cycleReportDateTimeStr: "",
      //当前所选择到的子节点的信息
      node: {
        label: "",
        id: "",
        value: "",
      },
      commandProps: {
        children: "children",
        label: "label",
      },
      command_xinchi_data: [
        {
          id: 1,
          value: 1,
          label: "下发控制命令",
          children: [
            {
              id: 2,
              value: 2,
              label: "设置周期上报参数",
            },
            {
              id: 3,
              value: 3,
              label: "阀门控制",
            },
            {
              id: 4,
              value: 4,
              label: "设置读数",
            },
          ],
        },
      ],
      params_set_tai: {
        famenstate: "",
        zhouqishangbao: {
          way: "",
          week: 0,
          interval: null,
          year: "",
          month: "",
          day: "",
          hour: "",
          minute: "",
          second: "",
        },
        count: '',

      },
      // 新增周期上报参数校验规则
      cycleReportRules: {
        way: [{ validator: validateWay, trigger: 'change' }],
        week: [{ validator: validateWeek, trigger: 'change' }],
        interval: [{ validator: validateInterval, trigger: 'blur' }],
        year: [{ validator: validateYear, trigger: 'blur' }],
        month: [{ validator: validateMonth, trigger: 'blur' }],
        day: [{ validator: validateDay, trigger: 'blur' }],
        hour: [{ validator: validateHour, trigger: 'blur' }],
        minute: [{ validator: validateMinute, trigger: 'blur' }],
        second: [{ validator: validateSecond, trigger: 'blur' }]
      },
      valveControlRules: {
        famenstate: [{ validator: validateFamenstate, trigger: 'change' }]
      },
      readCountRules: {
        count: [{ validator: validateCount, trigger: 'blur' }]
      },
    };
  },

  computed: {
    /**
     * 周期单位中文映射
     */
    cycleReportUnit() {
      const unitMap = { '5': '小时', '6': '天', '7': '周', '8': '月' };
      return unitMap[this.params_set_tai.zhouqishangbao.way] || '';
    },
  },

  watch: {
    commandFilterText(val) {
      this.$refs.commandTreeRef.filter(val);
    },
    /**
     * 监听日期选择器值变化，分解为独立的年/月/日/时/分/秒字段
     * 保持原有数据结构和请求逻辑不变
     */
    cycleReportDateTimeStr(val) {
      if (val) {
        const parts = val.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
        if (parts) {
          this.params_set_tai.zhouqishangbao.year = parts[1];
          this.params_set_tai.zhouqishangbao.month = parts[2];
          this.params_set_tai.zhouqishangbao.day = parts[3];
          this.params_set_tai.zhouqishangbao.hour = parts[4];
          this.params_set_tai.zhouqishangbao.minute = parts[5];
          this.params_set_tai.zhouqishangbao.second = parts[6];
        }
      } else {
        this.params_set_tai.zhouqishangbao.year = '';
        this.params_set_tai.zhouqishangbao.month = '';
        this.params_set_tai.zhouqishangbao.day = '';
        this.params_set_tai.zhouqishangbao.hour = '';
        this.params_set_tai.zhouqishangbao.minute = '';
        this.params_set_tai.zhouqishangbao.second = '';
      }
    },
    /**
     * 监听周期单位变化：非"每周"模式时，week 自动设为 0
     * 星期映射规则：周几对应数值几（周一=1, ..., 周日=7），非周模式统一填 0
     */
    'params_set_tai.zhouqishangbao.way'(newVal) {
      if (newVal !== '7') {
        this.params_set_tai.zhouqishangbao.week = 0;
      }
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.commandTreeRef = this.$refs.commandTreeRef;
    });
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
      console.log(this.node.id);
      console.log(this.node.value);
      console.log(this.node.label);
    },
    closeCommandDialog() {
      this.node.label = "";
      this.$emit("close");
    },
    /**
     * 将年、月、日、时、分、秒转换为 YYYY-MM-DD HH:MM:SS 格式的字符串
     */
    formatDateTime(year, month, day, hour, minute, second) {
      // 补零函数，确保个位数前有0
      const padZero = (num) => num.toString().padStart(2, "0");
      // 构建并返回格式化的日期时间字符串
      return `${year}-${padZero(month)}-${padZero(day)} ${padZero(hour)}:${padZero(minute)}:${padZero(second)}`;
    },
    // commit_xinchi() {
    //   if (this.node.label === "设置周期上报参数") {
    //     ElMessage.warning("该功能暂未开放！");
    //   } else if (this.node.label === "阀门控制") {
    //     ElMessage.warning("该功能暂未开放！");
    //   } else if (this.node.label === "设置读数") {
    //     ElMessage.warning("该功能暂未开放！");
    //   }
    // },
    commit_xinchi() {
      if (this.node.label === "设置周期上报参数") {
        if (!this.$refs.cycleReportForm) {
          ElMessage.error('表单未加载完成，请稍后重试');
          return;
        }
        this.$refs.cycleReportForm.validate((valid) => {
          console.log(valid)
          if (valid) {
            const imei = this.data.imei;
            const status = this.params_set_tai.zhouqishangbao.way;
            const weeks = this.params_set_tai.zhouqishangbao.week;
            const cycleIntervals = this.params_set_tai.zhouqishangbao.interval;
            const { year, month, day, hour, minute, second } = this.params_set_tai.zhouqishangbao;
            // 调用格式化函数
            const time = this.formatDateTime(year, month, day, hour, minute, second);
            service
              .get(`/command/oldXinChi/oldXinChiSetCycleParametersCommand?imei=${imei}&status=${status}&weeks=${weeks}&cycleIntervals=${cycleIntervals}&time=${time}`)
              .then((res) => {
                if (res.code === 200) {
                  ElMessage.success("周期上报参数设置成功！");
                  // this.closeCommandDialog();
                } else {
                  ElMessage.error(res.msg);
                }
              })
              .catch((error) => {
                ElMessage.error(error.message || "设置周期上报参数失败!");
              });
          }
        });

      } else if (this.node.label === "阀门控制") {
        if (!this.$refs.valveControlForm) {
          ElMessage.error('表单未加载完成，请稍后重试');
          return;
        }
        this.$refs.valveControlForm.validate((valid) => {
          if (valid) {
            const imei = this.data.imei;
            const status = this.params_set_tai.famenstate;
            service
              .get(`/command/oldXinChi/oldXinChiValveCommand?imei=${imei}&status=${status}`)
              .then((res) => {
                if (res.code === 200) {
                  ElMessage.success("阀门设置成功");
                } else {
                  ElMessage.error(res.msg);
                }
              })
              .catch((error) => {
                ElMessage.error(error.msg);
              });
          }
        });
      } else if (this.node.label === "设置读数") {
        if (!this.$refs.readCountForm) {
          ElMessage.error('表单未加载完成，请稍后重试');
          return;
        }
        this.$refs.readCountForm.validate((valid) => {
          if (valid) {
            const imei = this.data.imei;
            const count = this.params_set_tai.count;
            service
              .get(`/command/oldXinChi/oldXinChiSetReadCount?imei=${imei}&count=${count}`)
              .then((res) => {
                if (res.code === 200) {
                  ElMessage.success("表读数设置成功");
                } else {
                  ElMessage.error(res.msg);
                }
              })
              .catch((error) => {
                ElMessage.error(error.msg);
              });
          }
        });
      }

    },
  },
};
</script>

<style scoped>
.command-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.command-dialog-content {
  width: 60%;
  height: 700px;
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
  overflow: hidden;
}

.command-content {
  width: 96%;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 0 10px;
  background: none;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
}

.command-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-wrap: nowrap;
}

.command-select {
  height: 100%;
  width: 260px;
  min-width: 260px;
  flex-shrink: 0;
  min-height: 0;
  overflow: hidden;
  background-color: #fff;
  border-radius: 5px;
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.command-params {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 20px;
}

.set-params,
.get-params {
  background-color: #fff;
  border-radius: 5px;
  width: 98%;
  margin-bottom: 20px;
  padding-left: 10px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.set-content,
.get-content {
  width: 100%;
}

.set-content-container {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
}

.set-input {
  display: flex;
  justify-content: center;
  /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 31.5%;
  height: 75px;
  margin-right: 10px;
}

.set-input>span {
  font-size: 20px;
  color: #747374;
  margin-bottom: 5px;
}

.cycle-summary {
  border-top: 1px dashed #e9e9e9;
  padding-top: 10px;
  margin-top: 5px;
}

/* 周期上报预览卡片 - 始终显示的填空式预览 */
.cycle-preview-card {
  width: 96%;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 14px 16px;
  margin-top: 12px;
  margin-bottom: 4px;
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

.set-input>.el-input {
  height: 35px;
  width: 100%;
}

.flex-container {
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 5px;
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
  flex-shrink: 0;
}

.btns {
  width: 100%;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 8px;
  padding-right: 10px;
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
