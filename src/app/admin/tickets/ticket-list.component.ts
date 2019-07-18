import { Component, Injector, OnInit } from '@angular/core';

import * as _ from 'lodash';

import { ListComponent } from '../shared';
import { Ticket, TicketService, TicketStatus, TICKET_STATUS_OPTIONS, Collection } from '@app/core';

@Component({
  selector: 'admin-tickets-list',
  templateUrl: 'ticket-list.component.html'
})
export class TicketListComponent extends ListComponent<Ticket, TicketService> implements OnInit {

  activeTab: string;

  ticketStatusCategories = _.map(TICKET_STATUS_OPTIONS, (name, value) => ({ name, value, count: 0 }));
  TicketStatus = TicketStatus;

  constructor(
    injector: Injector,
    protected dataService: TicketService
  ) {
    super(injector);
  }

  ngOnInit() {
    this.criteria['ticketStatus'] = this.activeTab = this.TicketStatus.New;
  }

  assignItems = (collection: Collection<Ticket>) => {
    this.items = collection.items;
    this.meta = collection.meta;
    _.forEach(this.ticketStatusCategories, (category) => {
      category.count = _.chain(collection.meta.status_categorize).find( { status: category.value })
        .get('count', 0)
        .value();
    });
  }

  onTabSelect(status: string): void {
    this.items = [];
    this.activeTab = this.criteria.ticketStatus = status;
    this.reloadItems(this.getResetTableParameters());
  }

}

