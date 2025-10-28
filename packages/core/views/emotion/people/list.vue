<!--
 * Copyright (c) 2013-Now http://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
-->
<template>
  <div>
    <input ref="dbFilesInputRef" type="file" multiple style="display:none" @change="onPickDbFiles" accept=".csv,.xls,.xlsx,.xlsm,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
    <input ref="singleFileInputRef" type="file" style="display:none" @change="onPickSingleFile" accept=".csv,.xls,.xlsx,.xlsm,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <Icon :icon="getTitle.icon" class="m-1 pr-1" />
        <span> {{ getTitle.value }} </span>
      </template>
      <template #tableTop>
        <div style="display: flex;column-gap: 10px">
         <a-button type="primary" @click="() => (dbFilesInputRef as any)?.click()">导入数据库</a-button>
         <a-button type="primary" @click="onExportDatabase">导出数据库</a-button>
         <a-button type="primary" @click="() => (singleFileInputRef as any)?.click()">上传人员信息</a-button>
         <a-button type="primary" style="background: green;" @click="onAllModeling">全体建模</a-button>
         <a-button type="primary" @click="onBatchExportReports">批量导出个人报告</a-button>
         <a-button type="primary" @click="onBatchModeling">批量建模</a-button>
         <a-button type="primary" danger @click="onBatchDelete">批量删除个人结果</a-button>
         <a-button type="primary" @click="onBatchModifyPosition">批量修改部别</a-button>
        </div>

      </template>
      <template #firstColumn="{ record }">
        <span class="cursor-pointer" @click="expandCollapse(record)"> ( {{ record.viewCode }} ) </span>
        <a @click="handleForm({ companyCode: record.companyCode })">
          {{ record.companyName }}
        </a>
      </template>
    </BasicTable>
  </div>
</template>
<script lang="ts" setup name="ViewsSysCompanyList">
  import { watch, nextTick, unref, ref } from 'vue';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { useMessage } from '@jeesite/core/hooks/web/useMessage';
  import { router } from '@jeesite/core/router';
  import { Icon } from '@jeesite/core/components/Icon';
  import { BasicTable, BasicColumn, useTable } from '@jeesite/core/components/Table';
  import { companyDelete, companyListData } from '@jeesite/core/api/sys/company';
  import { companyDisable, companyEnable } from '@jeesite/core/api/sys/company';
  import { useDrawer } from '@jeesite/core/components/Drawer';
  import { FormProps } from '@jeesite/core/components/Form';
  import { isEmpty } from '@jeesite/core/utils/is';
import { getPersonList, getPersonStatistics, importDatabaseData, exportDatabase, importFile, requestAllModeling, requestIndividualModeling, deletePerson, exportPersonReport, updatePositionAndName } from '@jeesite/core/api/emption/people';

  const props = defineProps({
    treeCodes: Array as PropType<String[]>,
  });

  const emit = defineEmits(['update:treeCodes']);

  const { t } = useI18n('sys.company');
  const { showMessage } = useMessage();
  const { meta } = unref(router.currentRoute);
  const getTitle = {
    icon: meta.icon || 'ant-design:book-outlined',
    value: meta.title || t('部职别管理'),
  };

  const searchForm: FormProps = {
    baseColProps: { md: 8, lg: 6 },
    labelWidth: 90,
    schemas: [
      {
        label: t('编号'),
        field: 'pidcard',
        component: 'Input',
      },
      {
        label: t('姓名'),
        field: 'pname',
        component: 'Input',
      },
      {
        label: t('性别'),
        field: 'pgender',
        component: 'Input',
      },
    ],
    resetFunc: async () => {
      emit('update:treeCodes', []);
    },
  };

  const tableColumns: BasicColumn[] = [
    // 第一列可勾选
    {
      title: t('选择'),
    },
      
    
    {
      title: t('编号'),
      dataIndex: 'pidcard',
      width: 230,
      align: 'left'
    },
    {
      title: t('姓名'),
      dataIndex: 'pname',
      width: 130,
      align: 'left',
    },
    {
      title: t('年龄'),
      dataIndex: 'age',
      width: 90,
      align: 'center',
    },
    {
      title: t('性别'),
      dataIndex: 'pgender',
      width: 100,
      align: 'center',
    },
    {
      title: t('部别'),
      dataIndex: 'ppositionName',
      width: 80,
      align: 'center',
    },
      {
      title: t('正常'),
      dataIndex: 'normal',
      width: 80,
      align: 'center',
    },
    {
      title: t('一般'),
      dataIndex: 'attention',
      width: 80,
      align: 'center',
    },
    {
      title: t('关注'),
      dataIndex: 'emphasis',
      width: 80,
      align: 'center',
    },
    {
      title: t('建模'),
      dataIndex: 'modelingStatus',
      width: 80,
      align: 'center',
    }
  ];

  const actionColumn: BasicColumn = {
    width: 260,
    actions: (record: Recordable) => [
      {
        label: t('详情'),
        onClick: () => onRowDetail(record),
        auth: 'sys:company:edit',
      },
      {
        label: t('建模'),
        onClick: () => onRowModeling(record),
        auth: 'sys:company:edit',
      },
      {
        label: t('修改'),
        onClick: () => onRowModifyPosition(record),
        auth: 'sys:company:edit',
      },
      {
        label: t('删除'),
        onClick: () => onRowDelete(record),
        auth: 'sys:company:edit',
      },
      {
        label: t('本地导出'),
        onClick: () => onRowExport(record),
        auth: 'sys:company:edit',
      }
    ],
  };

  const dbFilesInputRef = ref<HTMLInputElement | null>(null);
  const singleFileInputRef = ref<HTMLInputElement | null>(null);

  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerTable, { reload, expandCollapse, getSelectRows, clearSelectedRowKeys }] = useTable({
    api: async (params) => {
      // 先获取分页列表
      const page = await getPersonList(params);
      const rows = Array.isArray(page?.list) ? page.list : [];
      // 并行拉取每行统计信息并合并
      const enriched = await Promise.all(
        rows.map(async (row: any) => {
          try {
            const statsRes = await getPersonStatistics(row.pidcard);
            // 兼容返回为数组的结构
            const stat = Array.isArray(statsRes) ? statsRes[0] : statsRes;
            return {
              ...row,
              normal: stat?.normalCount ?? 0,
              attention: stat?.attentionCount ?? 0,
              emphasis: stat?.emphasisAttentionCount ?? 0,
              modelingStatus: stat?.modelingStatus ?? row?.modelingStatus ?? 0,
            };
          } catch (e) {
            // 失败时保持原值或设为 0
            return {
              ...row,
              normal: row?.normal ?? 0,
              attention: row?.attention ?? 0,
              emphasis: row?.emphasis ?? 0,
              modelingStatus: row?.modelingStatus ?? 0,
            };
          }
        })
      );

      return { ...page, list: enriched };
    },
    beforeFetch: (params) => {
      params.pposition = !isEmpty(props.treeCodes) ? props.treeCodes[0] : '';
      params.ppositionName = ''
      params.pidcard = params.pidcard || ''
      params.pname = params.pname || ''
      params.pgender = params.pgender || ''
      return params;
    },
    columns: tableColumns,
    actionColumn: actionColumn,
    formConfig: searchForm,
    showTableSetting: true,
    useSearchForm: true,
    pagination: true,
    canResize: true,
    rowSelection: {}
  });

  watch(
    () => props.treeCodes,
    () => {
      if (!isEmpty(props.treeCodes)) {
        reload();
      }
    },
  );

  // function fetchSuccess() {
  //   if (!isEmpty(props.treeCodes)) {
  //     nextTick(expandAll);
  //   }
  // }

  function handleForm(record: Recordable) {
    openDrawer(true, record);
  }

  // 选择的行帮助函数
  function getSelected(): any[] {
    try { return (getSelectRows && getSelectRows()) || []; } catch { return []; }
  }

  // 顶部操作：导入数据库
  async function onPickDbFiles(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    if (!files.length) return;
    try {
      await importDatabaseData(files);
      showMessage('导入成功');
      clearSelectedRowKeys && clearSelectedRowKeys();
      reload();
    } finally {
      if (input) input.value = '';
    }
  }

  // 顶部操作：上传人员信息（单文件）
  async function onPickSingleFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    if (!files.length) return;
    try {
      await importFile(files[0]);
      showMessage('上传成功');
      reload();
    } finally {
      if (input) input.value = '';
    }
  }

  // 顶部操作：导出数据库
  async function onExportDatabase() {
    await exportDatabase('D:/481Develop/exportDatabase');
    showMessage('已触发导出');
  }

  // 顶部操作：全体建模（优先使用选中行的部别，需一致；否则使用当前树选择）
  async function onAllModeling() {
    const rows = getSelected();
    let code = '', name = '';
    if (rows.length > 0) {
      const allSame = rows.every((r) => r.pposition === rows[0].pposition);
      if (!allSame) {
        showMessage('请选择相同部别的人员');
        return;
      }
      code = rows[0].pposition || '';
      name = rows[0].ppositionName || '';
    } else {
      // 使用左侧树条件
      // @ts-ignore
      code = !isEmpty((props as any).treeCodes) ? (props as any).treeCodes[0] : '';
      name = '';
    }
    if (!code) { showMessage('请选择部别或至少选择一行'); return; }
    await requestAllModeling(code, name);
    showMessage('已提交建模');
  }

  // 顶部操作：批量导出个人报告
  async function onBatchExportReports() {
    const rows = getSelected();
    if (!rows.length) { showMessage('请先选择行'); return; }
    for (const r of rows) {
      const blob = await exportPersonReport(r.pidcard);
      try {
        const url = window.URL.createObjectURL(blob as any);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${r.pidcard}-${r.pname || '报告'}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } catch {}
    }
    showMessage('导出任务已完成');
  }

  // 顶部操作：批量建模
  async function onBatchModeling() {
    const rows = getSelected();
    if (!rows.length) { showMessage('请先选择行'); return; }
    for (const r of rows) {
      await requestIndividualModeling(r.pidcard);
    }
    showMessage('已提交建模');
  }

  // 顶部操作：批量删除
  async function onBatchDelete() {
    const rows = getSelected();
    if (!rows.length) { showMessage('请先选择行'); return; }
    for (const r of rows) {
      await deletePerson(r.pidcard);
    }
    showMessage('已删除所选');
    reload();
  }

  function onRowDetail(record: any) {
    openDrawer(true, record);
  }

  async function onRowModeling(record: any) {
    await requestIndividualModeling(record.pidcard);
    showMessage('已提交建模');
  }

  async function onRowModifyPosition(record: any) {
    const code = !isEmpty((props as any).treeCodes) ? (props as any).treeCodes[0] : '';
    const name = '';
    if (!code) { showMessage('请在左侧选择目标部别'); return; }
    await updatePositionAndName(record.pidcard, code, name);
    showMessage('已修改部别');
    reload();
  }

  async function onRowDelete(record: any) {
    await deletePerson(record.pidcard);
    showMessage('删除成功');
    reload();
  }

  async function onRowExport(record: any) {
    const blob = await exportPersonReport(record.pidcard);
    try {
      const url = window.URL.createObjectURL(blob as any);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${record.pidcard}-${record.pname || '报告'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      showMessage('已导出');
    } catch {
      showMessage('导出失败');
    }
  }

  // 顶部操作：批量修改部别（将所选行的部别改为当前树选择）
  async function onBatchModifyPosition() {
    // @ts-ignore
    const code = !isEmpty((props as any).treeCodes) ? (props as any).treeCodes[0] : '';
    const name = '';
    if (!code) { showMessage('请在左侧选择目标部别'); return; }
    const rows = getSelected();
    if (!rows.length) { showMessage('请先选择行'); return; }
    for (const r of rows) {
      await updatePositionAndName(r.pidcard, code, name);
    }
    showMessage('已修改部别');
    reload();
  }

  async function handleDisable(record: Recordable) {
    const params = { companyCode: record.companyCode };
    const res = await companyDisable(params);
    showMessage(res.message);
    handleSuccess(record);
  }

  async function handleEnable(record: Recordable) {
    const params = { companyCode: record.companyCode };
    const res = await companyEnable(params);
    showMessage(res.message);
    handleSuccess(record);
  }

  async function handleDelete(record: Recordable) {
    const params = { companyCode: record.companyCode };
    const res = await companyDelete(params);
    showMessage(res.message);
    handleSuccess(record);
  }

  function handleSuccess(record: Recordable) {
    reload({ record });
  }
</script>
