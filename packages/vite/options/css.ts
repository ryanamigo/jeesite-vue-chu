/**
 * Copyright (c) 2013-Now http://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
 */
import type { CSSOptions } from 'vite';
import { generateModifyVars } from '../theme/modifyVars';

export function createCSSOptions(): CSSOptions {
  return {
    preprocessorOptions: {
      less: {
        modifyVars: generateModifyVars(),
        javascriptEnabled: true,
        // 优化 Less 编译性能
        compress: false,
        // 减少编译时间
        math: 'always',
      },
    },
    // 禁用 CSS 源码映射，提高编译速度
    devSourcemap: false,
  };
}
