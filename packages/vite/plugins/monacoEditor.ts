/**
 * Copyright (c) 2013-Now http://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
 */
import type { PluginOption } from 'vite';
// @ts-ignore
import monacoEditorPluginModule from 'vite-plugin-monaco-editor';

export function configMonacoEditorPlugin(): PluginOption {
  // 处理不同版本的 vite-plugin-monaco-editor 导出方式
  // 尝试多种可能的导出结构
  let plugin: any = monacoEditorPluginModule;
  
  // 如果直接是函数，直接使用
  if (typeof plugin === 'function') {
    return plugin({
      languageWorkers: ['editorWorkerService', 'json', 'html'],
      customDistPath: (root, buildOutDir) => `${buildOutDir}/monaco`,
      publicPath: 'monaco',
    });
  }
  
  // 尝试访问 default 属性
  if (plugin && plugin.default) {
    if (typeof plugin.default === 'function') {
      plugin = plugin.default;
    } else if (plugin.default.default && typeof plugin.default.default === 'function') {
      // 处理嵌套的 default
      plugin = plugin.default.default;
    }
  }
  
  // 最终检查
  if (typeof plugin !== 'function') {
    throw new Error(
      `vite-plugin-monaco-editor: Unable to resolve plugin function. ` +
      `Module structure: ${JSON.stringify(Object.keys(plugin || {}))}`
    );
  }
  
  return plugin({
    languageWorkers: ['editorWorkerService', 'json', 'html'],
    customDistPath: (root, buildOutDir) => `${buildOutDir}/monaco`,
    publicPath: 'monaco',
  });
}
