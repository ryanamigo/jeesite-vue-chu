import type { FormProps, FormActionType, UseFormReturnType, FormSchema } from '../types/form';
import type { NamePath } from 'ant-design-vue/lib/form/interface';
import type { DynamicProps } from '@jeesite/types/utils';
import { ref, onUnmounted, unref, nextTick, watch } from 'vue';
import { isProdMode } from '@jeesite/core/utils/env';
import { error } from '@jeesite/core/utils/log';
import { getDynamicProps } from '@jeesite/core/utils';

export declare type ValidateFields = (nameList?: NamePath[]) => Promise<Recordable>;

type Props<T> = Partial<DynamicProps<FormProps<T>>>;

export function useForm<T = Recordable>(props?: Props<T>): UseFormReturnType {
  const formRef = ref<Nullable<FormActionType>>(null);
  const loadedRef = ref<Nullable<boolean>>(false);

  async function getForm() {
    const form = unref(formRef);
    if (!form) {
      error(
        'The form instance has not been obtained, please make sure that the form has been rendered when performing the form operation!',
      );
    }
    await nextTick();
    return form as FormActionType;
  }

  function register(instance: FormActionType) {
    isProdMode() &&
      onUnmounted(() => {
        formRef.value = null;
        loadedRef.value = null;
      });
    if (unref(loadedRef) && isProdMode() && instance === unref(formRef)) return;

    formRef.value = instance;
    loadedRef.value = true;

    watch(
      () => props,
      () => {
        props && instance.setProps(getDynamicProps(props));
      },
      {
        immediate: true,
        deep: true,
      },
    );
  }

  const methods: FormActionType = {
    setProps: async (formProps: Partial<FormProps>) => {
      const form = await getForm();
      await form.setProps(formProps);
    },

    updateSchema: async (data: Partial<FormSchema> | Partial<FormSchema>[]) => {
      const form = await getForm();
      await form.updateSchema(data);
    },

    resetSchema: async (data: Partial<FormSchema> | Partial<FormSchema>[]) => {
      const form = await getForm();
      await form.resetSchema(data);
    },

    getFieldsValue: <T = Recordable>() => {
      return unref(formRef)?.getFieldsValue() as T;
    },

    setFieldsValue: async <T extends Recordable>(values: T) => {
      const form = await getForm();
      await form.setFieldsValue(values);
    },

    appendSchemaByField: async (schema: FormSchema, prefixField: string | undefined, first?: boolean) => {
      const form = await getForm();
      await form.appendSchemaByField(schema, prefixField, first);
    },

    removeSchemaByFiled: async (field: string | string[]) => {
      unref(formRef)?.removeSchemaByFiled(field);
    },

    resetFields: async () => {
      const form = await getForm();
      await form.resetFields();
    },

    submit: async (): Promise<any> => {
      const form = await getForm();
      return form.submit();
    },

    validate: async (nameList?: NamePath[]): Promise<Recordable> => {
      const form = await getForm();
      return form.validate(nameList);
    },

    validateFields: async (nameList?: NamePath[]): Promise<Recordable> => {
      const form = await getForm();
      return form.validateFields(nameList);
    },

    clearValidate: async (name?: string | string[]) => {
      const form = await getForm();
      await form.clearValidate(name);
    },

    scrollToField: async (name: NamePath, options?: ScrollOptions | undefined) => {
      const form = await getForm();
      await form.scrollToField(name, options);
    },
  };

  return [register, methods];
}
