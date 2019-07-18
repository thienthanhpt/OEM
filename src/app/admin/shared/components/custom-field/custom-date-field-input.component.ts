import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AdminConfig } from '@app/admin/shared';

@Component({
  selector: 'admin-custom-date-field-input',
  templateUrl: 'custom-date-field-input.component.html'
})
export class CustomDateFieldInputComponent {
  @Output() update: EventEmitter<any> = new EventEmitter();
  @Output() edit: EventEmitter<any> = new EventEmitter();

  @Input() isEnable = true;
  @Input() fieldName: string = null;
  @Input() modelFieldName: string = null;
  @Input() minDate: Date = null;
  @Input() isInputting = false;
  @Input() isUpdating = false;
  @Input() currentValue: string = null;

  adminConfig = AdminConfig;

  oldValue: string = null;
  errorMessage = '';
  isClickUpdate = false;

  updateInput() {
    this.isClickUpdate = true;
    if (this.oldValue !== this.currentValue) {
      this.isUpdating = true;
      this.update.emit({
        currentValue: this.currentValue,
        modelFieldName: this.modelFieldName,
        isUpdating: this.isUpdating
      });
    }
  }

  cancelInput() {
    this.isInputting = false;
    if (!this.isClickUpdate) {
      this.currentValue = this.oldValue;
    }
    this.isClickUpdate = false;
  }

  editField() {
    this.oldValue = this.currentValue;
    this.isInputting = true;
    this.edit.emit();
  }

  changeValue(event: any, inputModel: any, inputElement: any) {
    if (inputModel.invalid) {
      this.errorMessage = this.fieldName + ' is invalid.';
    } else {
      this.errorMessage = '';
    }
  }
}
