import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseModel, BaseService, SuccessResponse } from './base.service';

const INVOICE_AGING_REPORT_FIELD_MAP = {
  name: 'file_name', filePath: 'file_path',
};


export class InvoiceAgingReport extends BaseModel {

  name: string = null;
  filePath: string = null;
  isForced = false;

  protected getFieldMap() {
    return super.getFieldMap(INVOICE_AGING_REPORT_FIELD_MAP);
  }

  get fullFilePath() {
    return 'http://' + this.filePath;
  }
}

function newInvoiceAgingReport(data: object) {
  return new InvoiceAgingReport().fromData(data);
}

@Injectable()
export class InvoiceAgingReportService extends BaseService<InvoiceAgingReport> {
  protected baseUrl = 'invoice-aging-report';

  protected newModel = (data: object) => newInvoiceAgingReport(data);

  generate(data: object): Observable<InvoiceAgingReport> {
    return this.http.post( `${this.baseUrl}/generate/`, data, this.getHttpConfigs())
      .pipe(map( (rs: SuccessResponse) => new InvoiceAgingReport().fromData(rs.data)));
  }

  generateAll(): Observable<InvoiceAgingReport> {
    return this.http.post( `${this.baseUrl}/generate/all/`, {}, this.getHttpConfigs())
      .pipe(map( (rs: SuccessResponse) => new InvoiceAgingReport().fromData(rs.data)));
  }

  protected getFieldMap() {
    return super.getFieldMap(INVOICE_AGING_REPORT_FIELD_MAP);
  }
}
