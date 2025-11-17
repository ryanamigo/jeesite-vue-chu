<!--
 * Copyright (c) 2013-Now http://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
-->
<template>
  <div class="task-tree-container">
    <div class="tree-header">
      <div class="tree-title">
        <Icon icon="ant-design:appstore-outlined" class="m-1 pr-1" />
        <span>任务批次</span>
      </div>
      <div class="tree-tools">
        <a-button type="text" size="small" @click="handleAdd" title="新增任务">
          <Icon icon="ant-design:plus-outlined" />
        </a-button>
        <a-button type="text" size="small" @click="handleRefresh" title="刷新">
          <Icon icon="ant-design:reload-outlined" />
        </a-button>
      </div>
    </div>
    <div class="tree-content">
      <div v-for="item in taskList" :key="item.testNumber" class="task-item">
        <div
          class="task-name"
          :class="{ active: props.selectedTask?.testNumber === item.testNumber }"
          @click="handleTaskClick(item)"
        >
          {{ item.testNumberName }}
        </div>
        <div
          v-if="expandedTasks.includes(item.testNumber)"
          class="task-departments"
        >
          <div
            v-for="(dept, index) in item.departments || []"
            :key="`${item.testNumber}-${dept.companyCode}-${index}`"
            class="department-item"
            @click.stop="handleDepartmentClick(item, dept)"
          >
            {{ dept.companyName }}
          </div>
        </div>
      </div>
    </div>

    <!-- 新增任务对话框 -->
    <a-modal
      v-model:open="addModalVisible"
      title="新增任务"
      :width="400"
      @ok="handleConfirmAdd"
      @cancel="handleCancelAdd"
    >
      <!-- 表单内容 -->
    </a-modal>
  </div>
</template>

<script lang="ts" setup name="ResultInformationTree">
import { ref, onMounted } from 'vue';
import { useMessage } from '@jeesite/core/hooks/web/useMessage';
import { Icon } from '@jeesite/core/components/Icon';
import { TreeSelect } from '@jeesite/core/components/Form';
import { companyTreeData } from '@jeesite/core/api/sys/company';
import {
  getTestNumberList,
  getCompanyByTestNumber,
  insertTestNumberInformation,
  deleteTestNumber,
  type TestNumberInfo,
} from '@jeesite/core/api/resultInformation/resultInformation';

const props = defineProps<{
  selectedTask?: { testNumber: string; testNumberName: string };
  selectedDepartment?: { companyCode: string; companyName: string };
}>();

const emit = defineEmits<{
  (e: 'update:selectedTask', task: { testNumber: string; testNumberName: string } | undefined): void;
  (e: 'update:selectedDepartment', dept: { companyCode: string; companyName: string } | undefined): void;
}>();
const { showMessage } = useMessage();

const taskList = ref<(TestNumberInfo & { departments?: any[] })[]>([]);
const expandedTasks = ref<string[]>([]);
const addModalVisible = ref(false);

// 加载任务列表
async function loadTaskList() {
  try {
    const data = await getTestNumberList();
    taskList.value = data || [];
  } catch (error) {
    console.error('加载任务列表失败:', error);
  }
}

// 加载任务下的部门列表
async function loadTaskDepartments(task: TestNumberInfo) {
  if (expandedTasks.value.includes(task.testNumber)) {
    // 已展开，收起
    expandedTasks.value = expandedTasks.value.filter((t) => t !== task.testNumber);
    return;
  }

  try {
    const departments = await getCompanyByTestNumber(task.testNumber);
    const taskItem = taskList.value.find((t) => t.testNumber === task.testNumber);
    if (taskItem) {
      taskItem.departments = departments || [];
      expandedTasks.value.push(task.testNumber);
    }
  } catch (error) {
    console.error('加载部门列表失败:', error);
  }
}

// 点击任务
function handleTaskClick(task: TestNumberInfo) {
  loadTaskDepartments(task);
  emit('update:selectedTask', { testNumber: task.testNumber, testNumberName: task.testNumberName });
  emit('update:selectedDepartment', undefined);
}

// 点击部门
function handleDepartmentClick(
  task: TestNumberInfo,
  dept: { companyCode: string; companyName: string }
) {
  emit('update:selectedTask', { testNumber: task.testNumber, testNumberName: task.testNumberName });
  emit('update:selectedDepartment', dept);
}

// 新增任务
function handleAdd() {
  addForm.value = {
    testNumberName: '',
    department: '',
    departmentsName: '',
  };
  addModalVisible.value = true;
}

// 确认新增
async function handleConfirmAdd() {
  if (!addForm.value.testNumberName.trim()) {
    showMessage('任务名称不能为空', 'error');
    return;
  }
  if (!addForm.value.department) {
    showMessage('部别选择不能为空', 'error');
    return;
  }

  try {
    await insertTestNumberInformation({
      testNumberName: addForm.value.testNumberName,
      department: addForm.value.department,
      departmentsName: addForm.value.departmentsName,
    });
    showMessage('任务添加成功');
    addModalVisible.value = false;
    loadTaskList();
  } catch (error) {
    showMessage('任务添加失败', 'error');
  }
}

// 取消新增
function handleCancelAdd() {
  addModalVisible.value = false;
}

// 刷新
function handleRefresh() {
  loadTaskList();
}

// 右键删除任务（可以通过右键菜单实现）
function handleDeleteTask(testNumber: string) {
  // 这里可以添加确认对话框
  deleteTestNumber(testNumber).then(() => {
    showMessage('删除成功');
    loadTaskList();
  });
}

onMounted(() => {
  loadTaskList();
});
</script>

<style lang="less" scoped>
.task-tree-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0c3e7b;
  color: #ffffff;

  .tree-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid rgba(127, 12, 12, 0.1);

    .tree-title {
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: 500;
    }

    .tree-tools {
      display: flex;
      gap: 8px;
    }
  }

  .tree-content {
    flex: 1;
    overflow-y: auto;
    padding: 10px;

    .task-item {
      margin-bottom: 20px;

      .task-name {
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.3s;
        margin-left: 15%;

        &:hover {
          background-color: rgba(5, 148, 183, 0.3);
          text-decoration: underline;
        }

        &.active {
          background-color: rgb(5, 148, 183);
          border-radius: 9%;
          width: 30%;
        }
      }

      .task-departments {
        margin-top: 15px;
        margin-left: 15%;

        .department-item {
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
}

// 滚动条样式
.task-tree-container .tree-content::-webkit-scrollbar {
  width: 10px;
}

.task-tree-container .tree-content::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: #2d9fed;
  background-image: -webkit-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.2) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0.2) 75%,
    transparent 75%,
    transparent
  );
}

.task-tree-container .tree-content::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: #0c3e7b;
}
</style>