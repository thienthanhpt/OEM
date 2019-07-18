import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from './shared';

import { AdminComponent } from './admin.component';
import * as auth from './auth';
import { BillingChartComponent } from './billings/billing-chart.component';
import * as consumers from './consumers';
import * as contracts from './contracts';
import * as customers from './customers';
import * as errors from './errors';
import * as invoices from './invoices';
import * as transactions from './transactions';
import * as payments from './payments';
import * as pricingPlans from './pricing-plans';
import * as reports from './reports';
import * as tickets from './tickets';
import * as users from './users';
import * as promotions from './promotion';

import { ADMIN_ROUTES } from './admin.constant';

export const appRoutes: Routes = [
  {
    path: 'admin/auth',
    component: auth.AuthComponent,
    children: [
      { path: 'forget-password', component: auth.ForgetPasswordComponent },
      { path: 'reset-password', component: auth.ResetPasswordComponent },
      { path: 'reset-password/:token', component: auth.ResetPasswordComponent },
      { path: '', component: auth.LoginComponent },
    ]
  },
  {
    path: 'admin/login',
    redirectTo: 'admin/auth',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [ AuthGuardService ],
    children: [
      {
        path: 'dashboard', data: { title: 'Dashboard' },
        children: [
          { path: 'billing', component: BillingChartComponent, data: { title: 'Billing' } },
        ]
      },
      {
        path: 'transactions', data: { title: 'Transaction' },
        children: [
          { path: 'subscription',
            children: [
              { path: 'dbs-orders', component: transactions.DbsOrdersComponent, data: { title: 'Create DBS Order' } },
              { path: '', component: transactions.TransactionsListComponent, data: { title: 'Subscription' } },
            ],
          },
          { path: 'termination', component: transactions.TransactionsListComponent, data: { title: 'Termination' } },
          { path: 'relocation', component: transactions.TransactionsListComponent, data: { title: 'Relocation' } },
          { path: 'support', component: transactions.SupportTransactionsListComponent, data: { title: 'Support' } },
        ],
      },
      {
        path: 'management', data: { title: 'Management' },
        children: [
          {
            path: 'invoices',
            children: [
              { path: 'cdrs', component: invoices.StarhubCDRListComponent, data: { title: 'Starhub CDR List' } },
              { path: ':id/detail', component: invoices.InvoiceFormComponent, data: { title: 'Review' } },
              { path: 'review-bp', component: invoices.InvoicesStatisticComponent, data: { title: 'Review BP' } },
              { path: 'import', component: invoices.ImportMasterInvoicesComponent, data: { title: 'Import Master Invoices' } },
              { path: '', component: invoices.InvoicesListComponent, data: { title: 'Invoice' } },
              { path: 'new', component: invoices.InvoiceFormCreateComponent, data: { title: 'Create' } },
              { path: ':id/edit', component: invoices.InvoiceEditComponent, data: { title: 'Edit' } },
            ],
          },
          { path: 'payments',
            children: [
              { path: 'collection-files', component: payments.PaymentFilesListComponent, data: { title: 'Collection Files' }},
              { path: 'dda', component: payments.DdaSetupComponent , data: { title: 'DDA Set-up' } },
              { path: '', component: payments.PaymentsListComponent, data: { title: 'Payment' }},
            ]},
          {
            path: 'consumers',
            children: [
              { path: 'new', component: consumers.ConsumerFormComponent, data: { title: 'Create' } },
              { path: ':id/edit', component: consumers.ConsumerFormComponent, data: { title: 'Edit' } },
              { path: ':id/detail', component: consumers.ConsumerFormComponent, data: { title: 'Review' } },
              { path: 'usage-data-files', component: consumers.UsageDataFilesListComponent, data: { title: 'Usage Data Files List' } },
              { path: '', component: consumers.ConsumersListComponent, data: { title: 'Consumer' } },
            ],
          },
          {
            path: 'contracts',
            children: [
              { path: 'new', component: contracts.ContractFormComponent, data: { title: 'Create' } },
              { path: ':id/edit', component: contracts.ContractFormComponent, data: { title: 'Edit' } },
              { path: ':id/detail', component: contracts.ContractFormComponent, data: { title: 'Review' } },
              { path: '', component: contracts.ContractsListComponent, data: { title: 'Contract' } },
            ],
          },
          {
            path: 'pricingplans',
            children: [
              { path: 'new', component: pricingPlans.PricingPlanFormComponent, data: { title: 'Create' } },
              { path: ':id/edit', component: pricingPlans.PricingPlanFormComponent, data: { title: 'Edit' } },
              { path: ':id/detail', component: pricingPlans.PricingPlanFormComponent, data: { title: 'Review' } },
              { path: '', component: pricingPlans.PricingPlanListComponent, data: { title: 'Pricing Plan' } },
            ],
          },
          {
            path: 'customers',
            children: [
              { path: 'new', component: customers.CustomerFormComponent, data: { title: 'Create' } },
              { path: ':id/edit', component: customers.CustomerFormComponent, data: { title: 'Edit' } },
              { path: ':id/detail', component: customers.CustomerFormComponent, data: { title: 'Review' } },
              { path: '', component: customers.CustomersListComponent, data: { title: 'Customer' } },
            ],
          },
          {
            path: 'users',
            children: [
              { path: 'new', component: users.UserFormComponent, data: { title: 'Create' } },
              { path: ':id/edit', component: users.UserFormComponent, data: { title: 'Edit' } },
              { path: '', component: users.UsersListComponent, data: { title: 'User' } },
            ],
          },
          {
            path: 'tickets',
            children: [
              { path: 'new', component: tickets.TicketFormComponent, data: { title: 'Create' } },
              { path: ':id/detail', component: tickets.TicketFormComponent, data: { title: 'Review' } },
              { path: ':id/edit', component: tickets.TicketFormComponent, data: { title: 'Edit' } },
              { path: '', component: tickets.TicketListComponent, data: { title: 'Ticket' } },
            ]
          },
          {
            path: 'promotion',
            children: [
              { path: '', component: promotions.PromotionComponent, data: { title: 'Promotion Campain' } },
            ]
          }
        ],
      },
      {
        path: 'report', data: { title: 'Report' },
        children: [
          {
            path: 'ema',
            children: [
              { path: 'new', component: reports.EmaReportFormComponent, data: { title: 'Generate' } },
              { path: '', component: reports.EmaReportListComponent, data: { title: 'EMA Report' } }
            ],
          },
          {
            path: 'sign-up',
            children: [
              { path: 'new', component: reports.SignupReportFormComponent, data: { title: 'Generate' } },
              { path: '', component: reports.SignupReportListComponent, data: { title: 'Sign-up Report' } }
            ]
          },
          {
            path: 'billing',
            children: [
              { path: 'new', component: reports.BillingReportFormComponent, data: { title: 'Generate' } },
              { path: '', component: reports.BillingReportListComponent, data: { title: 'Billing Report' } }
            ]
          },
          {
            path: 'ctr',
            children: [
              { path: 'new', component: reports.CtrReportFormComponent, data: { title: 'Generate' } },
              { path: '', component: reports.CtrReportListComponent, data: { title: 'CTR Report' } }
            ]
          },
          {
            path: 'payment',
            children: [
              { path: 'new', component: reports.PaymentReportFormComponent, data: { title: 'Generate' } },
              { path: '', component: reports.PaymentReportListComponent, data: { title: 'Payment Report' } }
            ],
          },
          {
            path: 'aging-invoice',
            children: [
              { path: 'new', component: reports.AgingInvoiceGenerateListComponent, data: { title: 'Generate' } },
              { path: '', component: reports.AgingInvoiceListComponent, data: { title: 'Aging Invoice' } }
            ]
          },
          {
            path: 'contract',
            children: [
              { path: 'new', component: reports.ContractReportFormComponent, data: { title: 'Generate' } },
              { path: '', component: reports.ContractReportListComponent, data: { title: 'Contract Details Report' } }
            ]
          },
          {
            path: 'promotion',
            children: [
              { path: 'new', component: reports.PromotionReportFormComponent, data: { title: 'Generate' } },
              { path: '', component: reports.PromotionReportListComponent, data: { title: 'Promotion Count' } }
            ]
          }
        ],
      },
      {
        path: ADMIN_ROUTES.PAGE_NOT_ALLOWED,
        component: errors.PageNotAllowedComponent,
      },
      {
        path: '',
        redirectTo: 'transactions/subscription',
        pathMatch: 'full'
      },
      { path: '**', component: errors.PageNotFoundComponent }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(
      appRoutes
    )
  ],
  exports: [ RouterModule ]
})
export class AdminRoutingModule { }
