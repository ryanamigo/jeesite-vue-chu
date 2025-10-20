import type { AppRouteModule } from '@jeesite/core/router/types';

import { LAYOUT } from '@jeesite/core/router/constant';
import { t } from '@jeesite/core/hooks/web/useI18n';

const emotion: AppRouteModule = {
  path: '/emotion',
  name: 'Emotion',
  component: LAYOUT,
  redirect: '/emotion/result', // 默认打开的子页面
  meta: {
    orderNo: 20, // 排序值
    icon: 'i-ant-design:smile-outlined', // 图标
    title: '数据分析1',
  },
  children: [
    {
      path: 'result',
      name: 'EmotionResult',
      component: () => import('@jeesite/core/views/emotion/EmotionResult.vue'), // 页面组件路径
      meta: {
        icon: 'i-ant-design:home-outlined', // 子菜单图标
          title: '数据分析2',
      },
    },
    // 如需添加更多子页面，按此格式继续添加
    // {
    //   path: 'setting',
    //   name: 'EmotionSetting',
    //   component: () => import('@jeesite/core/views/emotion/EmotionSetting.vue'),
    //   meta: {
    //     icon: 'i-ant-design:setting-outlined',
    //     title:'总人数详情'
    //   },
    // },
  ],
};

export default emotion;