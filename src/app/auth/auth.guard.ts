import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {DeviceDetectorService} from 'ngx-device-detector';

@Injectable()
export class AuthGuard {

  private userLoggedInSubject = new Subject<boolean>();

  constructor() {
  }

  public toggleUserLoggedIn(loggedIn: boolean) {
    this.userLoggedInSubject.next(loggedIn);
  }

  public userLoggedIn(): Observable<boolean> {
    return this.userLoggedInSubject.asObservable();
  }

}

abstract class PermissionChecker {
  static check(permission: string, router: Router): boolean {
    if (JSON.parse(localStorage.getItem('currentUser'))['permissions'].indexOf(permission) >= 0) {
      return true;
    }

    // no permission so we redirect to unauthorized page
    router.navigate(['/unauthorized']);
    return false;
  }
}

@Injectable()
export class CanRead implements CanActivate {
  constructor(private router: Router, private deviceDetector: DeviceDetectorService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.deviceDetector.getDeviceInfo().browser !== 'chrome') {
      this.router.navigate(['/notSupportedBrowser']);
      return false;
    }

    if (localStorage.getItem('currentUser')) {
      if (route.data.permission) {
        return PermissionChecker.check(route.data.permission + '_READ', this.router);
      }
      return true;
    }

    // not logged in so redirect to login page with the return url
    this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
    return false;
  }
}
