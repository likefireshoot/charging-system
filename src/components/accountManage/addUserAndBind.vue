<template>
  <div class="change-dialog" v-if="dialogVisible">
    <div class="combo-dialog-content" :style="{ height: companyId == 1 ? '780px' : '710px' }">
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
          <div class="edit-input" v-if="companyId === 1">
            <span>所属水厂</span>
            <el-select v-model="form.companyId" class="input-item big-font-el-select" placeholder="请选择所属水厂">
              <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id" :disabled="companyId !== 1" />
            </el-select>
          </div>
          <div class="edit-input">
            <span>用户名称</span>
            <el-input v-model="form.userName" class="input-item" />
          </div>
          <div class="edit-input">
            <span>用户号（选填，不填则自动生成）</span>
            <el-input v-model="form.userId" class="input-item" placeholder="选填，不填则自动生成" />
          </div>
          <div class="edit-input">
            <span>用户住址</span>
            <el-input v-model="form.userAddr" class="input-item" />
          </div>
          <div class="edit-input">
            <span>所属区域</span>
            <el-select v-model="form.regionId" class="input-item big-font-el-select" placeholder="请选择所属区域">
              <el-option v-for="item in regionList" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </div>
          <div class="edit-input">
            <span>联系电话（选填）</span>
            <el-input v-model="form.userPhone" class="input-item" placeholder="选填"/>
          </div>
          <div class="edit-input">
            <span>开户时间</span>
            <el-date-picker v-model="form.createTime" type="date" placeholder="选择日期" style="flex-grow: 1; width: 100%; max-height: 35px" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
          </div>
        </div>

        <div class="section-title" style="margin-top: 10px">绑定信息</div>
        <div class="section-grid">
          <div class="edit-input">
            <span>表号</span>
            <el-input v-model="form.meterCode" class="input-item" @blur="handleMeterCodeBlur" />
          </div>
          <div class="edit-input">
            <span>价格类型</span>
            <el-select v-model="form.priceId" class="input-item big-font-el-select" placeholder="请选择价格类型">
              <el-option v-for="item in priceList" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </div>
          <div class="edit-input">
            <span>短信配置</span>
            <el-select v-model="form.smsConfigId" class="input-item big-font-el-select" placeholder="请选择短信配置">
              <el-option v-for="item in smsConfigList" :key="item.id" :label="item.label" :value="item.id" />
            </el-select>
          </div>
          <div class="edit-input">
            <span>开户审批人 1</span>
            <el-select v-model="form.approver_1" class="input-item big-font-el-select" placeholder="请选择">
              <el-option v-for="item in approverList" :key="item.id" :label="item.label" :value="item.label" />
            </el-select>
          </div>
          <div class="edit-input">
            <span>出厂日期</span>
            <el-date-picker v-model="form.factoryDate" type="date" placeholder="选择日期" style="flex-grow: 1; width: 100%; max-height: 35px" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
          </div>
          <div class="edit-input">
            <span>首检日期</span>
            <el-date-picker v-model="form.firstInspectDate" type="date" placeholder="选择日期" style="flex-grow: 1; width: 100%; max-height: 35px" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
          </div>
          <!-- 水表读数放在最后一行，占满整行 -->
          <div class="edit-input full-width">
            <span>水表读数（吨）</span>
            <div class="reading-container">
              <el-input
                v-model="form.reading"
                class="input-item"
                :disabled="!allowEditReading"
                placeholder="请输入表号后自动查询"
              />
              <span v-if="meterQueryError" class="error-tip">{{ meterQueryError }}</span>
            </div>
            <el-checkbox
              v-model="allowEditReading"
              class="edit-checkbox"
              @change="handleAllowEditChange"
            >
              <span style="font-size: 18px;">确认修改水表吨数</span>
            </el-checkbox>
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

    <el-dialog
      v-model="showConfirmDialog"
      title="重要提示"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="closeConfirmDialog"
      center
      :lock-scroll="false"
    >
      <div style="font-size: 22px; color: #333; line-height: 1.8; text-align: center; padding: 10px 0;">
        <template v-if="allowEditReading">
          用户绑定水表后，将从
          <span style="color: #45ba7e; font-weight: bold; font-size: 22px;">{{ form.reading }}</span>
          吨开始计费，请核实以避免多余的扣费
        </template>
        <template v-else>
          用户绑定水表后，将从
          <span style="color: #45ba7e; font-weight: bold; font-size: 22px;">{{ originalReading }}</span>
          吨开始计费，请核实以避免多余的扣费
        </template>
      </div>
      <template #footer>
        <div style="display: flex; justify-content: center; gap: 20px;">
          <div class="confirm-btn" @click="confirmReadingChange" style="background-color: #45ba7e; color: #fff; width: 120px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 5px; cursor: pointer; font-size: 16px;">
            <el-icon><Check /></el-icon>
            <span style="margin-left: 8px; font-size: 20px">确认</span>
          </div>
          <div class="cancel-btn" @click="closeConfirmDialog" style="background-color: #fff; border: 1px solid #ddd; width: 120px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 5px; cursor: pointer; font-size: 16px;">
            <el-icon style="color: #45ba7e"><Close /></el-icon>
            <span style="margin-left: 8px; color: #5a5a5a; font-size: 20px">取消</span>
          </div>
        </div>
      </template>
    </el-dialog>
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
    const userDataStr = sessionStorage.getItem("userData");
    if (!userDataStr) {
      throw new Error("未找到用户登录信息，请重新登录！");
    }

    const userData = JSON.parse(userDataStr);

    if (!userData.staffName || !userData.companyId) {
      throw new Error("用户信息不完整，请重新登录！");
    }

    const currentDate = new Date().toISOString().split("T")[0];
    return {
      companyId: userData.companyId,
      submitting: false,
      form: {
        companyId: userData.companyId,
        userName: "",
        userId: "",
        userAddr: "",
        regionId: null,
        userPhone: "",
        createTime: currentDate,
        meterCode: "",
        priceId: null,
        smsConfigId: null,
        approver_1: userData.staffName || "",
        approver_2: userData.staffName || "",
        approver_3: userData.staffName || "",
        factoryDate: null,
        firstInspectDate: null,
        reading: null,
        meterId: null
      },
      companyList: [],
      regionList: [],
      priceList: [],
      smsConfigList: [],
      approverList: [],
      currentStaffId: userData.staffId || null,
      allowEditReading: false,
      meterQueryError: "",
      showConfirmDialog: false,
      pendingSubmit: false,
      originalReading: null
    };
  },
  mounted() {
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
    handleMeterCodeBlur() {
      if (!this.form.meterCode || this.form.meterCode.trim() === "") {
        this.form.reading = null;
        this.form.meterId = null;
        this.originalReading = null;  // 清空原始读数
        this.meterQueryError = "";
        this.allowEditReading = false;
        return;
      }

      this.queryMeterReading();
    },
    async queryMeterReading() {
      try {
        const response = await service.get(`/external/externalSimpleMeterQuery?meterCode=${this.form.meterCode}`);

        if (response.code === 200 && response.data) {
          this.originalReading = response.data.reading;  // 保存原始读数
          this.form.reading = response.data.reading;
          this.form.meterId = response.data.meterId;
          this.meterQueryError = "";
        } else {
          this.form.reading = null;
          this.form.meterId = null;
          this.originalReading = null;
          this.meterQueryError = "该表资料未录入系统";
        }
      } catch (error) {
        this.form.reading = null;
        this.form.meterId = null;
        this.originalReading = null;
        this.meterQueryError = "该表资料未录入系统";
      }
    },
    handleAllowEditChange(value) {
      // 勾选时，将 reading 设置为可编辑状态（已经是可编辑）
      // 取消勾选时，恢复为原始读数
      if (!value && this.originalReading !== null && this.originalReading !== undefined) {
        this.form.reading = this.originalReading;
      }
    },
    closeConfirmDialog() {
      this.showConfirmDialog = false;
    },
    confirmReadingChange() {
      this.showConfirmDialog = false;
      // 执行提交
      this.doCommit();
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
        approver_1: "开户审批人 1",
        factoryDate: "出厂日期",
        firstInspectDate: "首检日期"
      };

      const missing = required.filter((k) => this.form[k] === undefined || this.form[k] === null || this.form[k] === "");
      if (missing.length) {
        ElMessage.error(missing.map((k) => fieldNameMap[k] || k).join(",") + "不能为空");
        return false;
      }

      const phoneRegex = /^1[3-9]\d{9}$/;
      if (this.form.userPhone && this.form.userPhone !== "无" && !phoneRegex.test(this.form.userPhone)) {
        ElMessage.error("请输入正确格式的联系电话！");
        return false;
      }

      return true;
    },
    async updateMeterReading() {
      if (!this.allowEditReading || this.form.reading === null || this.form.reading === undefined) {
        return true;
      }

      try {
        const updateResponse = await service.post("/userManage/meterRead/editMeter", {
          meterId: this.form.meterId,
          meterCode: this.form.meterCode,
          reading: this.form.reading
        });

        if (updateResponse.code !== 200) {
          ElMessage.error(updateResponse.msg || "更新水表读数失败");
          return false;
        }

        return true;
      } catch (error) {
        ElMessage.error("更新水表读数失败：" + (error?.message || "未知错误"));
        return false;
      }
    },
    async handleCommit() {
      if (this.submitting) return;
      if (!this.validate()) return;

      // 无论是否勾选，都弹出确认弹窗
      this.showConfirmDialog = true;
    },
    async doCommit() {
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
          factoryDate: this.form.factoryDate,
          firstInspectDate: this.form.firstInspectDate
        },
      };

      this.submitting = true;
      try {
        // 只有勾选了允许编辑且读数有变化时，才更新水表读数
        if (this.allowEditReading && this.form.reading !== this.originalReading) {
          const updateSuccess = await this.updateMeterReading();
          if (!updateSuccess) {
            this.submitting = false;
            return;
          }
        }

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
  flex: 1;
  width: 94%;
  background-color: #fff;
  border-radius: 5px;
  margin-top: 15px;
  margin-bottom: 5px;
  padding: 10px 5px;
  overflow-y: auto;
  overflow-x: hidden;
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
  gap: 10px ;
}

.edit-input {
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: calc(33.33% - 7px);
  height: 73px;
}

.edit-input.full-width {
  width: 100%;
  height: auto;
  margin-top: 10px;
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

.reading-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 33%;
}

.reading-container .input-item {
  flex: 1;
}

.error-tip {
  color: red;
  font-size: 18px;
  white-space: nowrap;
  font-weight: bold;
}

.edit-checkbox {
  margin-top: 8px;
  margin-left: 0;
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

/* 修改 el-dialog 样式 */
:deep(.el-dialog) {
  --el-dialog-width: 500px;
  --el-dialog-border-radius: 8px;
}

:deep(.el-dialog__header) {
  padding: 20px 20px 10px;
  border-bottom: 1px solid #eee;
}

:deep(.el-dialog__title) {
  font-size: 25px;
  font-weight: 600;
  color: #333;
}

:deep(.el-dialog__body) {
  padding: 30px 40px;
  text-align: center;
}

:deep(.el-dialog__footer) {
  padding: 10px 20px 30px;
  border-top: none;
}
</style>
