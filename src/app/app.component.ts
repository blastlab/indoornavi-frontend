import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {AuthGuard} from './auth/auth.guard';
import {ActivatedRoute, Params} from '@angular/router';
import {MenuItem} from 'primeng/primeng';
import {Subscription} from 'rxjs/Subscription';
import {BreadcrumbService} from './shared/services/breadcrumbs/breadcrumb.service';
import {Location} from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit, OnDestroy {
  isUserLoggedIn: boolean;
  isDisplayedInIFrame: boolean = false;
  sidebar: boolean = false;
  breadcrumbs: MenuItem[];
  mapPublication: boolean = false;
  private userLoggedInSubscription: Subscription;
  private breadcrumbIsReadySubscription: Subscription;

  constructor(
    private authGuard: AuthGuard,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private cd: ChangeDetectorRef,
    private location: Location) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params: Params) => {
      if (!!params['api_key']) {
        this.isDisplayedInIFrame = true;
      }
    });
    this.isUserLoggedIn = !!localStorage.getItem('currentUser');
    this.userLoggedInSubscription = this.authGuard.userLoggedIn().subscribe((loggedIn: boolean) => {
      if (!loggedIn) {
        localStorage.removeItem('currentUser');
      }
      this.isUserLoggedIn = loggedIn;
    });
    this.breadcrumbIsReadySubscription = this.breadcrumbService.isReady().subscribe((breadcrumbs: MenuItem[]) => {
      this.breadcrumbs = breadcrumbs;
      this.cd.detectChanges();
    });
    this.hideSidebar();
    this.mapPublication = this.location.path().match(/publications/) ? true : false;
  }

  ngOnDestroy() {
    this.userLoggedInSubscription.unsubscribe();
    this.breadcrumbIsReadySubscription.unsubscribe();
  }

  displaySidebar(): void {
    this.sidebar = true;
  }

  hideSidebar(): void {
    this.sidebar = false;
  }

  logout(): void {
    this.isUserLoggedIn = false;
    this.hideSidebar();
  }
}
