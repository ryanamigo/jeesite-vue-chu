/**
 * Copyright (c) 2013-Now http://jeesite.com All rights reserved.
 * No deletion without permission, or be held responsible to law.
 * @author ThinkGem
 */
import type { PluginOption } from 'vite';
import monacoEditorPlugin from 'vite-plugin-monaco-editor'; // 已默认导出插件函数

export function configMonacoEditorPlugin(): PluginOption {
  // 直接调用插件函数，去掉多余的 .default
  return monacoEditorPlugin({
    languageWorkers: ['editorWorkerService', 'json', 'html'],
    customDistPath: (root, buildOutDir) => `${buildOutDir}/monaco`,
    publicPath: 'monaco',
  });
}