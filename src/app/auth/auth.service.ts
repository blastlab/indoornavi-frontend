import {Injectable} from '@angular/core';
import {HttpAuthService} from '../shared/services/http/http-auth.service';
import {AuthResponse, Credentials} from './auth.type';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class AuthService {
  private url = 'auth/';

  constructor(private httpService: HttpAuthService) {
  }

  login(credentials: Credentials): Observable<AuthResponse> {
    return this.httpService.doPost(this.url, credentials);
  }

  logout(): Observable<any> {
    return this.httpService.doPost(this.url + 'logout', {});
  }
}
