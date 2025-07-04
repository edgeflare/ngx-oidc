import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.example.capdemo',
  appName: 'CapDemo',
  webDir: 'dist/example-capacitor/browser',
  server: {
    iosScheme: 'https',
    androidScheme: 'https',
    // // for dev (hot reload)
    // url: 'http://192.168.0.113:4200',
    // cleartext: true
    // // env only
  },
  plugins: {
    App: {
      customUrlScheme: 'org.example.capdemo',
    },
    Preferences: {},
  },
  ios: {
    contentInset: 'always'
  },
};

export default config;
