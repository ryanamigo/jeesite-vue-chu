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
    <!-- 未检测人员对话框 -->
    <a-modal
      v-model:open="untestedModalVisible"
      title="未检测人员"
      :width="800"
      :footer="null"
    >
      <a-table
        :columns="untestedColumns"
        :data-source="untestedList"
        :pagination="false"
        size="small"
        :row-class-name="(_, index) => (index % 2 === 0 ? 'even-row' : 'odd-row')"
      />
    </a-modal>
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

// 搜索表单配置 - 根据HTML中的字段定义
const searchForm: FormProps = {
  baseColProps: { md: 8, lg: 6 },
  labelWidth: 90,
  schemas: [
    {
      label: '编号',
      field: 'pidcard',
      component: 'Input',
      componentProps: {
        maxlength: 18,
      },
    },
    {
      label: '姓名',
      field: 'pname',
      component: 'Input',
      componentProps: {
        maxlength: 20,
      },
    },
    {
      label: '性别',
      field: 'pgender',
      component: 'Input',
      componentProps: {
        maxlength: 1,
      },
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
        title: '部别选择',
      },
      fieldLabel: 'ppositionName',
    },
    {
      label: '跟踪预警状态',
      field: 'alarmStatus',
      component: 'Select',
      componentProps: {
        dictType: 'sys_user_alarmStatus',
        allowClear: true,
      },
    },
    {
      label: '综合心理',
      field: 'psychologyStatus',
      component: 'Select',
      componentProps: {
        dictType: 'sys_user_psychology',
        allowClear: true,
      },
    },
    {
      label: '测试任务',
      field: 'testNumberName',
      component: 'Input',
      componentProps: {
        maxlength: 25,
      },
    },
    // 隐藏的测试任务编号字段
    {
      field: 'testNumber',
      component: 'Input',
      show: false,
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
          style: { color: '#dddddd' }
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
      style: { color: '#00f4ff' }
    },
    {
      label: '标注',
      onClick: () => handleAnnotation(record),
      style: { color: '#dddddd' }
    },
    {
      label: '删除',
      onClick: () => handleDelete(record),
      style: { color: '#d73925' }
    },
    {
      label: '添加视频',
      onClick: () => handleAddVideo(record),
    },
    {
      label: '本地导出',
      onClick: () => handleExportReport(record),
      className: 'PreventDuplication'
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

const [registerTable, { reload, getSelectRows, getForm, setProps }] = useTable({
  api: getResultInformationList,
  beforeFetch: (params: any) => {
    // 根据选中的任务和部门设置查询参数
    if (props.selectedTask) {
      params.testNumber = props.selectedTask.testNumber;
      params.testNumberName = props.selectedTask.testNumberName;
    }
    if (props.selectedDepartment) {
      params.pposition = props.selectedDepartment.companyCode;
      params.ppositionName = props.selectedDepartment.companyName;
    }
    
    // 设置分页参数 - 这是关键修复
    params.pageNo = params.page || 1;
    params.pageSize = params.pageSize || 20;
    params.orderBy = params.sortField ? `${params.sortField} ${params.sortOrder === 'ascend' ? 'ASC' : 'DESC'}` : '';
    
    return params;
  },
  columns: tableColumns,
  actionColumn: actionColumn,
  formConfig: searchForm,
  showTableSetting: true,
  useSearchForm: true,
  pagination: {
    pageSize: 20,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showQuickJumper: true,
  },
  canResize: true,
  rowSelection: {
    type: 'checkbox',
  },
  immediate: false, // 设置为false，等待参数设置完成后再加载
});

// 监听任务和部门变化，重新加载数据
watch(
  () => [props.selectedTask, props.selectedDepartment],
  () => {
    // 更新表单值
    const form = getForm();
    if (form) {
      if (props.selectedTask) {
        form.setFieldsValue({
          testNumber: props.selectedTask.testNumber,
          testNumberName: props.selectedTask.testNumberName
        });
      }
      if (props.selectedDepartment) {
        form.setFieldsValue({
          pposition: props.selectedDepartment.companyCode,
          ppositionName: props.selectedDepartment.companyName
        });
      }
    }
    reload();
  },
  { deep: true, immediate: true }
);

// 初始化时设置分页参数
setProps({
  pagination: {
    current: 1,
    pageSize: 20,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showQuickJumper: true,
  }
});

// 详情
function handleDetail(record: ResultInformationItem) {
  router.push({
    path: '/subject/subjectInformation/form',
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

// 标注功能
function handleAnnotation(record: ResultInformationItem) {
  currentAnnotationRecord.value = record;
  
  Modal.confirm({
    title: '添加标注',
    content: h('div', [
      h('textarea', {
        style: {
          width: '100%',
          height: '120px',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #d9d9d9',
          backgroundColor: '#262626',
          color: 'rgba(255, 255, 255, 0.8)',
        },
        placeholder: '请输入注释',
        value: record.annotation || '',
        onInput: (e: Event) => {
          const target = e.target as HTMLTextAreaElement;
          currentAnnotationRecord.value!.annotation = target.value;
        }
      })
    ]),
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      if (!currentAnnotationRecord.value) return;
      
      try {
        await updateAnnotationInfo({
          pidCard: currentAnnotationRecord.value.pidcard,
          annotation: currentAnnotationRecord.value.annotation || '',
          annotationType: 1
        });
        showMessage('标注成功');
        reload();
      } catch (error) {
        showMessage('标注失败', 'error');
      }
    }
  });
}

// 删除
async function handleDelete(record: ResultInformationItem) {
  Modal.confirm({
    title: `确认要删除${record.pname}的人员信息吗？`,
    content: '此操作不可撤销',
    okText: '是的，删除它！',
    cancelText: '取消',
    onOk: async () => {
      try {
        await deleteRelevantInformationByVideoId(record.videoId);
        showMessage('删除成功');
        reload();
      } catch (error) {
        showMessage('删除失败', 'error');
      }
    }
  });
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
    } else {
      showMessage('该任务所有人员均已检测');
    }
  } catch (error) {
    showMessage('查询失败', 'error');
  }
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
  showMessage('请使用表格左上角的全选复选框', 'info');
}
</script>

<style lang="less" scoped>
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

// 防止重复点击样式
:deep(.PreventDuplication) {
  &.ant-btn {
    &[disabled] {
      pointer-events: none;
    }
  }
}
</style>