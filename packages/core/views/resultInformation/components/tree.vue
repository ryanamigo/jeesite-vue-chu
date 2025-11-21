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

    <!-- 新增任务对话框 - 自定义样式 -->
    <div v-if="addModalVisible" class="add-task-overlay" @click="handleCancelAdd">
      <div class="add-task-modal" @click.stop>
        <div class="modal-title">新增任务</div>
        <div class="modal-form">
          <div class="form-item">
            <label class="form-label">任务名称:</label>
            <a-input
              v-model:value="addForm.testNumberName"
              placeholder=""
              :maxlength="25"
              class="custom-input"
            />
          </div>
          <div class="form-item">
            <label class="form-label">部别:</label>
            <a-input
              :value="addForm.departmentsName || ''"
              placeholder="请选择部别"
              readonly
              class="custom-input department-input"
              @click="handleOpenDepartmentModal"
            >
              <template #suffix>
                <Icon icon="ant-design:down-outlined" />
              </template>
            </a-input>
          </div>
        </div>
        <div class="modal-footer">
          <a-button class="confirm-btn" :loading="confirmLoading" @click="handleConfirmAdd">
            确认
          </a-button>
          <a-button class="cancel-btn" @click="handleCancelAdd">取消</a-button>
        </div>
      </div>
    </div>

    <!-- 部别选择弹窗 -->
    <div v-if="departmentModalVisible" class="department-select-overlay" @click="handleCloseDepartmentModal">
      <div class="department-select-modal" @click.stop>
        <div class="department-modal-header">
          <span class="department-modal-title">部别选择</span>
          <div class="department-modal-actions">
            <Icon icon="ant-design:close-outlined" class="close-icon" @click="handleCloseDepartmentModal" />
          </div>
        </div>
        <div class="department-modal-content">
          <div class="department-search">
            <a-input
              v-model:value="departmentSearchValue"
              placeholder="关键字:"
              class="search-input"
            >
              <template #suffix>
                <Icon icon="ant-design:search-outlined" @click="handleDepartmentSearch" />
              </template>
            </a-input>
            <a-button class="search-btn" @click="handleDepartmentSearch">搜索</a-button>
          </div>
          <div class="department-tree-container">
            <BasicTree
              ref="departmentTreeRef"
              :api="companyTreeData"
              :can-select-parent="false"
              :checkable="true"
              :check-strictly="false"
              :search="true"
              :search-value="departmentSearchValue"
              :immediate="true"
              @check="handleDepartmentTreeCheck"
            />
          </div>
        </div>
        <div class="department-modal-footer">
          <a-button class="confirm-btn" @click="handleConfirmDepartmentSelect">确定</a-button>
          <a-button class="clear-btn" @click="handleClearDepartmentSelect">清除</a-button>
          <a-button class="cancel-btn" @click="handleCloseDepartmentModal">关闭</a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="ResultInformationTree">
import { ref, onMounted } from 'vue';
import { useMessage } from '@jeesite/core/hooks/web/useMessage';
import { Icon } from '@jeesite/core/components/Icon';
import { BasicTree, TreeActionType } from '@jeesite/core/components/Tree';
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
const confirmLoading = ref(false);
const departmentModalVisible = ref(false);
const departmentTreeRef = ref<TreeActionType | null>(null);
const departmentSearchValue = ref('');
const tempCheckedKeys = ref<string[]>([]);
const tempCheckedNodes = ref<any[]>([]);
const addForm = ref({
  testNumberName: '',
  department: '',
  departmentsName: '',
});

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

// 打开部别选择弹窗
function handleOpenDepartmentModal() {
  departmentModalVisible.value = true;
  document.body.style.overflow = 'hidden';
  // 如果有已选中的值，设置到树中
  if (addForm.value.department) {
    const codes = addForm.value.department.split(';').filter(Boolean);
    tempCheckedKeys.value = codes;
  } else {
    tempCheckedKeys.value = [];
    tempCheckedNodes.value = [];
  }
}

// 关闭部别选择弹窗
function handleCloseDepartmentModal() {
  departmentModalVisible.value = false;
  document.body.style.overflow = 'visible';
  departmentSearchValue.value = '';
}

// 部别树选择变化
function handleDepartmentTreeCheck(checkedKeys: any, e: any) {
  tempCheckedKeys.value = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked || [];
  // 获取选中的节点信息
  if (e && e.checkedNodes) {
    // 过滤出叶子节点（check_Child_State === -1 对应没有children）
    tempCheckedNodes.value = e.checkedNodes.filter((node: any) => {
      return !node.children || node.children.length === 0;
    });
  } else {
    tempCheckedNodes.value = [];
  }
}

// 确认部别选择
function handleConfirmDepartmentSelect() {
  // 按照HTML逻辑格式化：code用英文分号分隔，name用中文分号分隔
  if (tempCheckedNodes.value.length > 0) {
    const codeArray = tempCheckedNodes.value.map((node: any) => String(node.id || node.code || node.value || ''));
    const nameArray = tempCheckedNodes.value.map((node: any) => String(node.name || node.label || ''));
    
    addForm.value.department = codeArray.filter(Boolean).join(';');
    addForm.value.departmentsName = nameArray.filter(Boolean).join('；');
  } else {
    addForm.value.department = '';
    addForm.value.departmentsName = '';
  }
  handleCloseDepartmentModal();
}

// 清除部别选择
function handleClearDepartmentSelect() {
  tempCheckedKeys.value = [];
  tempCheckedNodes.value = [];
  if (departmentTreeRef.value) {
    departmentTreeRef.value.setCheckedKeys([]);
  }
  addForm.value.department = '';
  addForm.value.departmentsName = '';
}

// 部别搜索
function handleDepartmentSearch() {
  // BasicTree会自动处理searchValue的变化
}

// 新增任务
function handleAdd() {
  // 重置表单
  addForm.value = {
    testNumberName: '',
    department: '',
    departmentsName: '',
  };
  // 显示弹窗
  addModalVisible.value = true;
  // 禁止body滚动
  document.body.style.overflow = 'hidden';
}

// 确认新增
async function handleConfirmAdd() {
  // 验证任务名称
  if (!addForm.value.testNumberName.trim()) {
    showMessage('任务名称不能为空', 'error');
    return;
  }
  // 验证部别选择（按照HTML逻辑，验证departmentsName）
  if (!addForm.value.departmentsName || !addForm.value.departmentsName.trim()) {
    showMessage('部别选择不能为空', 'error');
    return;
  }

  confirmLoading.value = true;
  try {
    await insertTestNumberInformation({
      testNumberName: addForm.value.testNumberName,
      department: addForm.value.department,
      departmentsName: addForm.value.departmentsName,
    });
    showMessage('任务添加成功', 'success');
    addModalVisible.value = false;
    // 恢复body滚动
    document.body.style.overflow = 'visible';
    // 刷新任务列表
    await loadTaskList();
  } catch (error) {
    showMessage('任务添加失败', 'error');
    // 即使失败也保持弹窗打开，不恢复滚动
  } finally {
    confirmLoading.value = false;
  }
}

// 取消新增
function handleCancelAdd() {
  addModalVisible.value = false;
  // 恢复body滚动
  document.body.style.overflow = 'visible';
}

// 刷新任务列表 - 按照原HTML逻辑：清空树，重新加载
async function handleRefresh() {
  try {
    // 清空任务列表（对应HTML的 $('#tree').empty()）
    taskList.value = [];
    // 清空展开状态
    expandedTasks.value = [];
    // 清空选中的任务和部门
    emit('update:selectedTask', undefined);
    emit('update:selectedDepartment', undefined);
    // 重新加载任务列表（对应HTML的 treeLoad()）
    await loadTaskList();
    showMessage('刷新成功', 'success');
  } catch (error) {
    showMessage('刷新失败', 'error');
    console.error('刷新任务列表失败:', error);
  }
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
  background: #000000;
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
      color: #ffffff;

      :deep(.anticon) {
        color: #1890ff;
        margin-right: 4px;
      }
    }

    .tree-tools {
      display: flex;
      gap: 8px;

      :deep(.ant-btn) {
        color: #ffffff;
        border: none;
        background: transparent;

        &:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .anticon {
          color: #ffffff;
        }
      }
    }
  }

  .tree-content {
    flex: 1;
    overflow-y: auto;
    padding: 10px;

    .task-item {
      margin-bottom: 8px;

      .task-name {
        padding: 8px 12px;
        cursor: pointer;
        transition: all 0.3s;
        color: #ffffff;
        font-size: 14px;
        line-height: 1.5;

        &:hover {
          background-color: rgba(5, 148, 183, 0.3);
        }

        &.active {
          background-color: rgb(5, 148, 183);
          border-radius: 4px;
        }
      }

      .task-departments {
        margin-top: 8px;
        margin-left: 20px;

        .department-item {
          padding: 6px 12px;
          cursor: pointer;
          transition: all 0.3s;
          color: #ffffff;
          font-size: 14px;

          &:hover {
            background-color: rgba(5, 148, 183, 0.2);
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
  background: #000000;
}

// 新增任务弹窗样式
.add-task-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-task-modal {
  width: 400px;
  height: 300px;
  background: #1a1a1a;
  padding: 20px;
  border-radius: 5px;
  border: 1px solid #333;
  display: flex;
  flex-direction: column;

  .modal-title {
    color: #ffffff;
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 20px;
  }

  .modal-form {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .form-item {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .form-label {
        color: #ffffff;
        font-size: 17px;
        display: block;
      }

      .custom-input {
        :deep(.ant-input) {
          background-color: #1a1a1a;
          border: 1px solid #494640;
          color: #ffffff;
          width: 100%;
          box-shadow: 0 0 10px #3c8dbc;

          &:focus,
          &:hover {
            border-color: #3c8dbc;
            box-shadow: 0 0 10px #3c8dbc;
          }

          &::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }
        }
      }

      .custom-select {
        :deep(.ant-select-selector) {
          background-color: #1a1a1a !important;
          border: 1px solid #494640 !important;
          color: #ffffff !important;
          box-shadow: 0 0 10px #3c8dbc !important;

          &:hover,
          &.ant-select-focused {
            border-color: #3c8dbc !important;
            box-shadow: 0 0 10px #3c8dbc !important;
          }
        }

        :deep(.ant-select-selection-item),
        :deep(.ant-select-selection-placeholder) {
          color: #ffffff !important;
        }

        :deep(.ant-select-arrow) {
          color: #ffffff;
        }
      }
    }
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;

    .confirm-btn {
      background-color: #1e5edb;
      color: rgba(255, 255, 255, 0.8);
      border: 0;
      border-radius: 22px;
      box-shadow: 0 0 15px #97bdd4;
      font-size: 15px;
      padding: 6px 20px;
      height: auto;

      &:hover {
        background-color: #2563eb;
        box-shadow: 0 0 20px #97bdd4;
      }
    }

    .cancel-btn {
      background-color: #494640;
      color: rgba(255, 255, 255, 0.8);
      border: 0;
      border-radius: 22px;
      box-shadow: 0 0 15px #97bdd4;
      font-size: 15px;
      padding: 6px 20px;
      height: auto;

      &:hover {
        background-color: #5a5a5a;
        box-shadow: 0 0 20px #97bdd4;
      }
    }
  }
}

// 部别选择弹窗样式
.department-select-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.department-select-modal {
  width: 600px;
  height: 500px;
  background: #1a1a1a;
  border-radius: 5px;
  border: 1px solid #333;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .department-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #333;

    .department-modal-title {
      color: #ffffff;
      font-size: 16px;
      font-weight: 500;
    }

    .department-modal-actions {
      .close-icon {
        color: #ffffff;
        cursor: pointer;
        font-size: 16px;

        &:hover {
          color: #3c8dbc;
        }
      }
    }
  }

  .department-modal-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 15px 20px;
    overflow: hidden;

    .department-search {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;

      .search-input {
        flex: 1;

        :deep(.ant-input) {
          background-color: #262626;
          border: 1px solid #494640;
          color: #ffffff;

          &:focus,
          &:hover {
            border-color: #3c8dbc;
          }

          &::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }
        }
      }

      .search-btn {
        background-color: #1e5edb;
        color: rgba(255, 255, 255, 0.8);
        border: 0;
        border-radius: 4px;

        &:hover {
          background-color: #2563eb;
        }
      }
    }

    .department-tree-container {
      flex: 1;
      overflow: auto;
      background-color: #262626;
      border-radius: 4px;
      padding: 10px;

      :deep(.ant-tree) {
        background-color: transparent;
        color: #ffffff;

        .ant-tree-node-content-wrapper {
          color: #ffffff;

          &:hover {
            background-color: rgba(60, 141, 188, 0.2);
          }
        }

        .ant-tree-checkbox {
          .ant-tree-checkbox-inner {
            border-color: #494640;
            background-color: #1a1a1a;
          }

          &.ant-tree-checkbox-checked .ant-tree-checkbox-inner {
            background-color: #1e5edb;
            border-color: #1e5edb;
          }
        }
      }
    }
  }

  .department-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 15px 20px;
    border-top: 1px solid #333;

    .confirm-btn {
      background-color: #1e5edb;
      color: rgba(255, 255, 255, 0.8);
      border: 0;
      border-radius: 22px;
      box-shadow: 0 0 15px #97bdd4;
      font-size: 15px;
      padding: 6px 20px;
      height: auto;

      &:hover {
        background-color: #2563eb;
        box-shadow: 0 0 20px #97bdd4;
      }
    }

    .clear-btn {
      background-color: #494640;
      color: rgba(255, 255, 255, 0.8);
      border: 0;
      border-radius: 22px;
      box-shadow: 0 0 15px #97bdd4;
      font-size: 15px;
      padding: 6px 20px;
      height: auto;

      &:hover {
        background-color: #5a5a5a;
        box-shadow: 0 0 20px #97bdd4;
      }
    }

    .cancel-btn {
      background-color: #444444;
      color: rgba(255, 255, 255, 0.8);
      border: 0;
      border-radius: 22px;
      box-shadow: 0 0 15px #97bdd4;
      font-size: 15px;
      padding: 6px 20px;
      height: auto;

      &:hover {
        background-color: #5a5a5a;
        box-shadow: 0 0 20px #97bdd4;
      }
    }
  }
}
</style>

