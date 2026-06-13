<template>
  <div class="command-tab-container">
    <!-- 品牌支持 -->
    <template v-if="brandComponent">
      <component :is="brandComponent" :meter-data="meterData" />
    </template>

    <!-- 未匹配到品牌 / 无品牌信息时 -->
    <div v-else class="unsupported-hint">
      <img src="@/assets/yonghu/0.png" alt="" />
      <span v-if="vendorName">
        暂不支持「{{ vendorName }}」品牌的命令下发
      </span>
      <span v-else>当前水表无品牌信息，无法进行命令下发</span>
    </div>
  </div>
</template>

<script>
import service from "@/api/request";
import { getCommandComponent, apiPrefixMap } from "./commandTab/index.js";

export default {
  name: "CommandTab",
  props: {
    user: {
      type: Object,
      default: () => ({}),
    },
    userMeters: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      brandComponent: null,
      vendorName: "",
      meterInfo: {}, // 从后端获取的水表简略信息（含 imei）
    };
  },
  computed: {
    selectedMeter() {
      if (!this.userMeters.length || !this.user.meterCode) return {};
      return (
        this.userMeters.find((m) => m.meterCode === this.user.meterCode) || {}
      );
    },
    meterData() {
      return {
        //meterInfo中垃圾信息最多,放在最前面,优先被覆盖
        ...this.meterInfo,
        ...this.selectedMeter,
        meterCode: this.user.meterCode || this.selectedMeter.meterCode || "",
        userId: this.user.userId || "",
        companyId: this.user.companyId || "",
        apiPrefix: apiPrefixMap[this.vendorName] || "",
      };
    },
  },
  watch: {
    "selectedMeter.meterVendor": {
      immediate: true,
      handler(val) {
        this.vendorName = val || "";
        if (!val) {
          this.brandComponent = null;
          return;
        }
        const factory = getCommandComponent(val);
        if (!factory) {
          this.brandComponent = null;
          return;
        }
        const result = factory();
        if (result && typeof result.then === "function") {
          result.then((mod) => {
            this.brandComponent = mod.default || mod;
          });
        } else {
          this.brandComponent = result;
        }
      },
    },
    /** 表号切换时重新请求水表简略信息 */
    "user.meterCode": {
      immediate: true,
      handler(val) {
        if (!val) { this.meterInfo = {}; return; }
        this.fetchSimpleMeter(val);
      },
    },
  },
  methods: {
    async fetchSimpleMeter(meterCode) {
      try {
        const res = await service.get(
          `/userManage/meter/getSimpleMeterByCode?meterCode=${encodeURIComponent(meterCode)}`
        );
        if (res.code === 200 && res.data) {
          this.meterInfo = res.data;
        } else {
          this.meterInfo = {};
        }
      } catch (e) {
        console.error("获取水表简略信息失败", e);
        this.meterInfo = {};
      }
    },
  },
};
</script>

<style scoped>
.command-tab-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.unsupported-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 100%;
  min-height: 640px;
  padding: 48px;
  color: #666;
  font-size: 24px;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  text-align: center;
}

.unsupported-hint img {
  height: 180px;
  margin-bottom: 32px;
  opacity: 0.56;
}

.unsupported-hint span {
  line-height: 1.8;
}
</style>
