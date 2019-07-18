import { Component, Injector, OnInit, TemplateRef } from '@angular/core';

import { BsModalService, BsModalRef } from 'ngx-bootstrap';

import { User, UserService, LoginService, Model, MODEL_OPTIONS } from '@app/core';
import { AdminConfig, FormComponent, AlertService } from '../shared';


@Component({
  selector: 'admin-user-form',
  templateUrl: 'user-form.component.html',
})
export class UserFormComponent extends FormComponent<User, UserService> implements OnInit {

  modelName = 'User';

  passwordValidationPattern: string = AdminConfig.validation.passwordPattern;

  confirmModal: BsModalRef;

  constructor(
    injector: Injector,
    protected dataService: UserService,
    protected loginService: LoginService,
    protected alertService: AlertService,
    protected modalService: BsModalService
  ) {
    super(injector);
    this.model = new User();
  }

  ngOnInit() {
    super.ngOnInit();
    this.modelPermission = JSON.parse(localStorage.getItem(MODEL_OPTIONS[Model.User]));
  }

  showConfirm(template: TemplateRef<any>) {
    this.confirmModal = this.modalService.show(template, { class: 'modal-sm', animated: true });
  }

  hideConfirm() {
    this.confirmModal.hide();
  }

  onResetPassword() {
    this.loginService.forgetPassword(this.model.email)
      .subscribe(
      () => {
        this.alertService.success(`Reset password user: ${this.model.username} successfully`, true);
        this.hideConfirm();
      },
      (error) => {
        this.alertService.error(error.message);
        this.hideConfirm();
      }
    );
  }

}
