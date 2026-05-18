<template>
  <section class="page-stack">
    <div class="page-header">
      <div>
        <h1>项目</h1>
        <p>维护项目资料，并查看每个项目关联的任务数量。</p>
      </div>
      <el-button type="primary" @click="openCreate">新建项目</el-button>
    </div>

    <section class="panel">
      <div class="toolbar">
        <el-input v-model="filters.q" placeholder="搜索项目名称或描述" clearable @input="resetPage" />
      </div>

      <el-table :data="pagedProjects" v-loading="loading" empty-text="暂无项目">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" min-width="180" />
        <el-table-column prop="description" label="描述" min-width="240">
          <template #default="{ row }">{{ row.description || '-' }}</template>
        </el-table-column>
        <el-table-column label="任务数" width="100">
          <template #default="{ row }">{{ row.tasks?.length || 0 }}</template>
        </el-table-column>
        <el-table-column label="操作" width="210" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredProjects.length"
        layout="prev, pager, next, total"
      />
    </section>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="editForm.name" maxlength="60" show-word-limit />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" :rows="4" maxlength="200" show-word-limit />
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
import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/api'

type Task = { id: number }
type Project = { id: number; name: string; description?: string; tasks?: Task[] }

export default defineComponent({
  name: 'Projects',
  setup() {
    const projects = ref<Project[]>([])
    const loading = ref(false)
    const saving = ref(false)
    const currentPage = ref(1)
    const pageSize = 8
    const filters = reactive({ q: '' })
    const dialogVisible = ref(false)
    const dialogTitle = ref('新建项目')
    const editForm = reactive({ name: '', description: '' })
    const editingId = ref<number | null>(null)

    const fetchProjects = async () => {
      loading.value = true
      try {
        const res = await api.get('/projects')
        projects.value = res.data
      } catch {
        ElMessage.error('获取项目失败')
      } finally {
        loading.value = false
      }
    }

    const resetForm = () => {
      editForm.name = ''
      editForm.description = ''
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
      dialogTitle.value = '编辑项目'
      dialogVisible.value = true
    }

    const saveProject = async () => {
      if (!editForm.name.trim()) {
        ElMessage.warning('请输入项目名称')
        return
      }

      saving.value = true
      try {
        const payload = { name: editForm.name.trim(), description: editForm.description.trim() }
        if (editingId.value) {
          await api.put(`/projects/${editingId.value}`, payload)
          ElMessage.success('项目已更新')
        } else {
          await api.post('/projects', payload)
          ElMessage.success('项目已创建')
        }
        dialogVisible.value = false
        await fetchProjects()
      } catch {
        ElMessage.error('保存项目失败')
      } finally {
        saving.value = false
      }
    }

    const remove = async (project: Project) => {
      try {
        await ElMessageBox.confirm(`确定删除项目“${project.name}”吗？`, '删除确认', { type: 'warning' })
        await api.delete(`/projects/${project.id}`)
        ElMessage.success('项目已删除')
        await fetchProjects()
      } catch (error) {
        if (error !== 'cancel') ElMessage.error('删除项目失败')
      }
    }

    const filteredProjects = computed(() => {
      const q = filters.q.trim().toLowerCase()
      if (!q) return projects.value
      return projects.value.filter((project) => {
        return `${project.name} ${project.description || ''}`.toLowerCase().includes(q)
      })
    })

    const pagedProjects = computed(() => {
      const start = (currentPage.value - 1) * pageSize
      return filteredProjects.value.slice(start, start + pageSize)
    })

    const resetPage = () => {
      currentPage.value = 1
    }

    onMounted(fetchProjects)

    return {
      projects,
      loading,
      saving,
      currentPage,
      pageSize,
      filters,
      dialogVisible,
      dialogTitle,
      editForm,
      filteredProjects,
      pagedProjects,
      openCreate,
      openEdit,
      saveProject,
      remove,
      resetPage,
    }
  },
})
</script>
