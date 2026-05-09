<template>
  <div class="valve-dialog" v-if="valveOpen_dialogFormVisible">
    <div class="valve-dialog-content">
      <div class="dialog-title">
        <div class="title-left">
          <img src="@/assets/yonghu/icon18.png" alt="" />
          <span>开阀控制</span>
        </div>
        <div class="title-close" @click="handleClose">
          <img src="@/assets/close.png" alt="" />
        </div>
      </div>

      <div class="dialog-body">
        <!-- 公司选择（仅 companyId === 1 时显示） -->
        <div class="company-card" v-if="companyId === 1">
          <div class="company-bar">
            <span>所属水厂</span>
            <el-select v-model="selectedCompany" placeholder="请选择水厂" style="width: 260px" @change="onCompanyChange">
              <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </div>
        </div>

        <!-- 区域网格 -->
        <div v-loading="regionLoading" class="region-grid">
          <div class="region-card" v-for="region in quyu_data" :key="region.regionId">
            <span class="region-name">{{ region.regionName }}</span>
            <select class="method-select" :value="regionMethods[region.regionId]"
              @change="(e) => onMethodChange(region, e.target.value)">
              <option v-for="m in methodOptions" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <div class="cancel-btn" @click="handleClose">关闭</div>
      </div>
    </div>

    <!-- 修改确认弹窗（自定义遮罩，避免 el-dialog 导致页面收紧） -->
    <div class="confirm-overlay" v-if="confirmVisible" @click.self="cancelChange">
      <div class="confirm-dialog">
        <div class="confirm-title">修改确认</div>
        <div class="confirm-body">
          <div class="confirm-row">
            <span class="confirm-label">区域</span>
            <span class="confirm-value">{{ pendingChange.regionName }}</span>
          </div>
          <div class="confirm-row">
            <span class="confirm-label">原方式</span>
            <span class="confirm-value old">{{ pendingChange.oldVal }}</span>
          </div>
          <div class="confirm-row">
            <span class="confirm-label">新方式</span>
            <span class="confirm-value new">{{ pendingChange.newVal }}</span>
          </div>
        </div>
        <div class="confirm-footer">
          <div class="confirm-btn-cancel" @click="cancelChange">取消</div>
          <div class="confirm-btn-ok" @click="confirmChange">确认修改</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import service from "@/api/request";
import { ElMessage } from "element-plus";

export default {
  name: "ValveOpen",
  props: {
    valveOpen_dialogFormVisible: {
      type: Boolean,
      default: false
    }
  },
  emits: ["close"],
  data() {
    return {
      selectedCompany: null,
      companyList: [],
      quyu_data: [],
      regionMethods: {},
      committedMethods: {},
      regionLoading: false,
      confirmVisible: false,
      pendingChange: {
        region: null,
        regionName: "",
        oldVal: "",
        newVal: ""
      },
      companyId: JSON.parse(sessionStorage.getItem("userData") || "{}").companyId,
      methodOptions: ["自动开阀", "手动开阀"]
    };
  },
  mounted() {
    this.getCompanyList();
    this.getRegionData();
  },
  methods: {
    handleClose() {
      this.$emit("close");
    },
    getCompanyList() {
      service
        .get("/getAllUnblockCompany")
        .then((response) => {
          if (response.code === 200) {
            this.companyList = response.data.map((item) => ({
              id: item.companyId,
              name: item.companyName
            }));
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    async getRegionData() {
      this.regionLoading = true;
      let url = "/getRegion";
      if (this.companyId === 1 && this.selectedCompany) {
        url += `?companyId=${this.selectedCompany}`;
      } else if (this.companyId !== 1) {
        url += `?companyId=${this.companyId}`;
      }
      try {
        const response = await service.get(url);
        if (response.code === 200) {
          const regions = [];
          const methods = {};
          const committed = {};
          response.data.forEach((item) => {
            const method = item.valveOpenMethod || "";
            regions.push({
              regionId: item.regionId,
              regionName: item.regionName
            });
            methods[item.regionId] = method;
            committed[item.regionId] = method;
          });
          this.quyu_data = regions;
          this.regionMethods = methods;
          this.committedMethods = committed;
        }
      } catch (error) {
        ElMessage.error("获取区域数据失败");
      } finally {
        this.regionLoading = false;
      }
    },
    onCompanyChange() {
      this.getRegionData();
    },
    onMethodChange(region, newVal) {
      const oldVal = this.committedMethods[region.regionId];
      if (oldVal === newVal) return;

      // 先回退 select 显示值，等确认后再更新
      this.regionMethods[region.regionId] = oldVal;

      this.pendingChange = {
        region,
        regionName: region.regionName,
        oldVal,
        newVal
      };
      this.confirmVisible = true;
    },
    async confirmChange() {
      const { region, newVal, oldVal } = this.pendingChange;
      this.confirmVisible = false;

      // 先乐观更新显示
      this.regionMethods[region.regionId] = newVal;

      try {
        const res = await service.get(
          `/userManage/meterRead/valveOpenMethodUpdate?valveOpenMethod=${encodeURIComponent(newVal)}&regionId=${region.regionId}`
        );
        if (res.code === 200) {
          ElMessage.success("修改成功");
          this.committedMethods[region.regionId] = newVal;
        } else {
          ElMessage.error(res.msg || "修改失败");
          this.regionMethods[region.regionId] = oldVal;
        }
      } catch (error) {
        ElMessage.error(error.msg || "修改失败");
        this.regionMethods[region.regionId] = oldVal;
      }
    },
    cancelChange() {
      this.confirmVisible = false;
      this.pendingChange = { region: null, regionName: "", oldVal: "", newVal: "" };
    }
  }
};
</script>

<style scoped>
.valve-dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 199;
  background-color: rgb(31 33 38 / 15%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.valve-dialog-content {
  width: 90%;
  max-width: 1300px;
  max-height: 85vh;
  border: 1px solid #fafafa;
  background-color: #fafafa;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
}

.dialog-title {
  width: 100%;
  background-color: #fff;
  border-radius: 5px 5px 0 0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  height: 60px;
  line-height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.title-left {
  display: flex;
  align-items: center;
  margin-left: 20px;
  gap: 10px;
  font-size: 22px;
  font-weight: normal;
}

.title-left img {
  width: 26px;
  height: 26px;
}

.title-close {
  margin-right: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
}

.company-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.company-bar>span {
  font-size: 24px;
  font-weight: normal;
  color: #555;
  white-space: nowrap;
}

.company-bar :deep(.el-input__inner) {
  font-size: 21px;
  height: 44px;
  line-height: 44px;
}

.region-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.region-card {
  background: #fff;
  border: 1px solid #e0e4e8;
  border-radius: 6px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.region-name {
  font-size: 21px;
  color: #222;
  font-weight: normal;
}

.method-select {
  width: 100%;
  height: 40px;
  font-size: 18px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #333;
  cursor: pointer;
  outline: none;
  transition: border-color 0.3s;
  appearance: auto;
  accent-color: #46B97E;
}

/* 聚焦时保持主题色（可选，根据需求调整） */
/*.method-select:focus {
  border-color: #46B97E;
}*/

/* 悬停时显示浅绿色，使用 !important 防止被用户代理样式覆盖 */
/*无法实现, 原生select不支持*/ 
.method-select:hover {
  border-color: #C1F1C1 !important;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 15px 28px;
  border-top: 1px solid #e9eef2;
  flex-shrink: 0;
}

.cancel-btn {
  height: 42px;
  width: 100px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  font-size: 20px;
  color: #5a5a5a;
  transition: all 0.3s;
  margin-right: 12px;
  /* 添加这一行，强制按钮靠右 */
}

.cancel-btn:hover {
  border-color: #46B97E;
  color: #46B97E;
}

/* ========== 公司搜索栏卡牌 ========== */
.company-card {
  margin-bottom: 22px;
}

.company-card .company-bar {
  padding-bottom: 16px;
  border-bottom: none;
  margin-bottom: 0;
}

/* ========== 确认弹窗（自定义遮罩）- 全面放大版 ========== */
.confirm-overlay {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 299;
  background-color: rgb(31 33 38 / 20%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-dialog {
  width: 560px;
  /* 从440px放大到560px */
  background: #fff;
  border-radius: 10px;
  /* 圆角稍微放大 */
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.2);
  /* 阴影加深 */
  overflow: hidden;
}

.confirm-title {
  height: 64px;
  /* 从48px放大到64px */
  line-height: 64px;
  font-size: 24px;
  /* 从18px放大到24px */
  font-weight: 500;
  color: #333;
  padding: 0 24px;
  border-bottom: 1px solid #eee;
}

.confirm-body {
  padding: 24px 28px;
  /* 内边距放大 */
}

.confirm-row {
  display: flex;
  align-items: center;
  padding: 14px 0;
  /* 从10px放大到14px */
  border-bottom: 1px solid #f0f0f0;
}

.confirm-row:last-child {
  border-bottom: none;
}

.confirm-label {
  width: 100px;
  /* 从80px放大到100px */
  font-size: 20px;
  /* 从16px放大到20px */
  color: #888;
  flex-shrink: 0;
}

.confirm-value {
  font-size: 20px;
  /* 从16px放大到20px */
  color: #333;
}

.confirm-value.old {
  color: #e6a23c;
}

.confirm-value.new {
  color: #46B97E;
  font-weight: 500;
  /* 从normal改为500稍微加粗 */
}

.confirm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  /* 从14px放大到20px */
  padding: 20px 28px;
  /* 内边距放大 */
  border-top: 1px solid #eee;
}

.confirm-btn-cancel,
.confirm-btn-ok {
  height: 48px;
  /* 从36px放大到48px */
  width: 120px;
  /* 从100px放大到120px */
  cursor: pointer;
  border-radius: 8px;
  /* 圆角放大 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  /* 从16px放大到20px */
  transition: all 0.3s;
}

.confirm-btn-cancel {
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
}

.confirm-btn-cancel:hover {
  border-color: #46B97E;
  color: #46B97E;
}

.confirm-btn-ok {
  background: #46B97E;
  border: 1px solid #46B97E;
  color: #fff;
}

.confirm-btn-ok:hover {
  background: #3aa06b;
}
</style>