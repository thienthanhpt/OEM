import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import * as _ from 'lodash';

@Component({
  selector: 'admin-custom-toggle',
  templateUrl: './custom-toggle.component.html'
})
export class CustomToggleComponent implements OnChanges {
  @Input() currentValue: boolean;
  @Input() clickedModelFieldName: string;
  @Input() fieldName: string;
  @Input() modelFieldName: string;

  @Output() update: EventEmitter<any> = new EventEmitter();
  @Output() changeToggle: EventEmitter<any> = new EventEmitter();

  oldValue: boolean;
  isConfirming = false;

  ngOnChanges(changes: SimpleChanges) {
    const { clickedModelFieldName } = changes;

    if (clickedModelFieldName && (clickedModelFieldName.currentValue !== this.modelFieldName)) {
      if (this.isConfirming) {
        this.currentValue = this.oldValue;
        this.isConfirming = false;
      }
    }
  }

  updateInput() {
    this.isConfirming = false;
    this.update.emit({
      currentValue: this.currentValue
    });
  }

  cancelInput() {
    this.currentValue = this.oldValue;
    this.isConfirming = false;
  }

  onChangeToggle() {
    if (_.isUndefined(this.oldValue)) {
      this.oldValue = this.currentValue;
    }
    this.isConfirming = true;
    this.changeToggle.emit({
      modelFieldName: this.modelFieldName,
      oldValue: this.oldValue,
      isConfirming: this.isConfirming
    });
  }
}
