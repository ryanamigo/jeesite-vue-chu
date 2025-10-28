<!--
 * Copyright (c) 2013-Now http://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
-->
<template>
  <PageWrapper :sidebarWidth="230">
    <template #sidebar>
      <TreeComp v-model:selectedKeys="treeCodes" />
    </template>
    <ListView v-model:treeCodes="treeCodes" />
  </PageWrapper>
</template>
<script lang="ts" setup name="ViewsSysCompanyIndex">
  import { ref } from 'vue';
  import { PageWrapper } from '@jeesite/core/components/Page';
  import ListView from './list.vue';
  import TreeComp  from '../permissions/compinents/tree.vue'

  const treeCodes = ref<string[]>([]);
</script>
