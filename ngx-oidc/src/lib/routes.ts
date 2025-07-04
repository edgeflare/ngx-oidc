import { Route } from '@angular/router';
import { authGuard } from './auth';

export const OIDC_ROUTES: Route[] = [
  /**
   * Only the `signin/callback` is REQUIRED for handling the response from OIDC provider after the user logs in
   * Use the SigninCallbackComponent supplied by the library, or create your own component to handle the response
   * See oidc-client-ts doc for more
   */
  {
    path: 'signin',
    children: [
      { path: 'callback', loadComponent: () => import('./components').then(m => m.SigninCallbackComponent) },
      // optional error handling
      { path: 'error', loadComponent: () => import('./components').then(m => m.SigninErrorComponent) },
      // examples of signinRedirect, signinPopup, signoutRedirect, etc
      { path: '', loadComponent: () => import('./components').then(m => m.SigninComponent) },
    ],
  },
  // route that requires authentication using CanActivateFn
  {
    path: 'oidc-profile',
    loadComponent: () => import('./components').then(m => m.AccountComponent),
    canActivate: [authGuard],
  },
  // signout callback
  {
    path: 'signout/callback',
    loadComponent: () => import('./components').then(m => m.SignoutCallbackComponent),
  },
];
