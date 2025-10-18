<template>
  <PageWrapper :sidebarWidth="230">
    <template #sidebar>
      <BasicTree
        :title="t('公司')"
        :search="true"
        :toolbar="true"
        :showIcon="true"
        :api="companyTreeData"
        :defaultExpandLevel="2"
        v-model:selectedKeys="treeCodes"
      />
    </template>
    <div>内容</div>
  </PageWrapper>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { PageWrapper } from '@jeesite/core/components/Page';
  import { BasicTree } from '@jeesite/core/components/Tree';
  import { companyTreeData } from '@jeesite/core/api/sys/company';


  const { t } = useI18n('sys.company');
  const treeCodes = ref<string[]>([]);
</script>

