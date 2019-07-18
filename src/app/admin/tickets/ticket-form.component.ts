import { Component, Injector, ViewChild } from '@angular/core';
import { DataTableComponent } from '../../libs/data-table/components/data-table.component';
import { TabsetComponent } from 'ngx-bootstrap';
import { DataTableParams } from '../../libs/data-table/components/types';

import * as _ from 'lodash';

import { FormComponent } from '../shared/index';
import {
  Attachment, Customer, CustomerService, Ticket, TicketContent, TicketDataTemplateType, TicketService, TicketStatus,
  TicketStep, TicketStepStatus, User, UserService, ErrorResponse,
  TICKET_DATA_TEMPLATE_OPTIONS, TICKET_STATUS_OPTIONS, TICKET_STEP_STATUS_OPTIONS,
} from '@app/core/index';


@Component({
  selector: 'admin-ticket-form',
  templateUrl: 'ticket-form.component.html',
})
export class TicketFormComponent extends FormComponent<Ticket, TicketService> {

  modelName = 'Ticket';

  modalAction = '';

  @ViewChild(TabsetComponent) tabsRef: TabsetComponent;
  @ViewChild(DataTableComponent) dataTable: DataTableComponent;
  @ViewChild(DataTableComponent) dataTicketTable: DataTableComponent;

  ticketList: Ticket[] = [];
  ticketToSetRelationList: Ticket[] = [];
  ticketsMetaToSetRelation: { [ name: string ]: any } = {
    count: 0,
    page: 1,
  };
  ticketCriteriaAllInOne = '';
  ticketSearchFields: string[] = [
    '~name', 'ticketContent.shortDescription', 'assignee', 'customer'
  ];
  relatedTicketList: Ticket[] = [];
  relatedTicketCount = 0;
  isTicketsLoading = false;

  // Ticket cloned to avoid fail server interaction
  ticketCloned: Ticket = null;

  ticketStepStatusOptions = TICKET_STEP_STATUS_OPTIONS;
  ticketStatusOptions = _.omit(TICKET_STATUS_OPTIONS, TicketStatus.Cancel);
  ticketDataTemplateTypeOptions = TICKET_DATA_TEMPLATE_OPTIONS;

  TicketDataTemplateType = TicketDataTemplateType;
  TicketStatus = TicketStatus;

  @ViewChild(DataTableComponent) dataCustomerTable: DataTableComponent;
  customerList: Customer[] = [];
  isCustomerLoading = false;
  customerMeta: { [ name: string ]: any } = {
    count: 0,
    page: 1,
  };
  customerCriteriaAllInOne = '';
  customerSearchFields: string[] = [
    '~spAccountNo', '~name', '~gstRegisteredNo', '~identificationNo',
    '~postalCode', '~address', '~typeValue',
  ];

  assigneeList: User[] = [];
  supervisorList: User[] = [];
  tagList: string[] = [];
  stepList: TicketStep[] = [];
  currentStep: TicketStep = null;
  stepToAction: TicketStep = null;
  ticketContentToAction: TicketContent;
  initialWorkLog: number = null;

  constructor(
    injector: Injector,
    protected dataService: TicketService,
    protected customerService: CustomerService,
    protected userService: UserService,
  ) {
    super(injector);
    this.model = new Ticket();
    this.ticketContentToAction = new TicketContent();
    this.currentStep = new TicketStep();
    this.stepToAction = new TicketStep();
  }

  protected onFetchModelFinished = () => {
    this.alertService.clear();
    if (this.route.snapshot.queryParams['related_ticket']) {
      this.model.parentTicket = this.route.snapshot.queryParams['related_ticket'];
    }
    if (this.is( ['new', 'edit'])) {
      this.userService
        .fetchAll()
        .subscribe( collection => (this.assigneeList = collection.items) && (this.supervisorList = collection.items) );
    }

    if (this.model.id) {
      this.ticketCloned = _.cloneDeep(this.model);
      this.reloadTickets();
      this.reloadSteps(this.model.id);

      this.ticketContentToAction = this.model.ticketContent;

      if (!_.isEmpty(this.model.tags)) {
        this.tagList = _.map(this.model.tags, 'keyword');
      }
    }
  }

  initiateWorkLog = () => {
    this.initialWorkLog = this.stepToAction.workLog;
    if (this.is('edit')) {
      this.stepToAction.workLog = 0;
    }
  }

  uploadSuccess(attachment: Attachment) {
    this.model.ticketDocuments.unshift(attachment);
    this.modal.hide();
  }

  uploadFail() {
      this.modal.hide();
  }

  onTicketAction = (action: 'createRelatedTicket' | 'reassignToSupervisor' | 'cancel' | 'reopen') => {
    this.alertService.clear();
    if (action === 'cancel') {
      this.onTicketStatusUpdate(TicketStatus.Cancel);
    } else if (action === 'reopen') {
      this.onTicketStatusUpdate(TicketStatus.New);
    } else if (action === 'reassignToSupervisor') {
      if (this.model.supervisor) {
        this.model.assignee = this.model.supervisor;
        this.dataService.updatePartial(this.model, [ 'assigneeId', 'supervisorId' ])
          .subscribe((model: Ticket) => this.alertService.info(`Ticket is assigned to ${model.assignee.fullName}`, false));
      } else {
        this.alertService.warn('Please assign a supervisor first', false);
      }
    } else {
      this.goWithHistory([ '/admin/management/tickets/new' ],
        { related_ticket: this.model.name }, [ '/admin/management/tickets', this.model.id, 'edit' ]);
    }
  }

  onTicketStatusUpdate = (status: TicketStatus) => {
    this.alertService.clear();
    if (status === TicketStatus.Assigned) {
      if (this.model.assignee) {
        this.model.ticketStatus = TicketStatus.Assigned;
        this.dataService.updatePartial(this.model, ['ticketStatus', 'assigneeId'])
          .subscribe( (model: Ticket) => {
            this.ticketCloned.ticketStatus = model.ticketStatus;
            this.alertService.success(`Ticket ${model.name} is assigned for ${model.assignee.fullName}`);
          }, () => this.alertService.error('Internal Server Error!'));
      } else {
        this.alertService.warn('Ticket is not assigned yet!');
      }
    } else if (status === TicketStatus.Done) {
      // Check if any step status is new (not executed), if there is any then ticket can not be done
      const pendingStep: string[] = [];
      _.forEach(this.stepList, function(value) {
        if (value.stepStatus === TicketStepStatus.New) {
          pendingStep.push(value.name);
        }
      });

      if (_.isEmpty(pendingStep)) {
        this.model.ticketStatus = TicketStatus.Done;
        this.dataService.updatePartial(this.model, ['ticketStatus'])
          .subscribe( (model: Ticket) => {
            this.ticketCloned.ticketStatus = model.ticketStatus;
            this.alertService.success(`Ticket ${model.name} is ${model.ticketStatus}`);
          }, () => this.alertService.error('Internal Server Error!'));
      } else {
        this.alertService.warn(`All steps should be executed first. Please review following step: ${pendingStep.join(', ')}` );
      }
    } else {
      this.model.ticketStatus = status;
      this.dataService.updatePartial(this.model, ['ticketStatus'])
        .subscribe( (model: Ticket) => {
          this.ticketCloned.ticketStatus = model.ticketStatus;
          this.alertService.success(`Ticket ${model.name} is ${model.ticketStatus}`);
        }, () => this.alertService.error('Internal Server Error!'));
    }
  }

  onSubmit() {
    this.model.keywords = this.tagList.toString();
    this.alertService.clear();
    if (this.is('new')) {
      this.model.ticketStatus = TicketStatus.New;
      this.dataService.create(this.model)
        .subscribe(
          model => {
            this.currentStep.ticket = model;
            this.ticketContentToAction.id = model.ticketContent.id;
            this.ticketContentToAction.ticket = model;
            this.onTicketContentSubmit(this.ticketContentToAction);
            this.onStepSubmit('create');
            this.alertService.success(`Ticket ${model.name} created successfully.`, true);
            this.goToList();
          },
          error => this.onError(error)
        );
    } else {
      this.ticketContentToAction.ticket = this.model;
      this.onTicketContentSubmit(this.ticketContentToAction);
      this.dataService.update(this.model)
        .subscribe(
          model => {
            this.alertService.success(`Ticket ${model.name} updated successfully.`, true);
            this.goToList();
          },
          error => this.onError(error)
        );
    }
  }

  onTicketContentSubmit = (ticketContent: TicketContent) => {
    this.dataService.updatePartialTicketContent(
      ticketContent, [ 'name', 'fullContext', 'shortDescription', 'specialRequest' ]
      ).subscribe( () => {}, (error) => this.onError(error) );
  }

  selectStepById(id: number) {
    this.stepToAction = _.find(this.stepList, { id: Number(id) });
    this.initiateWorkLog();
  }

  initStepUpdate = () => {
    this.stepToAction = this.currentStep;
    this.initiateWorkLog();
    this.modalAction = 'update';
  }

  initStepCreate = (fromStepToAction?: TicketStep) => {
    this.stepToAction = new TicketStep();
    if (fromStepToAction) {
      this.stepToAction.previousStep = fromStepToAction;
    } else {
      this.stepToAction.previousStep = this.currentStep;
    }
    this.modalAction = 'create';
  }

  reloadSteps = (ticketId: number) => {
    this.dataService.fetchAllSteps(ticketId)
      .subscribe( collection => {
        //this condition is temporarily used for incorrect data. Apparently, we should not have an empty array for the step
        if (!_.isEmpty(collection.items)) {
          this.stepList = collection.items;
          this.currentStep = _.findLast(collection.items);
        }
      });
  }

  onStepSubmit = (action: string, isDoneAndCreateNewStep?: boolean) => {
    this.alertService.clear();
    this.stepToAction.workLog += this.initialWorkLog;
    if (this.model.id) {
      this.currentStep.ticket = this.stepToAction.ticket = this.model;
    }
    if (action === 'update') {
      if (isDoneAndCreateNewStep) {
        this.currentStep.stepStatus = TicketStepStatus.Done;
        this.dataService.updatePartialStep(this.currentStep, [ 'stepStatus' ]).subscribe(
          () => {
            this.initStepCreate();
            this.alertService.success(`Step ${this.currentStep.name} done.`, true );
          },
          (error) => this.onError(error));
      } else {
        // this condition is temporarily used for incorrect data. Apparently, we don't need function createStep here
        if (this.stepToAction.id) {
          this.dataService.updatePartialStep(this.stepToAction,
            [ 'name', 'stepStatus', 'assigneeId', 'supervisorId', 'content', 'isNotified', 'description', 'workLog' ]
          ).subscribe( () => {
            this.afterStepSubmit();
            this.alertService.success(`Step ${this.stepToAction.name} updated successfully.`, true );
            this.fetchData(true);
          }, (error) => this.onError(error));
        } else {
          this.createStep(this.stepToAction);
        }
      }
    } else {
      // we create new step directly when we create new ticket and create new step indirectly via modal when we edit ticket
      if (this.is('new')) {
        this.createStep(this.currentStep);
      } else {
        this.createStep(this.stepToAction);
      }
    }
  }

  createStep = (step: TicketStep) => {
    if (!step.stepStatus) {
      step.stepStatus = TicketStepStatus.New;
    }
    step.workLog = 0;
    this.dataService.createStep(step)
      .subscribe( (step: TicketStep) => {
        if (this.is('edit')) {
          this.afterStepSubmit();
          this.alertService.success(`Step ${step.name} created successfully.`, true );
        }
      }, (error) => this.onError(error) );
  }

  afterStepSubmit = () => {
    this.reloadSteps(this.model.id);
    this.modal.hide();
  }

  getResetCustomerTableParameters(): DataTableParams {
    return _.assign(this.dataCustomerTable.getTableParameters(), { offset: 0 });
  }

  reloadCustomer(meta?: DataTableParams) {
    this.isCustomerLoading = true;
    const criteria: { [name: string]: any } = {};
    if (this.customerCriteriaAllInOne) {
      _.forEach(this.customerSearchFields, (key) => {
        criteria[key] = this.customerCriteriaAllInOne;
      });
    }
    this.customerService
      .fetchAll(criteria, meta)
      .subscribe(
        collection => {
          this.customerList = collection.items;
          this.customerMeta = collection.meta;
          this.isCustomerLoading = false;
        },
        (error: ErrorResponse) => {
          this.isCustomerLoading = false;
          this.modal.hide();
          this.alertService.clear();
          this.alertService.error(error.message, true);
        }
      );
  }

  onSelectCustomer(value: Customer) {
    if (!_.isEmpty(value)) {
      this.model.customer = _.cloneDeep(value);
      this.modal.hide();
    }
  }

  getResetTicketTableParameters(): DataTableParams {
    return _.assign(this.dataTicketTable.getTableParameters(), { offset: 0 });
  }

  // Because we have to update the linked ticket so we should decouple the update function
  onUpdateRelatedTicket = (ticketRef: string, action: 'link' | 'unlink') => {
    if (action === 'link') {
      this.model.relatedTickets = this.model.relatedTickets + (this.model.relatedTickets === '' ? ticketRef : (',' + ticketRef));
    } else {
      this.model.relatedTickets = _.without(this.model.relatedTicketArray, ticketRef).toString();
    }
    this.dataService.updatePartial(this.model, ['relatedTickets'])
      .subscribe(() => {
        this.getRelatedTickets(this.ticketList);
        const linkedTicket = _.find(this.ticketList, { 'name': ticketRef });
        if (action === 'link') {
          linkedTicket.relatedTickets = linkedTicket.relatedTickets +
            (linkedTicket.relatedTickets === '' ? this.model.name : (',' + this.model.name));
        } else {
          linkedTicket.relatedTickets = _.without(linkedTicket.relatedTicketArray, this.model.name).toString();
        }
        this.dataService.updatePartial(linkedTicket, ['relatedTickets']).subscribe( () => {});
      });
  }

  reloadTicketToSetRelation = (meta: DataTableParams) => {
    this.isTicketsLoading = true;
    const criteria: { [name: string]: any } = {};
    if (this.ticketCriteriaAllInOne) {
      _.forEach(this.ticketSearchFields, (key) => {
        criteria[key] = this.ticketCriteriaAllInOne;
      });
    }
    this.dataService
      .fetchAll(criteria, meta)
      .subscribe(
        collection => {
          this.ticketToSetRelationList = collection.items;
          this.ticketsMetaToSetRelation = collection.meta;
          this.isTicketsLoading = false;
        },
        (error: ErrorResponse) => {
          this.isTicketsLoading = false;
          this.modal.hide();
          this.alertService.clear();
          this.alertService.error(error.message, true);
        }
      );
  }

  // validTicket and updatePartial function here are being used to avoid app crashing due to dummy data
  getRelatedTickets = (ticketList: Ticket[]) => {
    this.relatedTicketList = [];
    if (this.model.relatedTickets) {
      _.forEach(this.model.relatedTicketArray, (ticketRef) => {
        const validTicket = _.find(ticketList, { 'name': ticketRef });
        if (validTicket) {
          this.relatedTicketList.push(validTicket);
        }
      });
    }
    this.relatedTicketCount = _.size(this.relatedTicketList);
    if (_.isEmpty(this.relatedTicketList)) {
      this.model.relatedTickets = '';
      this.dataService.updatePartial(this.model, ['relatedTickets'])
        .subscribe(() => {
          this.relatedTicketList = [];
        });
    }
  }

  reloadTickets = () => {
    this.dataService
      .fetchAll()
      .subscribe(
        collection => {
          this.isTicketsLoading = false;
          this.ticketList = collection.items;
          this.getRelatedTickets(this.ticketList);
        },
        (error: ErrorResponse) => {
          this.isTicketsLoading = false;
          this.alertService.clear();
          this.alertService.error(error.message, true);
        }
      );
  }
}
