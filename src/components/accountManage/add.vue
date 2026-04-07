<template>
  <div class="change-dialog" v-if="add_dialogFormVisible">
    <div class="account-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon13.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 20px">开户</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleAddClose">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="account-add-content">
        <div class="edit-input" style="margin-right: 1%">
          <span>用户名称</span>
          <el-input v-model="addData.userName" class="input-item" />
        </div>
        <div class="edit-input" style="margin-right: 1%">
          <span>用户号（选填）</span>
          <el-input v-model="addData.userId" class="input-item" placeholder="选填" />
        </div>
        <div class="edit-input" style="margin-right: 1%">
          <span>用户住址</span>
          <el-input v-model="addData.userAddr" class="input-item" />
        </div>
        <div class="edit-input" style="margin-right: 1%" v-if="companyId == 1">
          <span>所属水厂</span>
          <el-select v-model="addData.companyId" class="input-item big-font-el-select">
            <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id" :disabled="companyId !== 1"> </el-option>
          </el-select>
        </div>
        <div class="edit-input" style="margin-right: 1%">
          <span>所属区域</span>
          <el-select v-model="addData.regionName" class="input-item big-font-el-select">
            <el-option v-for="item in quyu_data" :key="item.id" :label="item.label" :value="item.label"> </el-option>
          </el-select>
        </div>
        <div class="edit-input" style="margin-right: 1%">
          <span>联系电话 (选填)</span>
          <el-input v-model="addData.userPhone" class="input-item" placeholder="选填"/>
        </div>
        <div class="edit-input" style="margin-right: 1%">
          <span>开户时间</span>
          <el-date-picker v-model="addData.createTime" type="date" placeholder="选择日期" style="flex-grow: 1; width: 100%; max-height: 35px" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
        </div>
      </div>
      <div class="btn">
        <div class="confirm-btn" @click="handleCommit">
          <el-icon style="margin-left: 15%"><Check /></el-icon>
          <span style="font-size: 20px; margin-left: 15%">确认</span>
        </div>
        <div class="cancel-btn" @click="handleAddClose">
          <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
          <span style="font-size: 20px; margin-left: 15%; color: #5a5a5a">取消</span>
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
    add_dialogFormVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    // 获取当前日期 YYYY-MM-DD 格式
    const currentDate = new Date().toISOString().split("T")[0];
    return {
      addData: {
        userName: "",
          userId: "",
        userAddr: "",
        regionName: "",
        companyId: null, // 新增水厂字段
        userPhone: "",
        createTime: currentDate,
      },
      companyId: JSON.parse(sessionStorage.getItem("userData")).companyId,
      price_list: [],
      quyu_data: [],
      companyList: [],
      isSubmitting: false, // 新增:防止重复提交的标志位
    };
  },
  mounted() {
    this.getCompanyList();
    this.getRegionData();
  },
  watch: {
    "addData.companyId": function (newVal) {
      if (newVal) {
        this.addData.regionName = ""; // 清空所属区域
        this.getRegionData();
      }
    },
  },
  methods: {
    handleAddClose() {
      this.$emit("close");
    },
    getRegionData() {
      let url = "";
      if (this.companyId === 1) {
        if (this.addData.companyId) {
          url = `/getRegion?companyId=${this.addData.companyId}`; // 所属水厂ID
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
    getCompanyList() {
      service
        .get("/getAllUnblockCompany")
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
    handleCommit() {
      if (this.isSubmitting) {
        return;
      }
      this.isSubmitting = true;
      let missingFields = [];
      let formData = {};
      Object.keys(this.addData).forEach((key) => {
        if (typeof this.addData[key] === "string") {
          this.addData[key] = this.addData[key].trim();
        }
      });

      formData = this.addData;
      if (this.companyId !== 1) {
        formData.companyId = this.companyId;
      }


      // 将空的联系电话转换为"无"
      if (!formData.userPhone || formData.userPhone.trim() === "") {
        formData.userPhone = "无";
      }

      // 定义字段名映射，将属性名映射为友好的显示名称
      const fieldNameMap = {
        userName: "用户名称",
        userId: "用户号",
        userAddr: "用户住址",
        regionName: "所属区域",
        userPhone: "联系电话",
        companyId: "所属水厂",
        createTime: "开户时间",
      };

      // 可选字段列表（允许为空）
      const optionalFields = ["userId","userPhone"];

      // 递归遍历对象属性
      function traverseObject(obj, parentKey = "") {
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const fullKey = parentKey ? `${parentKey}.${key}` : key;

            // 如果是可选字段，则跳过必填校验
            if (!parentKey && optionalFields.includes(key)) {
              continue;
            }

            const value = obj[key];

            if (typeof value === "object" && value !== null) {
              // 如果是对象，继续递归遍历
              traverseObject(value, fullKey);
            } else {
              // 检查值是否为空，排除0的情况
              if (value === undefined || value === null || value === "") {
                missingFields.push(fullKey);
              }
            }
          }
        }
      }

      traverseObject(formData);

      // 对联系电话和余额进行额外校验
      if (formData.userPhone&&formData.userPhone!=""&&formData.userPhone!="无") {
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(formData.userPhone)) {
          ElMessage.error("请输入正确格式的联系电话！");
          return;
        }
      }

      if (missingFields.length > 0) {
        const fieldNames = missingFields.map((field) => fieldNameMap[field] || field);
        const message = fieldNames.join("、") + "不能为空";
        ElMessage.error(message);
        return;
      }

      console.log(formData);

      // 所有字段都不为空，提交数据到后台
        service.post("/userManage/userCharge/addUser", formData)
        .then((res) => {
          if (res.code === 200) {
            ElMessage.success("提交成功");
            // 可以在这里添加提交成功后的其他逻辑，比如关闭对话框
            this.handleAddClose();
          } else if (res.code === -1) {
            ElMessage.error(res.msg);
          }
        })
        .catch((err) => {
          ElMessage.error("提交失败：" + err.message);
        }).finally(() => { this.isSubmitting = false; });
    },
  },
};
</script>

<style scoped>
.change-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
}

.account-dialog-content {
  width: 70%;
  height: 400px;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%);
  margin-top: -150px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.account-add-content {
  height: 270px;
  width: 94%;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 15px;
  margin-bottom: 5px;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: 5px;
  overflow-y: auto;
}

.edit-input {
  display: flex;
  justify-content: center; /* 确保子元素在父容器中垂直居中 */
  flex-direction: column;
  width: 32.3%;
  height: 73px;
}

.edit-input > span {
  font-size: 20px;
  color: #747374;
  margin-bottom: 5px;
}

.edit-input > .el-input {
  height: 35px;
  width: 100%;
}

.demo-date-picker { /*这个类项目中压根没用上*/
  display: flex;
  width: 100%;
  padding: 0;
  flex-wrap: wrap;
}

.demo-date-picker .block {
  padding: 1.5rem 0;
  text-align: center;
  border-right: solid 1px var(--el-border-color);
  flex: 1;
  min-width: 300px;
}

.demo-date-picker .block:last-child {
  border-right: none;
}

.demo-date-picker .demonstration {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-bottom: 1rem;
}

.edit-input > .el-date-picker {
  height: 35px;
  width: 100%;
}

/* 外层容器 */
:deep(.el-date-editor.el-input) {
  height: 35px !important;
}

/* 内部输入框 */
:deep(.el-input__wrapper) {
  height: 35px !important;
  min-height: 35px !important;
  padding: 0 8px !important;
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
  width: 100px;
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
