import type { GlobEnvConfig } from '@jeesite/types/config';

import { warn, env } from '@jeesite/core/utils/log';
import { version } from '../package.json';
import { getEnvConfigName } from '@jeesite/vite/config/getEnvConfigName';

export function getCommonStoragePrefix() {
  const { VITE_GLOB_APP_SHORT_NAME } = getAppEnvConfig();
  return `${VITE_GLOB_APP_SHORT_NAME}__${getEnv()}`.toUpperCase();
}

// Generate cache key according to version
export function getStorageShortName() {
  return `${getCommonStoragePrefix().replace(/\s/g, '_')}${`__${version}`}__`.toUpperCase();
}

export function getAppEnvConfig() {
  const ENV_CONFIG_NAME = getEnvConfigName(env);
  const ENV = (env.DEV
    ? (env as unknown as GlobEnvConfig)
    : window[ENV_CONFIG_NAME as any]) as unknown as GlobEnvConfig;

  if (!/^[a-zA-Z_]*$/.test(ENV.VITE_GLOB_APP_SHORT_NAME)) {
    warn(
      `VITE_GLOB_APP_SHORT_NAME Variables can only be characters/underscores, please modify in the environment variables and re-running.`,
    );
  }

  return ENV;
}

/**
 * @description: Development mode
 */
export const devMode = 'development';

/**
 * @description: Production mode
 */
export const prodMode = 'production';

/**
 * @description: Get environment mode
 */
export function getEnv(): string {
  return env.MODE;
}

/**
 * @description: Is it a development mode
 */
export function isDevMode(): boolean {
  return env.DEV;
}

/**
 * @description: Is it a production mode
 */
export function isProdMode(): boolean {
  return env.PROD;
}

/**
 * @description: VITE_PUBLIC_PATH
 */
function getPublicPath(): string {
  const publicPath = env.VITE_PUBLIC_PATH || '';
  return publicPath == '/' ? '' : publicPath;
}

export const publicPath = getPublicPath();
