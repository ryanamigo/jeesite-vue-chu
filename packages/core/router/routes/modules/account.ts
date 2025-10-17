import type { AppRouteModule } from '@jeesite/core/router/types';

import { LAYOUT } from '@jeesite/core/router/constant';
import { t } from '@jeesite/core/hooks/web/useI18n';

const account: AppRouteModule = {
  path: '/account',
  name: 'Account',
  component: LAYOUT,
  redirect: '/account/center',
  meta: {
    icon: 'i-ion:person-outline',
    title: t('sys.account.center'),
    orderNo: 100000,
  },
  children: [
    {
      path: 'center',
      name: 'AccountCenter',
      component: () => import('@jeesite/core/layouts/views/account/center.vue'),
      meta: {
        icon: 'i-ion:person-outline',
        title: t('sys.account.center'),
      },
    },
    {
      path: 'modPwd',
      name: 'AccountModPwd',
      component: () => import('@jeesite/core/layouts/views/account/modPwd.vue'),
      meta: {
        icon: 'i-ant-design:key-outlined',
        title: t('sys.account.modifyPwd'),
      },
    },
    {
      path: 'modPwdQuestion',
      name: 'AccountModPwdQuestion',
      component: () => import('@jeesite/core/layouts/views/account/modPwdQuestion.vue'),
      meta: {
        icon: 'i-ant-design:key-outlined',
        title: t('sys.account.modifyPqa'),
      },
    },
  ],
};

export default account;
