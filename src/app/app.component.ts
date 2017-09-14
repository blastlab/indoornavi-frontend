import {Component} from '@angular/core';
import {BreadcrumbService} from 'ng2-breadcrumb/ng2-breadcrumb';
import {AuthGuard} from './auth/auth.guard';

@Component({
  selector: 'app-root',
  templateUrl: './app.html'
})
export class AppComponent {
  public isUserLoggedIn: boolean;

  constructor(private breadcrumbService: BreadcrumbService, private authGuard: AuthGuard) {
    this.isUserLoggedIn = !!localStorage.getItem('currentUser');
    this.authGuard.userLoggedIn().subscribe((loggedIn: boolean) => {
      this.isUserLoggedIn = loggedIn;
    });
    breadcrumbService.addFriendlyNameForRoute('/complexes', 'Complexes');
    breadcrumbService.addFriendlyNameForRoute('/buildings', 'Buildings');
    breadcrumbService.addFriendlyNameForRoute('/floors', 'Floors');
    breadcrumbService.addFriendlyNameForRouteRegex('/complexes/\\d+/buildings', 'Buildings');
    breadcrumbService.addFriendlyNameForRouteRegex('/buildings/\\d+/floors', 'Floors');
    breadcrumbService.addFriendlyNameForRouteRegex('/floors/\\d+/map', 'Map');
    breadcrumbService.addFriendlyNameForRoute('/sinks', 'Sinks');
    breadcrumbService.addFriendlyNameForRoute('/anchors', 'Anchors');
    breadcrumbService.addFriendlyNameForRoute('/tags', 'Tags');
    breadcrumbService.addFriendlyNameForRoute('/users', 'Users');
    breadcrumbService.addFriendlyNameForRoute('/changePassword', 'Change password');
    breadcrumbService.addFriendlyNameForRoute('/permissionGroups', 'Permission groups');

    breadcrumbService.hideRouteRegex('^/complexes/\\d+$');
    breadcrumbService.hideRouteRegex('^/complexes/\\d+/buildings/\\d+$');
    breadcrumbService.hideRouteRegex('^/complexes/\\d+/buildings/\\d+/floors/\\d+$');
    breadcrumbService.hideRouteRegex('^/buildings/\\d+$');
    breadcrumbService.hideRouteRegex('^/floors/\\d+$');
    breadcrumbService.hideRouteRegex('^/login');
    breadcrumbService.hideRouteRegex('^/unauthorized');
  }

}
