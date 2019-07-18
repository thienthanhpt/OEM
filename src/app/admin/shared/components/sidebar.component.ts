import { Component, Inject, HostListener, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/platform-browser';

import * as _ from 'lodash';

import { ModelPermission, PageAccess, Model, MODEL_OPTIONS } from '@app/core';

const SIDE_MENU_ITEMS: any = [
  {
    name: 'Dashboard', children: [
      { name: '<i class="far fa-chart-bar"></i> Billing', link: 'dashboard/billing', model: '', action: '' },
    ],
  },
  {
    name: 'Transaction', children: [
      { name: '<i class="fas fa-plus-square"></i> Subscription', model: '', action: '', children: [
          { name: '<i class="fas fa-list"></i> List', link: 'transactions/subscription', model: '', action: '', },
          { name: '<i class="fas fa-upload"></i> DBS Order', link: 'transactions/subscription/dbs-orders', model: '', action: '', }
        ],
      },
      { name: '<i class="fas fa-minus-square"></i> Termination', link: 'transactions/termination', model: '', action: '' },
      { name: '<i class="fas fa-retweet"></i> Relocation', link: 'transactions/relocation', model: '', action: '' },
      { name: '<i class="fas fa-phone-square"></i> Support', link: 'transactions/support', model: '', action: '' },
    ],
  },
  {
    name: 'Management', children : [
      {
        name: '<i class="fas fa-users"></i> Customers', model: MODEL_OPTIONS[Model.Customer], children: [
          { name: '<i class="fas fa-list"></i> List', link: 'management/customers', action: '' },
          { name: '<i class="fas fa-plus"></i> Create', link: 'management/customers/new', action: 'create' },
        ],
      },
      {
        name: '<i class="fas fa-battery-full"></i> Consumers', model: MODEL_OPTIONS[Model.Consumer], children: [
          { name: '<i class="fas fa-list"></i> List', link: 'management/consumers', action: '' },
          { name: '<i class="fas fa-plus"></i> Create', link: 'management/consumers/new', action: 'create' },
          { name: '<i class="fas fa-file-pdf"></i> Usage Data Files',
            link: 'management/consumers/usage-data-files', model: '', action: '' },
        ],
      },
      {
        name: '<i class="fas fa-file-alt"></i> Contracts', model: MODEL_OPTIONS[Model.Contract], children: [
          { name: '<i class="fas fa-list"></i> List', link: 'management/contracts', action: '' },
          { name: '<i class="fas fa-plus"></i> Create', link: 'management/contracts/new', action: 'create' },
        ],
      },
      {
        name: '<i class="fas fa-money-bill-alt"></i> Invoices', model: '', children: [
          { name: '<i class="fas fa-list"></i> List', link: 'management/invoices', action: '' },
          { name: '<i class="fas fa-list"></i> Import Master Invoices', link: 'management/invoices/import', action: '' },
          { name: '<i class="fas fa-list"></i> Starhub CDRs', link: 'management/invoices/cdrs', action: '' },
          { name: '<i class="fas fa-list"></i> Review BP', link: 'management/invoices/review-bp', action: '' },
          { name: '<i class="fas fa-plus"></i> Create', link: 'management/invoices/new', action: 'create' },
        ],
      },
      {
        name: '<i class="fab fa-paypal"></i> Payment', model: MODEL_OPTIONS[Model.Payment], children: [
          { name: '<i class="fas fa-list"></i> List', link: 'management/payments', action: '' },
          { name: '<i class="fas fa-list"></i> Collection Files', link: 'management/payments/collection-files', action: '' },
          { name: '<i class="fas fa-list"></i> DDA Set-up', link: 'management/payments/dda', action: '' },
        ],
      },
      {
        name: '<i class="fas fa-bolt"></i> Products', model: MODEL_OPTIONS[Model.PricePlan], children: [
          { name: '<i class="fas fa-list"></i> List', link: 'management/pricingplans', action: '' },
        ],
      },
      {
        name: '<i class="fas fa-user"></i> Users', model: MODEL_OPTIONS[Model.User], children: [
          { name: '<i class="fas fa-list"></i> List', link: 'management/users', action: '' },
          { name: '<i class="fas fa-plus"></i> Create', link: 'management/users/new', action: 'create' },
        ],
      },
      {
        name: '<i class="fas fa-ticket-alt"></i> Tickets', model: '', children: [
          { name: '<i class="fas fa-list"></i> List', link: 'management/tickets', action: '' },
          { name: '<i class="fas fa-plus"></i> Create', link: 'management/tickets/new', action: 'create' },
        ],
      },
      {
        name: '<i class="fas fa-hand-holding-usd"></i> Promotion', link: 'management/promotion', model: '', action: ''
      },
    ]
  },
  {
    name: 'Report', children: [
      { name: '<i class="fas fa-clipboard-list"></i> EMA', link: 'report/ema', model: '', action: '' },
      { name: '<i class="fas fa-clipboard-list"></i> Sign-up', link: 'report/sign-up', model: '', action: '' },
      { name: '<i class="fas fa-clipboard-list"></i> Billing', link: 'report/billing', model: '', action: '' },
      { name: '<i class="fas fa-clipboard-list"></i> CTR', link: 'report/ctr', model: '', action: '' },
      { name: '<i class="fas fa-clipboard-list"></i> Aging Invoice', link: 'report/aging-invoice', model: '', action: '' },
      { name: '<i class="fas fa-clipboard-list"></i> Payment', link: 'report/payment', model: '', action: '' },
      { name: '<i class="fas fa-clipboard-list"></i> Contract Details', link: 'report/contract', model: '', action: '' },
      { name: '<i class="fas fa-clipboard-list"></i> Promotion', link: 'report/promotion', model: '', action: '' },
    ],
  },
];

@Component({
  selector: 'admin-sidebar',
  template: `
    <nav class="sidebar-nav pb-5 scrollable-sidebar" [ngClass]="{'mt-minus-47': navIsFixed}">
      <ul class="nav pb-4">
        <ng-container *ngFor="let section of sidebarItems; let lastSection = last">

          <ng-container *ngIf="section.children?.length > 0">
            <li class="nav-title">
              <h6 class="mb-0">{{ section.name }}</h6>
            </li>

            <ng-container *ngFor="let item of section.children">
              <ng-container *ngIf="item.children?.length > 0">
                <li class="nav-item nav-dropdown" routerLinkActive="open" appNavDropdown>
                  <a class="nav-link nav-dropdown-toggle" href="#" appNavDropdownToggle [innerHTML]="item.name"></a>
                  <ul *ngFor="let subItem of item.children" class="nav-dropdown-items">
                    <li class="nav-item">
                      <a class="nav-link" routerLinkActive="active"  [routerLinkActiveOptions]="{exact: true}"
                         [routerLink]="[subItem.link]" [innerHTML]="subItem.name">
                      </a>
                    </li>
                  </ul>
                </li>
              </ng-container>

              <ng-container *ngIf="!item.children?.length">
                <li class="nav-item">
                  <a class="nav-link" routerLinkActive="active" [routerLink]="[item.link]" [innerHTML]="item.name"></a>
                </li>
              </ng-container>
            </ng-container>
          </ng-container>

          <ng-container *ngIf="!section.children?.length">
            <li class="nav-item">
              <a class="nav-link" routerLinkActive="active" [routerLink]="[section.link]" [innerHTML]="section.name"></a>
            </li>
          </ng-container>

          <li *ngIf="!lastSection" class="divider"></li>
        </ng-container>
      </ul>
    </nav>
  `
})
export class SidebarComponent implements OnInit {

  Model = Model;

  sidebarItems = SIDE_MENU_ITEMS;

  navIsFixed = false;

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    // We only handle the button create in the management section in this release (1.5)
    _.forEach(this.sidebarItems, (item) => {
      _.forEach(item.children, (subItem) => {
        if (subItem.children) {
         if (_.includes(MODEL_OPTIONS, subItem.model)) {
           if (this.checkPermissionForItem(subItem.model, PageAccess.Create) === false) {
             _.remove(subItem.children, { action: PageAccess.Create });
           }
         }
        }
      });
    });
  }

  // There will be action 'access' when it is implemented in BE
  checkPermissionForItem(model: string, action: PageAccess): boolean {
    const itemToRemove: ModelPermission = JSON.parse(localStorage.getItem(model));
    if (action === PageAccess.Create) {
      return _.get(itemToRemove, 'create');
    } else {
      // Default true if there is no permission restriction from admin portal
      return true;
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop > 200) {
      this.navIsFixed = true;
    } else if (this.navIsFixed && window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop < 200) {
      this.navIsFixed = false;
    }
  }

}
