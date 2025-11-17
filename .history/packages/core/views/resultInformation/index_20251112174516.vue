<!--
 * Copyright (c) 2013-Now http://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
-->
<template>
  <PageWrapper :sidebarWidth="230">
    <template #sidebar>
    </template>
    <ListView
      :selectedTask="selectedTask"
      :selectedDepartment="selectedDepartment"
    />
  </PageWrapper>
</template>

<script lang="ts" setup name="ResultInformationIndex">
import { ref } from 'vue';
import { PageWrapper } from '@jeesite/core/components/Page';
import ListView from './list.vue';
import TreeComp from './components/tree.vue';
const selectedTask = ref<{ testNumber: string; testNumberName: string } | undefined>();
const selectedDepartment = ref<{ companyCode: string; companyName: string } | undefined>();
</script>

