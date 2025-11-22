<template>
  <ALayoutHeader :class="getHeaderClass">
    <!-- left start -->
    <div :class="`${prefixCls}-left`">
      <!-- logo -->
      <AppLogo
        v-if="getShowHeaderLogo || getIsMobile"
        :class="`${prefixCls}-logo`"
        :theme="getHeaderTheme"
        :style="getLogoWidth"
      />
      <LayoutTrigger
        v-if="(getShowContent && getShowHeaderTrigger && !getSplit && !getIsMixSidebar) || getIsMobile"
        :theme="getHeaderTheme"
        :sider="false"
      />
      <LayoutBreadcrumb v-if="getShowContent && getShowBread" :theme="getHeaderTheme" />
    </div>
    <!-- left end -->

    <!-- menu start -->
    <div :class="`${prefixCls}-menu`" v-if="getIsInitMenu && getShowTopMenu && !getIsMobile">
      <LayoutMenu :isHorizontal="true" :theme="getHeaderTheme" :splitType="getSplitType" :menuMode="getMenuMode" />
    </div>
    <!-- menu-end -->

    <!-- action  -->
    <div :class="`${prefixCls}-action`">
      <ErrorAction v-if="getUseErrorHandle" class="error-action" />

      <FullScreen v-if="getShowFullScreen" class="fullscreen-item" />

      <UserDropDown :theme="getHeaderTheme" />
    </div>
  </ALayoutHeader>
</template>
<script lang="ts">
  import { defineComponent, ref, unref, computed } from 'vue';
  import { propTypes } from '@jeesite/core/utils/propTypes';
  import { Layout } from 'ant-design-vue';
  import { AppLogo } from '@jeesite/core/components/Application';
  import { MenuModeEnum, MenuSplitTyeEnum } from '@jeesite/core/enums/menuEnum';
  import { useHeaderSetting } from '@jeesite/core/hooks/setting/useHeaderSetting';
  import { useMenuSetting } from '@jeesite/core/hooks/setting/useMenuSetting';
  import { useRootSetting } from '@jeesite/core/hooks/setting/useRootSetting';
  import { useAppInject } from '@jeesite/core/hooks/web/useAppInject';
  import { useDesign } from '@jeesite/core/hooks/web/useDesign';
  import { usePermission } from '@jeesite/core/hooks/web/usePermission';
  import { useLocale } from '@jeesite/core/locales/useLocale';
  import { useUserStore } from '@jeesite/core/store/modules/user';
  import { onMountedOrActivated } from '@jeesite/core/hooks/core/onMountedOrActivated';
  import LayoutMenu from '../menu/index.vue';
  import LayoutTrigger from '../trigger/index.vue';
  import {
    LayoutBreadcrumb,
    FullScreen,
    ErrorAction,
    UserDropDown,
  } from './components';

  export default defineComponent({
    name: 'LayoutHeader',
    components: {
      ALayoutHeader: Layout.Header,
      AppLogo,
      LayoutTrigger,
      LayoutBreadcrumb,
      LayoutMenu,
      FullScreen,
      ErrorAction,
      UserDropDown,
    },
    props: {
      fixed: propTypes.bool,
    },
    setup(props) {
      const { prefixCls } = useDesign('layout-header');
      // 增加延迟，修复Safari下首次加载顶部菜单重叠问题。
      const getIsInitMenu = ref<boolean>(false);
      onMountedOrActivated(() => {
        setTimeout(() => {
          getIsInitMenu.value = true;
        }, 100);
      });
      const { getShowTopMenu, getShowHeaderTrigger, getSplit, getIsMixMode, getMenuWidth, getIsMixSidebar } =
        useMenuSetting();
      const { getUseErrorHandle } = useRootSetting();

      const {
        getHeaderTheme,
        getShowFullScreen,
        getShowContent,
        getShowBread,
        getShowHeaderLogo,
        getShowHeader,
      } = useHeaderSetting();

      const { getShowLocalePicker } = useLocale();

      const { getIsMobile } = useAppInject();

      const getHeaderClass = computed(() => {
        const theme = unref(getHeaderTheme);
        return [
          prefixCls,
          {
            [`${prefixCls}--fixed`]: props.fixed,
            [`${prefixCls}--mobile`]: unref(getIsMobile),
            [`${prefixCls}--${theme}`]: theme,
          },
        ];
      });

      const getUseCorpModel = computed(() => {
        const userStore = useUserStore();
        const { hasPermission } = usePermission();
        return userStore.getPageCacheByKey('useCorpModel', false) && hasPermission('sys:corpAdmin:edit');
      });

      const getLogoWidth = computed(() => {
        if (!unref(getIsMixMode) || unref(getIsMobile)) {
          return {};
        }
        const width = unref(getMenuWidth) < 180 ? 180 : unref(getMenuWidth);
        return { minWidth: `${width}px` };
      });

      const getSplitType = computed(() => {
        return unref(getSplit) ? MenuSplitTyeEnum.TOP : MenuSplitTyeEnum.NONE;
      });

      const getMenuMode = computed(() => {
        return unref(getSplit) ? MenuModeEnum.HORIZONTAL : null;
      });

      return {
        prefixCls,
        getHeaderClass,
        getShowHeaderLogo,
        getHeaderTheme,
        getShowHeaderTrigger,
        getIsMobile,
        getShowBread,
        getShowContent,
        getSplitType,
        getSplit,
        getMenuMode,
        getIsInitMenu,
        getShowTopMenu,
        getShowLocalePicker,
        getShowFullScreen,
        getUseErrorHandle,
        getLogoWidth,
        getIsMixSidebar,
        getUseCorpModel,
      };
    },
  });
</script>
<style lang="less">
  @import './index.less';
</style>
