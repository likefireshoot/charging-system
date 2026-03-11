<template>
  <!-- 命令下发弹出框-集万讯 -->
  <div class="command-dialog" v-if="command_dialogFormVisible">
    <div class="command-dialog-content" v-if="commandType == '集万讯'">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon5.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 22px">命令下发</span>
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
            style="width: 230px; height: 460px; overflow-y: auto"
            :data="command_jiwanxun_data"
            :props="commandProps"
            default-expand-all
            :filter-node-method="command_filterNode"
            @node-click="handleNodeClick"
          ></el-tree>
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
              <div v-if="node.id == '' || node.id == 1 || node.id == 2 || node.id >= 8" class="set-content-container">
                <div class="set-input" style="width: 100%; height: 175px; justify-content: center; align-items: center">
                  <img src="@/assets/yonghu/0.png" alt="" style="width: auto; height: 75%" />
                  <span>暂无参数...</span>
                </div>
              </div>
              <div v-else>
                <div class="set-content-container" v-if="node.label === '阀门控制'">
                  <div class="set-input">
                    <span style="font-size: 20px">阀门状态</span>
                    <el-select v-model="params_set_tai.famenstate">
                      <el-option label="开阀" value="1"></el-option>
                      <el-option label="关阀" value="0"></el-option>
                    </el-select>
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
              <div v-if="node.id <= 7" class="set-content-container">
                <div class="set-input" style="width: 100%; height: 175px; justify-content: center; align-items: center">
                  <img src="@/assets/yonghu/0.png" alt="" style="width: auto; height: 75%" />
                  <span>暂无返回值...</span>
                </div>
              </div>
            </div>
          </div>
          <div class="btns">
            <div class="confirm-btn" @click="commit_jiwanxun">
              <el-icon style="margin-left: -3%"><Check /></el-icon>
              <span style="font-size: 20px; margin-left: 5%">确认</span>
            </div>
            <div class="cancel-btn" @click="closeCommandDialog">
              <el-icon style="margin-left:-3%; color: #45ba7e"><Close /></el-icon>
              <span style="font-size: 20px; margin-left: 5%; color: #5a5a5a">取消</span>
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
    const validateFamenstate = (rule, value, callback) => {
      if (!value && value !== 0) { // 0是关阀有效值，需特殊处理
        callback(new Error('请选择阀门状态'));
      } else {
        callback();
      }
    };
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
      command_jiwanxun_data: [
        {
          id: 1,
          value: 1,
          label: "下发控制命令",
          children: [
            {
              id: 6,
              value: 6,
              label: "阀门控制",
            },
          ],
        },
      ],
      params_set_tai: {
        famenstate: "",
      },
      valveControlRules: {
        famenstate: [{ validator: validateFamenstate, trigger: 'change' }]
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
    commit_jiwanxun() {
      if (this.node.label === "阀门控制") {

        if (!this.$refs.valveControlForm) {
          ElMessage.error('表单未加载完成，请稍后重试');
          return;
        }
        this.$refs.valveControlForm.validate((valid) => {
          if (valid) {
            console.log(this.data);
            const meterCode = this.data.meterCode;
            const status = this.params_set_tai.famenstate;
            service
              .get(`/command/jiWanXun/jiWanXunValveCommand?meterCode=${meterCode}&status=${status}`)
              .then((res) => {
                if (res.code === 200) {
                  ElMessage.success("阀门控制成功");
                } else {
                  ElMessage.error(res.code);
                }
              })
              .catch((err) => {
                ElMessage.error(err.msg);
                console.log(err);
              });
          }
        });

      }
    },
  },
};
</script>

<style>/*由于多文件混杂样式叠加,这里加scoped反而会造成不可预知的bug*/
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
  width: 70%; /* 稍微加宽一点，视觉更舒展 */
  height: auto; /* 关键：取消固定 300px */
  min-height: 650px; /* 设置一个合理的初始高度 */
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
  height: auto; /* 关键：取消固定 540px */
  overflow-y: visible; /* 关键：取消滚动条 */
  margin-bottom: 25px; /* 给底部按钮留点呼吸空间 */
  background-color: #fff;
  border-radius: 5px;
  margin-top: 10px;
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
  min-height: 40%;
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
  font-size: 18px;
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
  display: flex;
  /* 关键：确保主轴对齐方式为尾部对齐 */
  justify-content: flex-end;
  align-items: center;
  /* 增加垂直间距，防止贴着上方元素 */
  margin-top: 25px;
  /* 两个按钮之间的间距 */
  gap: 12px;
}

.confirm-btn,
.cancel-btn {
  /* 适当加宽：从 130px 增加到 150px 或更多 */
  width: 100px;
  height: 40px;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center; /* 确保按钮文字居中 */
  font-size: 14px;
  transition: all 0.2s ease; /* 增加平滑过渡 */
}

/* 区分一下确认和取消的视觉权重 */
.confirm-btn {
  background-color: #45ba7e;
  color: white;
  border: none;
}

.confirm-btn:hover {
  background-color: #228b22;
}

.cancel-btn {
  background-color: white;
  color: #666;
  border: 1px solid #dcdfe6;
}

.cancel-btn:hover {
  background-color: #f5f7fa;
  border-color: #c0c4cc;
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
