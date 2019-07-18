import { Component, EventEmitter, Input, Output } from '@angular/core';

export enum InputFieldType {
  ReadOnly = 'readonly',
  Text = 'text',
  Email = 'email',
  Number = 'number',
  CheckBox = 'checkbox',
  DropDown = 'dropDown',
  DropDownYesNo = 'dropDownYesNo',
  Radio = 'radio',
  Date = 'date',
  TextArea = 'textArea'
}

@Component({
  selector: 'admin-custom-field-input',
  templateUrl: 'custom-field-input.component.html'
})
export class CustomFieldInputComponent {
  @Output() update: EventEmitter<any> = new EventEmitter();
  @Output() changeSelectById: EventEmitter<any> = new EventEmitter();
  @Output() edit: EventEmitter<any> = new EventEmitter();
  @Output() cancel: EventEmitter<any> = new EventEmitter();

  @Input() inputType: string = null;
  @Input() fieldName: string = null;
  @Input() modelFieldName: string = null;
  @Input() currentValue: string = null;
  @Input() currentValueDisplay: string = null;
  @Input() isUpdating = false;
  @Input() isInputting = false;
  @Input() isRequired = false;
  @Input() pattern: string = null;
  @Input() maxLength: number = null;
  @Input() listOptions: any[] = [];

  InputFieldType = InputFieldType;
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
      if (inputModel.errors && inputModel.errors.required) {
        this.errorMessage = this.fieldName + ' is required.';
      } else if (inputElement.type === InputFieldType.Email && inputModel.errors && inputModel.errors.email) {
        this.errorMessage = this.fieldName + ' is not a valid email.';
      } else if (inputElement.type === InputFieldType.Number && !Number(inputModel.value) && Number(inputModel.value) !== 0) {
        this.errorMessage = this.fieldName + ' is invalid format number.';
      } else if (inputModel.errors && inputModel.errors.maxlength
                && inputModel.errors.maxlength.actualLength > inputModel.errors.maxlength.requiredLength) {
        this.errorMessage = this.fieldName + ' is limited to ' + inputElement.maxLength + ' characters.';
      } else {
          this.errorMessage = this.fieldName + ' is invalid.';
      }
    } else {
      this.errorMessage = '';
    }
  }

  selectById(event: any) {
    this.changeSelectById.emit({
      value: event.target.value
    });
  }
}
