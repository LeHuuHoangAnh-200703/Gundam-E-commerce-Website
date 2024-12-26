<script setup>
import Loading from '../../C3 Gundam Website/src/components/client/Loading.vue';
import { isLoading } from '@/router';
</script>

<template>
  <div id="app">
    <Loading :isLoading="isLoading" />
      <router-view></router-view>
  </div>
</template>

<style scoped></style>