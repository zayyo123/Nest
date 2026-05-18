<template>
  <section class="page-stack">
    <div class="hero-panel">
      <div>
        <span class="eyebrow">项目组合</span>
        <h1>项目</h1>
        <p>按项目组织任务，设置颜色标识，并快速查看工作量。</p>
      </div>
      <el-button type="primary" @click="openCreate">新建项目</el-button>
    </div>

    <section class="panel">
      <div class="toolbar toolbar-wrap">
        <el-input v-model="filters.q" placeholder="搜索项目" clearable @input="syncFiltersToRoute" />
        <el-select v-model="filters.sort" placeholder="排序" @change="syncFiltersToRoute">
          <el-option label="最近创建" value="recent" />
          <el-option label="名称 A-Z" value="name" />
          <el-option label="任务最多" value="tasks" />
          <el-option label="完成度最高" value="completion" />
          <el-option label="进行中最多" value="active" />
        </el-select>
        <el-button plain :disabled="!hasActiveFilters" @click="clearFilters">清除筛选</el-button>
      </div>

      <div v-loading="loading" class="project-card-grid">
        <el-empty v-if="!pagedProjects.length" description="暂无项目" :image-size="110" />
        <article v-for="project in pagedProjects" v-else :key="project.id" class="project-card">
          <div class="project-card-accent" :style="{ background: project.color || defaultColor }"></div>
          <div class="project-card-header">
            <div>
              <h2>{{ project.name }}</h2>
              <p>{{ project.description || '暂无描述' }}</p>
            </div>
            <span class="color-chip" :style="{ background: project.color || defaultColor }"></span>
          </div>

          <div class="project-card-meta">
            <span>{{ project.tasks?.length || 0 }} 个任务</span>
            <span>{{ projectDoneCount(project) }} 已完成</span>
            <span>{{ projectActiveCount(project) }} 进行中</span>
          </div>

          <el-progress :percentage="projectCompletion(project)" :stroke-width="10" />

          <div class="project-card-actions">
            <el-button size="small" type="primary" plain @click="viewProject(project)">查看</el-button>
            <el-button size="small" @click="openEdit(project)">编辑</el-button>
            <el-button size="small" type="danger" plain @click="remove(project)">删除</el-button>
          </div>
        </article>
      </div>

      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="sortedProjects.length"
        layout="prev, pager, next, total"
      />
    </section>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="540px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="名称" required>
          <el-input v-model="editForm.name" maxlength="60" show-word-limit />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" :rows="4" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="颜色">
          <div class="color-picker-row">
            <button
              v-for="color in colorOptions"
              :key="color"
              type="button"
              class="color-swatch"
              :class="{ active: editForm.color === color }"
              :style="{ background: color }"
              @click="editForm.color = color"
              :aria-label="`使用颜色 ${color}`"
            ></button>
            <el-color-picker v-model="editForm.color" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveProject">保存</el-button>
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
type Task = { id: number; status?: TaskStatus }
type ProjectSort = 'recent' | 'name' | 'tasks' | 'completion' | 'active'
type Project = {
  id: number
  name: string
  description?: string | null
  color?: string
  tasks?: Task[]
}

const defaultColor = '#2563eb'
const colorOptions = ['#2563eb', '#0f766e', '#7c3aed', '#db2777', '#ea580c', '#475569']
const projectSortOptions: ProjectSort[] = ['recent', 'name', 'tasks', 'completion', 'active']

export default defineComponent({
  name: 'Projects',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const projects = ref<Project[]>([])
    const loading = ref(false)
    const saving = ref(false)
    const currentPage = ref(1)
    const pageSize = 6
    const filters = reactive<{ q: string; sort: ProjectSort }>({ q: '', sort: 'recent' })
    const dialogVisible = ref(false)
    const dialogTitle = ref('新建项目')
    const editForm = reactive({ name: '', description: '', color: defaultColor })
    const editingId = ref<number | null>(null)

    const fetchProjects = async () => {
      loading.value = true
      try {
        const res = await api.get<Project[]>('/projects')
        projects.value = res.data
      } catch (err) {
        ElMessage.error(getApiErrorMessage(err, '无法加载项目'))
      } finally {
        loading.value = false
      }
    }

    const applyRouteFilters = () => {
      const q = route.query.q
      const sort = route.query.sort

      filters.q = ''
      filters.sort = 'recent'

      if (typeof q === 'string') {
        filters.q = q
      }

      if (typeof sort === 'string' && projectSortOptions.includes(sort as ProjectSort)) {
        filters.sort = sort as ProjectSort
      }

      resetPage()
    }

    const resetForm = () => {
      editForm.name = ''
      editForm.description = ''
      editForm.color = defaultColor
      editingId.value = null
    }

    const openCreate = () => {
      resetForm()
      dialogTitle.value = '新建项目'
      dialogVisible.value = true
    }

    const openEdit = (project: Project) => {
      editingId.value = project.id
      editForm.name = project.name
      editForm.description = project.description || ''
      editForm.color = project.color || defaultColor
      dialogTitle.value = '编辑项目'
      dialogVisible.value = true
    }

    const viewProject = (project: Project) => {
      router.push(`/projects/${project.id}`)
    }

    const saveProject = async () => {
      if (!editForm.name.trim()) {
        ElMessage.warning('请输入项目名称')
        return
      }

      saving.value = true
      try {
        const payload = {
          name: editForm.name.trim(),
          description: editForm.description.trim(),
          color: editForm.color,
        }

        if (editingId.value) {
          await api.put(`/projects/${editingId.value}`, payload)
          ElMessage.success('项目已更新')
        } else {
          await api.post('/projects', payload)
          ElMessage.success('项目已创建')
        }

        dialogVisible.value = false
        await fetchProjects()
      } catch (err) {
        ElMessage.error(getApiErrorMessage(err, '无法保存项目'))
      } finally {
        saving.value = false
      }
    }

    const remove = async (project: Project) => {
      try {
        await ElMessageBox.confirm(`确定删除“${project.name}”吗？关联任务会保留，但不再归属该项目。`, '删除项目', {
          type: 'warning',
        })
        await api.delete(`/projects/${project.id}`)
        ElMessage.success('项目已删除')
        await fetchProjects()
      } catch (err) {
        if (err !== 'cancel') ElMessage.error(getApiErrorMessage(err, '无法删除项目'))
      }
    }

    const filteredProjects = computed(() => {
      const q = filters.q.trim().toLowerCase()
      if (!q) return projects.value

      return projects.value.filter((project) =>
        `${project.name} ${project.description || ''}`.toLowerCase().includes(q),
      )
    })

    const pagedProjects = computed(() => {
      const start = (currentPage.value - 1) * pageSize
      return sortedProjects.value.slice(start, start + pageSize)
    })

    const sortedProjects = computed(() => {
      return filteredProjects.value.slice().sort((a, b) => {
        if (filters.sort === 'name') return a.name.localeCompare(b.name)
        if (filters.sort === 'tasks') return projectTaskCount(b) - projectTaskCount(a) || b.id - a.id
        if (filters.sort === 'completion') return projectCompletion(b) - projectCompletion(a) || b.id - a.id
        if (filters.sort === 'active') return projectActiveCount(b) - projectActiveCount(a) || b.id - a.id
        return b.id - a.id
      })
    })
    const hasActiveFilters = computed(() => Boolean(filters.q.trim()) || filters.sort !== 'recent')

    const resetPage = () => {
      currentPage.value = 1
    }

    const clearFilters = () => {
      filters.q = ''
      filters.sort = 'recent'
      syncFiltersToRoute()
    }

    const syncFiltersToRoute = () => {
      resetPage()

      const query: Record<string, string> = {}
      if (filters.q.trim()) query.q = filters.q.trim()
      if (filters.sort !== 'recent') query.sort = filters.sort

      const current = Object.fromEntries(
        Object.entries(route.query)
          .filter(([, value]) => typeof value === 'string')
          .map(([key, value]) => [key, value as string]),
      )

      if (JSON.stringify(current) !== JSON.stringify(query)) {
        void router.replace({ path: '/projects', query })
      }
    }

    const projectDoneCount = (project: Project) => project.tasks?.filter((task) => task.status === 'DONE').length || 0
    const projectActiveCount = (project: Project) => project.tasks?.filter((task) => task.status !== 'DONE').length || 0
    const projectTaskCount = (project: Project) => project.tasks?.length || 0
    const projectCompletion = (project: Project) => {
      const total = projectTaskCount(project)
      if (!total) return 0
      return Math.round((projectDoneCount(project) / total) * 100)
    }

    onMounted(async () => {
      applyRouteFilters()
      await fetchProjects()
    })

    watch(() => route.query, applyRouteFilters)

    return {
      colorOptions,
      currentPage,
      defaultColor,
      dialogTitle,
      dialogVisible,
      editForm,
      filteredProjects,
      filters,
      hasActiveFilters,
      loading,
      openCreate,
      openEdit,
      pageSize,
      pagedProjects,
      projectActiveCount,
      projectCompletion,
      projectDoneCount,
      clearFilters,
      remove,
      resetPage,
      saveProject,
      saving,
      sortedProjects,
      syncFiltersToRoute,
      viewProject,
    }
  },
})
</script>
