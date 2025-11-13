<template>
  <!-- 命令下发弹出框-旧信驰 -->
  <div class="command-dialog" v-if="command_dialogFormVisible">
    <div class="command-dialog-content" v-if="commandType === '旧信驰'">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon5.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 18px">命令下发</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer; width: 50px" @click="closeCommandDialog">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="command-content">
        <div class="command-select">
          <el-input v-model="commandFilterText" placeholder="请输入命令名称..." style="height: 40px; margin-bottom: 10px; margin-top: 10px"></el-input>
          <el-tree
            ref="commandTreeRef"
            style="width: 210px; height: 460px; overflow-y: auto"
            :data="command_xinchi_data"
            :props="commandProps"
            default-expand-all
            :filter-node-method="command_filterNode"
            @node-click="handleNodeClick"
          ></el-tree>
        </div>
        <div class="command-params">
          <div class="set-params">
            <span style="font-size: 16px; margin-top: 10px; margin-bottom: 5px">设置参数</span>
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
                <div class="set-content-container" v-if="node.label === '设置周期上报参数'">
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
                      <el-input style="margin-right: 10px" v-model="params_set_tai.zhouqishangbao.year" placeholder="年"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.zhouqishangbao.month" placeholder="月"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.zhouqishangbao.day" placeholder="日"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.zhouqishangbao.hour" placeholder="时"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.zhouqishangbao.minute" placeholder="分"></el-input>
                      <el-input style="margin-right: 10px" v-model="params_set_tai.zhouqishangbao.second" placeholder="秒"></el-input>
                    </div>
                  </div>
                </div>
                <div class="set-content-container" v-if="node.label === '阀门控制'">
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
                </div>
              </div>
            </div>
          </div>
          <div class="get-params">
            <span style="font-size: 16px; margin-top: 10px; margin-bottom: 5px">返回值</span>
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
          <div class="btns">
            <div class="confirm-btn" @click="commit_xinchi">
              <el-icon style="margin-left: 15%"><Check /></el-icon>
              <span style="font-size: 16px; margin-left: 15%">确认</span>
            </div>
            <div class="cancel-btn" @click="closeCommandDialog">
              <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
              <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">取消</span>
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
    return {
      commandFilterText: "",
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
            // {
            //   id: 2,
            //   value: 2,
            //   label: "设置周期上报参数",
            // },
            {
              id: 3,
              value: 3,
              label: "阀门控制",
            },
            // {
            //   id: 4,
            //   value: 4,
            //   label: "设置读数",
            // },
          ],
        },
      ],
      params_set_tai: {
        famenstate: "",
        zhouqishangbao: {
          way: "",
          week: null,
          interval: null,
          year: "",
          month: "",
          day: "",
          hour: "",
          minute: "",
          second: "",
        },
        count: 0,
      },
    };
  },

  watch: {
    commandFilterText(val) {
      this.$refs.commandTreeRef.filter(val);
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
        const imei = this.data.imei;
        const status = this.params_set_tai.zhouqishangbao.way;
        const weeks = this.params_set_tai.zhouqishangbao.week;
        const cycleIntervals = this.params_set_tai.zhouqishangbao.interval;
        const { year, month, day, hour, minute, second } = this.params_set_tai.zhouqishangbao;
        if (status === "" || weeks == null || cycleIntervals == null || year === "" || month === "" || day === "" || hour === "" || minute === "" || second === "") {
          ElMessage.error("所有的参数均不能为空！");
          return;
        }
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
      } else if (this.node.label === "阀门控制") {
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
      } else if (this.node.label === "设置读数") {
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
    },
  },
};
</script>

<style>
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
  height: 600px;
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
}

.command-content {
  width: 96%;
  height: 540px;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 10px;
  margin-bottom: 10px;
  overflow-y: auto;
  padding: 0 10px;
  background: none;
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
}

.command-select {
  height: 100%;
  width: 210px;
  background-color: #fff;
  border-radius: 5px;
  padding: 0 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.command-params {
  flex-grow: 1;
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
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 31.5%;
  height: 75px;
  margin-right: 10px;
}

.set-input > span {
  font-size: 14px;
  color: #747374;
  margin-bottom: 5px;
}

.set-input > .el-input {
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
}

.btns {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 0px;
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
    > .el-tree-node__content {
      background-color: var(--el-tree-node-hover-bg-color);
      color: white;
    }
  }
}
</style>
