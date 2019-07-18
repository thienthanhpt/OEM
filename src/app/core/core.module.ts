import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { RequestInterceptor } from './interceptors/request.interceptor';

import { AuthService, AuthorizationService, CORE_SERVICES, } from './index';

@NgModule({
  imports:      [ CommonModule, HttpClientModule ],
  declarations: [ ],
  exports:      [ ],
  providers:    [
    { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true },
    AuthService, AuthorizationService,
    CORE_SERVICES,
  ]
})
export class CoreModule {
  constructor(
    @Optional() @SkipSelf() parentModule: CoreModule
  ) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import only in AppModule');
    }
  }
}
