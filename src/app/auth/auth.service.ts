import {Injectable} from '@angular/core';
import {HttpService} from '../utils/http/http.service';
import {AuthResponse, Credentials} from './auth.type';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class AuthService {
  private url = 'auth/';

  constructor(private httpService: HttpService) {
  }

  login(credentials: Credentials): Observable<AuthResponse> {
    return this.httpService.doPost(this.url, credentials);
  }

  logout() {
    this.httpService.doPost(this.url + 'logout', {});
  }
}
