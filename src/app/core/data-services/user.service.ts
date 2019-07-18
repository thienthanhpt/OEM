import { Injectable } from '@angular/core';

import { BaseModel, BaseService } from './base.service';

export const USER_FIELD_MAP = {
  id: 'uid', fullName: 'name', username: 'username', password: 'pw',
  email: 'email', jobDesignation: 'job', phoneNumber: 'mobile'
};

export class User extends BaseModel {

  fullName: string = null;
  username: string = null;
  password: string = null;
  email: string = null;
  jobDesignation: string = null;
  phoneNumber: string = null;

  protected getFieldMap() {
    return super.getFieldMap(USER_FIELD_MAP);
  }
}

function newUser(data: object) {
  return new User().fromData(data);
}

@Injectable()
export class UserService extends BaseService<User> {

  protected baseUrl = 'users';

  protected newModel = (data: object) => newUser(data);

  protected getFieldMap() {
    return super.getFieldMap(USER_FIELD_MAP);
  }
}
