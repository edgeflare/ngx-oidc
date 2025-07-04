import { Injectable, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  UserManager,
  UserManagerSettings,
  User,
  WebStorageStateStore,
  SigninRedirectArgs,
  SignoutRedirectArgs,
  SigninPopupArgs,
  SigninSilentArgs
} from 'oidc-client-ts';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { OIDC_CONFIG_TOKEN } from '../oidc-config.token';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * The underlying UserManager instance handling OpenID Connect operations.
   */
  private userManager!: UserManager;

  /**
   * BehaviorSubject holding the current authenticated user or null.
   */
  protected user$ = new BehaviorSubject<User | null>(null);

  /**
   * Signal representation of the current user.
   */
  user = toSignal(this.user$);

  /**
   * Observable indicating whether the user is currently authenticated.
   */
  private isAuthenticated$: Observable<boolean> = this.user$.pipe(map(user => !!user && !user.expired));

  /**
   * Signal representation of the authentication status.
   */
  isAuthenticated = toSignal(this.isAuthenticated$);

  /**
   * BehaviorSubject holding any authentication errors that occur.
   */
  public authError$ = new BehaviorSubject<Error | null | unknown>(null);

  /**
   * Signal representation of the authentication error status.
   */
  public authError = toSignal(this.authError$);

  /**
   * Constructs the AuthService.
   * @param config - The UserManagerSettings for configuring the OpenID Connect client.
   * @param router - The Angular Router for navigation.
   */
  constructor(
    @Inject(OIDC_CONFIG_TOKEN) private config: UserManagerSettings,
    private router: Router
  ) {
    this.initializeUserManager();
    // explicitly call getUser() to check if the user is already logged in
    this.getUser().subscribe();
  }

  /**
   * Initializes the UserManager with the provided configuration.
   * Configures user storage and event listeners.
   * @private
   */
  private initializeUserManager(): void {
    if (!this.config.userStore) {
      this.config.userStore = new WebStorageStateStore({
        store: window.localStorage
      });
    }

    if (!this.config.scope) {
      this.config.scope = 'openid profile email';
    }

    this.userManager = new UserManager(this.config);

    this.userManager.events.addUserLoaded((user) => {
      this.user$.next(user);
    });

    this.userManager.events.addUserUnloaded(() => {
      this.user$.next(null);
    });

    this.userManager.events.addUserSignedOut(() => {
      this.user$.next(null);
    });

    this.userManager.events.addSilentRenewError((error) => {
      console.error('Silent renew error:', error);
      this.authError$.next(error);
    });
  }

  /**
   * Returns the current user from the UserManager.
   * Initiates silent session renewal if the user is logged in.
   * @returns {Observable<User | null>} Observable emitting the current user or null if not logged in.
   */
  getUser(): Observable<User | null> {
    return from(this.userManager.getUser()).pipe(
      tap((user) => {
        this.user$.next(user);
        // enable silentRefresh if the user is already logged in
        this.userManager.startSilentRenew();
        // check if silent refresh working by explicitly calling
        // signinSilent() once to renew the user's session
        this.signinSilent().then(user => {
          console.log('Silent signin success', user);
        });
      }),
      catchError((error: Error) => {
        console.error('Error getting user:', error);
        this.authError$.next(error);
        return of(null);
      })
    );
  }

  /**
   * Initiates a redirect-based sign-in process.
   * @param {SigninRedirectArgs} [args] Optional arguments for the sign-in process.
   * @returns {Promise<void>} A promise that resolves when the sign-in is initiated.
   * @throws Will throw an error if the sign-in fails.
   */
  public async signinRedirect(args?: SigninRedirectArgs): Promise<void> {
    try {
      await this.userManager.signinRedirect(args);
    } catch (error) {
      console.error('Error during sign-in redirect:', error);
      this.authError$.next(error);
      throw error;
    }
  }

  /**
   * Initiates a popup-based sign-in process.
   * @param {SigninPopupArgs} [args] Optional arguments for the sign-in process.
   * @returns {Promise<void>} A promise that resolves when the sign-in is completed.
   * @throws Will throw an error if the sign-in fails.
   */
  public async signinPopup(args?: SigninPopupArgs): Promise<void> {
    try {
      const user = await this.userManager.signinPopup(args);
      this.user$.next(user);
      // window.opener?.postMessage("signinPopupComplete", window.location.origin);
    } catch (error) {
      console.error('Error during sign-in popup:', error);
      this.authError$.next(error);
      throw error;
    }
  }

  /**
   * Attempts a silent sign-in process.
   * @returns {Promise<User | null>} A promise that resolves to the authenticated user or null if unsuccessful.
   * @throws Will throw an error if the silent sign-in fails.
   */
  public async signinSilent(args?: SigninSilentArgs): Promise<User | null> {
    // this.config.response_mode = 'query';
    try {
      const user = await this.userManager.signinSilent(args);
      this.user$.next(user);
      return user;
    } catch (error) {
      console.error('Error during silent sign-in:', error);
      this.authError$.next(error);
      throw error;
    }
  }

  /**
   * Handles the sign-in callback after a redirect or popup.
   * @param {string} [url] The URL to handle. Defaults to the current URL.
   * @returns {Promise<void>} A promise that resolves when the callback is handled.
   * @throws Will throw an error if the sign-in callback fails.
   */
  public async signinCallback(url?: string): Promise<void> {
    try {
      const user = await this.userManager.signinCallback(url);
      if (user) {
        this.user$.next(user);
      }
    } catch (error) {
      console.error('Error during sign-in callback:', error);
      this.authError$.next(error);
      await this.router.navigate(['/signin/error']);
      throw error;
    }
  }

  /**
   * Handles the sign-out callback after a redirect or popup.
   * @param {string} [url] The URL to handle. Defaults to the current URL.
   * @returns {Promise<void>} A promise that resolves when the callback is handled.
   * @throws Will throw an error if the sign-out callback fails.
   */
  public async signoutCallback(url?: string): Promise<void> {
    try {
      await this.userManager.signoutCallback(url);
    } catch (error) {
      console.error('Error during sign-out callback:', error);
      this.authError$.next(error);
      throw error;
    } finally {
      this.cleanupAfterSignout();
    }
  }

  /**
   * Initiates a redirect-based sign-out process.
   * @param {SignoutRedirectArgs} [args] Optional arguments for the sign-out process.
   * @returns {Promise<void>} A promise that resolves when the sign-out is initiated.
   * @throws Will throw an error if the sign-out fails.
   */
  public async signoutRedirect(args?: SignoutRedirectArgs): Promise<void> {
    try {
      await this.userManager.signoutRedirect(args);
    } catch (error) {
      console.error('Error during sign-out redirect:', error);
      this.authError$.next(error);
      throw error;
    } finally {
      this.cleanupAfterSignout();
    }
  }

  /**
   * Initiates a popup-based sign-out process.
   * @param {SignoutRedirectArgs} [args] Optional arguments for the sign-out process.
   * @returns {Promise<void>} A promise that resolves when the sign-out is completed.
   * @throws Will throw an error if the sign-out fails.
   */
  public async signoutPopup(args?: SignoutRedirectArgs): Promise<void> {
    try {
      await this.userManager.signoutPopup(args);
    } catch (error) {
      console.error('Error during sign-out popup:', error);
      this.authError$.next(error);
      throw error;
    } finally {
      this.cleanupAfterSignout();
    }
  }

  /**
   * Gets the instance of UserManager.
   * @returns {UserManager} The UserManager instance.
   */
  public get userManagerInstance(): UserManager {
    return this.userManager;
  }

  /**
   * Sets the intercepted pathname for the auth guard.
   * @param {string} [path] The path to store. Defaults to the current location's pathname.
   */
  public setAuthGuardInterceptedPathname(path?: string): void {
    const pathToStore = path || window.location.pathname;
    localStorage.setItem('authGuardInterceptedPathname', pathToStore);
  }

  /**
   * Gets the intercepted pathname from the auth guard.
   * @returns {string} The stored pathname or '/' if not set.
   */
  public getAuthGuardInterceptedPathname(): string {
    return localStorage.getItem('authGuardInterceptedPathname') || '/';
  }

  /**
   * Cleans up user session and local storage after sign-out.
   * @private
   */
  private cleanupAfterSignout(): void {
    this.user$.next(null);
    this.userManager.removeUser();
    localStorage.removeItem('authGuardInterceptedPathname');
  }
}
