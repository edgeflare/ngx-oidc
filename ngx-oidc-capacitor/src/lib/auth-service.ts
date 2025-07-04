import { Inject, Injectable } from '@angular/core';
import { AuthService, OIDC_CONFIG_TOKEN } from '@edgeflare/ngx-oidc';
import { OidcMetadata, SigninRedirectArgs, User, UserManagerSettings } from 'oidc-client-ts';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class CapacitorAuthService extends AuthService {
  private oidcMetadata: Partial<OidcMetadata> | null = null;
  private readonly isNative = Capacitor.isNativePlatform();
  private readonly isIOS = Capacitor.getPlatform() === 'ios';

  constructor(@Inject(OIDC_CONFIG_TOKEN) config: UserManagerSettings, router: Router) {
    super(config, router);
    this.initCapacitorAuth();
  }

  private async initCapacitorAuth(): Promise<void> {
    if (!this.isNative) return;

    try {
      this.setupDeepLinkHandling();
      await this.loadOidcMetadata();
      await this.handleAppInit();
      console.log('Capacitor auth initialization complete');
    } catch (error) {
      console.error('Error initializing Capacitor auth:', error);
      this.authError$.next(error);
    }
  }

  private async loadOidcMetadata(): Promise<void> {
    try {
      if (!this.userManagerInstance) throw new Error('UserManager not initialized');

      this.oidcMetadata = await this.userManagerInstance.metadataService.getMetadata();
      if (!this.oidcMetadata.authorization_endpoint || !this.oidcMetadata.token_endpoint) {
        throw new Error('Required endpoints not found in OIDC metadata');
      }
    } catch (error) {
      console.error('Failed to load OIDC metadata:', error);
      this.authError$.next(error);
      throw new Error('Could not load OIDC configuration');
    }
  }

  private setupDeepLinkHandling() {
    App.addListener('appUrlOpen', async (event) => {
      console.log('Deep link received:', event.url);
      if (event.url.includes('/signin/callback')) await this.handleDeepLinkCallback(event.url);
      else if (event.url.includes('/signout/callback')) await this.signoutCallbackHybrid();
    });
  }

  private async handleDeepLinkCallback(url: string) {
    try {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const [code, state, error] = [urlParams.get('code'), urlParams.get('state'), urlParams.get('error')];

      if (error) throw new Error(`OAuth error: ${error} - ${urlParams.get('error_description') || 'Unknown error'}`);
      if (!code) throw new Error('No authorization code received');

      const user = await this.exchangeCodeForUser(code, state);
      this.user$.next(user);
      this.resolveAuthPromise(user);
    } catch (error) {
      console.error('Deep link callback error:', error);
      this.user$.next(null);
      this.rejectAuthPromise(error);
    } finally {
      if (this.isIOS) this.closeBrowserSafe();
    }
  }

  private async exchangeCodeForUser(code: string, state: string | null): Promise<User> {
    if (!this.oidcMetadata) await this.loadOidcMetadata();
    if (!this.oidcMetadata?.token_endpoint) throw new Error('Token endpoint not available');

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: this.userManagerInstance.settings.client_id!,
      redirect_uri: this.userManagerInstance.settings.redirect_uri!,
    });

    const response = await fetch(this.oidcMetadata.token_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return this.createUserFromTokenResponse(await response.json());
  }

  private async createUserFromTokenResponse(tokenResponse: any): Promise<User> {
    try {
      const idTokenPayload = JSON.parse(atob(tokenResponse.id_token.split('.')[1]));
      const userData = {
        access_token: tokenResponse.access_token,
        token_type: tokenResponse.token_type || 'Bearer',
        id_token: tokenResponse.id_token,
        refresh_token: tokenResponse.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + (tokenResponse.expires_in || 3600),
        scope: tokenResponse.scope,
        profile: idTokenPayload,
        expired: false,
        scopes: (tokenResponse.scope || '').split(' '),
        session_state: null,
        state: null
      };

      const user = new User(userData);
      await this.userManagerInstance.storeUser(user);
      return user;
    } catch (error) {
      console.error('Error creating user from token response:', error);
      throw error;
    }
  }

  private buildAuthorizationUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.userManagerInstance.settings.client_id!,
      redirect_uri: this.userManagerInstance.settings.redirect_uri!,
      scope: this.userManagerInstance.settings.scope || 'openid profile email offline_access',
      state: this.generateSecureRandomString(32),
      nonce: this.generateSecureRandomString(32),
    });
    return `${this.oidcMetadata!.authorization_endpoint}?${params.toString()}`;
  }

  private buildSignoutUrl(): string {
    const params = new URLSearchParams({
      post_logout_redirect_uri: this.userManagerInstance.settings.post_logout_redirect_uri!,
      client_id: this.userManagerInstance.settings.client_id!,
    });
    return `${this.oidcMetadata!.end_session_endpoint}?${params.toString()}`;
  }

  private generateSecureRandomString(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(36)).join('').slice(0, length);
  }

  private resolveAuthPromise(user: User): void {
    if ((window as any).__ngxOidcAuthResolve) {
      clearTimeout((window as any).__ngxOidcAuthTimeout);
      (window as any).__ngxOidcAuthResolve(user);
      this.cleanupAuthPromise();
    }
  }

  private rejectAuthPromise(error: any): void {
    if ((window as any).__ngxOidcAuthReject) {
      clearTimeout((window as any).__ngxOidcAuthTimeout);
      (window as any).__ngxOidcAuthReject(error);
      this.cleanupAuthPromise();
    }
  }

  private cleanupAuthPromise(): void {
    delete (window as any).__ngxOidcAuthResolve;
    delete (window as any).__ngxOidcAuthReject;
    delete (window as any).__ngxOidcAuthTimeout;
  }

  private async closeBrowserSafe(): Promise<void> {
    try {
      await Browser.close();
    } catch (error) {
      console.warn('Failed to close browser', error);
    }
  }

  async signinNative(): Promise<User> {
    if (!this.oidcMetadata?.authorization_endpoint) await this.loadOidcMetadata();

    await Browser.open({ url: this.buildAuthorizationUrl(), windowName: '_system' });

    return new Promise<User>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.cleanupAuthPromise();
        reject(new Error('Authentication timeout (5 minutes)'));
      }, 300000);

      (window as any).__ngxOidcAuthResolve = resolve;
      (window as any).__ngxOidcAuthReject = reject;
      (window as any).__ngxOidcAuthTimeout = timeout;
    });
  }

  async signinHybrid(args?: SigninRedirectArgs): Promise<User | void> {
    try {
      if (this.isNative) {
        return await this.signinNative();
      } else {
        return await this.signinRedirect(args);
      }
    } catch (error) {
      this.authError$.next(error);
      throw error;
    }
  }

  async signoutCallbackHybrid(): Promise<void> {
    if (this.isNative) {
      await this.userManagerInstance.removeUser();
      this.user$.next(null);
      if (this.isIOS) this.closeBrowserSafe();
    } else {
      await this.userManagerInstance.signoutCallback();
    }
  }

  async signoutHybrid(): Promise<void> {
    try {
      if (this.isNative) await this.signoutNative();
      else await this.signoutRedirect();
    } catch (error) {
      this.authError$.next(error);
      throw error;
    }
  }

  private async signoutNative(): Promise<void> {
    await this.userManagerInstance.removeUser();
    this.user$.next(null);

    if (this.oidcMetadata?.end_session_endpoint) {
      await Browser.open({ url: this.buildSignoutUrl(), windowName: '_system' });
    }
  }

  async signinCallbackHybrid(): Promise<User | undefined> {
    if (this.isNative) return undefined; // processed by deeplink handler

    const user = await this.userManagerInstance.signinCallback();
    if (user) {
      this.user$.next(user);
      return user;
    }
    return undefined;
  }

  private async handleAppInit(): Promise<void> {
    try {
      const user = await this.userManagerInstance.getUser();
      if (user && !user.expired) this.user$.next(user);
    } catch (error) {
      console.error('Error handling startup callback:', error);
    }
  }
}
