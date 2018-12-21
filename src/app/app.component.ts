import {AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {AuthGuard} from './auth/auth.guard';
import {ActivatedRoute, Params} from '@angular/router';
import {MenuItem} from 'primeng/primeng';
import {Subscription} from 'rxjs/Subscription';
import {BreadcrumbService} from './shared/services/breadcrumbs/breadcrumb.service';
import {Location} from '@angular/common';
import {Helper} from './shared/utils/helper/helper';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewChecked {
  isUserLoggedIn: boolean;
  isDisplayedInIFrame: boolean = false;
  sidebar: boolean = false;
  breadcrumbs: MenuItem[] = [];
  isPublic: boolean = false;
  isMobile = false;
  private userLoggedInSubscription: Subscription;
  private breadcrumbIsReadySubscription: Subscription;

  constructor(private authGuard: AuthGuard,
              private route: ActivatedRoute,
              private breadcrumbService: BreadcrumbService,
              private cd: ChangeDetectorRef,
              private location: Location) {
  }

  ngOnInit() {
    this.isMobile = Helper.detectMobile();
    this.isPublic = !!this.location.path().match(/embedded/);
    this.route.queryParams.subscribe((params: Params) => {
      if (!!params['api_key']) {
        this.isDisplayedInIFrame = true;
      }
    });
    this.isUserLoggedIn = !!localStorage.getItem('currentUser');
    this.userLoggedInSubscription = this.authGuard.userLoggedIn().subscribe((loggedIn: boolean) => {
      this.isUserLoggedIn = loggedIn;
      if (!loggedIn) {
        localStorage.removeItem('currentUser');
      }
    });
    this.breadcrumbIsReadySubscription = this.breadcrumbService.isReady().subscribe((breadcrumbs: MenuItem[]) => {
      this.breadcrumbs = breadcrumbs;
      if (breadcrumbs.findIndex((breadcrumb: MenuItem) => {
        return breadcrumb.label === 'Dashboard';
      }) < 0) {
        this.breadcrumbs.unshift({
          label: 'Dashboard',
          routerLink: '/dashboard', routerLinkActiveOptions: {exact: true}
        });
      }
      this.cd.detectChanges();
    });
    this.hideSidebar();
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

  ngAfterViewChecked(): void {
    this.cd.detectChanges();
  }
}
