import { EnvironmentProviders, Provider } from '@angular/core';
import { AuthService, authzTokenInterceptor } from './auth';
import { OIDC_CONFIG_TOKEN } from './oidc-config.token';
import { UserManagerSettings } from 'oidc-client-ts';
import { provideRouter } from '@angular/router';
import { OIDC_ROUTES } from './routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

/**
 * Initializes OpenID Connect (OIDC) configuration for the Angular application.
 *
 * @param oidcConfig - The configuration settings for the OIDC UserManager.
 * @returns An array of providers and environment providers to configure OIDC-related services and routes.
 */
export function initOidc(oidcConfig: UserManagerSettings): (Provider | EnvironmentProviders)[] {
  return [
    {
      provide: OIDC_CONFIG_TOKEN,
      useValue: oidcConfig,
    },
    {
      provide: AuthService,
      useClass: AuthService,
    },
    provideHttpClient(
      withFetch(),
      withInterceptors([authzTokenInterceptor]),
    ),
    provideRouter(OIDC_ROUTES),
  ];
}

/**
 * Initializes the application with asynchronous logic, attempting a silent sign-in.
 *
 * @param authService - The AuthService instance to handle authentication.
 * @returns A function that performs the asynchronous initialization.
 */
export function initializeApp(authService: AuthService): () => Promise<void> {
  return async (): Promise<void> => {
    // any necessary asynchronous initialization logic
    try {
      await authService.signinSilent();
      console.log('Silent sign-in successful');
    } catch (error) {
      console.warn('Silent sign-in failed', error);
    }
  };
}

