import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '../../auth';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'ng-account',
  standalone: true,
	imports: [CommonModule, RouterModule],
  template: `
  @if(isAuthenticated()) {
    <pre><code>{{ user() | json }}</code></pre>
  } @else {
    <p>You are not authenticated. Please <a routerLink="../signin">signin</a>.</p>
  }
  `,
  styles: ``
})
export class AccountComponent {
  private authService = inject(AuthService);

  isAuthenticated = this.authService.isAuthenticated;
  user = this.authService.user;
}
