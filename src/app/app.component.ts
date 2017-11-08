import {Component, OnInit} from '@angular/core';
import {AuthGuard} from './auth/auth.guard';
import {ActivatedRoute, Params} from '@angular/router';
import {MenuItem} from 'primeng/primeng';

@Component({
  selector: 'app-root',
  templateUrl: './app.html'
})
export class AppComponent implements OnInit {
  public isUserLoggedIn: boolean;
  public isDisplayedInIFrame: boolean = false;

  private items: Array<MenuItem>;

  constructor(private authGuard: AuthGuard, private route: ActivatedRoute) {
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
    this.items = [
      {label: 'Complexes', url: '/complexes'},
      {label: 'Users', url: '/users'}
    ];
  }

 }

