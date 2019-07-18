import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { AuthService } from '@app/core';

@Component({
  selector: 'admin-forget-password',
  templateUrl: 'forget-password.component.html',
})
export class ForgetPasswordComponent implements OnInit {

  forgetPasswordForm: FormGroup;

  forgetPasswordFail = false;
  forgetPasswordFailMessage = '';
  forgetPasswordSuccess = false;

  email: FormControl;

  constructor(
    public authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.email = new FormControl('', [Validators.required, Validators.email]);
    this.forgetPasswordForm = this.fb.group({
      email: this.email
    });
  }

  forgetPassword() {
    const formModel = this.forgetPasswordForm.value;

    this.authService
      .forgetPassword(formModel.email)
      .subscribe(
        () => {
          this.forgetPasswordSuccess = true;
        },
        (error) => {
          this.forgetPasswordFail = true;
          this.forgetPasswordFailMessage = error.message;
        }
      );
  }

  login = () => {
    this.authService.goToLoginPage();
  }
}
