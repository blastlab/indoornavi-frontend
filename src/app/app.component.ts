import {AfterViewInit, Component, OnInit} from '@angular/core';
import {AuthGuard} from './auth/auth.guard';
import {ActivatedRoute, Params} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.html'
})
export class AppComponent {
  public isUserLoggedIn: boolean;
  public isDisplayedInIFrame: boolean = false;

  constructor(/*private breadcrumbService: BreadcrumbService,*/ private authGuard: AuthGuard, private route: ActivatedRoute) {
    this.route.queryParams.subscribe((params: Params) => {
      if (!!params['api_key']) {
        this.isDisplayedInIFrame = true;
      }
    });
    this.isUserLoggedIn = !!localStorage.getItem('currentUser');
    this.authGuard.userLoggedIn().subscribe((loggedIn: boolean) => {
      console.log(loggedIn);
      this.isUserLoggedIn = loggedIn;
    });
  }
 }
