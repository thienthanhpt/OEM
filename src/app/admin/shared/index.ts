import { FileUploadComponent } from './components/form/file-upload.component';
import { FilePreviewComponent } from './components/form/file-preview.component';
import { AlertComponent } from './components/alert.component';
import { AlertModalComponent } from './components/alert-modal.component';
import { BreadcrumbsComponent } from './components/breadcrumb.component';
import { SidebarComponent } from './components/sidebar.component';
import { SelectTableModalComponent } from './components/select-table-modal.component';
import { CustomToggleComponent } from './components/custom-field/custom-toggle.component';
import { CustomFieldInputComponent } from './components/custom-field/custom-field-input.component';
import { CustomDateFieldInputComponent } from '@app/admin/shared/components/custom-field/custom-date-field-input.component';
import { TableHistoryComponent } from './components/table/table-history.component';

export const ADMIN_SHARED_COMPONENTS = [
  FilePreviewComponent, FileUploadComponent, AlertComponent, AlertModalComponent, BreadcrumbsComponent, SidebarComponent,
  SelectTableModalComponent, CustomToggleComponent, CustomFieldInputComponent, CustomDateFieldInputComponent, TableHistoryComponent,
];

import { AlertService } from './services/alert.service';
import { AlertModalService } from './services/alert-modal.service';
import { AuthGuardService } from './services/auth-guard.service';
import { ModalService } from './services/modal.service';

export const ADMIN_SHARED_SERVICES = [
  AlertService, AlertModalService, AuthGuardService, ModalService,
];

export {
  AlertModalComponent, SelectTableModalComponent, AlertService, AlertModalService, AuthGuardService, ModalService,
  TableHistoryComponent
};

export { AdminConfig } from './configs/admin.config';
export { FormComponent } from './views/crud/form.component';
export { ListComponent } from './views/crud/list.component';
export { InputFieldType } from './components/custom-field/custom-field-input.component';

export * from './components/form/file-upload.component';
export * from './components/form/file-preview.component';
