import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { of } from 'rxjs';

/**
 * Angular route guard function that checks if the user is authenticated.
 * If authenticated, allows access to the route. Otherwise, redirects to the login page.
 *
 * @param route - The activated route snapshot.
 * @param state - The router state snapshot.
 * @returns An Observable emitting true if the user is authenticated, false otherwise.
 */
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    return of(true);
  } else {
    authService.setAuthGuardInterceptedPathname(state.url);
    authService.signinRedirect();
    return of(false);
  }
};
