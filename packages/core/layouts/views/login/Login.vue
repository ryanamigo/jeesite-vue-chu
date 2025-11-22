<template>
  <div :class="prefixCls" class="relative h-full w-full">
    <AppLocalePicker
      class="enter-x absolute right-3 top-6 text-gray-600"
      :showText="false"
      v-if="!sessionTimeout && showLocale"
    />

    <!-- Logo 区域 -->
    <div class="login-logo">
      <a href="#">
        <b class="login-logo-title">非接触式心理健康监测预警系统</b>
        <small class="login-logo-version"></small>
      </a>
    </div>

    <!-- 左侧背景图 -->
    <div id="backImg2" class="back-img2"></div>

    <!-- 登录框 -->
    <div class="login-box">
      <div class="login-box-body">
        <LoginForm @demo-mode="demoMode = $event" />
        <ForgetPasswordForm :demoMode="demoMode" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import { AppLogo } from '@jeesite/core/components/Application';
  import { AppLocalePicker } from '@jeesite/core/components/Application';
  import LoginForm from './LoginForm.vue';
  import ForgetPasswordForm from './ForgetPasswordForm.vue';
  import { useGlobSetting } from '@jeesite/core/hooks/setting';
  import { useDesign } from '@jeesite/core/hooks/web/useDesign';
  import { useLocaleStore } from '@jeesite/core/store/modules/locale';

  /* import { onMounted } from 'vue';
  import { useMessage } from '@jeesite/core/hooks/web/useMessage';
  const { createConfirm } = useMessage();
  onMounted(() => {
    if (!import.meta.env.DEV) {
      createConfirm({
        content: [
          '<div onclick="window.open(\'https://gitee.com/thinkgem/jeesite-vue\')">',
          '进入 <strong style="color: #FF0036;">JeeSite Vue</strong> 源码仓库页面，',
          '点右上角 <strong style="color: #FF0036;">Star</strong> 加星关注',
          '</div>',
        ].join(''),
        width: 480,
        iconType: 'info',
        maskClosable: false,
        cancelText: '我已 Star',
        okText: '带我去 Star',
        onOk: () => {
          window.open('https://gitee.com/thinkgem/jeesite-vue');
        },
      });
    }
  }); */

  defineProps({
    sessionTimeout: {
      type: Boolean,
    },
  });

  const globSetting = useGlobSetting();
  const { prefixCls } = useDesign('login');
  const localeStore = useLocaleStore();
  const showLocale = localeStore.getShowPicker;
  const title = computed(() => globSetting?.title ?? '');
  const demoMode = ref(false);
</script>
<style lang="less">
  @prefix-cls: ~'jeesite-login';
  @logo-prefix-cls: ~'jeesite-app-logo';
  @countdown-prefix-cls: ~'jeesite-countdown-input';
  @dark-bg: #293146;

  html[data-theme='dark'] {
    .@{prefix-cls} {
      background-color: @dark-bg;

      .ant-input,
      .ant-input-password {
        background-color: #232a3b;
      }

      .ant-btn:not(.ant-btn-link):not(.ant-btn-primary) {
        border: 1px solid #4a5569;
      }

      &-form {
        background: transparent !important;
        box-shadow: none;
      }

      .@{logo-prefix-cls} {
        &__title {
          color: #eee;
        }
      }

      .jeesite-icon {
        color: #fff;
      }
    }

    input.fix-auto-fill,
    .fix-auto-fill input {
      -webkit-text-fill-color: #c9d1d9 !important;
      box-shadow: inherit !important;
    }
  }

  .@{prefix-cls} {
    min-height: 100%;
    overflow: hidden;

    // Logo 区域样式
    .login-logo {
      position: absolute;
      top: 18%;
      left: 20%;
      z-index: 10;

      .login-logo-title {
        position: fixed;
        left: 8%;
        top: 15%;
        color: #00b7ee;
        font-size: 69px;
        font-weight: bold;
      }

      .login-logo-version {
        color: #00b7ee;
      }
    }

    // 左侧背景图
    #backImg2 {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      width: 55%;
      height: 55%;
      margin: 13% 0 0 5%;
      background-image: url('@jeesite/assets/images/login/login2.png');
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
      background-color: transparent;
      position: relative;
    }

    // 登录框样式
    .login-box {
      position: fixed;
      top: 10%;
      left: 50%;
      height: 80%;
      width: 55%;
      background-image: url('@jeesite/assets/images/login/login_box.png');
      background-size: contain;
      background-position: center;
      background-repeat: no-repeat;
      padding: 20px;
      color: #FFFFFF;
      z-index: 10;

      .login-box-body {
        background-color: rgba(170, 187, 215, 0);
        margin: 22% 0 0 37%;
        width:30%;

        h2 {
          color: #fff;
        }
      }
    }

    &-form {
      background-color: transparent;
      box-shadow: none;

      .ant-form-item {
        margin-bottom: 15px;
      }
    }

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url('@jeesite/assets/images/login/login.png');
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
      content: '';
      z-index: 0;
    }



    input:not([type='checkbox']) {
      min-width: 200px;
      border-radius: 0 !important;

      @media (max-width: @screen-xl) {
        min-width: 280px;
      }

      @media (max-width: @screen-lg) {
        min-width: 240px;
      }

      @media (max-width: @screen-md) {
        min-width: 240px;
      }

      @media (max-width: @screen-sm) {
        min-width: 160px;
      }
    }

    .ant-input,
    .ant-input-password .ant-input {
      border-radius: 0 !important;
    }

    .valid-code input {
      min-width: auto;
    }

    .@{countdown-prefix-cls} input {
      min-width: unset;
    }

    .ant-divider-inner-text {
      font-size: 14px;
      color: @text-color-secondary;
    }

    // 按钮样式（对应原 HTML 的 .skin-dark .btn-primary）
    .ant-btn-primary {
      background-color: #054d81 !important;
      border-color: #054d81 !important;
      color: #fff !important;
    }

    // 响应式处理
    @media (max-width: @screen-lg) {
      .login-logo {
        .login-logo-title {
          font-size: 40px;
        }
      }

      #backImg2 {
        width: 100%;
        height: 50%;
        margin: 5% 0 0 0;
      }

      .login-box {
        position: relative;
        top: auto;
        margin: 20px auto;
        height: auto;
        width: 90%;
        max-width: 400px;
        transform: none;
      }
    }
  }
</style>
