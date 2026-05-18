<template>
  <el-container>
    <el-header><NavBar /></el-header>
    <el-main class="container"><router-view /></el-main>
  </el-container>
  </template>
<script lang="ts">
import { defineComponent } from 'vue'
import NavBar from './components/NavBar.vue'
export default defineComponent({ components: { NavBar } })
</script>
<style scoped>
.container { padding: 20px; max-width: 1200px; margin: 0 auto; }
</style>
