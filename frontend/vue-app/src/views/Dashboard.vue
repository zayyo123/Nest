<template>
  <section class="page-stack">
    <!-- 学习注释：仪表盘页面只展示汇总信息，不在这里编辑数据。 -->
    <div class="hero-panel">
      <div>
        <span class="eyebrow">工作区概览</span>
        <h1>仪表盘</h1>
        <p>集中查看交付进度、紧急任务和项目动态。</p>
      </div>
      <el-button type="primary" :loading="loading" @click="refresh">刷新</el-button>
    </div>

    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />

    <div class="metric-grid" v-loading="loading">
      <!-- 学习注释：router-link 可以包住整张卡片，让指标既是展示也是快捷入口。 -->
      <router-link to="/projects" class="metric-card accent-blue">
        <span>项目数</span>
        <strong>{{ projects.length }}</strong>
      </router-link>
      <router-link to="/tasks" class="metric-card accent-teal">
        <span>任务数</span>
        <strong>{{ tasks.length }}</strong>
      </router-link>
      <router-link :to="{ path: '/tasks', query: { priority: 'HIGH' } }" class="metric-card accent-amber">
        <span>高优先级</span>
        <strong>{{ highPriorityCount }}</strong>
      </router-link>
      <router-link :to="{ path: '/tasks', query: { due: 'overdue' } }" class="metric-card accent-red">
        <span>已逾期</span>
        <strong>{{ overdueCount }}</strong>
      </router-link>
    </div>

    <div class="content-grid">
      <section class="panel">
        <div class="panel-header">
          <h2>完成度</h2>
          <span>{{ completionRate }}%</span>
        </div>
        <el-progress :percentage="completionRate" :stroke-width="14" />
        <div class="status-breakdown">
          <span>待办 {{ todoCount }}</span>
          <span>进行中 {{ inProgressCount }}</span>
          <span>已完成 {{ doneCount }}</span>
          <span>即将到期 {{ dueSoonCount }}</span>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <h2>风险雷达</h2>
          <router-link to="/tasks">查看任务</router-link>
        </div>
        <ul class="risk-list">
          <li>
            <router-link :to="{ path: '/tasks', query: { due: 'overdue' } }" class="risk-link">
              <span class="risk-dot red"></span>
              <div>
                <strong>{{ overdueCount }} 个已逾期</strong>
                <small>超过截止日期且尚未完成的任务</small>
              </div>
            </router-link>
          </li>
          <li>
            <router-link :to="{ path: '/tasks', query: { due: 'week' } }" class="risk-link">
              <span class="risk-dot amber"></span>
              <div>
                <strong>{{ dueSoonCount }} 个即将到期</strong>
                <small>未来 7 天内到期的任务</small>
              </div>
            </router-link>
          </li>
          <li>
            <router-link :to="{ path: '/tasks', query: { priority: 'HIGH' } }" class="risk-link">
              <span class="risk-dot teal"></span>
              <div>
                <strong>{{ highPriorityCount }} 个高优先级</strong>
                <small>需要重点关注的重要任务</small>
              </div>
            </router-link>
          </li>
        </ul>
      </section>
    </div>

    <div class="content-grid wide-left">
      <section class="panel">
        <div class="panel-header">
          <h2>项目工作量</h2>
          <router-link to="/projects">管理项目</router-link>
        </div>
        <el-empty v-if="!projectSummaries.length" description="暂无项目" :image-size="96" />
        <div v-else class="project-summary-grid">
          <router-link v-for="project in projectSummaries" :key="project.id" class="project-summary" :to="`/projects/${project.id}`">
            <div class="project-summary-top">
              <span class="color-dot" :style="{ background: project.color }"></span>
              <strong>{{ project.name }}</strong>
            </div>
            <el-progress :percentage="project.completion" :stroke-width="10" />
            <small>已完成 {{ project.done }} / {{ project.total }}</small>
          </router-link>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <h2>最近任务</h2>
          <router-link to="/tasks">查看全部</router-link>
        </div>
        <el-empty v-if="!recentTasks.length" description="暂无任务" :image-size="96" />
        <ul v-else class="task-list compact">
          <li v-for="task in recentTasks" :key="task.id">
            <router-link class="task-link" :to="{ path: '/tasks', query: task.project?.id ? { projectId: task.project.id } : {} }">
              <div>
                <strong>{{ task.title }}</strong>
                <small>{{ task.project?.name || '未关联项目' }}</small>
              </div>
              <el-tag :type="statusType(task.status)">
                {{ statusText(task.status) }}
              </el-tag>
            </router-link>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import api, { getApiErrorMessage } from '@/api'

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'
// 学习注释：这里定义的是前端需要用到的数据形状，不一定等于后端实体的全部字段。
type Project = { id: number; name: string; color?: string }
type Task = {
  id: number
  title: string
  status: TaskStatus
  priority?: TaskPriority
  dueDate?: string | null
  project?: Project | null
}

const todayString = () => new Date().toISOString().slice(0, 10)
// 学习注释：日期在页面中只按 YYYY-MM-DD 比较，所以统一截取 ISO 字符串前 10 位。
const addDaysString = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export default defineComponent({
  name: 'Dashboard',
  setup() {
    const projects = ref<Project[]>([])
    const tasks = ref<Task[]>([])
    const loading = ref(false)
    const error = ref('')

    const refresh = async () => {
      // 学习注释：loading 控制页面加载态；error 控制错误提示。
      loading.value = true
      error.value = ''

      try {
        // Promise.all 并发请求项目和任务，比先请求项目再请求任务更快。
        const [projectRes, taskRes] = await Promise.all([api.get('/projects'), api.get('/tasks')])
        projects.value = projectRes.data
        tasks.value = taskRes.data
      } catch (err) {
        error.value = getApiErrorMessage(err, '无法加载仪表盘数据')
      } finally {
        loading.value = false
      }
    }

    // 学习注释：computed 是“由已有响应式数据推导出的值”。
    // tasks 变化时，这些统计值会自动重新计算并更新页面。
    const todoCount = computed(() => tasks.value.filter((task) => task.status === 'TODO').length)
    const inProgressCount = computed(() => tasks.value.filter((task) => task.status === 'IN_PROGRESS').length)
    const doneCount = computed(() => tasks.value.filter((task) => task.status === 'DONE').length)
    const highPriorityCount = computed(
      () => tasks.value.filter((task) => task.priority === 'HIGH' && task.status !== 'DONE').length,
    )
    const overdueCount = computed(
      () => tasks.value.filter((task) => Boolean(task.dueDate && task.status !== 'DONE' && task.dueDate < todayString())).length,
    )
    const dueSoonCount = computed(() => {
      const today = todayString()
      const week = addDaysString(7)
      return tasks.value.filter((task) => Boolean(task.dueDate && task.status !== 'DONE' && task.dueDate >= today && task.dueDate <= week)).length
    })
    const completionRate = computed(() => {
      if (!tasks.value.length) return 0
      return Math.round((doneCount.value / tasks.value.length) * 100)
    })
    const recentTasks = computed(() => tasks.value.slice(0, 6))

    const projectSummaries = computed(() =>
      // 为每个项目计算任务数和完成率，模板中就不用写复杂逻辑。
      projects.value.map((project) => {
        const related = tasks.value.filter((task) => task.project?.id === project.id)
        const done = related.filter((task) => task.status === 'DONE').length
        return {
          ...project,
          color: project.color || '#2563eb',
          done,
          total: related.length,
          completion: related.length ? Math.round((done / related.length) * 100) : 0,
        }
      }),
    )

    const statusText = (status: TaskStatus) => {
      // 把后端枚举值转换成中文展示文案。
      const labels = { TODO: '待办', IN_PROGRESS: '进行中', DONE: '已完成' }
      return labels[status]
    }

    const statusType = (status: TaskStatus) => {
      const types = { TODO: 'info', IN_PROGRESS: 'warning', DONE: 'success' } as const
      return types[status]
    }

    // 学习注释：onMounted 会在组件首次挂载到页面后执行，适合发起初始数据请求。
    onMounted(refresh)

    return {
      completionRate,
      doneCount,
      dueSoonCount,
      error,
      highPriorityCount,
      inProgressCount,
      loading,
      overdueCount,
      projectSummaries,
      projects,
      recentTasks,
      refresh,
      statusText,
      statusType,
      tasks,
      todoCount,
    }
  },
})
</script>
