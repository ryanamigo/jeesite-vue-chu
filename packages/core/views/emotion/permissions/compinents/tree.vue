<!--
 * Copyright (c) 2013-Now http://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
-->
<template>
  <BasicTree
    :title="t('部职别')"
    :search="false"
    :toolbar="true"
    :showIcon="true"
    :api="companyTreeData"
    :defaultExpandLevel="2"
    v-model:selectedKeys="innerSelectedKeys"
  />
  
</template>
<script lang="ts" setup name="ViewsEmotionPermissionsTree">
  import { computed } from 'vue';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { BasicTree } from '@jeesite/core/components/Tree';
  import { companyTreeData } from '@jeesite/core/api/sys/company';

  const props = defineProps<{ selectedKeys: string[] }>();
  const emit = defineEmits<{ (e: 'update:selectedKeys', v: string[]): void }>();

  const { t } = useI18n('sys.company');

  const innerSelectedKeys = computed({
    get: () => props.selectedKeys,
    set: (v: string[]) => emit('update:selectedKeys', v),
  });
</script>

