<template>
  <nav class="map-view-control" aria-label="地图视角" @click.stop @pointerdown.stop>
    <button type="button" data-testid="map-view-2d" :disabled="!ready || disabled" :aria-pressed="!threeD" :class="{ active: !threeD }" @click="view?.setMode('2d')">二维</button>
    <button type="button" data-testid="map-view-3d" :disabled="!ready || disabled" :aria-pressed="threeD" :class="{ active: threeD }" title="倾斜视角；放大后显示有高度数据的建筑，编辑时暂隐藏建筑" @click="view?.setMode('3d')">三维</button>
    <span class="view-divider"></span>
    <button type="button" data-testid="map-rotate-left" aria-label="视角向左旋转" title="视角向左旋转 30°" :disabled="!ready || disabled || !threeD" @click="view?.rotate(-30)">↶</button>
    <button type="button" data-testid="map-north" title="恢复正北" :disabled="!ready || disabled" @click="view?.north()"><span :style="{ transform: `rotate(${-bearing}deg)` }">↑</span>北</button>
    <button type="button" data-testid="map-rotate-right" aria-label="视角向右旋转" title="视角向右旋转 30°" :disabled="!ready || disabled || !threeD" @click="view?.rotate(30)">↷</button>
  </nav>
</template>

<script setup>
import { ref, watch, onUnmounted } from "vue";
const props = defineProps({ map: Object, view: Object, ready: Boolean, disabled: Boolean });
const threeD = ref(false), bearing = ref(0);
let detach;
watch(() => props.map, map => {
  detach?.();
  if (!map) return;
  const sync = () => { threeD.value = map.getPitch() > 1; bearing.value = map.getBearing(); };
  sync(); map.on("pitch", sync); map.on("rotate", sync);
  detach = () => { map.off("pitch", sync); map.off("rotate", sync); };
}, { immediate: true });
onUnmounted(() => detach?.());
</script>

<style scoped>
.map-view-control { display: flex; align-items: center; gap: 3px; padding: 4px; border: 1px solid #dce7e1; border-radius: 10px; box-shadow: 0 5px 20px #244a3c12; background: #fffffff5; }
button { border: 0; border-radius: 7px; padding: 9px 12px; color: #3a6357; background: transparent; font: inherit; font-size: 18px; white-space: nowrap; cursor: pointer; }
button.active { color: #fff; background: #208f6c; }
button:not(:disabled):not(.active):hover { background: #e7f2ec; }
button.active:hover { background: #187d5e; }
button:disabled { opacity: .5; cursor: default; }
.view-divider { width: 1px; height: 22px; background: #dce7e1; margin: 0 3px; }
button span { display: inline-block; margin-right: 4px; }
</style>
