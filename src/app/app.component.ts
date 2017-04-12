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
    breadcrumbService.addFriendlyNameForRoute('/floors', 'Floors');
    breadcrumbService.addFriendlyNameForRouteRegex('/complexes/\\d+/buildings', 'Buildings');
    breadcrumbService.addFriendlyNameForRouteRegex('/buildings/\\d+/floors', 'Floors');
    breadcrumbService.addFriendlyNameForRouteRegex('/floors/\\d+/map', 'Map');
    breadcrumbService.addFriendlyNameForRoute('/anchors', 'Anchors');
    breadcrumbService.addFriendlyNameForRoute('/tags', 'Tags');

    breadcrumbService.hideRouteRegex('^/complexes/\\d+$');
    breadcrumbService.hideRouteRegex('^/complexes/\\d+/buildings/\\d+$');
    breadcrumbService.hideRouteRegex('^/complexes/\\d+/buildings/\\d+/floors/\\d+$');
    breadcrumbService.hideRouteRegex('^/buildings/\\d+$');
    breadcrumbService.hideRouteRegex('^/floors/\\d+$');
  }
}
