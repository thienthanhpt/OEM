import { Injector, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras, Params } from '@angular/router';
import { Location } from '@angular/common';

import { NGXLogger } from 'ngx-logger';
import * as _ from 'lodash';

import { BaseModel, BaseService, ErrorResponse, ModelPermission, AuthorizationService, PageAccess, Attachment } from '@app/core';
import { AlertService, AdminConfig, ModalService } from '../..';

export abstract class FormComponent<
  Model extends BaseModel,
  DataService extends BaseService<Model>
> implements OnInit {

  modelPermission: ModelPermission = null;
  PageAccess = PageAccess;

  modal: ModalService;

  isLoading = false;
  hasBackHistory = false;

  abstract modelName: string;
  action: string;
  data: any;
  model: Model;

  historyParams: string[] = [];

  documentToPreview: Attachment = null;
  adminConfig: { [name: string]: any } = AdminConfig;

  protected router: Router;
  protected route: ActivatedRoute;
  protected logger: NGXLogger;
  protected alertService: AlertService;
  protected authorizationService: AuthorizationService;

  protected location: Location;

  protected dataService: DataService;

  constructor(
    injector: Injector
  ) {
    this.router = injector.get(Router);
    this.route = injector.get(ActivatedRoute);
    this.logger = injector.get(NGXLogger);
    this.alertService = injector.get(AlertService);
    this.modal = injector.get(ModalService);
    this.data = this.route.snapshot.data;
    this.location = injector.get(Location);
    this.authorizationService = injector.get(AuthorizationService);
  }

  ngOnInit() {
    this.action = _.chain(this.route.snapshot.url).last().get('path', '').value();

    this.fetchData();

    const queryParamBackHistory = this.route.snapshot.queryParams[this.adminConfig.queryParams.backHistory];
    if (!_.isEmpty(queryParamBackHistory)) {
      this.historyParams = decodeURIComponent(queryParamBackHistory).split(',');
      this.hasBackHistory = true;
    }
  }

  isAccessible(action: PageAccess): boolean {
    if (this.modelPermission) {
      return this.authorizationService.checkPermission(action, this.modelPermission);
    } else {
      return false;
    }
  }

  is(action: string | string[]) {
    if (_.isArray(action)) {
      return _.includes(action, this.action);
    } else {
      return action === this.action;
    }
  }

  onSubmit() {
    this.isLoading = true;
    this.alertService.clear();
    this.save().subscribe(
      (model: Model) => this.onSubmitSuccess(model),
      this.onError, this.onComplete
    );
  }

  selectById(id: any, assignTo: string, listName: string) {
    const selectedItem = _.chain(this).get(listName).find({ id: Number(id) }).value();
    _.set(this, assignTo, selectedItem);
  }

  getHistoryParams(queryParams: Params = {}, linkHistory: any[] | string = null): Params {
    //set link to history with this page
    let urlHistory = window.location.pathname;
    if (!_.isEmpty(linkHistory)) {
      //link another
      if (_.isArray(linkHistory)) {
        urlHistory = linkHistory.join('/');
      } else {
        urlHistory = linkHistory;
      }
    }

    if (_.indexOf(this.historyParams, urlHistory) === -1) {
      this.historyParams.push(urlHistory);
    }

    if (!_.isEmpty(this.historyParams))
      _.set(queryParams, this.adminConfig.queryParams.backHistory, encodeURI(this.historyParams.join(',')));

    return queryParams;
  }

  linkWithHistory(link: any[] | string, queryParams: Params = {}, linkHistory: any[] | string = null): string {
    const extras: NavigationExtras = {
      queryParams: this.getHistoryParams(queryParams, linkHistory),
      relativeTo: this.route
    };
    if (_.isArray(link)) {
      return this.router.createUrlTree(link, extras).toString();
    } else {
      return this.router.createUrlTree([link], extras).toString();
    }
  }

  linkToList(): string {
    return this.router.createUrlTree([ this.is('new') ? '..' : '../..' ], { relativeTo: this.route }).toString();
  }

  linkToBack(): string {
    let goLink = '';
    if (this.historyParams.length > 0) {
      goLink = _.last(this.historyParams);
      this.historyParams = _.dropRight(this.historyParams);

      if (goLink === window.location.pathname) {
        goLink = _.last(this.historyParams);
        this.historyParams = _.dropRight(this.historyParams);
      }

      const queryParams: Params = {};

      if (!_.isEmpty(this.historyParams))
        _.set(queryParams, this.adminConfig.queryParams.backHistory, encodeURI(this.historyParams.join(',')));

      return this.router.createUrlTree([goLink], { queryParams: queryParams, relativeTo: this.route }).toString();
    } else
      return goLink;
  }

  goWithHistory(link: any[] | string, queryParams: Params = {}, linkHistory: any[] | string = null) {
    this.router.navigateByUrl(
      this.linkWithHistory(link, queryParams, linkHistory)
    );
  }

  goToList() {
    this.router.navigateByUrl(
      this.linkToList()
    );
  }

  goBack() {
    const url = this.linkToBack();
    if (!_.isEmpty(url))
      this.router.navigateByUrl(url);
    else
      this.location.back();
  }

  isPreviewDocumentSupport = (attachment: Attachment) => {
    return new RegExp(this.adminConfig.validation.previewFile, 'i').test(attachment.filePath);
  }

  scrollIntoView = (documentViewID: string) => {
    const element = document.getElementById(documentViewID);
    element.scrollIntoView({behavior: 'smooth', block: 'start'});
  }

  protected fetchData = (reload = false) => {
    if (!this.is('new')) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      if (!_.get(this.model, 'id') || reload) {
        this.isLoading = true;
        this.dataService
          .fetchOne(id)
          .subscribe(
            (model: Model) => {
              this.onFetchModelSuccess(model);
              this.onFetchModelFinished();
            }, this.onError, this.onComplete
          );
      }
    } else {
      this.onFetchModelFinished();
    }
  }

  protected onFetchModelSuccess = (model: Model) => {
    this.model = model;
  }

  protected onFetchModelFinished = () => { };

  protected onError = (error: ErrorResponse) => {
    this.alertService.clear();
    if (!_.isEmpty(error.errors)) {
      Object.keys(error.errors).forEach(key => {
        error.message += (' ' + key + ': ' + error.errors[key]);
      });
    }
    this.alertService.error(error.message, true);
    this.isLoading = false;
  }

  protected onComplete = () => {
    this.isLoading = false;
  }

  protected onSubmitSuccess(model: Model): void {
    this.logger.debug(this.is('new') ? 'Created' : 'Updated', this.model, model);
    this.alertService.success(`${this.modelName} ${this.is('new') ? 'created' : 'updated'} successfully.`, true);

    this.goToList();
  }

  private save() {
    return (this.is('new'))
      ? this.dataService.create(this.model)
      : this.dataService.update(this.model);
  }
}
