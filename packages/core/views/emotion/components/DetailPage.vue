<template>
  <SubjectListTable :config="config" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import SubjectListTable from './SubjectListTable.vue';
import {
  createTotalPersonConfig,
  createTotalTimesConfig,
  createTodayPersonConfig,
  createTodayTimesConfig,
  createInvalidVideoConfig,
} from './tableConfig';

const route = useRoute();

// 根据路由路径动态选择配置
const config = computed(() => {
  const path = route.path;
  
  // 根据路径匹配不同的页面类型
  if (path.includes('zongrenshu')) {
    return createTotalPersonConfig();
  } else if (path.includes('zongcishu')) {
    return createTotalTimesConfig();
  } else if (path.includes('jinrijiance') && !path.includes('jiancecishu')) {
    // jinrijiance 是今日检测人数
    return createTodayPersonConfig();
  } else if (path.includes('jiancecishu')) {
    return createTodayTimesConfig();
  } else if (path.includes('wuxiaoshipin')) {
    return createInvalidVideoConfig();
  }
  
  // 默认返回总人数配置
  return createTotalPersonConfig();
});
</script>

