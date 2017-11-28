import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {AuthGuard} from './auth/auth.guard';
import {ActivatedRoute, Params} from '@angular/router';
import {MenuItem} from 'primeng/primeng';
import {BreadcrumbService} from './utils/breadcrumbs/breadcrumb.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-root',
  templateUrl: './app.html'
})
export class AppComponent implements OnInit, OnDestroy {
  isUserLoggedIn: boolean;
  isDisplayedInIFrame: boolean = false;
  displaySidebar: boolean = false;
  breadcrumbs: MenuItem[];
  private userLoggedInSubscription: Subscription;
  private breadcrumbIsReadySubscription: Subscription;

  constructor(private authGuard: AuthGuard, private route: ActivatedRoute, private breadcrumbService: BreadcrumbService, private cd: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params: Params) => {
      if (!!params['api_key']) {
        this.isDisplayedInIFrame = true;
      }
    });
    this.isUserLoggedIn = !!localStorage.getItem('currentUser');
    this.userLoggedInSubscription = this.authGuard.userLoggedIn().subscribe((loggedIn: boolean) => {
      this.isUserLoggedIn = loggedIn;
    });
    this.breadcrumbIsReadySubscription = this.breadcrumbService.isReady().subscribe((breadcrumbs: MenuItem[]) => {
      this.breadcrumbs = breadcrumbs;
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() {
    this.userLoggedInSubscription.unsubscribe();
    this.breadcrumbIsReadySubscription.unsubscribe();
  }

}
