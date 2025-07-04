import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

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

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    ...initOidc(oidcConfig),
    provideRouter(OIDC_ROUTES), // before application routes
    provideRouter(routes)
  ]
};
