<template>
  <div class="add-dialog" v-if="valveOpen_dialogFormVisible">
    <div class="add-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon18.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 18px">开阀控制</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleValveClose">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="add-content">
        <el-form :model="valveData" :rules="rules" class="add-content" style="padding: 0; width: 100%; height: 80px">
          <div class="add-input" v-if="companyId === 1" style="margin-left: 2%">
            <span>所属水厂</span>
            <el-form-item>
              <el-select v-model="valveData.companyId" class="input-item">
                <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id"> </el-option>
              </el-select>
            </el-form-item>
          </div>
          <div class="add-input" style="margin-left: 2%; margin-right: 2%">
            <span>所属区域</span>
            <el-form-item prop="user_for_town_id">
              <el-select v-model="valveData.regionId" class="input-item">
                <el-option v-for="item in quyu_data" :key="item.id" :label="item.label" :value="item.id"> </el-option>
              </el-select>
            </el-form-item>
          </div>
          <div class="add-input" style="margin-right: 2%">
            <span>开阀方式</span>
            <el-radio-group v-model="valveData.valveShutMethod" style="height: 35px; width: 100%; margin-bottom: 18px">
              <el-radio value="自动开阀" class="recharge-green">自动开阀</el-radio>
              <el-radio value="手动开阀" class="recharge-green">手动开阀</el-radio>
            </el-radio-group>
          </div>
        </el-form>
      </div>
      <div class="btn">
        <div class="confirm-btn" @click="handleCommit">
          <el-icon style="margin-left: 15%"><Check /></el-icon>
          <span style="font-size: 16px; margin-left: 15%">确认</span>
        </div>
        <div class="cancel-btn" @click="handleValveClose">
          <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
          <span style="font-size: 16px; margin-left: 15%; color: #5a5a5a">取消</span>
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
    valveOpen_dialogFormVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      valveData: {
        companyId: null,
        regionId: "",
        valveShutMethod: null,
      },
      companyList: [],
      quyu_data: [],
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      rules: {
        regionId: [{ required: true, message: "请选择所属区域", trigger: "change" }],
        valveShutMethod: [{ required: true, message: "请选择关阀方式", trigger: "blur" }],
      },
    };
  },
  mounted() {
    this.getRegionData();
    this.getCompanyList();
  },
  methods: {
    handleValveClose() {
      this.$emit("close");
    },
    getCompanyList() {
      service
        .get("/getAllCompany", {
          headers: {
            Authorization: this.token,
          },
        })
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
    getRegionData() {
      let url = "";
      if (this.companyId === 1) {
        if (this.valveData.companyId) {
          url = `/getRegion?companyId=${this.valveData.companyId}`; // 所属水厂ID
        } else {
          url = `/getRegion`; // 所属水厂ID
        }
      } else {
        url = `/getRegion?companyId=${this.companyId}`; // 所属水厂ID
      }
      console.log(url);
      service
        .get(`${url}`)
        .then((response) => {
          if (response.code === 200) {
            this.quyu_data = response.data.map((item) => {
              return {
                id: item.regionId,
                value: item.regionId,
                label: item.regionName,
              };
            });
            console.log(this.quyu_data);
          }
        })
        .catch((error) => {
          ElMessage.error("获取区域数据失败");
        });
    },
    handleCommit() {
      let requestData = {
        valveShutMethod: this.valveData.valveShutMethod,
        regionId: this.valveData.regionId,
      };
      console.log(requestData);
      service
        .get(`/userManage/meterRead/valveShutMethodUpdate?valveShutMethod=${requestData.valveShutMethod}&regionId=${requestData.regionId}`)
        .then((res) => {
          if (res.code == 200) {
            ElMessage.success("设置成功");
            this.handleValveClose();
          } else {
            ElMessage.error(res.msg);
          }
        })
        .catch((error) => {
          ElMessage.error(error.msg);
        });
    },
  },
};
</script>

<style>
.add-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.add-dialog-content {
  width: 55%;
  height: 260px;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%);
  margin-top: -130px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.add-content {
  width: 94%;
  height: 120px;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 15px;
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

.add-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 30%;
  height: 73px;
}

.add-input > span {
  font-size: 14px;
  color: #747374;
  margin-bottom: 5px;
}

.add-input > .el-input {
  height: 35px;
  width: 100%;
}

.input-item {
  height: 35px;
  width: 100%;
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
</style>
