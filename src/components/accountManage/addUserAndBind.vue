<template>
  <div class="change-dialog" v-if="dialogVisible">
    <div class="combo-dialog-content">
      <div class="title">
        <div style="margin-left: 10px; display: flex; align-items: center">
          <img src="@/assets/yonghu/icon13.png" alt="" style="margin-right: 8px" />
          <span style="font-size: 20px">开户 & 绑定设备</span>
        </div>
        <div style="margin-right: 10px; cursor: pointer" @click="handleClose">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>
      <div class="combo-content">
        <div class="section-title">开户信息</div>
        <div class="section-grid">
          <div class="edit-input" style="margin-right: 1%" v-if="companyId === 1">
            <span>所属水厂</span>
            <el-select v-model="form.companyId" class="input-item big-font-el-select" placeholder="请选择所属水厂">
              <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id" :disabled="companyId !== 1" />
            </el-select>
          </div>
          <div class="edit-input" style="margin-right: 1%">
            <span>用户名称</span>
            <el-input v-model="form.userName" class="input-item" />
          </div>
          <div class="edit-input" style="margin-right: 1%">
            <span>用户号（选填,不填则自动生成）</span>
            <el-input v-model="form.userId" class="input-item" placeholder="选填,不填则自动生成" />
          </div>
          <div class="edit-input" style="margin-right: 1%">
            <span>用户住址</span>
            <el-input v-model="form.userAddr" class="input-item" />
          </div>
          <div class="edit-input" style="margin-right: 1%">
            <span>所属区域</span>
            <el-select v-model="form.regionId" class="input-item big-font-el-select" placeholder="请选择所属区域">
              <el-option v-for="item in regionList" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </div>
          <div class="edit-input" style="margin-right: 1%">
            <span>联系电话(选填)</span>
            <el-input v-model="form.userPhone" class="input-item" placeholder="选填"/>
          </div>
          <div class="edit-input" style="margin-right: 1%">
            <span>开户时间</span>
            <el-date-picker v-model="form.createTime" type="date" placeholder="选择日期" style="flex-grow: 1; width: 100%; max-height: 35px" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
          </div>
        </div>

        <div class="section-title" style="margin-top: 10px">绑定信息</div>
        <div class="section-grid">
          <div class="edit-input" style="margin-right: 1%">
            <span>表号</span>
            <el-input v-model="form.meterCode" class="input-item" />
          </div>
          <div class="edit-input" style="margin-right: 1%">
            <span>价格类型</span>
            <el-select v-model="form.priceId" class="input-item big-font-el-select" placeholder="请选择价格类型">
              <el-option v-for="item in priceList" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </div>
          <div class="edit-input" style="margin-right: 1%">
            <span>短信配置</span>
            <el-select v-model="form.smsConfigId" class="input-item big-font-el-select" placeholder="请选择短信配置">
              <el-option v-for="item in smsConfigList" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </div>
          <div class="edit-input" style="margin-right: 1%">
            <span>开户审批人1</span>
            <el-select v-model="form.approver_1" class="input-item big-font-el-select" placeholder="请选择">
              <el-option v-for="item in approverList" :key="item.id" :label="item.label" :value="item.label" />
            </el-select>
          </div>
          <div class="edit-input" style="margin-right: 1%">
            <span>开户审批人2</span>
            <el-select v-model="form.approver_2" class="input-item big-font-el-select" placeholder="请选择">
              <el-option v-for="item in approverList" :key="item.id" :label="item.label" :value="item.label" />
            </el-select>
          </div>
          <div class="edit-input" style="margin-right: 1%">
            <span>开户审批人3</span>
            <el-select v-model="form.approver_3" class="input-item big-font-el-select" placeholder="请选择">
              <el-option v-for="item in approverList" :key="item.id" :label="item.label" :value="item.label" />
            </el-select>
          </div>
        </div>
      </div>

      <div class="btn">
        <div class="confirm-btn" @click="handleCommit" :style="{ opacity: submitting ? 0.7 : 1, pointerEvents: submitting ? 'none' : 'auto' }">
          <el-icon style="margin-left: 15%"><Check /></el-icon>
          <span style="font-size: 20px; margin-left: 15%">确认</span>
        </div>
        <div class="cancel-btn" @click="handleClose">
          <el-icon style="margin-left: 15%; color: #45ba7e"><Close /></el-icon>
          <span style="font-size: 20px; margin-left: 15%; color: #5a5a5a">取消</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import service from "@/api/request";
import debounce from "lodash/debounce";
import { ElMessage } from "element-plus";

export default {
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    // 获取当前用户信息
  const userDataStr = sessionStorage.getItem("userData");
  if (!userDataStr) {
    throw new Error("未找到用户登录信息，请重新登录！");
  }

  const userData = JSON.parse(userDataStr);

  // 验证必要字段是否存在
  if (!userData.staffName || !userData.companyId) {
    throw new Error("用户信息不完整，请重新登录！");
  }

  // 获取当前日期 YYYY-MM-DD 格式
  const currentDate = new Date().toISOString().split("T")[0];
  return {
    companyId: userData.companyId,
    submitting: false,
    //表单数据中审批人从前端到后端使用的都是staff_name而非staff_id,有概率出现重名混淆
    form: {
      companyId: userData.companyId,
      userName: "",
      userId: "",
      userAddr: "",
      regionId: null,
      userPhone: "",
      createTime: currentDate,  // 修改：默认当前日期
      meterCode: "",
      priceId: null,
      smsConfigId: null,
      approver_1: userData.staffName || "",  // 修改：默认当前用户
      approver_2: userData.staffName || "",  // 修改：默认当前用户
      approver_3: userData.staffName || "",  // 修改：默认当前用户
    },
    companyList: [],
    regionList: [],
    priceList: [],
    smsConfigList: [],
    approverList: [],
    // 保存当前用户 ID 用于审批人匹配
    currentStaffId: userData.staffId || null,
  };
  },
  mounted() {
    // 二次检查 sessionStorage 数据
    // (避免form组件由于sessionStorage缺少信息, 加载失败, 直接白屏的情况出现)
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  if (!userData || !userData.staffName) {
    ElMessage.error("员工信息不完整，请重新登录！");
    this.handleClose();
    return;
  }
    this.getCompanyList();
    this.refreshCompanyRelated();
  },
  watch: {
    "form.companyId": function (newVal) {
      if (!newVal) return;
      this.form.regionId = null;
      this.refreshCompanyRelated();
    },
  },
  methods: {
    handleClose() {
      this.$emit("close");
    },
    refreshCompanyRelated() {
      const cid = this.companyId === 1 ? this.form.companyId : this.companyId;
      if (!cid) return;
      this.getRegionData(cid);
      this.getPriceList(cid);
      this.getSmsConfigList(cid);
      this.getApproverList(cid);
    },
    getCompanyList() {
      service
        .get("/getAllUnblockCompany")
        .then((response) => {
          if (response.code === 200) {
            this.companyList = response.data.map((item) => ({ id: item.companyId, name: item.companyName }));
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch(() => {});
    },
    getRegionData(companyId) {
      const url = companyId ? `/getRegion?companyId=${companyId}` : "/getRegion";
      service
        .get(url)
        .then((response) => {
          if (response.code === 200) {
            this.regionList = response.data.map((item) => ({ id: item.regionId, label: item.regionName }));
          }
        })
        .catch(() => {
          ElMessage.error("获取区域数据失败");
        });
    },
    getPriceList(companyId) {
      const params = { pageNo: 1, pageSize: 1000, companyId };
      service
        .post("/price/queryPriceMg", params)
        .then((res) => {
          const records = res?.data?.records || [];
          this.priceList = records.map((item) => ({ id: item.priceId, label: item.priceName }));
        })
        .catch(() => {
          ElMessage.error("获取价格类型失败");
        });
    },
    getSmsConfigList(companyId) {
      const params = { pageNo: 1, pageSize: 1000, companyId };
      service
        .post("/sms/querySmsConfig", params)
        .then((response) => {
          if (response.code === 200) {
            this.smsConfigList = response.data.records.map((item) => ({ id: item.smsConfigId, label: item.smsConfigName }));
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch(() => {
          ElMessage.error("获取短信配置失败");
        });
    },
    getApproverList(companyId) {
      const token = JSON.parse(sessionStorage.getItem("userData")).token;
      const params = { pageNo: 1, pageSize: 1000, companyId, staffCharacterId: 7 };
      service
        .post("/staff/queryStaff", params, {
          headers: {
            Authorization: token,
            token: token,
          },
        })
        .then((response) => {
          if (response.code === 200) {
            this.approverList = response.data.records.map((item) => ({ id: item.staffId, label: item.staffName }));
          } else {
            ElMessage.error(response.msg);
          }
        })
        .catch(() => {
          ElMessage.error("获取审批人失败");
        });
    },


    debouncedTrim: debounce(function () {
      Object.keys(this.form).forEach((key) => {
        if (typeof this.form[key] === "string") this.form[key] = this.form[key].trim();
      });
    }, 300),
    validate() {
      this.debouncedTrim.flush && this.debouncedTrim.flush();
      this.debouncedTrim();

      const required = [
        "userName",
        "userAddr",
        "regionId",
        "createTime",
        "meterCode",
        "priceId",
        "smsConfigId",
        "approver_1",
        "approver_2",
        "approver_3",
      ];
      if (this.companyId === 1) required.push("companyId");

      const fieldNameMap = {
        companyId: "所属水厂",
        userName: "用户名称",
        userId: "用户号",
        userAddr: "用户住址",
        regionId: "所属区域",
        userPhone: "联系电话",
        createTime: "开户时间",
        meterCode: "表号",
        priceId: "价格类型",
        smsConfigId: "短信配置",
        approver_1: "开户审批人1",
        approver_2: "开户审批人2",
        approver_3: "开户审批人3",
      };

      const missing = required.filter((k) => this.form[k] === undefined || this.form[k] === null || this.form[k] === "");
      if (missing.length) {
        ElMessage.error(missing.map((k) => fieldNameMap[k] || k).join("、") + "不能为空");
        return false;
      }

      const phoneRegex = /^1[3-9]\d{9}$/;
      if (this.form.userPhone && this.form.userPhone !== "无" && !phoneRegex.test(this.form.userPhone)) {
        ElMessage.error("请输入正确格式的联系电话！");
        return false;
      }

      return true;
    },
    async handleCommit() {
      if (this.submitting) return;
      if (!this.validate()) return;
      // // 检查电话号码是否为空，如果为空则提示用户
      // const isPhoneEmpty = !this.form.userPhone || this.form.userPhone.trim() === "";
      // if (isPhoneEmpty) {
      //   try {
      //     await ElMessageBox.confirm(
      //       '联系电话未填写，系统将自动设置为"无"。\n\n⚠️ 注意：短信提醒功能将不可用！\n\n是否继续提交？',
      //       '提示',
      //       {
      //         confirmButtonText: '继续提交',
      //         cancelButtonText: '取消',
      //         type: 'warning',
      //         dangerouslyUseHTMLString: false,
      //       }
      //     );
      //   } catch (error) {
      //     // 用户点击取消按钮或关闭对话框
      //     return;
      //   }
      // }


      const effectiveCompanyId = this.companyId === 1 ? this.form.companyId : this.companyId;
      const companyName = (this.companyList.find((c) => c.id === effectiveCompanyId) || {}).name || "";
      const regionName = (this.regionList.find((r) => r.id === this.form.regionId) || {}).label || "";

      const payload = {
        userAddDTO: {
          userId: this.form.userId ? Number(this.form.userId) : null,
          userName: this.form.userName,
          userAddr: this.form.userAddr,
          regionName,
          regionId: this.form.regionId,
          userPhone: !this.form.userPhone || this.form.userPhone.trim() === "" ? "无" : this.form.userPhone,
          companyName,
          companyId: effectiveCompanyId,
          createTime: this.form.createTime,
        },
        userMeterBindDTO: {
          userId: this.form.userId ? Number(this.form.userId) : null,
          companyId: effectiveCompanyId,
          meterCode: this.form.meterCode,
          priceId: this.form.priceId,
          smsConfigId: this.form.smsConfigId,
          approver_1: this.form.approver_1,
          approver_2: this.form.approver_2,
          approver_3: this.form.approver_3,
        },
      };

      this.submitting = true;
      try {
        const res = await service.post("/wx/addUserAndMeterBind", payload);
        if (res.code === 200) {
          ElMessage.success("提交成功");
          this.handleClose();
        } else {
          ElMessage.error(res.msg || "提交失败");
        }
      } catch (err) {
        ElMessage.error("提交失败：" + (err?.message || "未知错误"));
      } finally {
        this.submitting = false;
      }
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

.combo-dialog-content {
  width: 75%;
  height: 660px;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%);
  margin-top: -330px;
  display: flex;
  flex-direction: column;
  align-items: center;
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

.combo-content {
  height: 560px;
  width: 94%;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 15px;
  margin-bottom: 5px;
  padding: 10px 5px;
  overflow-y: hidden;
}

.section-title {
  font-size: 18px;
  color: #45ba7e;
  font-weight: 600;
  margin: 5px 0 10px 5px;
}

.section-grid {
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.edit-input {
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 32.3%;
  height: 73px;
}

.edit-input > span {
  font-size: 20px;
  color: #747374;
  margin-bottom: 5px;
}

.input-item {
  height: 35px;
  width: 100%;
}

::deep(.el-date-editor.el-input) {
  height: 35px !important;
}

::deep(.el-input__wrapper) {
  height: 35px !important;
  min-height: 35px !important;
  padding: 0 8px !important;
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
