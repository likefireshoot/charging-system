<template>
  <div class="map-pipe-legend" aria-label="管径颜色图例">
    <span v-for="item in items" :key="item.label"><i :style="{ background: getPipeColor(item.diameter) }"></i>{{ item.label }}</span>
    <p>箭头表示已确认流向，黄色描边表示选中管线。</p>
  </div>
</template>
<script setup>
import { getPipeColor } from "@/api/map/map";
const items = [{ diameter: 50, label: "50 / 其他管径" }, { diameter: 100, label: "100 mm" },
  { diameter: 150, label: "150 mm" }, { diameter: 0, label: "未填 / 0" }];
</script>
<style scoped>
.map-pipe-legend { display: flex; flex-wrap: wrap; gap: 8px 14px; margin-bottom: 12px; font-size: 15px; line-height: 1.5; flex-shrink: 0; color: #315544; }
span { display: inline-flex; align-items: center; gap: 6px; }
i { width: 20px; height: 5px; border-radius: 3px; }
p { width: 100%; font-size: 14px; color: #64766c; }
</style>
