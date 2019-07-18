import { Injectable, TemplateRef } from '@angular/core';

import { Subscription } from 'rxjs';
import { BsModalService, BsModalRef, ModalOptions } from 'ngx-bootstrap';
import * as _ from 'lodash';

import { AlertService } from './alert.service';

export interface ModalConfig {
  events?: {
    onShow?: (reason: string) => void;
    onShown?: (reason: string) => void;
    onHide?: (reason: string) => void;
    onHidden?: (reason: string) => void;
  };
}

@Injectable()
export class ModalService {

  refs: BsModalRef[] = [];

  private hasModalConfig = false;
  private modalConfig: ModalConfig = {};
  private subscriptions: Subscription[] = [];

  constructor(
    protected modalService: BsModalService,
    protected alertService: AlertService
  ) { }

  config(config: ModalConfig) {
    this.modalConfig = config;
    this.hasModalConfig = true;

    return this;
  }

  open(template: TemplateRef<any> | any, sizeClass: 'sm' | 'md' | 'lg' | 'xl' | '' = 'sm', initialState?: {}, extraOption?: ModalOptions) {
    const options: ModalOptions = { class: `modal-${sizeClass}`, animated: true };
    let ref: BsModalRef = null;

    this.alertService.clear();

    if (extraOption) {
      if (extraOption.class) {
        options.class += ' ' + extraOption.class;
        delete extraOption.class;
      }
      _.assign(options, extraOption);
      ref = this.modalService.show(template, options);
    } else {
      ref = this.modalService.show(template,
        { class: `modal-${sizeClass}`, animated: true, initialState });
    }

    if (this.hasModalConfig) {
      if (!_.isEmpty(this.modalConfig.events)) {
        _.forEach(['onShow', 'onShown', 'onHide'], (eventName: 'onShow' | 'onShown' | 'onHide') => {
          if (_.has(this.modalConfig.events, eventName)) {
            this.subscriptions.push(this.modalService[eventName].subscribe((reason: string) => {
              this.modalConfig.events[eventName](reason);
            }));
          }
        });
        this.subscriptions.push(
          this.modalService.onHidden.subscribe((reason: string) => {
            if (_.has(this.modalConfig.events, 'onHidden')) {
              this.modalConfig.events.onHidden(reason);
            }
            this.unsubscribe();
          })
        );
      }

      // reset modal configs
      this.hasModalConfig = false;
      // this.modalConfig = {};
    }

    this.refs.push(ref);
    return ref;
  }

  hide = () => {
    if (!_.isEmpty(this.refs)) {
      _.last(this.refs).hide();
      this.refs.pop();
    }
  }

  private unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  isExists() {
    return (this.refs.length > 0) ? true : false;
  }
}
