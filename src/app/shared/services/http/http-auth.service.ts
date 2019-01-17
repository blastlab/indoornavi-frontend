import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Config} from '../../../../config';
import 'rxjs/add/observable/throw';
import {ActivatedRoute, Params} from '@angular/router';
import {AuthGuard} from '../../../auth/auth.guard';
import {HttpBasicService} from './http-basic.service';

@Injectable()
export class HttpAuthService extends HttpBasicService {

  private static authGuard: AuthGuard;

  constructor(http: Http, route: ActivatedRoute, private authGuard: AuthGuard) {
    super(http, route);
    this.serverAddress = Config.API_URL;
    HttpAuthService.authGuard = authGuard;
    route.queryParams.subscribe((params: Params) => {
      if (localStorage.getItem('currentUser')) {
        this.prepareAuthHeader();
      } else if (params['api_key']) {
        this.prepareAuthHeader(params['api_key']);
      }
    });
    authGuard.userLoggedIn().subscribe((loggedIn: boolean) => {
      (loggedIn) ?
        this.prepareAuthHeader()
        :
        this.options.headers.delete('Authorization');
    });
  }

  private prepareAuthHeader(apiKey?: string) {
    if (!!apiKey) {
      this.options.headers.set('Authorization', `Token ${apiKey}`);
    } else {
      this.options.headers.set('Authorization', `Bearer ${JSON.parse(localStorage.getItem('currentUser'))['token']}`);
    }
  }

}
