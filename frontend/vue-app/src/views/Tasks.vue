<template>
  <section class="page-stack">
    <!-- 学习注释：任务页是本项目最完整的前端页面，包含筛选、看板/表格切换、分页和 CRUD。 -->
    <div class="hero-panel">
      <div>
        <span class="eyebrow">执行管理</span>
        <h1>任务</h1>
        <p>按优先级、截止日期、状态和项目上下文规划工作。</p>
      </div>
      <div class="hero-actions">
        <!-- v-model 绑定 viewMode；切换后通过 @change 把模式同步到 URL query。 -->
        <el-radio-group v-model="viewMode" size="large" @change="syncFiltersToRoute">
          <el-radio-button label="board">看板</el-radio-button>
          <el-radio-button label="table">表格</el-radio-button>
        </el-radio-group>
        <el-button type="primary" @click="openCreate">新建任务</el-button>
      </div>
    </div>

    <section class="panel">
      <!-- 学习注释：这一行是组合筛选器，所有筛选条件都会共同作用于 filteredTasks。 -->
      <div class="toolbar toolbar-wrap">
        <el-input v-model="filters.q" placeholder="搜索任务" clearable @input="syncFiltersToRoute" />
        <el-select v-model="filters.status" placeholder="状态" clearable @change="syncFiltersToRoute">
          <el-option label="待办" value="TODO" />
          <el-option label="进行中" value="IN_PROGRESS" />
          <el-option label="已完成" value="DONE" />
        </el-select>
        <el-select v-model="filters.priority" placeholder="优先级" clearable @change="syncFiltersToRoute">
          <el-option label="高" value="HIGH" />
          <el-option label="中" value="MEDIUM" />
          <el-option label="低" value="LOW" />
        </el-select>
        <el-select v-model="filters.projectId" placeholder="项目" clearable @change="syncFiltersToRoute">
          <el-option v-for="project in projects" :key="project.id" :label="project.name" :value="project.id" />
        </el-select>
        <el-button plain :disabled="!hasActiveFilters" @click="clearFilters">清除筛选</el-button>
      </div>

      <!-- 学习注释：快捷时间筛选由 dueFilterOptions 数据驱动渲染，新增选项时只改数组即可。 -->
      <div class="quick-filter-row" aria-label="任务时间筛选">
        <button
          v-for="option in dueFilterOptions"
          :key="option.value || 'all'"
          type="button"
          class="quick-filter-chip"
          :class="{ active: filters.due === option.value }"
          @click="setDueFilter(option.value)"
        >
          <span>{{ option.label }}</span>
          <strong>{{ dueFilterCount(option.value) }}</strong>
        </button>
      </div>

      <!-- 学习注释：v-if/v-else 在看板视图和表格视图之间切换。 -->
      <div v-if="viewMode === 'board'" v-loading="loading" class="board-grid">
        <!-- boardColumns 是 computed，把任务按 TODO/IN_PROGRESS/DONE 分成三列。 -->
        <section v-for="column in boardColumns" :key="column.status" class="board-column">
          <div class="board-column-header">
            <h2>{{ column.title }}</h2>
            <span>{{ column.tasks.length }}</span>
          </div>
          <el-empty v-if="!column.tasks.length" description="暂无任务" :image-size="80" />
          <article v-for="task in column.tasks" v-else :key="task.id" class="task-card">
            <div class="task-card-top">
              <strong>{{ task.title }}</strong>
              <el-tag :type="priorityType(task.priority)" size="small">
                {{ priorityText(task.priority) }}
              </el-tag>
            </div>
            <p>{{ task.description || '暂无描述' }}</p>
            <div class="task-card-meta">
              <span class="project-pill" :style="{ '--project-color': task.project?.color || defaultColor }">
                {{ task.project?.name || '未关联项目' }}
              </span>
              <span :class="{ 'danger-text': isOverdue(task) }">{{ formatDueDate(task.dueDate) }}</span>
            </div>
            <div class="task-card-actions">
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
              <el-button size="small" @click="openEdit(task)">编辑</el-button>
              <el-button size="small" type="danger" plain @click="remove(task)">删除</el-button>
            </div>
          </article>
        </section>
      </div>

      <template v-else>
        <!-- Element Plus 表格适合密集查看和扫描数据。 -->
        <el-table :data="pagedTasks" v-loading="loading" empty-text="暂无任务">
          <el-table-column prop="id" label="ID" width="80" />
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
              <span :class="{ 'danger-text': isOverdue(row) }">{{ formatDueDate(row.dueDate) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="项目" min-width="170">
            <template #default="{ row }">
              <span class="project-pill" :style="{ '--project-color': row.project?.color || defaultColor }">
                {{ row.project?.name || '未关联项目' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="320" fixed="right">
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
              <el-button size="small" @click="openEdit(row)">编辑</el-button>
              <el-button size="small" type="danger" @click="remove(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 学习注释：分页只影响前端展示；所有任务数据已经一次性从后端取回。 -->
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="sortedTasks.length"
          layout="prev, pager, next, total"
        />
      </template>
    </section>

    <!-- 学习注释：同一个弹窗复用为“新建”和“编辑”，通过 editingId 判断提交方式。 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="580px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="标题" required>
          <el-input v-model="editForm.title" maxlength="80" show-word-limit />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" :rows="4" maxlength="240" show-word-limit />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status">
            <el-option label="待办" value="TODO" />
            <el-option label="进行中" value="IN_PROGRESS" />
            <el-option label="已完成" value="DONE" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="editForm.priority">
            <el-option label="高" value="HIGH" />
            <el-option label="中" value="MEDIUM" />
            <el-option label="低" value="LOW" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker
            v-model="editForm.dueDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="无截止日期"
            clearable
          />
        </el-form-item>
        <el-form-item label="项目">
          <el-select v-model="editForm.projectId" placeholder="未关联项目" clearable>
            <el-option v-for="project in projects" :key="project.id" :label="project.name" :value="project.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveTask">保存</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api, { getApiErrorMessage } from '@/api'

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'
type DueFilter = '' | 'today' | 'week' | 'overdue'
type ViewMode = 'board' | 'table'
type Project = { id: number; name: string; color?: string }
// 学习注释：Task 类型描述当前页面会使用的任务字段，帮助 TypeScript 做类型检查。
type Task = {
  id: number
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string | null
  projectId?: number | null
  project?: Project | null
}

const defaultColor = '#2563eb'
// 学习注释：日期字符串统一为 YYYY-MM-DD 后，可以直接用字符串比较先后。
const todayString = () => new Date().toISOString().slice(0, 10)
const addDaysString = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}
const dueFilterOptions: Array<{ value: DueFilter; label: string }> = [
  { value: '', label: '全部' },
  { value: 'today', label: '今天' },
  { value: 'week', label: '7 天内' },
  { value: 'overdue', label: '已逾期' },
]

export default defineComponent({
  name: 'Tasks',
  setup() {
    // route 用来读取 URL query，router 用来把筛选条件写回 URL。
    const route = useRoute()
    const router = useRouter()
    const tasks = ref<Task[]>([])
    const projects = ref<Project[]>([])
    const loading = ref(false)
    const saving = ref(false)
    const updatingTaskId = ref<number | null>(null)
    const viewMode = ref<ViewMode>('board')
    const currentPage = ref(1)
    const pageSize = 8
    // 学习注释：filters 是筛选器状态；用 reactive 保存多个相关字段比多个 ref 更清晰。
    const filters = reactive<{
      q: string
      status: '' | TaskStatus
      priority: '' | TaskPriority
      projectId: number | ''
      due: DueFilter
    }>({
      q: '',
      status: '',
      priority: '',
      projectId: '',
      due: '',
    })
    const dialogVisible = ref(false)
    const dialogTitle = ref('新建任务')
    const editingId = ref<number | null>(null)
    const editForm = reactive<{
      title: string
      description: string
      status: TaskStatus
      priority: TaskPriority
      dueDate: string
      projectId: number | ''
    }>({
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
      projectId: '',
    })

    const fetchProjects = async () => {
      try {
        // 任务编辑弹窗需要项目下拉框，所以任务页也要加载项目列表。
        const res = await api.get<Project[]>('/projects')
        projects.value = res.data
      } catch (err) {
        ElMessage.error(getApiErrorMessage(err, '无法加载项目'))
      }
    }

    const fetchTasks = async () => {
      // 任务列表来自后端 /tasks；鉴权 token 会由 api.ts 的请求拦截器自动带上。
      loading.value = true
      try {
        const res = await api.get<Task[]>('/tasks')
        tasks.value = res.data
      } catch (err) {
        ElMessage.error(getApiErrorMessage(err, '无法加载任务'))
      } finally {
        loading.value = false
      }
    }

    const applyRouteFilters = () => {
      // 从 URL query 恢复筛选器，保证刷新页面或分享链接时状态不丢。
      const due = route.query.due
      const status = route.query.status
      const priority = route.query.priority
      const projectId = route.query.projectId
      const q = route.query.q
      const view = route.query.view

      filters.q = ''
      filters.due = ''
      filters.status = ''
      filters.priority = ''
      filters.projectId = ''
      viewMode.value = 'board'

      if (typeof q === 'string') {
        filters.q = q
      }

      if (view === 'board' || view === 'table') {
        viewMode.value = view
      }

      if (typeof due === 'string' && dueFilterOptions.some((option) => option.value === due)) {
        filters.due = due as DueFilter
      }

      if (status === 'TODO' || status === 'IN_PROGRESS' || status === 'DONE') {
        filters.status = status
      }

      if (priority === 'LOW' || priority === 'MEDIUM' || priority === 'HIGH') {
        filters.priority = priority
      }

      if (typeof projectId === 'string') {
        const parsed = Number(projectId)
        if (Number.isInteger(parsed) && parsed > 0) filters.projectId = parsed
      }

      resetPage()
    }

    const resetForm = () => {
      // 新建任务前重置表单，避免上一次编辑残留的数据污染下一次创建。
      editingId.value = null
      editForm.title = ''
      editForm.description = ''
      editForm.status = 'TODO'
      editForm.priority = 'MEDIUM'
      editForm.dueDate = ''
      editForm.projectId = ''
    }

    const openCreate = () => {
      resetForm()
      dialogTitle.value = '新建任务'
      dialogVisible.value = true
    }

    const openEdit = (task: Task) => {
      // 编辑时把当前任务数据复制到表单；用户修改表单时不会直接改列表里的原对象。
      editingId.value = task.id
      editForm.title = task.title
      editForm.description = task.description || ''
      editForm.status = task.status
      editForm.priority = task.priority || 'MEDIUM'
      editForm.dueDate = task.dueDate || ''
      editForm.projectId = task.project?.id || task.projectId || ''
      dialogTitle.value = '编辑任务'
      dialogVisible.value = true
    }

    const saveTask = async () => {
      if (!editForm.title.trim()) {
        ElMessage.warning('请输入任务标题')
        return
      }

      saving.value = true
      try {
        // 后端 DTO 接收 null 表示“无截止日期/无项目”，所以空字符串在这里转成 null。
        const payload = {
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          status: editForm.status,
          priority: editForm.priority,
          dueDate: editForm.dueDate || null,
          projectId: editForm.projectId || null,
        }

        if (editingId.value) {
          // 有 editingId 表示编辑已有任务，调用 PUT /tasks/:id。
          await api.put(`/tasks/${editingId.value}`, payload)
          ElMessage.success('任务已更新')
        } else {
          // 没有 editingId 表示新建任务，调用 POST /tasks。
          await api.post('/tasks', payload)
          ElMessage.success('任务已创建')
        }

        dialogVisible.value = false
        await fetchTasks()
      } catch (err) {
        ElMessage.error(getApiErrorMessage(err, '无法保存任务'))
      } finally {
        saving.value = false
      }
    }

    const remove = async (task: Task) => {
      try {
        await ElMessageBox.confirm(`确定删除“${task.title}”吗？`, '删除任务', { type: 'warning' })
        await api.delete(`/tasks/${task.id}`)
        ElMessage.success('任务已删除')
        await fetchTasks()
      } catch (err) {
        if (err !== 'cancel') ElMessage.error(getApiErrorMessage(err, '无法删除任务'))
      }
    }

    const statusActions = (task: Task) => {
      // 把状态流转按钮封装成函数，模板只负责渲染按钮，不写复杂判断。
      if (task.status === 'TODO') {
        return [{ label: '开始', status: 'IN_PROGRESS' as TaskStatus, type: 'warning' as const }]
      }

      if (task.status === 'IN_PROGRESS') {
        return [{ label: '完成', status: 'DONE' as TaskStatus, type: 'success' as const }]
      }

      return [{ label: '重开', status: 'TODO' as TaskStatus, type: 'info' as const }]
    }

    const updateTaskStatus = async (task: Task, status: TaskStatus) => {
      // 快捷改状态时只提交 status 字段，减少不必要的数据传输。
      if (task.status === status || updatingTaskId.value) return

      updatingTaskId.value = task.id
      try {
        const res = await api.put<Task>(`/tasks/${task.id}`, { status })
        const index = tasks.value.findIndex((item) => item.id === task.id)
        if (index >= 0) tasks.value[index] = res.data
        ElMessage.success(`任务已更新为${statusText(status)}`)
      } catch (err) {
        ElMessage.error(getApiErrorMessage(err, '无法更新任务状态'))
      } finally {
        updatingTaskId.value = null
      }
    }

    const filteredTasks = computed(() => {
      // 所有筛选条件在这里集中判断：文本、状态、优先级、项目、截止日期。
      const q = filters.q.trim().toLowerCase()

      return tasks.value.filter((task) => {
        const textMatch = !q || `${task.title} ${task.description || ''}`.toLowerCase().includes(q)
        const statusMatch = !filters.status || task.status === filters.status
        const priorityMatch = !filters.priority || task.priority === filters.priority
        const projectMatch = !filters.projectId || (task.project?.id || task.projectId) === filters.projectId
        const dueMatch = matchesDueFilter(task, filters.due)
        return textMatch && statusMatch && priorityMatch && projectMatch && dueMatch
      })
    })

    const pagedTasks = computed(() => {
      const start = (currentPage.value - 1) * pageSize
      return sortedTasks.value.slice(start, start + pageSize)
    })

    const sortedTasks = computed(() => {
      // 排序优先级：状态 -> 截止日期 -> 优先级 -> 新旧。
      return filteredTasks.value.slice().sort((a, b) => {
        const statusDiff = statusSortWeight(a.status) - statusSortWeight(b.status)
        if (statusDiff) return statusDiff

        const dueDiff = dueSortWeight(a) - dueSortWeight(b)
        if (dueDiff) return dueDiff

        const priorityDiff = prioritySortWeight(a.priority) - prioritySortWeight(b.priority)
        if (priorityDiff) return priorityDiff

        return b.id - a.id
      })
    })

    const boardColumns = computed(() => {
      // 看板列不是后端直接返回的，而是前端从 sortedTasks 按状态分组得到。
      const columns: Array<{ status: TaskStatus; title: string; tasks: Task[] }> = [
        { status: 'TODO', title: '待办', tasks: [] },
        { status: 'IN_PROGRESS', title: '进行中', tasks: [] },
        { status: 'DONE', title: '已完成', tasks: [] },
      ]
      columns.forEach((column) => {
        column.tasks = sortedTasks.value.filter((task) => task.status === column.status)
      })
      return columns
    })
    const hasActiveFilters = computed(() =>
      Boolean(filters.q.trim() || filters.status || filters.priority || filters.projectId || filters.due),
    )

    const resetPage = () => {
      currentPage.value = 1
    }

    const clearFilters = () => {
      filters.q = ''
      filters.status = ''
      filters.priority = ''
      filters.projectId = ''
      filters.due = ''
      syncFiltersToRoute()
    }

    const setDueFilter = (value: DueFilter) => {
      filters.due = value
      syncFiltersToRoute()
    }

    const syncFiltersToRoute = () => {
      // URL 只保存非默认条件，例如默认看板模式不写 view=board。
      resetPage()

      const query: Record<string, string> = {}
      if (filters.q.trim()) query.q = filters.q.trim()
      if (filters.status) query.status = filters.status
      if (filters.priority) query.priority = filters.priority
      if (filters.projectId) query.projectId = String(filters.projectId)
      if (filters.due) query.due = filters.due
      if (viewMode.value !== 'board') query.view = viewMode.value

      const current = Object.fromEntries(
        Object.entries(route.query)
          .filter(([, value]) => typeof value === 'string')
          .map(([key, value]) => [key, value as string]),
      )

      if (JSON.stringify(current) !== JSON.stringify(query)) {
        void router.replace({ path: '/tasks', query })
      }
    }

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

    const statusSortWeight = (status: TaskStatus) => {
      const weights = { IN_PROGRESS: 0, TODO: 1, DONE: 2 }
      return weights[status]
    }

    const prioritySortWeight = (priority: TaskPriority) => {
      const weights = { HIGH: 0, MEDIUM: 1, LOW: 2 }
      return weights[priority]
    }

    const dueSortWeight = (task: Task) => {
      if (!task.dueDate) return Number.MAX_SAFE_INTEGER
      if (task.status === 'DONE') return Number.MAX_SAFE_INTEGER - 1
      return new Date(task.dueDate).getTime()
    }

    const isOverdue = (task: Task) => Boolean(task.dueDate && task.status !== 'DONE' && task.dueDate < todayString())
    const matchesDueFilter = (task: Task, due: DueFilter) => {
      if (!due) return true
      if (!task.dueDate) return false

      const today = todayString()
      if (due === 'overdue') return task.status !== 'DONE' && task.dueDate < today
      if (due === 'today') return task.dueDate === today
      return task.status !== 'DONE' && task.dueDate >= today && task.dueDate <= addDaysString(7)
    }
    const dueFilterCount = (value: DueFilter) => tasks.value.filter((task) => matchesDueFilter(task, value)).length
    const formatDueDate = (dueDate?: string | null) => dueDate || '无截止日期'

    onMounted(async () => {
      // 页面首次打开时，先恢复 URL 筛选，再加载项目和任务数据。
      applyRouteFilters()
      await fetchProjects()
      await fetchTasks()
    })

    // 当用户通过浏览器前进/后退改变 URL query 时，页面筛选器跟着同步。
    watch(() => route.query, applyRouteFilters)

    return {
      boardColumns,
      currentPage,
      defaultColor,
      dialogTitle,
      dialogVisible,
      dueFilterCount,
      dueFilterOptions,
      editForm,
      filteredTasks,
      filters,
      formatDueDate,
      hasActiveFilters,
      isOverdue,
      loading,
      openCreate,
      openEdit,
      pageSize,
      pagedTasks,
      priorityText,
      priorityType,
      projects,
      clearFilters,
      remove,
      resetPage,
      saveTask,
      saving,
      setDueFilter,
      syncFiltersToRoute,
      sortedTasks,
      statusText,
      statusType,
      statusActions,
      updateTaskStatus,
      updatingTaskId,
      viewMode,
    }
  },
})
</script>
