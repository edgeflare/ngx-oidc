import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth';

@Component({
  selector: 'ng-signout-callback',
  standalone: true,
  imports: [],
  template: `
    <p>
      signout-callback works!
    </p>
  `,
  styles: ``
})
export class SignoutCallbackComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  async ngOnInit() {
    await this.authService.signoutCallback().then(() => {
      this.router.navigate(['/']);
    });
  }
}
