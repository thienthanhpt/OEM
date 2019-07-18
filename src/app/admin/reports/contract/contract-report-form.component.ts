import { Component, Injector, OnInit, ViewChild } from '@angular/core';

import { Contract, ContractReport, ContractReportService, ContractService, DateMoment } from '@app/core';
import { FormComponent } from '../../shared';
import { DataTableParams } from '@libs/data-table/components/types';

import * as moment from 'moment';
import { DataTableComponent } from '@libs/data-table/components/data-table.component';
import * as _ from 'lodash';

@Component({
  selector: 'admin-contract-report-form',
  templateUrl: 'contract-report-form.component.html',
})
export class ContractReportFormComponent extends FormComponent<ContractReport, ContractReportService> implements OnInit {

  @ViewChild('dataTableContractReport') dataTable: DataTableComponent;

  criteria: { [name: string]: any } = {};
  // note: add first char '~' when field search OR
  searchFields: string[] = [
    '~contractRef', '~customer.name', '~consumer.name', '~consumer.premiseAddress', '~consumer.premisePostalCode',
    '~consumer.msslNo', '~pricingPlanName'
  ];

  modelName = 'Contract Detail Report';
  criteriaAllInOne = '';

  isLoading = false;
  isLoadingContractList = false;

  contractTemplate: DataTableParams = {
    limit: 10,
    offset: 0,
  };
  contractTemplateList: Contract[] = [];
  contractTemplateMeta: { [ name: string ]: any } = {
    count: 0,
    page: 1,
  };

  contractSelectedPagination: DataTableParams = {
    limit: 10,
    offset: 0,
  };
  contractSelectedTemplateMeta: { [ name: string ]: any } = {
    count: 0,
    page: 1,
  };

  now = new DateMoment();
  contractSelectedList: ContractReport[] = [];
  contractSelectedListOnPage: ContractReport[] = [];

  constructor(
    injector: Injector,
    protected dataService: ContractReportService,
    protected contractService: ContractService
  ) {
    super(injector);
    this.model = new ContractReport();
  }

  ngOnInit() {
    super.ngOnInit();

    this.model.contractIds = [];
    this.model.isForFinance = false;
    this.now.moment = moment();
  }

  onSubmit() {
    if (this.model.isGetAll) {
      this.model.contractIds = [];
    } else {
      this.model.contractIds = this.contractSelectedList.map(contractReport => contractReport.id);
    }

    this.modal.hide();
    super.onSubmit();
  }

  onSubmitSuccess(model: ContractReport) {
    if (model.document) {
      window.location.href = model.document.fullFilePath;
    }
    super.onSubmitSuccess(model);
  }

  getResetTableParameters(): DataTableParams {
    return _.assign(this.dataTable.getTableParameters(), { offset: 0 });
  }

  onRowSelected(model: ContractReport, isSelected: boolean) {
    const indexContractSelected = _.findIndex(this.contractSelectedList, contractReport => contractReport.id === model.id);
    if (indexContractSelected < 0 && isSelected) {
      this.contractSelectedList.push(model);
    } else {
      this.contractSelectedList.splice(indexContractSelected, 1);
    }
    this.getDataContractSelectedOnPage();
  }

  reloadContractTemplate(params: DataTableParams) {
    this.isLoadingContractList = true;
    const criteria = _.assign({}, this.criteria);
    if (this.criteriaAllInOne.trim()) {
      _.forEach(this.searchFields, (key) => {
        criteria[key] = encodeURIComponent(this.criteriaAllInOne.trim());
      });
    }
    if (!this.model.commissionedFromDate.isEmpty()) {
      criteria['commissionedDateFrom'] = this.model.commissionedFromDate.toData();
    }
    if (!this.model.commissionedToDate.isEmpty()) {
      criteria['commissionedDateTo'] = this.model.commissionedToDate.toData();
    }
    criteria['isForFinance'] = this.model.isForFinance;
    this.contractService.fetchAll(criteria, params)
      .subscribe( (collection) => {
        this.contractTemplateList = collection.items;
        this.contractTemplateMeta = collection.meta;
        this.isLoadingContractList = false;
      }, (error) => {
        this.alertService.error(error);
        this.isLoadingContractList = false;
      });
  }

  reloadContractSelectedTemplate(params: DataTableParams) {
    this.contractSelectedTemplateMeta.page = Math.floor(params.offset / params.limit) + 1;
    this.getDataContractSelectedOnPage();
  }

  getDataContractSelectedOnPage() {
    const start = (this.contractSelectedTemplateMeta.page - 1) * this.contractSelectedPagination.limit;
    const end = ((start + this.contractSelectedPagination.limit) >= this.contractSelectedList.length)
      ? this.contractSelectedList.length : (start + this.contractSelectedPagination.limit);

    this.contractSelectedListOnPage = _.slice(this.contractSelectedList, start, end);
  }

  removeContractSelected(contract: ContractReport) {
    this.contractSelectedList.splice(_.indexOf(this.contractSelectedList, contract), 1);
    this.contractSelectedListOnPage.splice(_.indexOf(this.contractSelectedListOnPage, contract), 1);
    this.getDataContractSelectedOnPage();
  }
}
