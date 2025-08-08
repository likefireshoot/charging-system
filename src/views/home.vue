<template>
  <div class="card">
    <navCard></navCard>
    <router-view />
  </div>
</template>

<script setup>
import navCard from "@/components/navCard";
</script>

<style lang="scss" scoped>
.card {
  flex-direction: row;
  background-color: #fafafa;
}
</style>
