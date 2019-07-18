import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { LoginService, Token } from '../data-services/login.service';

const TOKEN_KEY = 'token';
const DEFAULT_URL = '/admin/transactions/subscription';
const LOGIN_URL = '/admin/login';
const FORGET_PASSWORD_URL = '/admin/auth/forget-password';
const RESET_PASSWORD_URL = '/admin/auth/reset-password';

export enum AuthFailMessage {
  IncorrectPassword = 'Password is incorrect',
  PasswordIsExpired = 'Password has expired',
  ExistedPassword = 'Password must not be the same as your previous password'
}

@Injectable()
export class AuthService {

  isLoggedIn = false;

  // store the URL so we can redirect after logging in
  returnUrl = DEFAULT_URL;

  authToken: Token;

  constructor(
    private router: Router,
    private loginService: LoginService
  ) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      this.isLoggedIn = true;
      this.authToken = JSON.parse(token);
    }
  }

  login(username: string, password: string): Observable<Token> {
    return this.loginService.login(username, password).pipe(
      tap(token => {
        this.isLoggedIn = true;
        this.authToken = token;
        localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
      })
    );
  }

  logout(): void {
    // this.loginService.logout().subscribe();
    this.isLoggedIn = false;
    localStorage.clear();
  }

  setCurrentReturnUrl() {
    this.returnUrl = this.router.url;
  }

  goToLoginPage() {
    this.router.navigate([ LOGIN_URL ]).then();
  }

  goToReturnPage() {
    this.router.navigate([ this.returnUrl ]).then();
    this.returnUrl = DEFAULT_URL;
  }

  goToForgetPasswordPage() {
    this.router.navigate([ FORGET_PASSWORD_URL ]);
  }

  gotoResetPasswordPage(token: string) {
    this.router.navigate([ `${RESET_PASSWORD_URL}/${token}/` ]);
  }

  forgetPassword(email: string): Observable<boolean> {
    return this.loginService.forgetPassword(email);
  }

  resetPassword(resetPasswordToken: string, password: string): Observable<boolean> {
    return this.loginService.resetPassword(resetPasswordToken, password);
  }

  validateResetPasswordToken(resetPasswordToken: string): Observable<boolean> {
    return this.loginService.validateResetPasswordToken(resetPasswordToken);
  }
}
