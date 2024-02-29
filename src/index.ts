/// <reference path="../../HelperLib/src/index.d.ts"/>

import './polyfill';

import './config';

import './command';

import { resetConnections } from './adapter';

export * from 'cosmokit';
export { default as Schema } from 'schemastery';

export { ConfigManager } from './config';
export * from './message';
export * from './utils';

mc.listen('onServerStarted', () => {
  resetConnections();
});
