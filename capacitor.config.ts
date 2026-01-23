import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.urbanauto.app',
  appName: 'Urban Auto',
  webDir: 'out',
  server: {
    url: 'https://app-preview-ua.vercel.app',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
