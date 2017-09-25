import {Component} from '@angular/core';
import {BreadcrumbService} from 'ng2-breadcrumb/ng2-breadcrumb';
import {AuthGuard} from './auth/auth.guard';
import {ActivatedRoute, Params} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html'
})
export class AppComponent {
  public isUserLoggedIn: boolean;
  public isDisplayedInIFrame: boolean = false;

  constructor(private breadcrumbService: BreadcrumbService, private authGuard: AuthGuard, private route: ActivatedRoute) {
    this.route.queryParams.subscribe((params: Params) => {
      if (!!params['api_key']) {
        this.isDisplayedInIFrame = true;
      }
    });
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
    breadcrumbService.addFriendlyNameForRoute('/anchors', 'Anchors');
    breadcrumbService.addFriendlyNameForRoute('/tags', 'Tags');
    breadcrumbService.addFriendlyNameForRoute('/sinks', 'Sinks');
    breadcrumbService.addFriendlyNameForRouteRegex('^/maps$', 'Published maps');
    breadcrumbService.addFriendlyNameForRouteRegex('/maps/\\d+', 'Map view');
    breadcrumbService.addFriendlyNameForRoute('/users', 'Users');
    breadcrumbService.addFriendlyNameForRoute('/changePassword', 'Change password');
    breadcrumbService.addFriendlyNameForRoute('/permissionGroups', 'Permission groups');

    breadcrumbService.hideRouteRegex('^/complexes/\\d+$');
    breadcrumbService.hideRouteRegex('^/complexes/\\d+/buildings/\\d+$');
    breadcrumbService.hideRouteRegex('^/complexes/\\d+/buildings/\\d+/floors/\\d+$');
    breadcrumbService.hideRouteRegex('^/buildings/\\d+$');
    breadcrumbService.hideRouteRegex('^/floors/\\d+$');
    breadcrumbService.hideRouteRegex('^/login');
    breadcrumbService.hideRouteRegex('^/embedded$');
    breadcrumbService.hideRouteRegex('^/embedded/\\d+\\?api_key=\\w+$');
    breadcrumbService.hideRouteRegex('^/unauthorized');
  }

}
