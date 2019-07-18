import { Component, Injector } from '@angular/core';

import { StarhubCDR, StarhubCDRService } from '../../core/index';
import { ListComponent } from '../shared/index';

@Component({
  selector: 'admin-starhub-cdr-list',
  templateUrl: 'starhub-cdr-list.component.html',
})
export class StarhubCDRListComponent extends ListComponent<StarhubCDR, StarhubCDRService> {

  constructor(
    injector: Injector,
    protected dataService: StarhubCDRService
  ) {
    super(injector);
  }
}
