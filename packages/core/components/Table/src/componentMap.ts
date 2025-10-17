import type { Component } from 'vue';
import type { ComponentType } from './types/componentType';
import { Input, Checkbox, InputNumber, Switch, DatePicker, TimePicker, AutoComplete } from 'ant-design-vue';

import { Select, TreeSelect, RadioButtonGroup, RadioGroup, CheckboxGroup } from '@jeesite/core/components/Form';
import { ListSelect } from '@jeesite/core/components/ListSelect';
import { BasicUpload } from '@jeesite/core/components/Upload';

const componentMap = new Map<ComponentType, Component>();

componentMap.set('Input', Input);
componentMap.set('InputTextArea', Input.TextArea);
componentMap.set('InputNumber', InputNumber);

componentMap.set('Select', Select);
componentMap.set('TreeSelect', TreeSelect);
componentMap.set('ListSelect', ListSelect);
componentMap.set('RadioButtonGroup', RadioButtonGroup);
componentMap.set('RadioGroup', RadioGroup);
componentMap.set('CheckboxGroup', CheckboxGroup);
componentMap.set('Upload', BasicUpload);

componentMap.set('Switch', Switch);
componentMap.set('Checkbox', Checkbox);
componentMap.set('DatePicker', DatePicker);
componentMap.set('TimePicker', TimePicker);
componentMap.set('AutoComplete', AutoComplete);

export function add(compName: ComponentType, component: Component) {
  componentMap.set(compName, component);
}

export function del(compName: ComponentType) {
  componentMap.delete(compName);
}

export { componentMap };
