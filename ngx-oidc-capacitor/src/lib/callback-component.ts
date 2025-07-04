import { Component, inject, OnInit } from '@angular/core';
import { CapacitorAuthService } from './auth-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <p>
      @if (error) {
        {{ error | json }}
      } @else {
        login successful...
      }
    </p>
  `,
  styles: ``
})
export class SigninCallbackComponent {
  private authService = inject(CapacitorAuthService);
  private router = inject(Router);

  error: string | unknown = null;

  async ngOnInit() {
    try {
      await this.authService.signinCallbackHybrid();
      this.router.navigate([this.authService.getAuthGuardInterceptedPathname()]);
    } catch (error) {
      console.error('Auth callback error:', error);
      this.error = error;
    }
  }
}

// Logout callback component
@Component({
  template: '<div>Processing logout...</div>'
})
export class SignoutCallbackComponent implements OnInit {
  private authService = inject(CapacitorAuthService);
  private router = inject(Router);

  async ngOnInit() {
    try {
      await this.authService.signoutCallbackHybrid();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Logout callback error:', error);
    }
  }
}
