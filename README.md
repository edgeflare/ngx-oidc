# [oidc-client-ts](https://github.com/authts/oidc-client-ts) wrapper for Angular and Capacitor

![signin demo](https://raw.githubusercontent.com/edgeflare/ngx-oidc/main/demo.gif?raw=true)

## 1. Install
```shell
npm install oidc-client-ts @edgeflare/ngx-oidc
```

## 2. Configure Angular
Update `<approot>/src/app/app.config.ts`. The [example](https://github.com/edgeflare/ngx-oidc/tree/main/example) directory includes a minimal app.

```ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter, Route } from '@angular/router';
import { UserManagerSettings } from 'oidc-client-ts';
import { initOidc, OIDC_ROUTES } from '@edgeflare/ngx-oidc';

// Define OIDC configuration
const oidcConfig: UserManagerSettings = {
  authority: "http://127.0.0.1:5556/dex",
  client_id: "public-webui",
  redirect_uri: "http://localhost:4200/signin/callback",
  response_type: "code",
  scope: "openid profile email offline_access audience:server:client_id:oauth2-proxy", // extra scopes for Dex
  post_logout_redirect_uri: "http://localhost:4200/signout/callback",
  automaticSilentRenew: true,
  silentRequestTimeoutInSeconds: 30,
  silent_redirect_uri: "http://localhost:4200/silent-refresh-callback.html",
};

// Provide OIDC configuration and routes in the application configuration
export const appConfig: ApplicationConfig = {
  providers: [
    // other providers
    ...initOidc(oidcConfig),
    provideRouter(OIDC_ROUTES), // before application routes
    provideRouter(routes)
    // more providers
  ],
};
```

**For [Capacitor](https://github.com/ionic-team/capacitor) based native mobile apps**

```sh
npm install @capacitor/core oidc-client-ts @edgeflare/ngx-oidc @edgeflare/ngx-oidc-capacitor
```

```ts
import { UserManagerSettings, WebStorageStateStore } from 'oidc-client-ts';
import { initOidc, OIDC_ROUTES, CapacitorStateStore } from '@edgeflare/ngx-oidc-capacitor';
import { Capacitor } from '@capacitor/core';

const oidcConfig: UserManagerSettings | any = {
  // Android requires issuer/authority endpoint to be HTTPS
  authority: 'https://iam.example.org', // https://keycloak.example.org/realms/<realmname>
  client_id: 'public-webui',
  redirect_uri: Capacitor.isNativePlatform()
    ? 'org.example.capdemo://signin/callback'
    : `${window.location.origin}/signin/callback`,
  post_logout_redirect_uri: Capacitor.isNativePlatform()
    ? 'org.example.capdemo://signout/callback'
    : `${window.location.origin}/signout/callback`,
  response_type: 'code',
  scope: 'openid profile email offline_access audience:server:client_id:oauth2-proxy',
  automaticSilentRenew: true,
  // Use the appropriate storage based on platform
  userStore: Capacitor.isNativePlatform()
    ? new CapacitorStateStore() // consider github.com/martinkasa/capacitor-secure-storage-plugin for sensitive (eg banking) apps
    : new WebStorageStateStore({
      store: window.localStorage
    }),
  loadUserInfo: true,
};
```

If using Capacitor, ensure all imports are from `@edgeflare/ngx-oidc-capacitor`, instead of `@edgeflare/ngx-oidc`. See [example-capacitor](./example-capacitor) app.

*Providing* `OIDC_ROUTES` registers below routes:

- `/signin/{callback,error,''}`
- `/signout/callback`
- `/oidc-profile`, protected by an `authGuard` supplied with `ngx-oidc`

See `signinRedirect`, `signinPopup` etc examples at [http://localhost:4200/signin](http://localhost:4200/signin). It additionally provides `user` and `isAuthenticated` signals; which can be called like `user()` to get the current user, and `isAuthenticated()` to check if the user is authenticated.

The routes can be registered on parent routes other root `/`, with ngx-oidc supplied components or your own.

```ts
const myOidcRoutes: Route[] = [
  // signin is now at /account/signin
  { path: 'account', loadChildren: () => import("@edgeflare/ngx-oidc").then((m) => m.OIDC_ROUTES)},
  // Or just the only required route. must match the `redirect_uri` in oidcConfig
  { path: 'signin-callback', loadComponent: () => import("@edgeflare/ngx-oidc").then((m) => m.SigninCallbackComponent)},
];

// ...
export const appConfig: ApplicationConfig = {
  providers: [
    ...initOidc(oidcConfig),
    provideRouter(myOidcRoutes),
  ],
};
```

## Features
- [x] signinRedirect, signinPopup, signoutRedirect, signoutPopup
- [x] authGuard using canActivateFn
- [x] [Capactior](https://github.com/ionic-team/capacitor) support for native mobile apps

## Contributing / Development

With ~200 lines of code ngx-oidc doesn't really do much except calling oidc-client-ts functions. It sets up and exposes oidc-client-ts' [UserManager](https://authts.github.io/oidc-client-ts/classes/UserManager.html) functions through an Angular service, AuthService. The function signatures used in this service are the same as those provided by `oidc-client-ts` *e.g.*:

- `signinRedirect(args?: SigninRedirectArgs): Promise<void>`
- `signinPopup(args?: SigninPopupArgs): Promise<User>`
- `signinSilent(args?: SigninSilentArgs): Promise<null | User>`

For advanced usage, access the underlying oidc-client-ts' UserManager instance with `AuthService.userManagerInstance`. If you wanna make it better, please do! Fork the repo, make your changes, and submit a PR.

```sh
npx ng build ngx-oidc
npx ng build ngx-oidc-capacitor
```

## License
Apache License 2.0
