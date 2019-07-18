import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SHARED_PIPES } from './pipes/index';
import { SHARED_DIRECTIVES } from './directives/index';


/**
 * Do not specify providers for modules that might be imported by a lazy loaded module.
 */
@NgModule({
  imports: [ CommonModule ],
  declarations: [ SHARED_PIPES, SHARED_DIRECTIVES ],
  exports: [ CommonModule, FormsModule, SHARED_PIPES, SHARED_DIRECTIVES ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [ ]
    };
  }
}
