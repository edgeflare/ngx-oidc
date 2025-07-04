import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../auth';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ng-signin',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);


  isAuthenticated = this.authService.isAuthenticated;
  user = this.authService.user;
  authGuardReturnUrl: string | null = null;

  signinRedirect() {
    this.authService.signinRedirect();
  }

  signinSilent() {
    this.authService.signinSilent();
  }

  signinPopup() {
    this.authService.signinPopup();
  }

  signoutRedirect() {
    this.authService.signoutRedirect();
  }

  signoutPopup() {
    this.authService.signoutPopup();
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      console.log('SigninComponent: User is authenticated');
    } else {
      console.log('SigninComponent: User is not authenticated');
      this.authGuardReturnUrl = this.authService.getAuthGuardInterceptedPathname();
      console.log('SigninComponent: authGuardReturnUrl', this.authGuardReturnUrl);
    }
  }
}
