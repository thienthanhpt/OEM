import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

import { AlertModule, BsDropdownModule, TabsModule, TooltipModule, BsDatepickerModule, ModalModule } from 'ngx-bootstrap';
import { TagInputModule } from 'ngx-chips';
import { Ng2FileDropModule } from '@app/libs/ng2-file-drop';
import { DataTableModule } from '@app/libs/data-table/data-table.module';

import { SharedModule } from '@app/shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AUTH_COMPONENTS } from './auth';
import { BillingChartComponent } from './billings/billing-chart.component';
import { CUSTOMER_COMPONENTS } from './customers';
import { CONSUMER_COMPONENTS, UsageFileUploadModalComponent } from './consumers';
import { CONTRACT_COMPONENTS } from './contracts';
import { ERROR_COMPONENTS } from './errors';
import { INVOICE_COMPONENTS } from './invoices';
import { PRICING_PLAN_COMPONENTS } from './pricing-plans';
import { REPORT_COMPONENTS } from './reports';
import { TRANSACTION_COMPONENTS } from './transactions';
import { TICKET_COMPONENTS } from './tickets';
import { USER_COMPONENTS } from './users';
import { PAYMENT_COMPONENTS, DdaFileGenerateModalComponent, DdaFileUploadModalComponent, PaymentFileUploadModalComponent } from './payments';
import { PromotionComponent } from '@app/admin/promotion/promotion.component';
import { SelectTableModalComponent } from '@app/admin/shared/components/select-table-modal.component';
import { AlertModalComponent } from '@app/admin/shared/components/alert-modal.component';
import { ADMIN_SHARED_COMPONENTS, ADMIN_SHARED_SERVICES } from '@app/admin/shared';

@NgModule({
  imports: [
    ReactiveFormsModule, BrowserAnimationsModule,
    AlertModule.forRoot(), BsDropdownModule.forRoot(), ModalModule.forRoot(), TabsModule.forRoot(),
    TooltipModule.forRoot(), BsDatepickerModule.forRoot(),
    Ng2FileDropModule, TagInputModule, DataTableModule,
    SharedModule, AdminRoutingModule,
    NgMultiSelectDropDownModule.forRoot(),
  ],
  declarations: [
    AdminComponent,
    ADMIN_SHARED_COMPONENTS,
    AUTH_COMPONENTS, CUSTOMER_COMPONENTS, CONSUMER_COMPONENTS, CONTRACT_COMPONENTS, ERROR_COMPONENTS, INVOICE_COMPONENTS,
    PAYMENT_COMPONENTS, PRICING_PLAN_COMPONENTS, REPORT_COMPONENTS, TRANSACTION_COMPONENTS, TICKET_COMPONENTS, USER_COMPONENTS,
    BillingChartComponent, PromotionComponent,
  ],
  entryComponents: [
    UsageFileUploadModalComponent, SelectTableModalComponent, PaymentFileUploadModalComponent, DdaFileUploadModalComponent,
    DdaFileGenerateModalComponent, AlertModalComponent,
  ],
  exports: [ AdminComponent ],
  providers: [ ADMIN_SHARED_SERVICES ]
})
export class AdminModule { }
