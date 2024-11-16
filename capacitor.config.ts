import type { CapacitorConfig } from '@capacitor/cli';

import * as fs from 'fs';
const pckg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

const config: CapacitorConfig = {
  appId: pckg.appId,
  appName: pckg.title,
  webDir: pckg.clientPath,
};

console.log('deep capacitor:', config);

/*
// @ts-ignore
config.electron = {
  // Custom scheme for your app to be served on in the electron window.
  // customUrlScheme: 'capacitor-electron',
  // Switch on/off a tray icon and menu, which is customizable in the app.
  // trayIconAndMenuEnabled: false,
  // Switch on/off whether or not a splashscreen will be used.
  // splashScreenEnabled: false,
  // Custom image name in the electron/assets folder to use as splash image (.gif included)
  // splashScreenImageName: 'splash.png',
  // Switch on/off if the main window should be hidden until brought to the front by the tray menu, etc.
  // hideMainWindowOnLaunch: false,
  // Switch on/off whether or not to use deeplinking in your app.
  deepLinkingEnabled: true,
  // Custom protocol to be used with deeplinking for your app.
  deepLinkingCustomProtocol: 'deep',
};
*/

export default config;
