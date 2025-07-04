/*
 * Public API Surface of ngx-oidc-capacitor
 */

export {
  OIDC_CONFIG_TOKEN,
  initOidc,
  authGuard,
  authzTokenInterceptor,
  AccountComponent,
  SigninErrorComponent
} from '@edgeflare/ngx-oidc';

export { CapacitorAuthService as AuthService } from './lib/auth-service';
export { CapacitorStateStore } from './lib/capacitor-state-store';
export { OIDC_ROUTES } from './lib/routes';
