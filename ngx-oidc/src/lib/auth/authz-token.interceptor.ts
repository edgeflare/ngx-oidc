import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';

/**
 * HTTP interceptor to add the authentication token to the headers of outgoing requests.
 *
 * @param req - The outgoing HTTP request.
 * @param next - The next interceptor in the chain.
 * @returns The handled request with the Authorization header set if the user is authenticated.
 */
export const authzTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authService.user()?.access_token}`
      }
    });
  }

  return next(req);
};
