<template>
  <section class="page-stack">
    <div class="page-header">
      <div>
        <h1>仪表盘</h1>
        <p>查看项目与任务的整体进度。</p>
      </div>
      <el-button type="primary" @click="refresh">刷新数据</el-button>
    </div>

    <el-alert
      v-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
    />

    <div class="metric-grid" v-loading="loading">
      <div class="metric-card">
        <span>项目总数</span>
        <strong>{{ projects.length }}</strong>
      </div>
      <div class="metric-card">
        <span>任务总数</span>
        <strong>{{ tasks.length }}</strong>
      </div>
      <div class="metric-card">
        <span>进行中</span>
        <strong>{{ inProgressCount }}</strong>
      </div>
      <div class="metric-card">
        <span>已完成</span>
        <strong>{{ doneCount }}</strong>
      </div>
    </div>

    <div class="content-grid">
      <section class="panel">
        <div class="panel-header">
          <h2>完成进度</h2>
          <span>{{ completionRate }}%</span>
        </div>
        <el-progress :percentage="completionRate" :stroke-width="14" />
        <div class="status-breakdown">
          <span>待办 {{ todoCount }}</span>
          <span>进行中 {{ inProgressCount }}</span>
          <span>已完成 {{ doneCount }}</span>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <h2>最近任务</h2>
          <router-link to="/tasks">查看全部</router-link>
        </div>
        <el-empty
          v-if="!recentTasks.length"
          description="暂无任务"
          :image-size="96"
        />
        <ul v-else class="task-list">
          <li v-for="task in recentTasks" :key="task.id">
            <div>
              <strong>{{ task.title }}</strong>
              <small>{{ task.project?.name || "未关联项目" }}</small>
            </div>
            <el-tag :type="statusType(task.status)">{{
              statusText(task.status)
            }}</el-tag>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import api from "@/api";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type Task = {
  id: number;
  title: string;
  status: TaskStatus;
  project?: { id: number; name: string };
};
type Project = { id: number; name: string };

export default defineComponent({
  name: "Dashboard",
  setup() {
    const projects = ref<Project[]>([]);
    const tasks = ref<Task[]>([]);
    const loading = ref(false);
    const error = ref("");

    const refresh = async () => {
      loading.value = true;
      error.value = "";
      try {
        const [projectRes, taskRes] = await Promise.all([
          api.get("/projects"),
          api.get("/tasks"),
        ]);
        projects.value = projectRes.data;
        tasks.value = taskRes.data;
      } catch {
        error.value = "数据加载失败，请确认后端服务已经启动。";
      } finally {
        loading.value = false;
      }
    };

    const todoCount = computed(
      () => tasks.value.filter((task) => task.status === "TODO").length,
    );
    const inProgressCount = computed(
      () => tasks.value.filter((task) => task.status === "IN_PROGRESS").length,
    );
    const doneCount = computed(
      () => tasks.value.filter((task) => task.status === "DONE").length,
    );
    const completionRate = computed(() => {
      if (!tasks.value.length) return 0;
      return Math.round((doneCount.value / tasks.value.length) * 100);
    });
    const recentTasks = computed(() => tasks.value.slice(0, 6));

    const statusText = (status: TaskStatus) => {
      const textMap = { TODO: "待办", IN_PROGRESS: "进行中", DONE: "已完成" };
      return textMap[status];
    };
    const statusType = (status: TaskStatus) => {
      const typeMap = {
        TODO: "info",
        IN_PROGRESS: "warning",
        DONE: "success",
      } as const;
      return typeMap[status];
    };

    onMounted(refresh);

    return {
      projects,
      tasks,
      loading,
      error,
      refresh,
      todoCount,
      inProgressCount,
      doneCount,
      completionRate,
      recentTasks,
      statusText,
      statusType,
    };
  },
});
</script>
