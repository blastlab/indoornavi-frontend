import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {AuthGuard} from './auth/auth.guard';
import {ActivatedRoute, Params} from '@angular/router';
import {MenuItem} from 'primeng/primeng';
import {BreadcrumbService} from './utils/breadcrumbs/breadcrumb.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html'
})
export class AppComponent implements OnInit {
  public isUserLoggedIn: boolean;
  public isDisplayedInIFrame: boolean = false;

  private items: MenuItem[];

  constructor(private authGuard: AuthGuard, private route: ActivatedRoute, private breadcrumbService: BreadcrumbService, private cd: ChangeDetectorRef) {
    this.route.queryParams.subscribe((params: Params) => {
      if (!!params['api_key']) {
        this.isDisplayedInIFrame = true;
      }
    });
    this.isUserLoggedIn = !!localStorage.getItem('currentUser');
    this.authGuard.userLoggedIn().subscribe((loggedIn: boolean) => {
      if (loggedIn) { this.isUserLoggedIn = loggedIn; }
    });
  }

  ngOnInit () {
    this.breadcrumbService.isReady().subscribe((breadcrumbs: MenuItem[]) => {
      this.items = breadcrumbs;
      this.cd.detectChanges();
    });
  }

 }
