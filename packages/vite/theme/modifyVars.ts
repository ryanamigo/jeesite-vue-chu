/**
 * Copyright (c) 2013-Now http://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
 */
import { generateAntColors, primaryColor, darkPrimaryColor } from './themeConfig';
import { theme } from 'ant-design-vue';
// 导入 convertLegacyToken（默认导出的函数）
import convertLegacyToken from 'ant-design-vue/lib/theme/convertLegacyToken';

/**
 * less global variable
 */
export function generateModifyVars(dark = false) {
  const palettes = generateAntColors(primaryColor);
  const primary = dark ? darkPrimaryColor : palettes[5];

  const { darkAlgorithm, defaultAlgorithm, defaultSeed } = theme;
  const mapToken = dark ? darkAlgorithm(defaultSeed) : defaultAlgorithm(defaultSeed);
  
  // 修正：直接调用 convertLegacyToken 函数，去掉多余的 .default
  const modifyVars = convertLegacyToken(mapToken);  // 核心修正行

  return {
    ...modifyVars,
    hack: `true; @import (reference) "${__dirname + '/../../core/design/var/index.less'}";`,
    'primary-color': primary,
    'link-color': primary,
    'info-color': primary,
  };
}