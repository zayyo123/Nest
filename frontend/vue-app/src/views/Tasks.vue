<template>
  <div class="card">
    <div class="toolbar" style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <div style="display:flex; gap:8px; align-items:center;">
        <el-input placeholder="搜索任务" v-model="filters.q" size="small" style="width:260px" @input="applyFilter" />
        <el-select v-model="filters.status" placeholder="状态" size="small" style="width:150px">
          <el-option label="全部" value=""></el-option>
          <el-option label="待办" value="TODO"></el-option>
          <el-option label="进行中" value="IN_PROGRESS"></el-option>
          <el-option label="已完成" value="DONE"></el-option>
        </el-select>
        <el-select v-model="filters.projectId" placeholder="项目" size="small" style="width:180px" @change="fetchTasks">
          <el-option label="全部" value=""></el-option>
          <el-option v-for="p in projects" :key="p.id" :label="p.name" :value="p.id"></el-option>
        </el-select>
      </div>
      <el-button type="primary" @click="openCreate">新建任务</el-button>
    </div>
    <el-table :data="pagedTasks" style="width:100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="status" label="状态" />
      <el-table-column label="项目">
        <template #default="scope">{{ scope.row.project?.name ?? '-' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="240">
        <template #default="scope">
          <el-button size="mini" @click="openEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="remove(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @current-change="handlePageChange" :current-page="currentPage" :page-size="pageSize" :total="filteredTasks.length" layout="prev, pager, next, total"></el-pagination>
  </div>

  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
    <el-form :model="editForm" label-width="120px">
      <el-form-item label="标题">
        <el-input v-model="editForm.title"></el-input>
      </el-form-item>
      <el-form-item label="描述">
        <el-input type="textarea" v-model="editForm.description"></el-input>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="editForm.status" placeholder="状态">
          <el-option label="待办" value="TODO"></el-option>
          <el-option label="进行中" value="IN_PROGRESS"></el-option>
          <el-option label="已完成" value="DONE"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="项目">
        <el-select v-model="editForm.projectId" placeholder="项目">
          <el-option v-for="p in projects" :key="p.id" :label="p.name" :value="p.id"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="saveTask">保存</el-button>
    </span>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted } from 'vue'
import api from '@/api'
import { ElMessage } from 'element-plus'

type Task = { id: number; title: string; description?: string; status: string; project?: { id: number; name: string } }
type Project = { id: number; name: string }

export default defineComponent({
  name: 'Tasks',
  setup() {
    const tasks = ref<Task[]>([])
    const projects = ref<Project[]>([])
    const loading = ref(false)
    const currentPage = ref(1)
    const pageSize = 5
    const filters = reactive({ q: '', status: '', projectId: '' })
    const dialogVisible = ref(false)
    const editForm = reactive({ id: 0, title: '', description: '', status: 'TODO', projectId: '' })
    const dialogTitle = ref('创建任务')
    const isEditing = ref(false)

    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects')
        projects.value = res.data
      } catch {
        ElMessage.error('获取项目失败')
      }
    }

    const fetchTasks = async () => {
      loading.value = true
      try {
        const res = await api.get('/tasks')
        tasks.value = res.data as any
      } catch {
        ElMessage.error('获取任务失败')
      } finally {
        loading.value = false
      }
    }

    const openCreate = () => {
      isEditing.value = false
      editForm.id = 0
      editForm.title = ''
      editForm.description = ''
      editForm.status = 'TODO'
      editForm.projectId = ''
      dialogTitle.value = '创建任务'
      dialogVisible.value = true
    }

    const openEdit = (t: Task) => {
      isEditing.value = true
      editForm.id = t.id
      editForm.title = t.title
      editForm.description = t.description ?? ''
      editForm.status = t.status
      editForm.projectId = String(t.project?.id ?? '')
      dialogTitle.value = '编辑任务'
      dialogVisible.value = true
    }

    const saveTask = async () => {
      if (isEditing.value) {
        await api.put(`/tasks/${editForm.id}`, {
          title: editForm.title,
          description: editForm.description,
          status: editForm.status,
          projectId: editForm.projectId
        })
      } else {
        await api.post('/tasks', {
          title: editForm.title,
          description: editForm.description,
          status: editForm.status,
          projectId: editForm.projectId
        })
      }
      dialogVisible.value = false
      await fetchTasks()
    }

    const remove = async (id: number) => {
      await api.delete(`/tasks/${id}`)
      await fetchTasks()
    }

    const pagedTasks = computed(() => {
      const start = (currentPage.value - 1) * pageSize
      const filtered = tasks.value.filter(t => {
        const s = t.status
        const projectMatch = !filters.projectId || (t.project?.id === Number(filters.projectId))
        const statusMatch = !filters.status || (s === filters.status)
        const q = filters.q.toLowerCase();
        const text = `${t.title} ${t.description ?? ''}`.toLowerCase()
        const textMatch = !q || text.includes(q)
        return projectMatch && statusMatch && textMatch
      })
      return filtered.slice(start, start + pageSize)
    })

    const filteredTasks = computed(() => tasks.value.filter(t => {
      const s = t.status
      const projectMatch = !filters.projectId || (t.project?.id === Number(filters.projectId))
      const statusMatch = !filters.status || (s === filters.status)
      const q = filters.q.toLowerCase();
      const text = `${t.title} ${t.description ?? ''}`.toLowerCase()
      const textMatch = !q || text.includes(q)
      return projectMatch && statusMatch && textMatch
    }))

    const handlePageChange = (page: number) => { currentPage.value = page }
    const applyFilter = () => { currentPage.value = 1 }

    onMounted(async () => { await fetchProjects(); await fetchTasks() })

    return { tasks, loading, currentPage, pageSize, filters, dialogVisible, dialogTitle, editForm, detailsVisible: ref(false), openCreate, openEdit, saveTask, remove, pagedTasks, filteredTasks, handlePageChange, applyFilter, projects }
  }
})
</script>
