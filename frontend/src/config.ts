// Capacitor is optional - only used for native apps
let Capacitor = {
  isNativePlatform: () => false,
  getPlatform: () => 'web'
};

export const config = {
  appName: 'Sentinel',
  version: '1.0.0',
  apiBaseUrl: import.meta.env.VITE_API_URL || '/api/v1',
  wsUrl: import.meta.env.VITE_WS_URL || `ws://${window.location.host}/api/v1/ws`,
  isNative: Capacitor.isNativePlatform(),
  platform: Capacitor.getPlatform(),
};

export default config;
