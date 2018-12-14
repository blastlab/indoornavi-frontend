import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from './auth.service';
import {AuthResponse} from './auth.type';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthGuard} from './auth.guard';

@Component({
  selector: 'app-auth',
  templateUrl: 'auth.html'
})
export class AuthComponent implements OnInit, OnDestroy {
  invalidCredentials: boolean = false;

  constructor(private authService: AuthService,
              translateService: TranslateService,
              private router: Router,
              private route: ActivatedRoute,
              private authGuard: AuthGuard) {
    translateService.setDefaultLang('en');
  }

  ngOnInit(): void {
    if (localStorage.getItem('currentUser')) {
      this.authService.logout().first().subscribe(() => {});
      localStorage.removeItem('currentUser');
      this.authGuard.toggleUserLoggedIn(false);
      localStorage.removeItem('currentUser');
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy() {
    localStorage.removeItem('currentUser');
  }

  login(username: string, password: string): void {
    this.authService.login({username: username, plainPassword: password}).first().subscribe((authResponse: AuthResponse) => {
      localStorage.setItem('currentUser', JSON.stringify({username: username, token: authResponse.token, permissions: authResponse.permissions}));
      this.authGuard.toggleUserLoggedIn(true);
      this.invalidCredentials = false;
    }, () => {
      this.invalidCredentials = true;
    }, () => {
      this.router.navigate([this.route.snapshot.queryParams['returnUrl'] || '']);
    });
  }

}
