import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import * as moment from 'moment';

import { environment } from '@env/environment';
import { AuthService } from '../services/auth.service';
import { AppOptions, ErrorResponse } from '../data-services/base.service';
import { AlertModalService } from '../../admin/shared/services/alert-modal.service';

const HTTP_PATTERN = new RegExp('^(?:[a-z]+:)?//', 'i');
const API_URL = `${environment.apiUrl}/api/${environment.apiVersion}/`;
const API_STARHUB_URL = `${environment.apiUrl}/b2bapi/starhub/${environment.apiVersion}/`;

@Injectable()
export class RequestInterceptor implements HttpInterceptor {

  private context: { [name: string]: string } = {
    language: 'en',
    'UTC-offset': moment().format('Z'),
  };

  private authService: AuthService;

  constructor(
    private injector: Injector,
    private alertModalService: AlertModalService,
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (!HTTP_PATTERN.test(req.url)) {
      let appOptions: AppOptions = {};
      if (req.headers.has('App-Options')) {
        appOptions = JSON.parse(req.headers.get('App-Options')) as AppOptions;
        req = req.clone({ headers: req.headers.delete('App-Options') });
      }

      const update: { [name: string]: any } = {};

      update.url = (appOptions.isStarhubUrl ? API_STARHUB_URL : API_URL) + req.url;
      update.setHeaders = {};

      if (!_.isEmpty(appOptions.context)) {
        _.assign(this.context, appOptions.context);
      }

      update.setHeaders.Context = JSON.stringify(this.context);

      const authService = this.getAuthService();

      if (authService.isLoggedIn) {
        update.setHeaders.Authorization = `Token ${authService.authToken.token}`;
      }

      req = req.clone(update);
    }

    return next.handle(req).pipe(
      catchError((err) => {
        let errorResponse: ErrorResponse;
        const { status, error, statusText } = err;

        if (status === 500) {
          errorResponse = { status, code: 'SERVER_ERROR', message: statusText, debugMessage: error };
          this.alertModalService.error(errorResponse.code, errorResponse.debugMessage, 'lg', false);
        } else if (status === 503) {
          document.body.innerHTML = error.html_content;
          errorResponse = error;
        } else if (status === 0) {
          errorResponse = { status, code: 'SERVER_ERROR', message: statusText };
        } else if (status === 401) {
          const authService = this.getAuthService();
          if (authService.isLoggedIn) {
            // logout users, redirect to login page
            authService.logout();
            authService.setCurrentReturnUrl();
            authService.goToLoginPage();
          }
          errorResponse = error;
        } else {
          errorResponse = error;
        }

        return throwError(errorResponse);
      }));
  }

  private getAuthService() {
    if (!this.authService) {
      this.authService = this.injector.get(AuthService);
    }
    return this.authService;
  }
}
