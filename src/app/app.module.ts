import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

import { environment } from '@env/environment';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { CoreModule } from '@app/core/core.module';
import { SharedModule } from '@app/shared/shared.module';
import { AdminModule } from '@app/admin/admin.module';

@NgModule({
  imports: [
    BrowserModule,
    CoreModule, SharedModule.forRoot(),
    LoggerModule.forRoot({
      level: NgxLoggerLevel.DEBUG,
      serverLogLevel: NgxLoggerLevel.ERROR
    }),
    AppRoutingModule,
    AdminModule,
  ],
  declarations: [
    AppComponent,
  ],
  providers: [ ],
  bootstrap: [ AppComponent ]

})
export class AppModule {
  constructor() {
    console.log('Environment config', environment);
  }
}
