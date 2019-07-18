import { TransactionsListComponent } from './transactions-list.component';
import { SupportTransactionsListComponent } from './support-transactions-list.component';

import { DbsOrdersComponent } from './dbs-orders.component';
import { DbsOrderUploadModalComponent } from './components/dbs-order-upload-modal.component';


export {
  TransactionsListComponent, SupportTransactionsListComponent,
  DbsOrdersComponent, DbsOrderUploadModalComponent,
};

export const TRANSACTION_COMPONENTS = [
  TransactionsListComponent,
  SupportTransactionsListComponent,
  DbsOrdersComponent, DbsOrderUploadModalComponent,
];
