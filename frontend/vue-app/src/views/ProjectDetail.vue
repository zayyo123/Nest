<template>
  <section class="page-stack">
    <!-- 学习注释：详情页从路由参数 :id 中读取项目 ID，再向后端请求单个项目。 -->
    <div class="page-header">
      <div>
        <el-button text class="back-button" @click="goBack">返回项目列表</el-button>
        <h1>{{ project?.name || '项目详情' }}</h1>
        <p>{{ project?.description || '暂无描述' }}</p>
      </div>
      <router-link :to="{ path: '/tasks', query: { projectId: project?.id } }">
        <el-button type="primary">管理任务</el-button>
      </router-link>
    </div>

    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />

    <div class="metric-grid" v-loading="loading">
      <div class="metric-card">
        <span>任务数</span>
        <strong>{{ tasks.length }}</strong>
      </div>
      <div class="metric-card">
        <span>已完成</span>
        <strong>{{ doneCount }}</strong>
      </div>
      <div class="metric-card">
        <span>已逾期</span>
        <strong :class="{ 'danger-text': overdueCount > 0 }">{{ overdueCount }}</strong>
      </div>
      <div class="metric-card">
        <span>高优先级</span>
        <strong>{{ highPriorityCount }}</strong>
      </div>
    </div>

    <div class="content-grid">
      <section class="panel">
        <div class="panel-header">
          <h2>进度</h2>
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
          <h2>下一步</h2>
          <span>{{ activeTasks.length }} 个进行中</span>
        </div>
        <el-empty v-if="!activeTasks.length" description="暂无进行中的任务" :image-size="96" />
        <ul v-else class="task-list">
          <li v-for="task in activeTasks.slice(0, 5)" :key="task.id">
            <div>
              <strong>{{ task.title }}</strong>
              <small>{{ task.dueDate ? `截止 ${task.dueDate}` : '无截止日期' }}</small>
            </div>
            <div class="tag-row">
              <el-tag :type="priorityType(task.priority)">{{ priorityText(task.priority) }}</el-tag>
              <el-tag :type="statusType(task.status)">{{ statusText(task.status) }}</el-tag>
              <el-button
                v-for="action in statusActions(task)"
                :key="action.status"
                size="small"
                :type="action.type"
                plain
                :loading="updatingTaskId === task.id"
                @click="updateTaskStatus(task, action.status)"
              >
                {{ action.label }}
              </el-button>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <section class="panel">
      <div class="panel-header">
        <h2>项目任务</h2>
        <span>共 {{ tasks.length }} 个</span>
      </div>
      <el-table :data="sortedTasks" v-loading="loading" empty-text="该项目暂无任务">
        <el-table-column prop="title" label="标题" min-width="180" />
        <el-table-column prop="description" label="描述" min-width="220">
          <template #default="{ row }">{{ row.description || '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" width="130">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="120">
          <template #default="{ row }">
            <el-tag :type="priorityType(row.priority)">{{ priorityText(row.priority) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="截止日期" width="140">
          <template #default="{ row }">
            <span :class="{ 'danger-text': isOverdue(row) }">{{ row.dueDate || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130" fixed="right">
          <template #default="{ row }">
            <el-button
              v-for="action in statusActions(row)"
              :key="action.status"
              size="small"
              :type="action.type"
              plain
              :loading="updatingTaskId === row.id"
              @click="updateTaskStatus(row, action.status)"
            >
              {{ action.label }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api, { getApiErrorMessage } from '@/api'

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

type Task = {
  id: number
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string | null
}

type Project = {
  id: number
  name: string
  description?: string | null
  tasks?: Task[]
}

export default defineComponent({
  name: 'ProjectDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const project = ref<Project | null>(null)
    const loading = ref(false)
    const updatingTaskId = ref<number | null>(null)
    const error = ref('')

    const loadProject = async () => {
      // route.params.id 来自 /projects/:id，例如 /projects/3 的 id 就是 3。
      loading.value = true
      error.value = ''

      try {
        const res = await api.get<Project>(`/projects/${route.params.id}`)
        project.value = res.data
      } catch (err) {
        error.value = getApiErrorMessage(err, '无法加载项目')
      } finally {
        loading.value = false
      }
    }

    // 详情接口返回 project，同时携带 tasks；这里把 tasks 提出来便于后续统计。
    const tasks = computed(() => project.value?.tasks || [])
    const todayString = () => new Date().toISOString().slice(0, 10)
    const isOverdue = (task: Task) => Boolean(task.dueDate && task.status !== 'DONE' && task.dueDate < todayString())
    const todoCount = computed(() => tasks.value.filter((task) => task.status === 'TODO').length)
    const inProgressCount = computed(() => tasks.value.filter((task) => task.status === 'IN_PROGRESS').length)
    const doneCount = computed(() => tasks.value.filter((task) => task.status === 'DONE').length)
    const overdueCount = computed(() => tasks.value.filter((task) => isOverdue(task)).length)
    const highPriorityCount = computed(() => tasks.value.filter((task) => task.priority === 'HIGH').length)
    const completionRate = computed(() => {
      if (!tasks.value.length) return 0
      return Math.round((doneCount.value / tasks.value.length) * 100)
    })

    const sortedTasks = computed(() => {
      // 任务排序规则：先按状态，再按截止日期，再按优先级，让“需要处理的任务”更靠前。
      const statusWeight: Record<TaskStatus, number> = { TODO: 0, IN_PROGRESS: 1, DONE: 2 }
      const priorityWeight: Record<TaskPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }
      return tasks.value
        .slice()
        .sort((a, b) => {
          if (statusWeight[a.status] !== statusWeight[b.status]) {
            return statusWeight[a.status] - statusWeight[b.status]
          }
          const aDue = a.dueDate || '9999-12-31'
          const bDue = b.dueDate || '9999-12-31'
          if (aDue !== bDue) return aDue.localeCompare(bDue)
          return priorityWeight[a.priority] - priorityWeight[b.priority]
        })
    })

    const activeTasks = computed(() => sortedTasks.value.filter((task) => task.status !== 'DONE'))

    const statusText = (status: TaskStatus) => {
      const labels = { TODO: '待办', IN_PROGRESS: '进行中', DONE: '已完成' }
      return labels[status]
    }

    const statusType = (status: TaskStatus) => {
      const types = { TODO: 'info', IN_PROGRESS: 'warning', DONE: 'success' } as const
      return types[status]
    }

    const priorityText = (priority: TaskPriority) => {
      const labels = { LOW: '低', MEDIUM: '中', HIGH: '高' }
      return labels[priority]
    }

    const priorityType = (priority: TaskPriority) => {
      const types = { LOW: 'info', MEDIUM: '', HIGH: 'danger' } as const
      return types[priority]
    }

    const statusActions = (task: Task) => {
      // 根据当前状态给出下一步动作，避免用户在界面上选择非法状态流转。
      if (task.status === 'TODO') {
        return [{ label: '开始', status: 'IN_PROGRESS' as TaskStatus, type: 'warning' as const }]
      }

      if (task.status === 'IN_PROGRESS') {
        return [{ label: '完成', status: 'DONE' as TaskStatus, type: 'success' as const }]
      }

      return [{ label: '重开', status: 'TODO' as TaskStatus, type: 'info' as const }]
    }

    const updateTaskStatus = async (task: Task, status: TaskStatus) => {
      // 防止重复点击：如果已经是目标状态，或当前有任务正在更新，就直接返回。
      if (task.status === status || updatingTaskId.value) return

      updatingTaskId.value = task.id
      try {
        const res = await api.put<Task>(`/tasks/${task.id}`, { status })
        const projectTasks = project.value?.tasks || []
        const index = projectTasks.findIndex((item) => item.id === task.id)
        // 局部替换数组中的任务，页面会立即基于新数据重新计算统计值。
        if (index >= 0) projectTasks[index] = res.data
        ElMessage.success(`任务已更新为${statusText(status)}`)
      } catch (err) {
        ElMessage.error(getApiErrorMessage(err, '无法更新任务状态'))
      } finally {
        updatingTaskId.value = null
      }
    }

    const goBack = () => {
      router.push('/projects')
    }

    onMounted(loadProject)

    return {
      activeTasks,
      completionRate,
      doneCount,
      error,
      goBack,
      highPriorityCount,
      inProgressCount,
      isOverdue,
      loading,
      overdueCount,
      priorityText,
      priorityType,
      project,
      sortedTasks,
      statusActions,
      statusText,
      statusType,
      tasks,
      todoCount,
      updateTaskStatus,
      updatingTaskId,
    }
  },
})
</script>
