<template>
  <LoginFormTitle v-show="getShow" class="enter-x" />
  <Form
    class="enter-x p-4"
    :model="formData"
    :rules="getFormRules"
    ref="formRef"
    v-show="getShow"
    @keypress.enter="handleLogin"
  >
    <div class="mb-5"></div>
    <FormItem name="account" class="enter-x login-form-item">
      <div class="login-input-group">
        <span class="login-form-label">{{ t('sys.login.account') }}：</span>
        <Input
          size="large"
          v-model:value="formData.account"
          placeholder="登录账号"
          class="fix-auto-fill"
        />
      </div>
    </FormItem>
    <FormItem name="password" class="enter-x login-form-item">
      <div class="login-input-group">
        <span class="login-form-label">{{ t('sys.login.password') }}：</span>
        <InputPassword
          size="large"
          visibilityToggle
          v-model:value="formData.password"
          placeholder="登录密码"
          autocomplete="off"
        />
      </div>
    </FormItem>
    <FormItem v-if="validCodeRefreshTime" name="validCode" class="enter-x valid-code">
      <ValidCode size="large" v-model:value="formData.validCode" :refreshTime="validCodeRefreshTime" />
    </FormItem>

    <div class="gp" v-if="demoMode">
      💡提示：当前您连接的后端服务，可能是
      <a href="https://vue.jeesite.com" target="_blank">vue.jeesite.com</a><br />
      &nbsp; &nbsp; 的演示服务器，请进入文档：《
      <a
        href="https://jeesite.com/docs/vue-install-deploy/#%E9%85%8D%E7%BD%AE%E5%90%8E%E7%AB%AF%E6%8E%A5%E5%8F%A3"
        target="_blank"
      >
        配置服务端接口
      </a>
      》
    </div>

    <ARow class="enter-x">
      <ACol :span="12">
        <FormItem>
          <!-- No logic, you need to deal with it yourself -->
          <Checkbox v-model:checked="rememberMe" size="small">
            {{ t('sys.login.rememberMe') }}
          </Checkbox>
        </FormItem>
      </ACol>
      <ACol :span="12">
        <FormItem :style="{ 'text-align': 'right' }">
          <!-- No logic, you need to deal with it yourself -->
          <Button type="link" size="small" @click="setLoginState(LoginStateEnum.RESET_PASSWORD)">
            {{ t('sys.login.forgetPassword') }}
          </Button>
        </FormItem>
      </ACol>
    </ARow>

    <FormItem class="enter-x">
      <Button type="primary" size="large" block @click="handleLogin" :loading="loading">
        {{ t('sys.login.loginButton') }}
      </Button>
    </FormItem>
  </Form>
</template>
<script lang="ts" setup>
  import { reactive, ref, toRaw, unref, computed, onMounted } from 'vue';

  import { Checkbox, Form, Input, Row, Col, Button, message } from 'ant-design-vue';
  import LoginFormTitle from './LoginFormTitle.vue';

  import { useI18n } from '@jeesite/core/hooks/web/useI18n';
  import { useMessage } from '@jeesite/core/hooks/web/useMessage';

  import { useUserStore } from '@jeesite/core/store/modules/user';
  import { LoginStateEnum, useLoginState, useFormRules, useFormValid } from './useLogin';
  import { useDesign } from '@jeesite/core/hooks/web/useDesign';
  import { useGlobSetting } from '@jeesite/core/hooks/setting';
  import { userInfoApi } from '@jeesite/core/api/sys/login';
  // import { onKeyStroke } from '@vueuse/core';
  import { ValidCode } from '@jeesite/core/components/ValidCode';

  const ACol = Col;
  const ARow = Row;
  const FormItem = Form.Item;
  const InputPassword = Input.Password;
  const { t } = useI18n();
  const { showMessage, notification } = useMessage();
  const { prefixCls } = useDesign('login');
  const { ctxPath } = useGlobSetting();
  const userStore = useUserStore();

  const { setLoginState, getLoginState } = useLoginState();

  const formRef = ref();
  const loading = ref(false);
  const rememberMe = ref(false);
  const validCodeRefreshTime = ref(0);
  const demoMode = ref(false);

  const emit = defineEmits(['demoMode']);

  const formData = reactive({
    account: 'system',
    password: '',
    validCode: '',
  });

  const { getFormRules } = useFormRules(formData);
  const { validForm } = useFormValid(formRef);

  //onKeyStroke('Enter', handleLogin);

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN);

  onMounted(async () => {
    setTimeout(() => message.destroy());
    try {
      const res = await userInfoApi('none');
      if (res.result == 'true') {
        // 如果已经登录，根据业务需要，是否自动跳转到系统首页
        await userStore.afterLoginAction(res, true);
        return;
      }
      userStore.initPageCache(res);
      demoMode.value = res.demoMode || false;
      emit('demoMode', demoMode.value);
      if (res.isValidCodeLogin) {
        validCodeRefreshTime.value = new Date().getTime();
      }
    } catch (error: any) {
      const err: string = error?.toString?.() ?? '';
      if (error?.code === 'ECONNABORTED' && err.indexOf('timeout of') !== -1) {
        showMessage(t('sys.api.apiTimeoutMessage'));
      } else if (err.indexOf('Network Error') !== -1) {
        showMessage(t('sys.api.networkExceptionMsg'));
      } else if (error?.code === 'ERR_BAD_RESPONSE') {
        showMessage(t('sys.api.apiRequestFailed'));
      }
      console.log(error);
    }
  });

  async function handleLogin() {
    try {
      const data = await validForm();
      if (!data) return;
      loading.value = true;
      const res = await userStore.login(
        toRaw({
          password: data.password,
          username: data.account,
          validCode: data.validCode,
          rememberMe: unref(rememberMe.value),
        }),
      );
      if (res.isValidCodeLogin) {
        validCodeRefreshTime.value = new Date().getTime();
      }
      if (res.result === 'true') {
        notification.success({
          message: t('sys.login.loginSuccessTitle'),
          description: `${t('sys.login.loginSuccessDesc')}: ${res.user.userName}`,
          duration: 1,
        });
      }
    } catch (error: any) {
      const err: string = error?.toString?.() ?? '';
      if (error?.code === 'ECONNABORTED' && err.indexOf('timeout of') !== -1) {
        showMessage(t('sys.api.apiTimeoutMessage'));
      } else if (err.indexOf('Network Error') !== -1) {
        showMessage(t('sys.api.networkExceptionMsg'));
      } else if (error?.code === 'ERR_BAD_RESPONSE') {
        showMessage(t('sys.api.apiRequestFailed'));
      }
      console.log(error);
    } finally {
      loading.value = false;
    }
  }

</script>
<style>
  .gp {
    padding-bottom: 15px;
    font-size: 16px;
  }

  .gp,
  .gp a {
    color: #d21919;
  }

  .login-form-item {
    width: 100%;
  }

  .login-input-group {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .login-form-label {
    color: #fff;
    font-size: 16px;
    min-width: 48px;
  }

  .login-input-group .ant-input,
  .login-input-group .ant-input-affix-wrapper {
    flex: 1;
  }

  .login-input-group .ant-input-affix-wrapper .ant-input {
    flex: 1;
  }
</style>
