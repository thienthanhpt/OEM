import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SuccessResponse } from './base.service';

export class Token {

  accountId: number = null;
  token: string = null;
  email: string = null;

}

@Injectable()
export class LoginService {

  constructor(
    private http: HttpClient
  ) { }

  login(username: string, pw: string): Observable<any>  {
    return this.http.post('login/', { username , pw })
      .pipe(map((rs: SuccessResponse) => ({ accountId: rs.data.account_id, token: rs.data.token, email: rs.data.email } as Token)));
  }

  logout(): Observable<any>  {
    return this.http.get('logout/', {});
  }

  forgetPassword(email: string): Observable<any> {
    const url = window.location.origin + '/admin/auth/reset-password/';
    return this.http.post('users/forget-password/', {email, url});
  }

  resetPassword(resetPasswordToken: string, password: string): Observable<any> {
    return this.http.put(`users/reset-password/${resetPasswordToken}/`, {password});
  }

  validateResetPasswordToken(resetPasswordToken: string): Observable<any> {
    return this.http.get(`users/validate-reset-password-token/${resetPasswordToken}/`);
  }
}
