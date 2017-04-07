import {Component} from '@angular/core';
import {BreadcrumbService} from 'ng2-breadcrumb/ng2-breadcrumb';

@Component({
  selector: 'app-root',
  templateUrl: './app.html'
})
export class AppComponent {
  constructor(private breadcrumbService: BreadcrumbService) {
    breadcrumbService.addFriendlyNameForRoute('/complexes', 'Complexes');
    breadcrumbService.addFriendlyNameForRoute('/buildings', 'Buildings');
    breadcrumbService.addFriendlyNameForRouteRegex('/complexes/\\d+/buildings', 'Buildings');
    breadcrumbService.addFriendlyNameForRouteRegex('/buildings/\\d+/floors', 'Floors');
    breadcrumbService.hideRouteRegex('^/complexes/\\d+$');
    breadcrumbService.hideRouteRegex('^/buildings/\\d+$');
    breadcrumbService.addFriendlyNameForRoute('/anchors', 'Anchors');
    breadcrumbService.addFriendlyNameForRoute('/tags', 'Tags');
  }
}
