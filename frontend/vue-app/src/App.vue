<template>
  <el-container class="app-shell">
    <!-- 全局导航栏始终显示，登录状态不同会切换显示登录/退出按钮。 -->
    <el-header class="app-header"><NavBar /></el-header>
    <!-- router-view 是页面出口，当前路由匹配到的视图会渲染在这里。 -->
    <el-main class="app-main"><router-view /></el-main>
  </el-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NavBar from "./components/NavBar.vue";

export default defineComponent({
  name: "App",
  // 根组件只负责搭建布局和挂载导航栏，具体业务页面由路由决定。
  components: { NavBar },
});
</script>
