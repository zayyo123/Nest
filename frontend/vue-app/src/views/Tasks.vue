<template>
  <section class="page-stack">
    <div class="page-header">
      <div>
        <h1>任务</h1>
        <p>跟踪任务状态、所属项目和执行进度。</p>
      </div>
      <el-button type="primary" @click="openCreate">新建任务</el-button>
    </div>

    <section class="panel">
      <div class="toolbar toolbar-wrap">
        <el-input
          v-model="filters.q"
          placeholder="搜索任务标题或描述"
          clearable
          @input="resetPage"
        />
        <el-select
          v-model="filters.status"
          placeholder="状态"
          clearable
          @change="resetPage"
        >
          <el-option label="待办" value="TODO" />
          <el-option label="进行中" value="IN_PROGRESS" />
          <el-option label="已完成" value="DONE" />
        </el-select>
        <el-select
          v-model="filters.projectId"
          placeholder="项目"
          clearable
          @change="resetPage"
        >
          <el-option
            v-for="project in projects"
            :key="project.id"
            :label="project.name"
            :value="project.id"
          />
        </el-select>
      </div>

      <el-table :data="pagedTasks" v-loading="loading" empty-text="暂无任务">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="180" />
        <el-table-column prop="description" label="描述" min-width="240">
          <template #default="{ row }">{{ row.description || "-" }}</template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{
              statusText(row.status)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="项目" min-width="160">
          <template #default="{ row }">{{
            row.project?.name || "未关联项目"
          }}</template>
        </el-table-column>
        <el-table-column label="操作" width="210" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="remove(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredTasks.length"
        layout="prev, pager, next, total"
      />
    </section>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="标题" required>
          <el-input v-model="editForm.title" maxlength="80" show-word-limit />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="4"
            maxlength="240"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status">
            <el-option label="待办" value="TODO" />
            <el-option label="进行中" value="IN_PROGRESS" />
            <el-option label="已完成" value="DONE" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目">
          <el-select
            v-model="editForm.projectId"
            placeholder="未关联项目"
            clearable
          >
            <el-option
              v-for="project in projects"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveTask"
          >保存</el-button
        >
      </template>
    </el-dialog>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import api from "@/api";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type Project = { id: number; name: string };
type Task = {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  projectId?: number;
  project?: Project;
};

export default defineComponent({
  name: "Tasks",
  setup() {
    const tasks = ref<Task[]>([]);
    const projects = ref<Project[]>([]);
    const loading = ref(false);
    const saving = ref(false);
    const currentPage = ref(1);
    const pageSize = 8;
    const filters = reactive<{
      q: string;
      status: "" | TaskStatus;
      projectId: number | "";
    }>({
      q: "",
      status: "",
      projectId: "",
    });
    const dialogVisible = ref(false);
    const dialogTitle = ref("新建任务");
    const editingId = ref<number | null>(null);
    const editForm = reactive<{
      title: string;
      description: string;
      status: TaskStatus;
      projectId: number | "";
    }>({
      title: "",
      description: "",
      status: "TODO",
      projectId: "",
    });

    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        projects.value = res.data;
      } catch {
        ElMessage.error("获取项目失败");
      }
    };

    const fetchTasks = async () => {
      loading.value = true;
      try {
        const res = await api.get("/tasks");
        tasks.value = res.data;
      } catch {
        ElMessage.error("获取任务失败");
      } finally {
        loading.value = false;
      }
    };

    const resetForm = () => {
      editingId.value = null;
      editForm.title = "";
      editForm.description = "";
      editForm.status = "TODO";
      editForm.projectId = "";
    };

    const openCreate = () => {
      resetForm();
      dialogTitle.value = "新建任务";
      dialogVisible.value = true;
    };

    const openEdit = (task: Task) => {
      editingId.value = task.id;
      editForm.title = task.title;
      editForm.description = task.description || "";
      editForm.status = task.status;
      editForm.projectId = task.project?.id || task.projectId || "";
      dialogTitle.value = "编辑任务";
      dialogVisible.value = true;
    };

    const saveTask = async () => {
      if (!editForm.title.trim()) {
        ElMessage.warning("请输入任务标题");
        return;
      }

      saving.value = true;
      try {
        const payload = {
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          status: editForm.status,
          projectId: editForm.projectId || null,
        };
        if (editingId.value) {
          await api.put(`/tasks/${editingId.value}`, payload);
          ElMessage.success("任务已更新");
        } else {
          await api.post("/tasks", payload);
          ElMessage.success("任务已创建");
        }
        dialogVisible.value = false;
        await fetchTasks();
      } catch {
        ElMessage.error("保存任务失败");
      } finally {
        saving.value = false;
      }
    };

    const remove = async (task: Task) => {
      try {
        await ElMessageBox.confirm(
          `确定删除任务“${task.title}”吗？`,
          "删除确认",
          { type: "warning" },
        );
        await api.delete(`/tasks/${task.id}`);
        ElMessage.success("任务已删除");
        await fetchTasks();
      } catch (error) {
        if (error !== "cancel") ElMessage.error("删除任务失败");
      }
    };

    const filteredTasks = computed(() => {
      const q = filters.q.trim().toLowerCase();
      return tasks.value.filter((task) => {
        const textMatch =
          !q ||
          `${task.title} ${task.description || ""}`.toLowerCase().includes(q);
        const statusMatch = !filters.status || task.status === filters.status;
        const projectMatch =
          !filters.projectId ||
          (task.project?.id || task.projectId) === filters.projectId;
        return textMatch && statusMatch && projectMatch;
      });
    });

    const pagedTasks = computed(() => {
      const start = (currentPage.value - 1) * pageSize;
      return filteredTasks.value.slice(start, start + pageSize);
    });

    const resetPage = () => {
      currentPage.value = 1;
    };

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

    onMounted(async () => {
      await fetchProjects();
      await fetchTasks();
    });

    return {
      tasks,
      projects,
      loading,
      saving,
      currentPage,
      pageSize,
      filters,
      dialogVisible,
      dialogTitle,
      editForm,
      filteredTasks,
      pagedTasks,
      openCreate,
      openEdit,
      saveTask,
      remove,
      resetPage,
      statusText,
      statusType,
    };
  },
});
</script>
