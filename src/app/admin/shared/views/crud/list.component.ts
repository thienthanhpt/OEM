import { Injector, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DataTableComponent, DataTableParams } from '@app/libs/data-table/data-table.module';
import * as _ from 'lodash';

import {
  BaseModel, BaseService, ErrorResponse, ModelPermission, AuthorizationService, PageAccess, Attachment, Collection
} from '@app/core';
import { AdminConfig, AlertService, ModalService } from '../..';

export abstract class ListComponent<
  Model extends BaseModel,
  DataService extends BaseService<Model>
> {

  @ViewChild(DataTableComponent) dataTable: DataTableComponent;

  public adminConfig: { [name: string]: any } = AdminConfig;
  public modal: ModalService;

  isLoading = false;

  data: any;

  PageAccess = PageAccess;

  modelPermission: ModelPermission = null;

  items: Model[] = [];
  meta: { [ name: string ]: any } = {
    count: 0,
    page: 1
  };
  criteriaAllInOne = '';

  protected route: ActivatedRoute;
  protected dataService: DataService;
  protected alertService: AlertService;
  protected authorizationService: AuthorizationService;

  protected criteria: { [name: string]: any } = {};
  // note: add first char '~' when field search OR
  protected searchFields: string[] = [];

  constructor(
    injector: Injector,
  ) {
    this.route = injector.get(ActivatedRoute);
    this.alertService = injector.get(AlertService);
    this.modal = injector.get(ModalService);
    this.data = this.route.snapshot.data;
    this.authorizationService = injector.get(AuthorizationService);
  }

  isAccessible(action: PageAccess): boolean {
    if (this.modelPermission) {
      return this.authorizationService.checkPermission(action, this.modelPermission);
    } else {
      return false;
    }
  }

  getResetTableParameters(): DataTableParams {
    return _.assign(this.dataTable.getTableParameters(), { offset: 0 });
  }

  reloadItems(meta?: DataTableParams) {
    const criteria = _.assign({}, this.criteria);
    if (this.criteriaAllInOne.trim()) {
      _.forEach(this.searchFields, (key) => {
        criteria[key] = encodeURIComponent(this.criteriaAllInOne.trim());
      });
    }
    this.isLoading = true;
    this.dataService
      .fetchAll(criteria, meta)
      .subscribe(this.assignItems, (error) => this.onError(error), () => this.onComplete());
  }

  assignItems = (collection: Collection<Model>) => {
    this.items = collection.items;
    this.meta = collection.meta;
  }

  isPreviewDocumentSupport = (attachment: Attachment) => {
    if (!attachment) {
      return false;
    }
    return new RegExp(this.adminConfig.validation.previewFile, 'i').test(attachment.filePath);
  }

  scrollIntoView = (documentViewID: string) => {
    const element = document.getElementById(documentViewID);
    element.scrollIntoView({behavior: 'smooth', block: 'start'});
  }

  protected onError = (error: ErrorResponse) => {
    this.alertService.error(error.message, true);
    this.isLoading = false;
    // Trigger reloading when fetch data failed.
    this.dataTable._reloading = false;
  }

  protected onComplete = () => {
    this.isLoading = false;
  }
}
