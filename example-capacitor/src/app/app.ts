import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { AuthService } from '@edgeflare/ngx-oidc-capacitor';

@Component({
  selector: 'app-root',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    CommonModule,
    RouterOutlet,
    RouterModule
  ],
  template: `
<mat-sidenav-container class="sidenav-container">
  <mat-sidenav #drawer class="sidenav" fixedInViewport [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
    [mode]="(isHandset$ | async) ? 'over' : 'side'" [opened]="(isHandset$ | async) === false">
    <mat-toolbar>Menu</mat-toolbar>
    <mat-nav-list>
      <a mat-list-item routerLink="/">Link 1</a>
      <a mat-list-item routerLink="/">Link 2</a>
      <a mat-list-item routerLink="/">Link 3</a>
    </mat-nav-list>
  </mat-sidenav>
  <mat-sidenav-content>
    <mat-toolbar color="primary">
      @if (isHandset$ | async) {
      <button type="button" aria-label="Toggle sidenav" matIconButton (click)="drawer.toggle()">
        <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
      </button>
      }
      <span>ngx-oidc-capacitor</span>
    </mat-toolbar>

    <!-- App Content -->
    <div>
      @if (authService.isAuthenticated()) {
      <p>Welcome, {{ authService.user()?.profile?.name || 'User' }}!</p>
      <button mat-raised-button (click)="authService.signoutHybrid()"><mat-icon>logout</mat-icon>signoutHybrid</button>
      <pre><code>{{ authService.user() | json }}</code></pre>
      } @else {
      <p>Please log in</p>
      <button mat-raised-button (click)="authService.signinHybrid()"><mat-icon>login</mat-icon>signinHybrid</button>
      }
    </div>
    <router-outlet />
    <!-- App Content -->

  </mat-sidenav-content>
</mat-sidenav-container>
  `,
  styles: `
    .sidenav-container {
      height: 100%;
      padding-top: env(safe-area-inset-top);
      box-sizing: border-box;
    }

    .sidenav {
      width: 200px;
    }

    .sidenav .mat-toolbar {
      background: inherit;
    }

    .mat-toolbar.mat-primary {
      position: sticky;
      top: 0;
      z-index: 1;
    }
  `,
})
export class App {
  private breakpointObserver = inject(BreakpointObserver);
  platform = Capacitor.getPlatform();

  authService = inject(AuthService);

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  ngOnInit() {
    // force reload user
    setTimeout(() => {
      this.authService.getUser().subscribe();
    }, 500);
  }
}
