<template>
  <el-container class="app-shell">
    <el-header class="app-header"><NavBar /></el-header>
    <el-main class="app-main"><router-view /></el-main>
  </el-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NavBar from "./components/NavBar.vue";

export default defineComponent({
  name: "App",
  components: { NavBar },
});
</script>
