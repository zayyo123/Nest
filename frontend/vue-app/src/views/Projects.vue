<template>
  <!-- 项目列表主卡片 -->
  <div class="card">
    <!-- 工具栏：搜索框和新建按钮 -->
    <div class="toolbar" style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <el-input placeholder="搜索项目" v-model="filters.q" size="small" style="width:300px" @input="onFilter" />
      <el-button type="primary" @click="openCreate">新建项目</el-button>
    </div>
    <!-- 项目数据表格 -->
    <el-table :data="pagedProjects" style="width:100%" v-loading="loading">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="description" label="描述" />
      <!-- 操作列：编辑、删除、详情 -->
      <el-table-column label="操作" width="260">
        <template #default="scope">
          <el-button size="mini" @click="openEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="remove(scope.row.id)">删除</el-button>
          <el-button size="mini" @click="viewDetails(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <el-pagination @current-change="handlePageChange" :current-page="currentPage" :page-size="pageSize" :total="filteredProjects.length" layout="prev, pager, next, total"></el-pagination>
  </div>

  <!-- 新建/编辑项目对话框 -->
  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
    <el-form :model="editForm" label-width="120px">
      <el-form-item label="名称">
        <el-input v-model="editForm.name"></el-input>
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="editForm.description"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="saveProject">保存</el-button>
    </span>
  </el-dialog>

  <!-- 项目详情抽屉 -->
  <el-drawer title="详情" :visible.sync="detailsVisible" size="40%">
    <div v-if="selectedProject">
      <p><strong>ID:</strong> {{ selectedProject.id }}</p>
      <p><strong>名称:</strong> {{ selectedProject.name }}</p>
      <p><strong>描述:</strong> {{ selectedProject.description }}</p>
    </div>
  </el-drawer>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted } from 'vue'
import api from '@/api'
import { ElMessage } from 'element-plus'

// 项目类型定义
type Project = { id: number; name: string; description?: string }

export default defineComponent({
  name: 'Projects',
  setup() {
    // 响应式状态定义
    const projects = ref<Project[]>([]) // 项目列表
    const loading = ref(false) // 加载状态
    const currentPage = ref(1) // 当前页码
    const pageSize = 5 // 每页显示数量
    const filters = reactive({ q: '' }) // 搜索过滤条件
    const dialogVisible = ref(false) // 对话框显示状态
    const detailsVisible = ref(false) // 详情抽屉显示状态
    const dialogTitle = ref('创建项目') // 对话框标题
    const editForm = reactive({ name: '', description: '' }) // 编辑表单数据
    const editingId = ref<number | null>(null) // 正在编辑的项目ID
    const selectedProject = ref<Project | null>(null) // 选中的项目

    // 获取项目列表
    const fetchProjects = async () => {
      loading.value = true
      try {
        const res = await api.get('/projects')
        projects.value = res.data as Project[]
      } catch {
        ElMessage.error('获取项目失败')
      } finally {
        loading.value = false
      }
    }

    // 打开新建项目对话框
    const openCreate = () => {
      editingId.value = null
      editForm.name = ''
      editForm.description = ''
      dialogTitle.value = '创建项目'
      dialogVisible.value = true
    }

    // 打开编辑项目对话框
    const openEdit = (p: Project) => {
      editingId.value = p.id
      editForm.name = p.name
      editForm.description = p.description ?? ''
      dialogTitle.value = '编辑项目'
      dialogVisible.value = true
    }

    // 保存项目（新建或更新）
    const saveProject = async () => {
      if (editingId.value) {
        await api.put(`/projects/${editingId.value}`, { name: editForm.name, description: editForm.description })
      } else {
        await api.post('/projects', { name: editForm.name, description: editForm.description })
      }
      dialogVisible.value = false
      await fetchProjects()
    }

    // 删除项目
    const remove = async (id: number) => {
      await api.delete(`/projects/${id}`)
      await fetchProjects()
    }

    // 查看项目详情
    const viewDetails = (p: Project) => {
      selectedProject.value = p
      detailsVisible.value = true
    }

    // 过滤后的项目列表（计算属性）
    const filteredProjects = computed(() => {
      const q = filters.q.toLowerCase()
      if (!q) return projects.value
      return projects.value.filter(p => p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q))
    })

    // 分页后的项目列表（计算属性）
    const pagedProjects = computed(() => {
      const start = (currentPage.value - 1) * pageSize
      return filteredProjects.value.slice(start, start + pageSize)
    })

    // 处理页码变化
    const handlePageChange = (page: number) => { currentPage.value = page }

    // 处理搜索过滤
    const onFilter = () => { currentPage.value = 1 }

    // 组件挂载时获取项目列表
    onMounted(fetchProjects)

    return {
      loading, currentPage, pageSize, filters, dialogVisible, detailsVisible, dialogTitle,
      editForm, editingId, selectedProject, fetchProjects, openCreate, openEdit, saveProject, remove,
      viewDetails, pagedProjects, filteredProjects, handlePageChange, onFilter
    }
  }
})
</script>
