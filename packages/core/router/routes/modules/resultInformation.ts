import type { AppRouteModule } from '@jeesite/core/router/types';
import { LAYOUT } from '@jeesite/core/router/constant';
import { t } from '@jeesite/core/hooks/web/useI18n';

const resultInformation: AppRouteModule = {
  path: '/resultInformation',
  name: 'ResultInformation',
  component: LAYOUT,
  redirect: '/resultInformation/index',
  meta: {
    orderNo: 30,
    icon: 'i-ant-design:file-text-outlined',
    title: '任务管理',
  },
  children: [
    {
      path: 'index',
      name: 'ResultInformationIndex',
      component: () => import('@jeesite/core/views/resultInformation/index.vue'),
      meta: {
        icon: 'i-ant-design:file-text-outlined',
        title: '任务管理',
      },
    },
  ],
};

export default resultInformation;

