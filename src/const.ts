import { description, version } from '../package.json';

export const PLUGIN_NAME = 'LeviOneBot';
export const PLUGIN_VERSION = <[number, number, number]>(
  version.split('.').map((v) => Number(v))
);
export const PLUGIN_DESCRIPTION = description;
export const PLUGIN_EXTRA = { Author: 'student_2333', License: 'Apache-2.0' };

export const BASE_PATH = `./plugins/${PLUGIN_NAME}`;
export const CONFIG_PATH = `${BASE_PATH}/config`;
export const PLUGINS_PATH = `${BASE_PATH}/plugins`;
[BASE_PATH, CONFIG_PATH, PLUGINS_PATH].forEach((x) => {
  if (!file.exists(x)) file.mkdir(x);
});

export const PLUGINS_REQUIRE_PATH = `./${PLUGIN_NAME}/plugins`;

logger.setTitle(PLUGIN_NAME);
