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
  import { companyTreeData } from '@jeesite/core/api/sys/company';
  import { createPermission } from '@jeesite/core/api/emption/permissions';

  const emit = defineEmits(['success', 'register']);

  const { t } = useI18n('sys.company');
  const { showMessage } = useMessage();
  const { meta } = unref(router.currentRoute);
  const record = ref<Record<string, any>>({});
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
        // 防止浏览器自动填充密码
        autocomplete: 'new-password',
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
      label: t('分配任务'),
      field: 'otherInfo',
      component: 'FormGroup',
      colProps: { md: 24, lg: 24 },
    },
    // employee.remarks isn't shown as a separate input in the old Vue form,
    // but the backend expects it in some cases. We'll ensure it's populated from password on submit.
    {
      label: '分配任务',
      component: 'Select',
      field: 'task',
      colProps: {
        span: 24
      }
    },
    {
      label: t('分配角色'),
      field: 'otherInfo',
      component: 'FormGroup',
      colProps: { md: 24, lg: 24 },
    },
    {
      label: t('分配角色'),
      field: 'userRoleString',
      component: 'RadioGroup',
      componentProps: {
        options: [
          { label: '部级管理员', value: 'administrator', description: '具有查看当前部门所包含小组的人员信息以及相关人员测试结果信息，但不具有数据采集的功能' },
          { label: '普通用户', value: 'Regular_users', description: '只具有采集功能，采集当前任务下相关人员测试数据' },
        ],
        help: '请选择用户角色，角色不同，拥有的权限也不同',
      },
    },
  ];

  const [registerForm, { resetFields, setFieldsValue, updateSchema, validate }] = useForm({
    labelWidth: 120,
    schemas: inputFormSchemas,
    baseColProps: { md: 24, lg: 12 },
  });

  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data: Record<string, any>) => {
    setDrawerProps({ loading: true });
    await resetFields();

    try {
      // 判断是否编辑（有 userCode 或 id 视为编辑）
      const isEdit = !!(data?.userCode || data?.id);
      record.value.isNewRecord = !isEdit;

      if (isEdit) {
        // 直接使用传入的 data 进行回填
        const res: any = data || {};
        record.value = { ...res, isNewRecord: false };

        // 角色映射：后端 remarks="部级管理员" => userRoleString='administrator'
        const roleVal = res?.remarks === '部级管理员' ? 'administrator' : 'Regular_users';

        setFieldsValue({
          userName: res?.userName || '',
          loginCode: res?.loginCode || '',
          mobile: res?.mobile || '',
          // TreeSelect 需要同时设置 code 与 label
          'employee.company.companyCode': res?.employee?.company?.companyCode || res?.employee?.company?.viewCode || res?.employee?.company?.id || '',
          'employee.company.companyName': res?.employee?.company?.companyName || res?.employee?.company?.fullName || '',
          userRoleString: roleVal,
        });
      } else {
        // 新增：根据传入 companyCode 预选
        setFieldsValue({
          userName: '',
          loginCode: '',
          mobile: '',
          password: '',
          'employee.company.companyCode': data?.companyCode || '',
          'employee.company.companyName': data?.companyName || '',
          userRoleString: 'Regular_users',
        });
      }
    } finally {
      setDrawerProps({ loading: false });
    }
  });

  async function handleSubmit() {
    try {
      const data = await validate();
      setDrawerProps({ confirmLoading: true });
      // mirror legacy behavior: ensure userType is 'employee'
      data.userType = data.userType || 'employee';
      // ensure employee object exists
      data.employee = data.employee || {};
      // if empNo empty, use loginCode
      if (!data.employee.empNo) {
        data.employee.empNo = data.loginCode || '';
      }
      // set employee.remarks from password when not provided (legacy used remarks as password input)
      if (!data.employee.remarks && data.password) {
        data.employee.remarks = data.password;
      }
      // data.employee.officeName = "测试机构"
      data.employee.office = {
        officeCode: "test",
        officeName: '测试机构'
      }
      Object.assign(data, {
        // 编辑态需带上 userCode，新增态为空
        userCode: record.value && record.value.isNewRecord === false ? (record.value.userCode || '') : '',
        refName: '',
        email: '',
        phone: '',
        // userWeight 默认 0，避免空字符串
        userWeight: data.userWeight ?? 0,
        ['!sex']: ''
      })

      // 根据所选角色同步 remarks，避免与列表上的角色不一致
      if (data.userRoleString === 'administrator') {
        data.remarks = '部级管理员';
      } else if (data.userRoleString === 'Regular_users') {
        data.remarks = '普通用户';
      }

      // 编辑时需要传递 oldLoginCode（原登录账号）；新增时为空
      if (record.value && record.value.isNewRecord === false) {
        data.oldLoginCode = record.value.loginCode || '';
      } else {
        data.oldLoginCode = '';
      }

      // ensure company/office names are set if fields are objects returned by TreeSelect
      // TreeSelect stores codes in field; the label field is fieldLabel configured above and should be set by form lib.
      // call API
      console.log('submitting data', data);

      // 将多层级 object 展平为点号键（employee.company.companyName=...）
      function flattenToDot(obj: any, parentKey = '', res: Record<string, any> = {}) {
        if (!obj || typeof obj !== 'object') return res;
        for (const key of Object.keys(obj)) {
          const val = obj[key];
          const newKey = parentKey ? `${parentKey}.${key}` : key;
          if (val === undefined || val === null) {
            // 保持空字符串以便后端接收该字段
            res[newKey] = '';
          } else if (Array.isArray(val)) {
            // 数组：如果是简单类型，逗号连接；如果是对象则 JSON 化
            if (val.every((v) => typeof v !== 'object')) {
              res[newKey] = val.join(',');
            } else {
              res[newKey] = JSON.stringify(val);
            }
          } else if (typeof val === 'object') {
            flattenToDot(val, newKey, res);
          } else {
            res[newKey] = val;
          }
        }
        return res;
      }

      const flatParams = flattenToDot(data);
      // 兼容旧项目：当有 userRoleString 时，设置 roleRadio=on
      if (flatParams.userRoleString) {
        flatParams.roleRadio = flatParams.roleRadio || 'on';
      }
      // 兼容旧项目：op 字段，默认新增/编辑
      flatParams.op = flatParams.op || (record.value.isNewRecord ? 'add' : 'edit');

      console.log('flatParams', flatParams);
      const res = await createPermission(flatParams);
      showMessage(res.message);
      if (res.result === true || res.result === 'true') {
        setTimeout(() => {
          closeDrawer();
          emit('success', data);
        }, 300);
      }
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
