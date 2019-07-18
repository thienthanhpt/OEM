import { Component } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-breadcrumbs',
  template: `
    <ol class="breadcrumb">
      <li *ngFor="let breadcrumb of breadcrumbs; last as isLast; first as isFirst" class="breadcrumb-item" [ngClass]="{active: isLast}">
        <a *ngIf="!isLast && !isFirst" [routerLink]="breadcrumb.url">{{ breadcrumb.title }}</a>
        <span *ngIf="isLast || isFirst">{{ breadcrumb.title }}</span>
      </li>
    </ol>
  `
})
export class BreadcrumbsComponent {

  breadcrumbs: Array<{ url: string; title: string; }>;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.breadcrumbs = [];
        let currentRoute = this.route.root,
        url = '';
        do {
          const childrenRoutes = currentRoute.children;
          currentRoute = null;
          childrenRoutes.forEach(route => {
            if (route.outlet === 'primary') {
              const routeSnapshot = route.snapshot;

              const childUrl = routeSnapshot.url.map(segment => segment.path).join('/');
              // since empty route will be assigned to component-less route, should remove the empty route
              if (childUrl === '') {
                return;
              }
              url += '/' + childUrl;

              let data: any;
              // handle path for component-less route
              if (route.component === undefined) {
                const emptyRoute = route.routeConfig.children.find(childRoute => childRoute.path === '' );
                if (emptyRoute && emptyRoute.data) {
                  data = emptyRoute.data;
                } else {
                  data = route.snapshot.data;
                }
              } else {
                data = route.snapshot.data;
              }

              if (data && data.title) {
                this.breadcrumbs.push({ title: data.title, url: url });
              }
              currentRoute = route;
            }
          });
        } while (currentRoute);
      }
    );
  }
}
