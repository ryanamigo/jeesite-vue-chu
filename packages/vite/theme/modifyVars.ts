/**
 * Copyright (c) 2013-Now http://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
 */
import { generateAntColors, primaryColor, darkPrimaryColor } from './themeConfig';
// import { getThemeVariables } from 'ant-design-vue/dist/theme';

import { theme } from 'ant-design-vue';
import convertLegacyToken from 'ant-design-vue/lib/theme/convertLegacyToken';

/**
 * less global variable
 */
export function generateModifyVars(dark = false) {
  const palettes = generateAntColors(primaryColor);
  const primary = dark ? darkPrimaryColor : palettes[5];

  // const primaryColorObj: Record<string, string> = {};
  // for (let index = 0; index < 10; index++) {
  //   primaryColorObj[`primary-${index + 1}`] = palettes[index];
  // }

  // const modifyVars = getThemeVariables({ dark: false });
  const { darkAlgorithm, defaultAlgorithm, defaultSeed } = theme;
  const mapToken = dark ? darkAlgorithm(defaultSeed) : defaultAlgorithm(defaultSeed);
  
  // 处理 convertLegacyToken 的不同导出方式
  let convertFn: any = convertLegacyToken;
  
  // 尝试多种可能的导出结构
  if (typeof convertFn === 'function') {
    // 直接是函数，无需处理
  } else if (convertFn && typeof convertFn.default === 'function') {
    convertFn = convertFn.default;
  } else if (convertFn && convertFn.default && typeof convertFn.default.default === 'function') {
    convertFn = convertFn.default.default;
  } else if (typeof convertFn !== 'function') {
    throw new Error(
      `convertLegacyToken: Unable to resolve function. ` +
      `Module structure: ${JSON.stringify(Object.keys(convertFn || {}))}`
    );
  }
  
  const modifyVars = convertFn(mapToken);
  // !!dark && console.log('modifyVars', dark, modifyVars);

  return {
    ...modifyVars,
    // Used for global import to avoid the need to import each style file separately
    // reference:  Avoid repeated references
    // hack: `${modifyVars.hack} @import (reference) "${__dirname + '/../../core/design/var/index.less'}";`,
    hack: `true; @import (reference) "${__dirname + '/../../core/design/var/index.less'}";`,
    // ...primaryColorObj,
    'primary-color': primary,
    'link-color': primary,
    'info-color': primary,
    // 'processing-color': primary,
    // 'success-color': '#55D187', //  Success color
    // 'error-color': '#ED6F6F', //  False color
    // 'warning-color': '#EFBD47', //   Warning color
    // 'font-size-base': '14px', //  Main font size
    // 'border-radius-base': '2px', //  Component/float fillet
    // 'content-bg-striped': '#fafafa',
  };
}
