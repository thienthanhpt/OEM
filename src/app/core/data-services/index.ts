
export * from './base.service';
export * from './attachment.service';
export * from './billing-chart.service';
export * from './billing-period.service';
export * from './billing-report.service';
export * from './consumer.service';
export * from './consumer-meter.service';
export * from './contract.service';
export * from './contract-report.service';
export * from './customer.service';
export * from './dbs-order.service';
export * from './ema-report.service';
export * from './invoice.service';
export * from './invoice-aging-report.service';
export * from './login.service';
export * from './order.service';
export * from './payment-mode.service';
export * from './payment-report.service';
export * from './pricing-plan.service';
export * from './pricing-plan-rate.service';
export * from './promotion.service';
export * from './promotion-template.service';
export * from './retailer.service';
export * from './sale-team.service';
export * from './signup-report.service';
export * from './starhub-cdr.service';
export * from './support-transaction.service';
export * from './ticket-tag.service';
export * from './ticket.service';
export * from './transaction.service';
export * from './usage-data.service';
export * from './usage-data-meter.service';
export * from './user.service';
export * from './payment.service';
export * from './dda-file.service';
export * from './ctr-report.service';
export * from './mail.service';
export * from './promotion-campaign.service';

import { AttachmentService } from './attachment.service';
import { BillingChartService } from './billing-chart.service';
import { BillingPeriodService } from './billing-period.service';
import { BillingReportService } from './billing-report.service';
import { ConsumerService } from './consumer.service';
import { ConsumerMeterService } from './consumer-meter.service';
import { ContractService } from './contract.service';
import { ContractReportService } from './contract-report.service';
import { CustomerService } from './customer.service';
import { DbsOrderService } from './dbs-order.service';
import { EmaReportService } from './ema-report.service';
import { InvoiceService } from './invoice.service';
import { InvoiceAgingReportService } from './invoice-aging-report.service';
import { LoginService } from './login.service';
import { OrderService } from './order.service';
import { PaymentModeService } from './payment-mode.service';
import { PricingPlanService } from './pricing-plan.service';
import { PricingPlanRateService } from './pricing-plan-rate.service';
import { PromotionService } from './promotion.service';
import { PromotionTemplateService } from './promotion-template.service';
import { RetailerService } from './retailer.service';
import { SaleTeamService } from './sale-team.service';
import { SignupReportService } from './signup-report.service';
import { StarhubCDRService } from './starhub-cdr.service';
import { SupportTransactionService } from './support-transaction.service';
import { TicketTagService } from './ticket-tag.service';
import { TicketService } from './ticket.service';
import { TransactionService } from './transaction.service';
import { UsageDataService } from './usage-data.service';
import { UsageDataMeterService } from './usage-data-meter.service';
import { UserService } from './user.service';
import { PaymentService } from './payment.service';
import { PaymentFileService } from './payment.service';
import { PaymentReportService } from './payment-report.service';
import { DdaFileService } from './dda-file.service';
import { CtrReportService } from './ctr-report.service';
import { MailService } from './mail.service';
import { PromotionReportService } from './promotion-report.service';
import { PromotionCampaignService } from '@core/data-services/promotion-campaign.service';
import { HistoriesService } from '@core/data-services/histories.service';

export const CORE_SERVICES = [
  AttachmentService, BillingChartService, BillingPeriodService, BillingReportService, ConsumerService,
  ConsumerMeterService, ContractService, CustomerService, EmaReportService, InvoiceService, LoginService, OrderService,
  PaymentModeService, PricingPlanService, PricingPlanRateService, PromotionService, PromotionTemplateService,
  RetailerService, SaleTeamService, SignupReportService, StarhubCDRService, SupportTransactionService, TicketTagService,
  TicketService, TransactionService, UserService, UsageDataService, UsageDataMeterService, PaymentService, PaymentFileService,
  DdaFileService, DbsOrderService, CtrReportService, MailService, PaymentReportService, InvoiceAgingReportService,
  ContractReportService, PromotionReportService, HistoriesService, PromotionCampaignService,
];
