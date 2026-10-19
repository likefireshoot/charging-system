<template>
  <svg class="map-tool-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path v-for="(line, index) in icons[name]" :key="index" :d="line" />
  </svg>
</template>
<script setup>
defineProps({ name: String });
const icons = {
  'device-add': ['M5 3h10v7M5 3v18h7M8 7h4M8 11h3', 'M18 13v8M14 17h8'],
  'device-revise': ['M12 3v4M12 17v4M3 12h4M17 12h4', 'M12 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10', 'M12 10v4M10 12h4'],
  'device-info': ['M5 3h14v18H5z', 'M8 7h8M8 11h8M8 15h5'],
  'pipe-add': ['M3 17h7V7h7', 'M17 3v8M13 7h8'],
  'pipe-revise': ['M3 17h7V7h11', 'M2 15h4v4H2zM8 5h4v4H8zM18 5h4v4h-4z'],
  'pipe-info': ['M3 17h7V7h11', 'M15 13h6M15 17h6M15 21h4'],
};
</script>
