import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';

import { AuthService, AuthorizationService, AuthFailMessage, MODEL_OPTIONS } from '@app/core/index';
import { ModalService } from '../shared';

@Component({
  selector: 'admin-login',
  templateUrl: 'login.component.html',
})
export class LoginComponent {

  @ViewChild('changePasswordForm') changePasswordForm: any;

  tokenToChangePassword = '';

  loginForm: FormGroup;

  loginFail = false;
  loginFailMessage = '';

  modelOptions = MODEL_OPTIONS;

  constructor(
    public authService: AuthService,
    public authorizationService: AuthorizationService,
    protected modal: ModalService,
    private fb: FormBuilder
  ) {
    if (this.authService.isLoggedIn) {
      this.authService.goToReturnPage();
    }
    this.createForm();
  }

  createForm() {
    this.loginForm = this.fb.group({
      username: [ '', Validators.required ],
      password: [ '', Validators.required ],
    });
  }

  login() {
    const formModel = this.loginForm.value;

    this.authService
      .login(formModel.username, formModel.password)
      .subscribe(
        () => {
          this.authorizationService.getAllPermissions()
            .subscribe( (value) => {
              // set permission for models
              _.forIn(this.modelOptions, (key, name) => {
                localStorage.setItem(key, JSON.stringify(this.authorizationService.getOnePermission(value, name)));
              });

              if (this.authService.isLoggedIn) {
                // Redirect the user
                this.authService.goToReturnPage();
              } else {
                this.loginFail = true;
              }
            });
        },
        (error) => {
          if (error.message === AuthFailMessage.PasswordIsExpired) {
            this.tokenToChangePassword = error.token;
            this.modal.open(this.changePasswordForm, 'sm');
          }
          this.loginFail = true;
          this.loginFailMessage = error.message;
        }
      );
  }

  changePassword = (token: string) => {
    this.authService.gotoResetPasswordPage(token);
  }

  forgetPassword = () => {
    this.authService.goToForgetPasswordPage();
  }

}
