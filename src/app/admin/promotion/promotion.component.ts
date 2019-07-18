import { Component, Injector, ViewChild } from '@angular/core';
import { ListComponent } from '../shared/index';
import {
  PromotionCampaign,
  PromotionCampaignService,
  PromotionCode, PromotionStatus,
  CustomerTypes, CUSTOMER_TYPES
} from '../../core/data-services/promotion-campaign.service';
import * as _ from 'lodash';
import { DataTableParams } from '../../libs/data-table/components/types';
import { Attachment, ErrorResponse } from '../../core/data-services';

export enum InputFieldType {
  ReadOnly = 'readonly',
  Text = 'text',
  Email = 'email',
  Number = 'number',
  CheckBox = 'checkbox',
  DropDown = 'dropDown',
  DropDownYesNo = 'dropDownYesNo',
  Radio = 'radio',
  Date = 'date',
  TextArea = 'textArea'
}

enum HeaderKeyCSV {
  Code = 'promotion code',
  Limit = 'limit',
  CustomerType = 'customer type',
  PromoType = 'promotype'
}

@Component({
  selector: 'admin-promotion',
  templateUrl: 'promotion.component.html'
})
export class PromotionComponent extends ListComponent<PromotionCampaign, PromotionCampaignService> {
  @ViewChild('promotionCampaignModal') promotionCampaignModal: any;
  @ViewChild('addPromotionCodeModal') addPromotionCodeModal: any;
  @ViewChild('promotionImportedModal') promotionImportedModal: any;

  promotionCodeToAdd: PromotionCode[] = [];
  promotionCodeToDisplay: PromotionCode[] = [];
  promotionCodeToDisplayOnPage: PromotionCode[] = [];
  promotionCodeIdsToDelete: number[] = [];
  promotionCodeMeta: { [ name: string ]: any } = {
    count: 0,
    page: 1,
  };
  promotionCodePagination: DataTableParams = {
    limit: 10,
    sortBy: 'created_date',
    sortAsc: false,
    offset: 0,
  };
  promotionCampaignPagination: DataTableParams = {
    limit: 10,
    sortBy: 'createdTime',
    sortAsc: false,
    offset: 0,
  };
  promotionCampaign = new PromotionCampaign();
  promotionCodeToCreate = new PromotionCode();
  promotionCodeListToInsert: PromotionCode[] = [];

  promotionCodeToInsertPagination: DataTableParams = {
    limit: 10,
    offset: 0
  };

  promotionCodeToInsertMeta: { [name: string]: any } = {
    count: 0,
    page: 1
  };

  customerTypes = CustomerTypes;
  customerTypesDropDown = CUSTOMER_TYPES;

  isCreate = false;
  isEdit = false;
  isReview = false;
  isAddedPromoCode = false;
  notificationMessage = '';
  promotionCodeStatus = PromotionStatus;
  isLoadingButton = false;

  constructor(
    injector: Injector,
    protected dataService: PromotionCampaignService,
  ) {
    super(injector);
  }

  reloadPromotionCode(params: DataTableParams) {
    if (this.isEdit && !this.isCreate) {
      this.fetchAllPromotionCode(this.promotionCampaign.id, params);
    }
  }

  fetchAllPromotionCode(promotionCampaignId: number, params: DataTableParams) {
    this.dataService.fetchAll({ 'id': this.promotionCampaign.id }, params).subscribe(
      (collection) => {
        // this.promotionCodeToAdd = collection.items[0].promotionCodes;
        this.promotionCodeMeta = collection.meta;
      });
  }

  uploadSuccess(attachment: Attachment) {
    this.modal.hide();
  }

  reader(content: string) {
    this.promotionCodeListToInsert = [];
    let indexOfCode: number = null;
    let indexOfLimit: number = null;
    let indexOfCustomerType: number = null;
    let indexOfPromoType: number = null;
    _.forEach(content.split('\n'), (line, index) => {
      if (line) {
        if (index === 0) {

          const headers = _.clone(_.toLower(line).split(','));
          indexOfCode = headers.indexOf(HeaderKeyCSV.Code);
          indexOfLimit = headers.indexOf(HeaderKeyCSV.Limit);
          indexOfCustomerType = headers.indexOf(HeaderKeyCSV.CustomerType);
          indexOfPromoType = headers.indexOf(HeaderKeyCSV.PromoType);

        } else if (index > 0 && _.trim(line)) {

          const values = line.split(',');
          console.log(values);
          const promoCodeInsert = new PromotionCode();
          promoCodeInsert.code = values[indexOfCode];
          promoCodeInsert.limit = _.toNumber(values[indexOfLimit]);
          promoCodeInsert.customerType = _.toLower(values[indexOfCustomerType]);

          if (_.find(this.promotionCodeListToInsert, { code: promoCodeInsert.code })
              || _.find(this.promotionCodeToDisplay, { code: promoCodeInsert.code })) {

            promoCodeInsert.status = this.promotionCodeStatus.Invalid;
            promoCodeInsert.reason = 'Code ' + promoCodeInsert.code + ' is duplicated.';

          } else if (!_.isEqual(this.promotionCampaign.customerType, this.customerTypes.Any)
                    && !_.isEqual(this.promotionCampaign.customerType, promoCodeInsert.customerType)) {

            promoCodeInsert.status = this.promotionCodeStatus.Invalid;
            promoCodeInsert.reason = 'Customer Type must be ' + this.promotionCampaign.customerTypeDisplay + '.';

          } else {
            promoCodeInsert.status = this.promotionCodeStatus.Valid;
          }

          this.promotionCodeListToInsert.push(promoCodeInsert);

          if ((index + 1) === content.split('\n').length) {
            this.modal.hide();
            this.modal.open(this.promotionImportedModal, 'lg');
            return;
          }
        }
      } else {
        this.modal.hide();
        this.modal.open(this.promotionImportedModal, 'lg');
        return;
      }
    });
  }

  addPromotionCode() {
    if (!_.find(this.promotionCodeToDisplay, { code: this.promotionCodeToCreate.code })) {
      if (this.promotionCampaign.id) {
        this.dataService.checkExists([this.promotionCodeToCreate], this.promotionCampaign.id).subscribe(
          () => {
              this.promotionCodeToDisplay.push(_.clone(this.promotionCodeToCreate));
              this.getPromotionCodeOnPage();
              this.promotionCodeToAdd.push(_.clone(this.promotionCodeToCreate));
              this.isAddedPromoCode = true;
              this.modal.hide();
              this.notificationMessage = 'Promotion code ' + this.promotionCodeToCreate.code + ' is added successfully.';
          },
          (error) => {
            this.isAddedPromoCode = false;
            this.notificationMessage = 'Promotion code ' + this.promotionCodeToCreate.code + ' is exists.';
          }
        );
      } else {
        this.promotionCodeToDisplay.push(_.clone(this.promotionCodeToCreate));
        this.getPromotionCodeOnPage();
        this.promotionCodeToAdd.push(_.clone(this.promotionCodeToCreate));
        this.isAddedPromoCode = true;
        this.modal.hide();
        this.notificationMessage = 'Promotion code ' + this.promotionCodeToCreate.code + ' is added successfully.';
      }
    } else {
      this.isAddedPromoCode = false;
      this.notificationMessage = 'Promotion code ' + this.promotionCodeToCreate.code + ' is exists.';
    }
  }

  addPromotionCampaign() {
    this.isLoadingButton = true;
    this.promotionCampaign.promotionCodes = this.promotionCampaign.promotionCodes.concat(this.promotionCodeToDisplay);
    this.dataService.create(this.promotionCampaign).subscribe(
      () => {
        this.isLoadingButton = false;
        this.closeModal();
        this.reloadItems(this.promotionCampaignPagination);
        // this.fetchAllPromotionCode(this.promotionCampaign.id, this.promotionCampaignPagination);
        this.alertService.success('Create Promotion Campaign successfully.');
      },
      (error: ErrorResponse) => {
        this.isLoadingButton = false;
        this.closeModal();
        this.alertService.error(error.message);
      }
    );
  }

  updatePromotionCampaign() {
    this.isLoadingButton = true;
    this.dataService.update(this.promotionCampaign).subscribe(
      () => {
        this.isLoadingButton = false;
        if (this.promotionCodeIdsToDelete.length > 0) {
          this.dataService.delete(this.promotionCodeIdsToDelete, this.promotionCampaign.id).subscribe(
            () => {
              this.promotionCodeIdsToDelete = [];
            }
          );
        }
        if (this.promotionCodeToAdd.length > 0) {
          this.dataService.addPromotionCode(this.promotionCodeToAdd, this.promotionCampaign.id).subscribe(
            () => {
              this.closeModal();
              this.reloadItems(this.promotionCampaignPagination);
              this.alertService.success('Update Promotion Campaign successfully.');
            }
          );
        } else {
          this.closeModal();
          this.reloadItems(this.promotionCampaignPagination);
          this.alertService.success('Update Promotion Campaign successfully.');
        }
      },
      (error: ErrorResponse) => {
        this.isLoadingButton = false;
        this.closeModal();
        this.alertService.error(error.message);
      }
    );
  }

  detailPromotionCampaign(promotionCampaign: PromotionCampaign) {
    this.promotionCodeToAdd = [];
    this.promotionCampaign = _.cloneDeep(promotionCampaign);
    this.promotionCodeToDisplay = _.cloneDeep(promotionCampaign.promotionCodes);
    this.promotionCodeMeta.page = 1;
    this.getPromotionCodeOnPage();
    this.modal.open(this.promotionCampaignModal, 'md');
  }

  getPromotionCodeOnPage() {
    const start = (this.promotionCodeMeta.page - 1) * this.promotionCodePagination.limit;
    const end = (start + this.promotionCodePagination.limit > this.promotionCodeToDisplay.length)
      ? this.promotionCodeToDisplay.length
      : start + this.promotionCodePagination.limit;

    this.promotionCodeToDisplayOnPage = _.slice(this.promotionCodeToDisplay, start, end);
  }

  deletePromotionCode(promotionCode: PromotionCode) {
    if (promotionCode.id && !this.promotionCodeIdsToDelete.includes(promotionCode.id)) {
      this.promotionCodeIdsToDelete.push(promotionCode.id);
    } else {
      if (_.find(this.promotionCodeToAdd, { code: promotionCode.code })) {
        const indexCode = _.findIndex(this.promotionCodeToAdd, { code: promotionCode.code });
        if (indexCode > -1) {
          this.promotionCodeToAdd.slice(indexCode, 1);
        }
      }
    }
    const indexCampaign = _.findIndex(this.promotionCodeToDisplay, { id: promotionCode.id });
    if (indexCampaign > -1) {
      this.promotionCodeToDisplay.splice(indexCampaign, 1);
      this.getPromotionCodeOnPage();
    }
  }

  createPromotionCampaign() {
    this.isCreate = true;
    this.isEdit = false;
    this.isReview = false;
    this.promotionCampaign = new PromotionCampaign();
    this.promotionCampaign.customerType = this.customerTypes.Any;
    this.promotionCodeToDisplay = [];
    this.getPromotionCodeOnPage();
    this.modal.open(this.promotionCampaignModal, 'md');
  }

  importPromotionCode() {
    _.forEach(this.promotionCodeListToInsert, promotion => {
      if (!_.find(this.promotionCodeToDisplay, { code: promotion.code })
          && _.isEqual(promotion.status, this.promotionCodeStatus.Valid)) {
        this.promotionCodeToDisplay.push(promotion);
        this.promotionCodeToAdd.push(promotion);
      }
    });

    this.getPromotionCodeOnPage();

    if (this.isEdit) {
      this.dataService.checkExists(this.promotionCodeListToInsert, this.promotionCampaign.id).subscribe(
        (collection) => {
          this.promotionCodeListToInsert = [];
        },
        error => {
          this.onError(error);
        }
      );
    }

    this.modal.hide();
  }

  addPromotionCodeDetail() {
    this.notificationMessage = '';
    this.promotionCodeToCreate = new PromotionCode();
    this.promotionCodeToCreate.customerType = this.promotionCampaign.customerType;
    this.modal.open(this.addPromotionCodeModal, 'sm', null, { class: 'box-shadow margin-top-sm' });
  }

  reloadPromotionCodes(params: DataTableParams) {
    this.promotionCodeMeta.page = Math.floor(params.offset / params.limit) + 1;
    this.getPromotionCodeOnPage();
  }

  closeModal() {
    while (this.modal.isExists()) {
      this.modal.hide();
    }
  }

  get isExistsPromotionsCanBeImport(): boolean {
    return (_.filter(this.promotionCodeListToInsert,
        promotion => (_.has(this.customerTypesDropDown, _.toLower(promotion.customerType))))
      .length > 0) ? true : false;
  }

}
