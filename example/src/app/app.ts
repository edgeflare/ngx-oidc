import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule],
  template: `
    <h1>Welcome to {{title}}!</h1>
    <p>Visit <a routerLink="/signin">signin page</a></p>

    <router-outlet />
  `,
  styles: [],
})
export class App {
  protected title = 'example';
}
