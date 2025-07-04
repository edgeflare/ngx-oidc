# [oidc-client-ts](https://github.com/authts/oidc-client-ts) wrapper for Angular and Capacitor

1. Ensure dependencies
- system: Java, Gradle, Android Studio, Xcode (See https://capacitorjs.com/docs/getting-started)
- node modules

```sh
npm install oidc-client-ts @edgeflare/ngx-oidc @edgeflare/ngx-oidc-capacitor \
  @capacitor/android @capacitor/app @capacitor/browser @capacitor/core \
  @capacitor/ios @capacitor/preferences

npm install --save-dev @capacitor/cli
```

2. Generate `capacitor.config.ts`

```sh
cat <<EOF > capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.example.capdemo',
  appName: 'CapDemo',
  webDir: 'dist/example-capacitor/browser',
  server: {
    iosScheme: 'https',
    androidScheme: 'https',
    // // for dev (hot reload)
    // url: 'http://192.168.0.144:4200',
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
EOF
```

3. Add Android and iOS projects

```sh
npx cap add android
npx cap add ios
```

4. Update deeplink in generated config files
- [android/app/src/main/AndroidManifest.xml](./_android/app/src/main/AndroidManifest.xml)
- [android/app/src/main/res/values/strings.xml](./_android/app/src/main/res/values/strings.xml)
- [ios/App/App/Info.plist](./_ios/App/App/Info.plist)

5. Build Angular app

```sh
npx ng build --project example-capacitor
```

6. Sync built artifacts with iOS and Android projects

```sh
npx cap sync
```

7. Run app in iOS and Android emulators

```sh
npx cap run ios
npx can run android
```
