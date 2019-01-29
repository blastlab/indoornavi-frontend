import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {ActivatedRoute} from '@angular/router';
import {AuthGuard} from '../../../auth/auth.guard';
import {HttpService} from './http.service';
import {Config} from '../../../../config';

@Injectable()
export class HttpSolver extends HttpService {
  // constructor(protected http: Http, protected route: ActivatedRoute, protected authGuard: AuthGuard) {
  //   super(http, route, authGuard, Config.SOLVER_URL, false);
  // }
  constructor(http: Http, route: ActivatedRoute, authGuard: AuthGuard) {
    super(http, route, authGuard, Config.SOLVER_URL, false);
  }
}
