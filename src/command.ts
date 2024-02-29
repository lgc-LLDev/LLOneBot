import { resetConnections } from './adapter';
import { manager } from './config';
import { PLUGIN_NAME } from './const';
import { formatError } from './utils';

mc.listen('onServerStarted', () => {
  const cmd = mc.newCommand('llob', PLUGIN_NAME, PermType.Console);

  type ResReload = { enumReload: 'reload' };
  cmd.setEnum('enumReload', ['reload']);
  cmd.mandatory('enumReload', ParamType.Enum, 'enumReload', 1);
  cmd.overload(['enumReload']);

  type Res = ResReload;

  cmd.setCallback((_, __, out, res: Res) => {
    if ('enumReload' in res && res.enumReload) {
      try {
        manager.reload();
        resetConnections();
      } catch (e) {
        out.error(formatError(e));
        return;
      }
      out.success('Successfully reloaded config');
      logger.info(JSON.stringify(manager.config)); // TODO: test, remove
    }
  });

  cmd.setup();
});
