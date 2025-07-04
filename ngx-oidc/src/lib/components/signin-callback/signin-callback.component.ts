import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../auth';
import { Router } from '@angular/router';

@Component({
  selector: 'ng-signin-callback',
  standalone: true,
  imports: [],
  template: `<p>Login successful! Redirecting...</p>`,
  styles: ``
})
export class SigninCallbackComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  async ngOnInit() {
    await this.authService.signinCallback().then(() => {
      this.router.navigate([this.authService.getAuthGuardInterceptedPathname()]);
    });
  }
}
