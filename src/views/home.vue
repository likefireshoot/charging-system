<template>
  <div class="card">
    <navCard></navCard>
    <div class="content-area">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import navCard from "@/components/navCard";
</script>

<style lang="scss" scoped>
.card {
  flex-direction: row;
  background-color: #fafafa;
  overflow: hidden; /* 防止内容溢出屏幕 */
  box-sizing: border-box;
}

.content-area {
  flex: 1; /* 占据剩余空间 */
  min-width: 0; /* 允许 flex 子元素缩小到内容宽度以下，防止溢出 */
  overflow: hidden; /* 防止内容溢出 */
  box-sizing: border-box;
}
</style>
