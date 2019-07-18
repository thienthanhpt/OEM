import { Injectable } from '@angular/core';
import * as _ from 'lodash';

import { BaseModel, BaseService, Ticket } from './index';

export const TICKET_TAG_FIELD_MAP = {
  keyword: 'keywords', ticketData: 'ticket',
};

export class TicketTag extends BaseModel {
  keyword = '';
  ticket: Ticket = null;

  set ticketData(data: object) {
    if (!_.isEmpty) {
      this.ticket = new Ticket().fromData(data);
    }
  }

  protected getFieldMap() {
    return super.getFieldMap(TICKET_TAG_FIELD_MAP);
  }
}

function newTag(data: object): TicketTag {
  return new TicketTag().fromData(data);
}

@Injectable()
export class TicketTagService extends BaseService<TicketTag> {

  protected baseUrl = 'tag';

  protected newModel = (data: object) => newTag(data);

  protected getFieldMap() {
    return super.getFieldMap(TICKET_TAG_FIELD_MAP);
  }

}
