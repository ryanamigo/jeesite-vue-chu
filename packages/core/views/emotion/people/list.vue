<!--
 * Copyright (c) 2013-Now http://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
-->
<template>
  <div>
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <Icon :icon="getTitle.icon" class="m-1 pr-1" />
        <span> {{ getTitle.value }} </span>
      </template>
      <template #tableTop>
        <div style="display: flex;column-gap: 10px">
         <a-button type="primary">导入数据库</a-button>
         <a-button type="primary">导出数据库</a-button>
         <a-button type="primary">上传人员信息</a-button>
         <a-button type="primary" style="background: green;">全体建模</a-button>
         <a-button type="primary">批量导出个人报告</a-button>
         <a-button type="primary">批量建模</a-button>
         <a-button type="primary" danger>批量删除个人结果</a-button>
         <a-button type="primary">批量修改部别</a-button>
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
  import { watch, nextTick, unref } from 'vue';
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
import { getPersonList, getPersonStatistics } from '@jeesite/core/api/emption/people';

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
        // TODO 
        onClick: handleForm.bind(this,  record),
        auth: 'sys:company:edit',
      },
      {
        label: t('建模'),
        onClick: handleForm.bind(this,  record),
        auth: 'sys:company:edit',
      },
      {
        label: t('修改'),
        onClick: handleForm.bind(this,  record),
        auth: 'sys:company:edit',
      },
      {
        label: t('删除'),
        onClick: handleForm.bind(this,  record),
        auth: 'sys:company:edit',
      },
      {
        label: t('本地导出'),
        onClick: handleForm.bind(this,  record),
        auth: 'sys:company:edit',
      }
    ],
  };

  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerTable, { reload, expandCollapse, setSelectedRowKeys }] = useTable({
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
