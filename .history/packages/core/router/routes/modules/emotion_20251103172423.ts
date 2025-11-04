import type { AppRouteModule } from '@jeesite/core/router/types';
import { LAYOUT } from '@jeesite/core/router/constant';
import { t } from '@jeesite/core/hooks/web/useI18n';

const emotion: AppRouteModule = {
  path: '/emotion',
  name: 'Emotion',
  component: LAYOUT,
  redirect: '/emotion/result', // 默认子页面
  meta: {
    orderNo: 20,
    icon: 'i-ant-design:smile-outlined',
    title: '数据分析',
  },
  children: [
    {
      path: 'result',
      name: 'EmotionResult',
      component: () => import('@jeesite/core/views/emotion/index.vue'), // 当前页面
      meta: {
        icon: 'i-ant-design:home-outlined',
        title: '数据分析',
      },
    },
    // 新增：总人数页面路由（目标跳转页面）
    {
      path: 'zongrenshu', // 路由路径，最终跳转地址为 /emotion/zongrenshu
      name: 'EmotionZongrenshu', // 路由唯一名称（不可重复）
      component: () => import('@jeesite/core/views/emotion/components/DetailPage.vue'), // 统一的详情页面组件
      meta: {
        icon: 'i-ant-design:user-outlined', // 可选：子菜单图标
        title: '总人数详情', // 菜单/面包屑显示标题
      },
    },
     {
      path: 'zongcishu',
      name: 'EmotionZongcishu', 
      component: () => import('@jeesite/core/views/emotion/components/DetailPage.vue'), // 统一的详情页面组件
      meta: {
        icon: 'i-ant-design:user-outlined', 
        title: '总次数详情',
      },
    },
     {
      path: 'jinrijiance', 
      name: 'Emotionjinrijiance',
      component: () => import('@jeesite/core/views/emotion/components/DetailPage.vue'), // 统一的详情页面组件
      meta: {
        icon: 'i-ant-design:user-outlined', 
        title: '今日检测人数详情', 
      },
    },
     {
      path: 'jiancecishu', 
      name: 'Emotionjiancecishu',
      component: () => import('@jeesite/core/views/emotion/components/DetailPage.vue'), // 统一的详情页面组件
      meta: {
        icon: 'i-ant-design:user-outlined', 
        title: '今日检测次数详情', 
      },
    },
     {
      path: 'wuxiaoshipin', 
      name: 'Emotionwuxiaoshipin', 
      component: () => import('@jeesite/core/views/emotion/components/DetailPage.vue'), // 统一的详情页面组件
      meta: {
        icon: 'i-ant-design:user-outlined', 
        title: '无效视频数据详情', 
      },
    },
    {
      path: 'xiangqing', 
      name: 'Emotionxiangqing', 
      component: () => import('@jeesite/core/views/emotion/components/xiangqing.vue'),
      meta: {
        icon: 'i-ant-design:user-outlined', 
        title: '详情', 
      },
    },
  ],
};

export default emotion;