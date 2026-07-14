<template>
  <!-- 命令下发弹出框-千宝通 -->
  <div class="command-dialog" v-if="command_dialogFormVisible">
    <div class="command-dialog-content" v-if="commandType == '千宝通'">
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
            style="width: 230px; height: 460px; overflow-y: auto"
            :data="command_qianbaotong_data"
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
              <div v-if="node.id == '' || node.id == 1" class="set-content-container">
                <div class="set-input" style="width: 100%; height: 175px; justify-content: center; align-items: center">
                  <img src="@/assets/yonghu/0.png" alt="" style="width: auto; height: 75%" />
                  <span>暂无参数...</span>
                </div>
              </div>
              <div v-else>
                <el-form class="set-content-container" v-if="node.label === '设置读数'" :model="params_set_tai" :rules="readCountRules" ref="readCountForm">
                  <div class="set-input">
                    <span>读数</span>
                    <el-form-item prop="readCount" style="margin: 0">
                      <el-input v-model="params_set_tai.readCount"></el-input>
                    </el-form-item>
                  </div>
                </el-form>
                <el-form class="set-content-container" v-if="node.label === '阀门控制'" :model="params_set_tai" :rules="valveControlRules" ref="valveControlForm">
                  <div class="set-input">
                    <span>阀门状态</span>
                    <el-form-item prop="valveState" style="margin: 0">
                      <el-select v-model="params_set_tai.valveState">
                        <el-option label="开阀" value="1"></el-option>
                        <el-option label="关阀" value="0"></el-option>
                      </el-select>
                    </el-form-item>
                  </div>
                </el-form>
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
              <div class="set-content-container">
                <div class="set-input" style="width: 100%; height: 175px; justify-content: center; align-items: center">
                  <img src="@/assets/yonghu/0.png" alt="" style="width: auto; height: 75%" />
                  <span>暂无返回值...</span>
                </div>
              </div>
            </div>
          </div>
          <div class="btns">
            <div class="confirm-btn" @click="commit_qianbaotong">
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
    const validateReadCount = (rule, value, callback) => {
      if (value === null || value === undefined || value === "") {
        callback(new Error("读数不能为空"));
      } else if (isNaN(value) || Number(value) < 0) {
        callback(new Error("读数必须为非负数"));
      } else {
        callback();
      }
    };
    const validateValveState = (rule, value, callback) => {
      if (!value) {
        callback(new Error("请选择阀门状态"));
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
      command_qianbaotong_data: [
        {
          id: 1,
          value: 1,
          label: "下发控制命令",
          children: [
            {
              id: 3,
              value: 3,
              label: "设置读数",
            },
            {
              id: 4,
              value: 4,
              label: "阀门控制",
            },
          ],
        },
      ],
      params_set_tai: {
        readCount: "",
        valveState: "",
      },
      readCountRules: {
        readCount: [{ validator: validateReadCount, trigger: "blur" }],
      },
      valveControlRules: {
        valveState: [{ validator: validateValveState, trigger: "change" }],
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
    getMeterCode() {
      return this.data.meterCode || this.data.imei;
    },
    commit_qianbaotong() {
      const meterCode = this.getMeterCode();
      if (!meterCode) {
        ElMessage.error("未获取到水表编号");
        return;
      }
      if (this.node.label === "设置读数") {
        if (!this.$refs.readCountForm) {
          ElMessage.error("表单未加载完成，请稍后重试");
          return;
        }
        this.$refs.readCountForm.validate((valid) => {
          if (!valid) return;
          service
            .get(`/command/qianBaoTong/qianBaoTongSetReadCount?meterCode=${meterCode}&readCount=${this.params_set_tai.readCount}`)
            .then((res) => {
              if (res.code === 200) {
                ElMessage.success("设置读数成功");
                this.closeCommandDialog();
              } else {
                ElMessage.error(res.msg || res.code);
              }
            })
            .catch((error) => {
              ElMessage.error(error.message || "设置读数失败");
            });
        });
      } else if (this.node.label === "阀门控制") {
        if (!this.$refs.valveControlForm) {
          ElMessage.error("表单未加载完成，请稍后重试");
          return;
        }
        this.$refs.valveControlForm.validate((valid) => {
          if (!valid) return;
          service
            .get(`/command/qianBaoTong/qianBaoTongValveCommand?meterCode=${meterCode}&status=${this.params_set_tai.valveState}`)
            .then((res) => {
              if (res.code === 200) {
                ElMessage.success("阀门控制成功");
                this.closeCommandDialog();
              } else {
                ElMessage.error(res.msg || res.code);
              }
            })
            .catch((error) => {
              ElMessage.error(error.message || "命令下发失败");
            });
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

.set-input > .el-form-item {
  width: 100%;
}

.set-input > .el-form-item .el-input,
.set-input > .el-form-item .el-select {
  width: 100%;
}

.set-input > .el-form-item .el-select .el-input {
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
