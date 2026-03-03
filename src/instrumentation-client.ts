import { retrieveLaunchParams } from '@tma.js/sdk-react';
import { init } from './core/init';
import { mockEnv } from './mockEnv';

mockEnv().then(() => {
  try {
    const launchParams = retrieveLaunchParams();
    const { tgWebAppPlatform: platform } = launchParams;
    const debug =
      (launchParams.tgWebAppStartParam || '').includes('debug') ||
      process.env.NODE_ENV === 'development';

    init({
      debug,
      eruda: debug && ['ios', 'android'].includes(platform),
      mockForMacOS: platform === 'macos',
    });
  } catch (e) {
    console.log(e);
  }
});
