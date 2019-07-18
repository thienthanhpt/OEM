import { Component, Injector, OnInit } from '@angular/core';

import { User, UserService, Model, MODEL_OPTIONS } from '@app/core';
import { ListComponent } from '../shared';

@Component({
  selector: 'admin-users-list',
  templateUrl: 'users-list.component.html',
})
export class UsersListComponent extends ListComponent<User, UserService> implements OnInit{

  protected searchFields = [ '~username', '~phoneNumber', '~email' ];

  constructor(
    injector: Injector,
    protected dataService: UserService
  ) {
    super(injector);
  }

  ngOnInit() {
    this.modelPermission = JSON.parse(localStorage.getItem(MODEL_OPTIONS[Model.User]));
  }
}
