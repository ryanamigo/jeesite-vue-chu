<!--
 * Copyright (c) 2013-Now http://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
-->
<template>
  <BasicDrawer
    v-bind="$attrs"
    :showFooter="true"
    :okAuth="'sys:company:edit'"
    @register="registerDrawer"
    @ok="handleSubmit"
    width="70%"
  >
    <template #title>
      <Icon :icon="getTitle.icon" class="m-1 pr-1" />
      <span> {{ getTitle.value }} </span>
    </template>
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts" setup name="ViewsSysCompanyForm">
  import { ref, unref, computed } from 'vue';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { useMessage } from '@jeesite/core/hooks/web/useMessage';
  import { router } from '@jeesite/core/router';
  import { Icon } from '@jeesite/core/components/Icon';
  import { BasicForm, FormSchema, useForm } from '@jeesite/core/components/Form';
  import { BasicDrawer, useDrawerInner } from '@jeesite/core/components/Drawer';
  import { Company, companySave, companyForm, companyTreeData } from '@jeesite/core/api/sys/company';
  import { officeTreeData } from '@jeesite/core/api/sys/office';
  import { areaTreeData } from '@jeesite/core/api/sys/area';

  const emit = defineEmits(['success', 'register']);

  const { t } = useI18n('sys.company');
  const { showMessage } = useMessage();
  const { meta } = unref(router.currentRoute);
  const record = ref<Company>({} as Company);
  const getTitle = computed(() => ({
    icon: meta.icon || 'ant-design:book-outlined',
    value: record.value.isNewRecord ? t('新增公司') : t('编辑公司'),
  }));

  const inputFormSchemas: FormSchema[] = [
    {
      label: t('基本信息'),
      field: 'basicInfo',
      component: 'FormGroup',
      colProps: { md: 24, lg: 24 },
    },
    {
      label: t('责任权限'),
      field: 'employee.company.companyCode',
      fieldLabel: 'employee.company.companyName',
      component: 'TreeSelect',
      componentProps: {
        allowClear: true,
        api: companyTreeData,
        // style: 'width: calc(50% - 60px)',
      },
      // colProps: { md: 24, lg: 24 },
    },
    {
      field: 'none',
      component: 'None',
    },
    {
      label: t('责任人'),
      field: 'userName',
      component: 'Input',
      componentProps: {
        maxlength: 200,
      },
      required: true,
    },
    {
      label: t('登录账号'),
      field: 'loginCode',
      component: 'Input',
      componentProps: {
        maxlength: 64,
      },
      rules: [{ required: true }, { pattern: /^[a-zA-Z0-9_]*$/, message: t('请输入字母数字下划线') }],
    },
    {
      label: t('登录密码'),
      field: 'password',
      component: 'InputPassword',
      componentProps: {
        maxlength: 200,
      },
      required: true,
    },
    {
      label: t('手机号码'),
      field: 'mobile',
      component: 'InputNumber',
      componentProps: {
        maxlength: 11,
      },
      required: true,
    },

    {
      label: '工号',
      field: 'employee.empNo',
      component: 'Input',
      componentProps: {
        maxlength: 64,
      },
    },

    {
      label: '部职别(机构)',
      field: 'employee.office.officeCode',
      fieldLabel: 'employee.office.officeName',
      component: 'TreeSelect',
      componentProps: {
        api: officeTreeData,
        allowClear: true,
      },
    },

    {
      label: t('其它信息'),
      field: 'otherInfo',
      component: 'FormGroup',
      colProps: { md: 24, lg: 24 },
    },
    {
      label: t('归属区域'),
      field: 'area.areaCode',
      fieldLabel: 'area.areaName',
      component: 'TreeSelect',
      componentProps: {
        api: areaTreeData,
      },
    },
    {
      label: t('包含机构'),
      field: 'officeCodes',
      fieldLabel: 'officeNames',
      component: 'TreeSelect',
      componentProps: {
        api: officeTreeData,
        treeCheckable: true,
      },
    },
    {
      label: t('备注信息'),
      field: 'remarks',
      component: 'InputTextArea',
      componentProps: {
        maxlength: 500,
      },
      colProps: { md: 24, lg: 24 },
    },
  ];

  const [registerForm, { resetFields, setFieldsValue, updateSchema, validate }] = useForm({
    labelWidth: 120,
    schemas: inputFormSchemas,
    baseColProps: { md: 24, lg: 12 },
  });

  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    setDrawerProps({ loading: true });
    await resetFields();
    const res = await companyForm(data);
    record.value = (res.company || {}) as Company;
    record.value.officeCodes = res.officeCodes || '';
    record.value.officeNames = res.officeNames || '';
    if (data.parentCode && data.parentName) {
      record.value.parentCode = data.parentCode;
      record.value.parentName = data.parentName;
    }
    setFieldsValue(record.value);
    updateSchema([
      {
        field: 'parentCode',
        componentProps: {
          api: companyTreeData,
          params: {
            excludeCode: record.value.id,
            isShowRawName: true,
          },
        },
      },
      {
        field: 'viewCode',
        componentProps: {
          disabled: !record.value.isNewRecord,
        },
      },
    ]);
    setDrawerProps({ loading: false });
  });

  async function handleSubmit() {
    try {
      const data = await validate();
      setDrawerProps({ confirmLoading: true });
      const params: any = {
        isNewRecord: record.value.isNewRecord,
        companyCode: record.value.companyCode,
      };
      // ensure employee/company/office fields are present in payload
      data.oldParentCode = record.value.parentCode;
      data.userType = data.userType || 'employee';
      // merge existing record values for nested employee fields when not provided by form
      data.employee = Object.assign({}, record.value.employee || {}, data.employee || {});
      // ensure company fields
      if (record.value['employee.company.companyCode'] || record.value.employee?.company?.companyCode) {
        // nothing
      }
      // Some form schemas store nested fields as dot-paths on record; normalize into nested objects
      if (record.value['employee.company.companyCode']) {
        data.employee.company = data.employee.company || {};
        data.employee.company.companyCode = data.employee.company.companyCode || record.value['employee.company.companyCode'];
      }
      if (record.value['employee.company.companyName']) {
        data.employee.company = data.employee.company || {};
        data.employee.company.companyName = data.employee.company.companyName || record.value['employee.company.companyName'];
      }
      // office
      if (record.value['employee.office.officeCode']) {
        data.employee.office = data.employee.office || {};
        data.employee.office.officeCode = data.employee.office.officeCode || record.value['employee.office.officeCode'];
      }
      if (record.value['employee.office.officeName']) {
        data.employee.office = data.employee.office || {};
        data.employee.office.officeName = data.employee.office.officeName || record.value['employee.office.officeName'];
      }

      // copy some common flat fields into expected nested structure if present
      if (data.employee && data.employee.empNo) {
        // already present
      }

      // include role flags if present
      if (data.roleRadio) {
        data.roleRadio = data.roleRadio;
      }

      // call save
      const res = await companySave(params, data);
      showMessage(res.message);
      setTimeout(closeDrawer);
      emit('success', data);
    } catch (error: any) {
      if (error && error.errorFields) {
        showMessage(error.message || t('common.validateError'));
      }
      console.log('error', error);
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  }
</script>
