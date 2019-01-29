import {Injectable} from '@angular/core';
import {HttpService} from './http.service';
import {AuthGuard} from '../../../auth/auth.guard';
import {ActivatedRoute} from '@angular/router';
import {Http} from '@angular/http';
import {Config} from '../../../../config';

@Injectable()
export class HttpBackend extends HttpService {
  constructor(http: Http, route: ActivatedRoute, authGuard: AuthGuard) {
    console.log('http backend is being created')
    super(http, route, authGuard, Config.API_URL, true);
  }
  // constructor(protected http: Http, protected route: ActivatedRoute, protected authGuard: AuthGuard) {
  //   super(http, route, authGuard, Config.API_URL, true);
  // }
}
