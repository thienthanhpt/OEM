import { Component, Injector, OnInit } from '@angular/core';

import { Invoice, InvoiceService, Attachment } from '@app/core';
import { FormComponent } from '../shared/views/crud/form.component';

@Component({
  selector: 'admin-invoice-form',
  templateUrl: 'invoice-form.component.html',
})
export class InvoiceFormComponent extends FormComponent<Invoice, InvoiceService> implements OnInit {

  modelName = 'Invoice';

  constructor(
    injector: Injector,
    protected dataService: InvoiceService,
  ) {
    super(injector);
    this.model = new Invoice();
  }

  reloadDocuments = (attachments?: Attachment[]) => {
    if (attachments) {
      this.model.documents = attachments;
    }
  }

  uploadSuccess(attachment: Attachment) {
    this.model.invoiceDocument = attachment;
    this.modal.hide();
    this.isLoading = true;
    this.dataService.updatePartial(this.model, [ 'invoiceDocumentId' ]).subscribe(
      (model: Invoice) => {
        this.isLoading = false;
        this.reloadDocuments(model.documents);
      },
      (error) => this.onError(error)
    );
  }
}
