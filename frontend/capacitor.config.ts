import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.coffeepanorama.app',
  appName: 'SCE Manager',
  webDir: 'dist/mobile',
  server: {
    androidScheme: 'https'
  }
};

export default config;