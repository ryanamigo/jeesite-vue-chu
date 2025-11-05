import type { AppRouteModule } from '@jeesite/core/router/types';
import { LAYOUT } from '@jeesite/core/router/constant';
import { t } from '@jeesite/core/hooks/web/useI18n';

const screendisplay: AppRouteModule = {
  path: '/screendisplay',
  name: 'ScreenDisplay',
  component: LAYOUT,
  redirect: '/screendisplay/index',
  meta: {
    orderNo: 30,
    icon: 'i-ant-design:desktop-outlined',
    title: '大屏展示',
  },
  children: [
    {
      path: 'index',
      name: 'ScreenDisplayIndex',
      component: () => import('@jeesite/core/views/screendisplay/index.vue'),
      meta: {
        icon: 'i-ant-design:desktop-outlined',
        title: '大屏展示',
      },
    },
  ],
};

export default screendisplay;

