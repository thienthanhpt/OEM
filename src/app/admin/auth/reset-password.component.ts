import { Injector, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AuthService, AuthFailMessage } from '@app/core/services/auth.service';
import { AdminConfig } from '../shared/configs/admin.config';

@Component({
  selector: 'admin-reset-password',
  templateUrl: 'reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {

  resetPasswordForm: FormGroup;
  newPassword: FormControl;
  confirmPassword: FormControl;

  passwordValidationPattern = AdminConfig.validation.passwordPattern;

  resetPasswordToken = '';
  validateResetPasswordTokenFail = false;
  validateResetPasswordTokenMessage = '';
  resetPasswordFail = false;
  resetPasswordFailMessage = '';
  resetPasswordSuccess = false;
  AuthFailMessage = AuthFailMessage;

  protected route: ActivatedRoute;

  constructor(
    injector: Injector,
    public authService: AuthService,
    private fb: FormBuilder
  ) {
    this.route = injector.get(ActivatedRoute);
  }

  /**
   * Check token before load page, if invalid token, auto transit to login page
   */
  ngOnInit() {
    if (this.route.snapshot.paramMap.get('token')) {
      this.resetPasswordToken = this.route.snapshot.paramMap.get('token');
      this.createForm();
      this.authService
        .validateResetPasswordToken(this.resetPasswordToken)
        .subscribe(
          () => {
            this.createForm();
          },
          (error) => {
            this.validateResetPasswordTokenFail = true;
            this.validateResetPasswordTokenMessage = error.message;
          }
        );
    } else {
      this.authService.goToLoginPage();
    }
  }

  createForm() {
    this.newPassword = new FormControl('', [
      Validators.required,
      Validators.pattern(this.passwordValidationPattern)
    ]);
    this.confirmPassword = new FormControl('', [
      Validators.required
    ]);
    this.resetPasswordForm = this.fb.group({
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    });
  }

  resetPassword() {
    const formModel = this.resetPasswordForm.value;
    this.authService
      .resetPassword(this.resetPasswordToken, formModel.confirmPassword)
      .subscribe(
        () => {
          this.resetPasswordSuccess = true;
        },
        (error) => {
          this.validateResetPasswordTokenFail = true;
          this.validateResetPasswordTokenMessage = error.message;
        }
      );
  }
}
