<!--
 * Copyright (c) 2013-Now http://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
-->
<template>
  <div>
    <!-- 文件上传输入 -->
    <input
      ref="videoFileInputRef"
      type="file"
      multiple
      style="display: none"
      @change="onVideoFileChange"
      accept="video/*"
    />

    <BasicTable @register="registerTable">
      <template #tableTitle>
        <Icon :icon="getTitle.icon" class="m-1 pr-1" />
        <span>{{ getTitle.value }}</span>
      </template>
      <template #tableTop>
        <div style="display: flex; column-gap: 10px; justify-content: flex-end; margin-bottom: 10px">
          <a-button type="primary" danger @click="handleUntestedPeople">未检测人员</a-button>
          <a-button type="primary" @click="handleExportAllReport">导出整体报告</a-button>
          <a-button type="primary" @click="handleExportExcel">导出excel表格</a-button>
          <a-button type="primary" @click="handleBatchExportReports">批量导出个人报告</a-button>
          <a-button type="primary" danger @click="handleBatchDelete">批量删除个人结果</a-button>
          <a-button @click="handleSelectAll">全选</a-button>
        </div>
      </template>
    </BasicTable>
    <!-- 未检测人员遮罩层 -->
    <div
      v-show="untestedModalVisible"
      class="untested-panel"
      @click="handleCloseUntestedModal"
    ></div>
    <!-- 未检测人员弹窗 -->
    <div v-show="untestedModalVisible" class="untested-people-mask">
      <div class="untest-tree">
        <a-table
          :columns="untestedColumns"
          :data-source="untestedList"
          :pagination="false"
          size="small"
          :row-class-name="(_, index) => (index % 2 === 0 ? 'even-row' : 'odd-row')"
        />
      </div>
      <div class="untest-button">
        <a-button class="untest-cancel" @click="handleCloseUntestedModal">关闭</a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="ResultInformationList">
import { ref, computed, unref, watch, type PropType, h } from 'vue';
import { useI18n } from '@jeesite/core/hooks/web/useI18n';
import { useMessage } from '@jeesite/core/hooks/web/useMessage';
import { router } from '@jeesite/core/router';
import { Icon } from '@jeesite/core/components/Icon';
import { BasicTable, BasicColumn, useTable } from '@jeesite/core/components/Table';
import { FormProps } from '@jeesite/core/components/Form';
import { Modal } from 'ant-design-vue';
import {
  getResultInformationList,
  deleteRelevantInformationByVideoId,
  updateAnnotationInfo,
  exportPdfFile,
  exportAllPdf,
  exportTaskExcel,
  findListOfUntestedPersonnel,
  updateOrInsertVideoByPidCard,
  type ResultInformationItem,
} from '@jeesite/core/api/resultInformation/resultInformation';
import { companyTreeData } from '@jeesite/core/api/sys/company';

const props = defineProps({
  selectedTask: Object as PropType<{ testNumber: string; testNumberName: string }>,
  selectedDepartment: Object as PropType<{ companyCode: string; companyName: string }>,
});

const { t } = useI18n();
const { showMessage } = useMessage();
const { meta } = unref(router.currentRoute);

const getTitle = computed(() => ({
  icon: meta.icon || 'ant-design:book-outlined',
  value: meta.title || '任务管理',
}));

const videoFileInputRef = ref<HTMLInputElement | null>(null);
const currentAnnotationRecord = ref<ResultInformationItem | null>(null);
const untestedModalVisible = ref(false);
const untestedList = ref<any[]>([]);

// 搜索表单配置
const searchForm: FormProps = {
  baseColProps: { md: 8, lg: 6 },
  labelWidth: 90,
  showAdvancedButton: false,
  schemas: [
    {
      label: '编号',
      field: 'pidcard',
      component: 'Input',
    },
    {
      label: '姓名',
      field: 'pname',
      component: 'Input',
    },
    {
      label: '性别',
      field: 'pgender',
      component: 'Input',
    },
    {
      label: '部别',
      field: 'pposition',
      component: 'TreeSelect',
      componentProps: {
        api: companyTreeData,
        allowClear: true,
        canSelectRoot: true,
        canSelectParent: true,
      },
      fieldLabel: 'ppositionName',
    },
    {
      label: '状态',
      field: 'alarmStatus',
      component: 'Select',
      componentProps: {
        options: [
          { label: '未跟踪', value: '0' },
          { label: '正常', value: '1' },
          { label: '一般', value: '2' },
          { label: '关注', value: '3' },
        ],
        allowClear: true,
      },
    },
    {
      label: '综合心理',
      field: 'psychologyStatus',
      component: 'Select',
      componentProps: {
        options: [
          { label: '正常', value: '0' },
          { label: '一般', value: '1' },
          { label: '关注', value: '2' },
        ],
        allowClear: true,
      },
    },
    {
      label: '测试任务',
      field: 'testNumberName',
      component: 'Input',
    },
  ],
};

// 表格列配置
const tableColumns: BasicColumn[] = [
  {
    title: '编号',
    dataIndex: 'pidcard',
    width: 200,
    align: 'left',
    fixed: 'left',
  },
  {
    title: '姓名',
    dataIndex: 'pname',
    width: 100,
    align: 'center',
  },
  {
    title: '年龄',
    dataIndex: 'age',
    width: 80,
    align: 'center',
  },
  {
    title: '性别',
    dataIndex: 'pgender',
    width: 80,
    align: 'center',
  },
  {
    title: '部别',
    dataIndex: 'ppositionName',
    width: 150,
    align: 'center',
  },
  {
    title: '跟踪预警',
    dataIndex: 'alarmStatus',
    width: 110,
    align: 'center',
    customRender: ({ record }: { record: ResultInformationItem }) => {
      const statusMap: Record<number, { text: string; color: string }> = {
        0: { text: '未跟踪', color: '#dddddd' },
        1: { text: '正常', color: '#dddddd' },
        2: { text: '一般', color: '#dddddd' },
        3: { text: '关注', color: '#dddddd' },
      };
      const status = statusMap[record.alarmStatus] || { text: '-', color: '#dddddd' };
      return h('span', { style: { color: status.color } }, status.text);
    },
  },
  {
    title: '综合心理',
    dataIndex: 'psychologyStatus',
    width: 110,
    align: 'center',
    customRender: ({ record }: { record: ResultInformationItem }) => {
      const statusMap: Record<number, { text: string; color: string }> = {
        0: { text: '正常', color: '#03cb6e' },
        1: { text: '一般', color: '#c09d00' },
        2: { text: '关注', color: '#f37c01' },
      };
      const status = statusMap[record.psychologyStatus] || { text: '-', color: '#dddddd' };
      return h('span', { style: { color: status.color } }, status.text);
    },
  },
  {
    title: '测试任务',
    dataIndex: 'testNumberName',
    width: 120,
    align: 'center',
  },
  {
    title: '标注',
    dataIndex: 'annotationType',
    width: 100,
    align: 'center',
    customRender: ({ record }: { record: ResultInformationItem }) => {
      const hasAnnotation = record.annotation && record.annotation.trim();
      return h(
        'span',
        {
          title: hasAnnotation ? record.annotation : '',
        },
        hasAnnotation ? '已标注' : '未标注'
      );
    },
  },
];

// 操作列
const actionColumn: BasicColumn = {
  width: 270,
  title: '操作',
  align: 'center',
  actions: (record: Recordable) => [
    {
      label: '详情',
      onClick: () => handleDetail(record),
    },
    {
      label: '标注',
      onClick: () => handleAnnotation(record),
    },
    {
      label: '删除',
      color: 'error',
      popConfirm: {
        title: `确认要删除${record.pname}的人员信息吗？`,
        confirm: () => handleDelete(record),
      },
    },
    {
      label: '添加视频',
      onClick: () => handleAddVideo(record),
    },
    {
      label: '本地导出',
      onClick: () => handleExportReport(record),
    },
  ],
};

// 未检测人员表格列
const untestedColumns = [
  { title: '任务批次', dataIndex: 'testNumberName', key: 'testNumberName' },
  { title: '姓名', dataIndex: 'pname', key: 'pname' },
  { title: '编号', dataIndex: 'pidcard', key: 'pidcard' },
  { title: '部别', dataIndex: 'ppositionName', key: 'ppositionName' },
];

const [registerTable, { reload, getSelectRows, getSelectRowKeys, setSelectedRowKeys, clearSelectedRowKeys, getDataSource }] = useTable({
  api: getResultInformationList,
  beforeFetch: (params: any) => {
    // 按照HTML页面的传参逻辑，确保所有参数都被传递
    // 编号
    params.pidcard = params.pidcard || '';
    // 姓名
    params.pname = params.pname || '';
    // 性别
    params.pgender = params.pgender || '';
    // 部别名称（从表单的fieldLabel获取，或从selectedDepartment获取）
    params.ppositionName = params.ppositionName || '';
    // 部别代码
    params.pposition = params.pposition || '';
    // 状态
    params.alarmStatus = params.alarmStatus || '';
    // 综合心理
    params.psychologyStatus = params.psychologyStatus || '';
    // 测试任务名称
    params.testNumberName = params.testNumberName || '';
    // 测试任务编号
    params.testNumber = params.testNumber || '';
    
    // 根据选中的任务设置查询参数（优先级高于表单输入）
    if (props.selectedTask) {
      params.testNumber = props.selectedTask.testNumber;
      params.testNumberName = props.selectedTask.testNumberName || params.testNumberName;
    }
    
    // 根据选中的部门设置查询参数（优先级高于表单输入）
    if (props.selectedDepartment) {
      params.pposition = props.selectedDepartment.companyCode || params.pposition;
      params.ppositionName = props.selectedDepartment.companyName || params.ppositionName;
    }
    
    // 确保orderBy参数存在（即使为空字符串）
    // orderBy通常由表格排序自动生成，但确保它被传递
    params.orderBy = params.orderBy || '';
    
    // pageNo和pageSize由useTable自动处理，不需要手动设置
    
    return params;
  },
  columns: tableColumns,
  actionColumn: actionColumn,
  formConfig: searchForm,
  showTableSetting: true,
  useSearchForm: true,
  pagination: true,
  canResize: true,
  rowKey: 'videoId',
  clickToRowSelect: false,
  rowSelection: {
    type: 'checkbox',
  },
});

// 监听任务和部门变化，重新加载数据
watch(
  () => [props.selectedTask, props.selectedDepartment],
  () => {
    reload();
  },
  { deep: true }
);

// 详情
function handleDetail(record: ResultInformationItem) {
  router.push({
    path: '/emotion/xiangqing',
    query: {
      sid: record.mid,
      pname: record.pname,
      age: record.age?.toString(),
      ppositionName: record.ppositionName,
      pidcard: record.pidcard,
      pgender: record.pgender,
    },
  });
}

// 删除
async function handleDelete(record: ResultInformationItem) {
  try {
    await deleteRelevantInformationByVideoId(record.videoId);
    showMessage('删除成功');
    reload();
  } catch (error) {
    showMessage('删除失败', 'error');
  }
}

// 添加视频
function handleAddVideo(record: ResultInformationItem) {
  currentAnnotationRecord.value = record;
  videoFileInputRef.value?.click();
}

// 视频文件选择
async function onVideoFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = input.files ? Array.from(input.files) : [];
  if (!files.length || !currentAnnotationRecord.value) return;

  try {
    const formData = new FormData();
    const filteredFiles = files.filter((file) => file.name.includes('红外'));
    const filteredFiles2 = files.filter((file) => file.name.includes('正常'));

    filteredFiles.forEach((file) => {
      formData.append('nirVideoFile', file, file.name);
    });
    filteredFiles2.forEach((file) => {
      formData.append('videoFile', file, file.name);
    });

    formData.append('videoId', currentAnnotationRecord.value.videoId);
    formData.append('pidCard', currentAnnotationRecord.value.pidcard);
    formData.append('pname', currentAnnotationRecord.value.pname);
    formData.append('testNumber', currentAnnotationRecord.value.testNumber);

    await updateOrInsertVideoByPidCard(formData);
    showMessage('上传成功');
  } catch (error) {
    showMessage('上传失败', 'error');
  } finally {
    if (input) input.value = '';
  }
}

// 导出报告
async function handleExportReport(record: ResultInformationItem) {
  try {
    const response = await exportPdfFile(record.videoId);
    const blob = response?.data || response;
    if (blob instanceof Blob) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${record.pidcard}-${record.pname || '报告'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      showMessage('导出成功');
    } else {
      showMessage('导出成功');
    }
  } catch (error) {
    showMessage('导出失败', 'error');
  }
}

// 未检测人员
async function handleUntestedPeople() {
  if (!props.selectedTask?.testNumber) {
    showMessage('请选择任务批次', 'warning');
    return;
  }

  try {
    const data = await findListOfUntestedPersonnel(props.selectedTask.testNumber);
    if (data && data.length > 0) {
      untestedList.value = data.map((item: any) => ({
        ...item,
        testNumberName: props.selectedTask?.testNumberName,
      }));
      untestedModalVisible.value = true;
      // 禁止body滚动
      document.body.style.overflow = 'hidden';
    } else {
      showMessage('该任务所有人员均已检测');
    }
  } catch (error) {
    showMessage('查询失败', 'error');
  }
}

// 关闭未检测人员弹窗
function handleCloseUntestedModal() {
  untestedModalVisible.value = false;
  document.body.style.overflow = 'visible';
}

// 导出整体报告
async function handleExportAllReport() {
  if (!props.selectedTask?.testNumber) {
    showMessage('请选择任务批次', 'warning');
    return;
  }

  try {
    const response = await exportAllPdf(props.selectedTask.testNumber);
    const blob = response?.data || response;
    if (blob instanceof Blob) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${props.selectedTask.testNumber}-导出报告.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      showMessage('导出成功');
    } else {
      showMessage('导出成功');
    }
  } catch (error) {
    showMessage('导出失败', 'error');
  }
}

// 导出Excel
async function handleExportExcel() {
  if (!props.selectedTask?.testNumber) {
    showMessage('请选择任务批次', 'warning');
    return;
  }

  try {
    const response = await exportTaskExcel(props.selectedTask.testNumber);
    const blob = response?.data || response;
    if (blob instanceof Blob) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${props.selectedTask.testNumber}-任务导出报告.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      showMessage('导出成功');
    } else {
      showMessage('导出成功');
    }
  } catch (error) {
    showMessage('导出失败', 'error');
  }
}

// 批量导出个人报告
async function handleBatchExportReports() {
  const rows = getSelectRows();
  if (!rows || rows.length === 0) {
    showMessage('请先选择行', 'warning');
    return;
  }

  for (const row of rows) {
    try {
      const response = await exportPdfFile(row.videoId);
      const blob = response?.data || response;
      if (blob instanceof Blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${row.pidcard}-${row.pname || '报告'}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('导出失败:', error);
    }
  }
  showMessage('导出任务已完成');
}

// 批量删除
async function handleBatchDelete() {
  const rows = getSelectRows();
  if (!rows || rows.length === 0) {
    showMessage('请先选择行', 'warning');
    return;
  }

  Modal.confirm({
    title: '确认要删除选中的人员信息吗？',
    content: '此操作不可撤销',
    okText: '是的，删除它！',
    cancelText: '取消',
    onOk: async () => {
      for (const row of rows) {
        try {
          await deleteRelevantInformationByVideoId(row.videoId);
        } catch (error) {
          console.error('删除失败:', error);
        }
      }
      showMessage('所有数据已删除');
      reload();
    },
  });
}

// 全选
function handleSelectAll() {
  const allData = getDataSource() || [];
  const selectedKeys = getSelectRowKeys() || [];
  
  // 如果没有数据，直接返回
  if (allData.length === 0) {
    showMessage('暂无数据', 'warning');
    return;
  }
  
  // 获取所有行的键（使用 videoId 作为唯一标识）
  const allKeys = allData.map((item: any) => item.videoId).filter((key: any) => key != null) as string[];
  
  // 将选中的键转换为字符串数组以便比较
  const selectedKeysStr = selectedKeys.map((key) => String(key));
  
  // 判断是否已全选（比较选中键的数量和所有键的数量）
  const isAllSelected = selectedKeysStr.length === allKeys.length && 
                        allKeys.every((key: string) => selectedKeysStr.includes(key));
  
  if (isAllSelected) {
    // 如果已全选，则取消全选
    clearSelectedRowKeys();
  } else {
    // 如果未全选，则全选所有行
    setSelectedRowKeys(allKeys);
  }
}
</script>

<style lang="less" scoped>
// 确保整个表格容器自适应宽度，不出现滚动条
:deep(.jeesite-basic-table) {
  width: 100%;
  max-width: 100%;
  overflow: visible;
  
  // 表格主体自适应宽度
  .ant-table-wrapper {
    width: 100%;
    max-width: 100%;
    overflow: visible;
  }
  
  .ant-table {
    width: 100%;
    max-width: 100%;
  }
  
  .ant-table-container {
    width: 100%;
    max-width: 100%;
    overflow: visible;
  }
  
  // 表格内容区域自适应
  .ant-table-body {
    width: 100%;
    max-width: 100%;
  }
}

// 确保表单区域自适应剩余宽度，不出现滚动条
:deep(.jeesite-basic-table-form-container) {
  width: 100%;
  overflow: visible;
  display: block;
  position: relative;
  
  .ant-form {
    width: 100%;
    display: block;
  }
  
  // 允许表单行换行，自适应容器宽度
  .ant-row {
    flex-wrap: wrap; // 允许换行
    width: 100%;
    display: flex;
  }
  
  // 表单项自适应宽度
  .ant-form-item {
    flex: 1 1 auto; // 允许表单项自适应
    min-width: 0; // 允许缩小
  }
  
  // 确保表单项内的输入框自适应
  .ant-form-item-control-input {
    min-width: 0;
    width: 100%;
  }
  
  // 表单操作按钮区域自适应
  .ant-form-item:last-child {
    flex: 0 0 auto; // 操作按钮不缩放
  }
}

:deep(.ant-table-tbody) {
  .odd-row {
    box-shadow: inset 0px 0px 13px #4487d5;
    height: 5vh;
    border: 0;
    border-radius: 24px;
    font-size: 16px;
  }

  .even-row {
    background-color: transparent;
    height: 5vh;
    font-size: 16px;
  }
}

// 未检测人员遮罩层
.untested-panel {
  width: 100%;
  height: 100%;
  background-color: #000;
  opacity: 0.4;
  // IE兼容透明度
  // filter: alpha(opacity=40);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 9998;
}

// 未检测人员弹窗
.untested-people-mask {
  width: 50%;
  height: 80%;
  background: #1a1a1a;
  border-radius: 5px;
  position: fixed;
  left: 40%;
  top: 30%;
  margin: -150px 0 0 -150px;
  border: 1px solid black;
  padding: 10px;
  z-index: 9999;

  .untest-tree {
    width: 90%;
    height: 85%;
    background-color: #262626;
    display: block;
    margin-left: 5%;
    max-height: 85%;
    overflow: auto;
    border: 0;
    outline: 0;
    border-radius: 4px;
    background-color: transparent;
    color: #dddddd;
  }

  .untest-button {
    position: relative;
    top: 10%;

    .untest-cancel {
      position: relative;
      left: 35%;
      width: 20%;
      background-color: #444444;
      color: rgba(255, 255, 255, 0.8);
      border: 0;
      border-radius: 22px;
      box-shadow: 0 0 15px #97bdd4;
      font-size: 15px;
      margin-left: 25px;
      top: 80%;
    }
  }
}
</style>

