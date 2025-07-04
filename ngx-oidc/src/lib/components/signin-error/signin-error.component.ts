import { Component, inject } from '@angular/core';
import { AuthService } from '../../auth';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'ng-signin-error',
  standalone: true,
  imports: [JsonPipe],
  template: `<p>signin error errored!</p><br>
  <pre><code>{{ authError() | json }} </code></pre>
  `,
  styles: ``
})
export class SigninErrorComponent {
  private authService = inject(AuthService);
  authError = this.authService.authError;
}
