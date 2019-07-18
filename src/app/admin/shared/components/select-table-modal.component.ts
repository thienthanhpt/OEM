import { Component, Injector, Input, Output, EventEmitter, ContentChildren, QueryList } from '@angular/core';

import { DataTableParams } from '@app/libs/data-table/components/types';
import { DataTableColumnComponent } from '@app/libs/data-table/data-table.module';

import { Consumer } from '@app/core';
import { ModalService } from '../../shared';

@Component({
  selector: 'admin-select-table-modal',
  templateUrl: 'select-table-modal.component.html',
})
export class SelectTableModalComponent {
  @Input() isConsumerLoading = false;
  @Input() consumerList: Consumer[] = [];
  @Input() consumer: Consumer = null;
  @Input() placeholder: string;
  @Input() searchFields: any[] = [];

  @Output() reloadConsumer: EventEmitter<any> = new EventEmitter();
  @Output() selectRow: EventEmitter<any> = new EventEmitter();
  @Output() close: EventEmitter<any> = new EventEmitter();

  @ContentChildren(DataTableColumnComponent) columns: QueryList<DataTableColumnComponent>;

  modal: ModalService;
  criteriaAllInOne = '';

  constructor(injector: Injector) {
    this.modal = injector.get(Injector);
  }

  reloadConsumers(params: DataTableParams) {
    this.reloadConsumer.emit({ data: params });
  }

  onConsumerSelect(item: Consumer) {
    this.selectRow.emit({ item: item });
  }

  closeModal() {
    this.close.emit({ data: true });
  }
}
