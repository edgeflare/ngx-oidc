import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { UserManagerSettings } from 'oidc-client-ts';
import { initOidc, OIDC_ROUTES } from '@edgeflare/ngx-oidc';

const oidcConfig: UserManagerSettings = {
  authority: "http://127.0.0.1:5556/dex",
  client_id: "public-webui",
  redirect_uri: "http://localhost:4200/signin/callback",
  response_type: "code",
  scope: "openid profile email offline_access audience:server:client_id:oauth2-proxy", // some extra scopes for Dex
  post_logout_redirect_uri: "http://localhost:4200/signout/callback",
  automaticSilentRenew: true,
  silentRequestTimeoutInSeconds: 30,
  silent_redirect_uri: "http://localhost:4200/silent-refresh-callback.html",
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
