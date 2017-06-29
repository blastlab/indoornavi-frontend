import {Component, OnInit} from '@angular/core';
import {AuthService} from './auth.service';
import {AuthResponse} from './auth.type';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthGuard} from './auth.guard';
import {ToastService} from '../utils/toast/toast.service';

@Component({
  templateUrl: 'auth.html',
  styleUrls: []
})
export class AuthComponent implements OnInit {
  constructor(private authService: AuthService,
              translateService: TranslateService,
              private router: Router,
              private route: ActivatedRoute,
              private authGuard: AuthGuard,
              private toastService: ToastService) {
    translateService.setDefaultLang('en');
  }

  ngOnInit(): void {
    if (localStorage.getItem('currentUser')) {
      this.authService.logout();
      this.authGuard.toggleUserLoggedIn(false);
      localStorage.removeItem('currentUser');
      this.router.navigate(['/login']);
    }
  }

  login(username: string, password: string): void {
    this.authService.login({username: username, plainPassword: password}).subscribe((authResponse: AuthResponse) => {
      localStorage.setItem('currentUser', JSON.stringify({username: username, token: authResponse.token, permissions: authResponse.permissions}));
      this.authGuard.toggleUserLoggedIn(true);
      this.toastService.forceHide();
    }, () => {
      this.toastService.showFailure('auth.invalid.credentials');
    }, () => {
      this.router.navigate([this.route.snapshot.queryParams['returnUrl'] || '']);
    });
  }

}
