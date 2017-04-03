import { Component } from '@angular/core';
import {BreadcrumbService} from 'ng2-breadcrumb/ng2-breadcrumb';

@Component({
  selector: 'app-root',
  template: `
    <breadcrumb></breadcrumb>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  constructor(private breadcrumbService: BreadcrumbService) {
    breadcrumbService.addFriendlyNameForRoute('/complexes', 'Complexes');
    breadcrumbService.addFriendlyNameForRouteRegex('/complexes/\\d+/buildings', 'Buildings');
    breadcrumbService.hideRouteRegex('^/complexes/\\d+$');
    breadcrumbService.addFriendlyNameForRoute('/anchors', 'Anchors');
  }
}
