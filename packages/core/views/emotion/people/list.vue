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
      <template #toolbar>
        <a-button type="primary" @click="handleForm({})" v-auth="'sys:company:edit'">
          <Icon icon="i-fluent:add-12-filled" /> {{ t('新增') }}
        </a-button>
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
import { getPersonList } from '@jeesite/core/api/emption/people';

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
        label: t('登录账号'),
        field: 'loginCode',
        component: 'Input',
      },
      {
        label: t('责任人'),
        field: 'refName',
        component: 'Input',
      },
      // {
      //   label: t('状态'),
      //   field: 'status',
      //   component: 'Select',
      //   componentProps: {
      //     dictType: 'sys_search_status',
      //     allowClear: true,
      //     onChange: handleSuccess,
      //   },
      // },
      {
        label: t('手机号'),
        field: 'mobile',
        component: 'Input',
      },
    ],
    resetFunc: async () => {
      emit('update:treeCodes', []);
    },
  };

  const tableColumns: BasicColumn[] = [
    {
      title: t('登录账号'),
      dataIndex: 'loginCode',
      width: 230,
      align: 'left'
    },
    {
      title: t('责任人'),
      dataIndex: 'userName',
      width: 130,
      align: 'left',
    },
    {
      title: t('责任权限'),
      dataIndex: 'employee.company.companyName',
      width: 90,
      align: 'center',
    },
    {
      title: t('手机号码'),
      dataIndex: 'mobile',
      width: 100,
      align: 'center',
    },
    {
      title: t('更新时间'),
      dataIndex: 'updateDate',
      width: 80,
      align: 'center',
    }
  ];

  const actionColumn: BasicColumn = {
    width: 160,
    actions: (record: Recordable) => [
      {
        icon: 'i-clarity:note-edit-line',
        title: t('修改部职别'),
        onClick: handleForm.bind(this,  record),
        auth: 'sys:company:edit',
      },
    ],
  };

  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerTable, { reload, expandCollapse }] = useTable({
    api: getPersonList,
    beforeFetch: (params) => {
      params['employee.company.companyCode'] = !isEmpty(props.treeCodes) ? props.treeCodes[0] : '';
      params['employee.company.companyName'] = ''
      params.ctrlPermi = 2
      params.loginCode = params.loginCode || ''
      params.refName = params.refName || ''
      params.mobile = params.mobile || ''
      return params;
    },
    columns: tableColumns,
    actionColumn: actionColumn,
    formConfig: searchForm,
    showTableSetting: true,
    useSearchForm: true,
    pagination: true,
    canResize: true,
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
