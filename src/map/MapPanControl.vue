<template>
  <nav class="map-pan-control" aria-label="地图移动" @click.stop @pointerdown.stop>
    <button v-for="item in directions" :key="item.id" type="button" :class="item.id"
      :data-testid="'map-pan-' + item.id" :aria-label="item.label" :title="item.label"
      :disabled="!ready" @click="pan(item.offset)">{{ item.symbol }}</button>
  </nav>
</template>

<script setup>
const props = defineProps({ map: Object, ready: Boolean });
const directions = [
  { id: 'up', label: '地图向上移动', symbol: '↑', offset: [0, -100] },
  { id: 'down', label: '地图向下移动', symbol: '↓', offset: [0, 100] },
  { id: 'left', label: '地图向左移动', symbol: '←', offset: [-100, 0] },
  { id: 'right', label: '地图向右移动', symbol: '→', offset: [100, 0] },
];
function pan(offset) {
  // AMap moved the map surface; MapLibre moves the camera in the opposite sign.
  // Preserve the original four directions, 100 layout pixels and 250 ms duration.
  if (props.ready && props.map) props.map.panBy(offset, { duration: 250 });
}
</script>

<style scoped>
.map-pan-control { position: absolute; bottom: 10px; left: 65px; z-index: 8;
  display: grid; grid-template-columns: repeat(3, 28px); grid-template-rows: repeat(3, 28px); gap: 2px; }
button { background: #fff; color: #315544; border: 1px solid #d7e0da; border-radius: 4px;
  font-size: 20px; cursor: pointer; padding: 0; }
button:hover { background: #edf7f1; } button:disabled { cursor: default; opacity: .5; }
.up { grid-area: 1 / 2; } .down { grid-area: 3 / 2; }
.left { grid-area: 2 / 1; } .right { grid-area: 2 / 3; }
</style>
