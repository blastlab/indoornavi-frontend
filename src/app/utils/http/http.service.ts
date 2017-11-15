import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions, Response, ResponseContentType} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {Config} from '../../../config';
import 'rxjs/add/observable/throw';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {AuthGuard} from '../../auth/auth.guard';

@Injectable()
export class HttpService {

  private static router: Router;
  private headers: Headers = new Headers();
  private options: RequestOptions = new RequestOptions({headers: this.headers});

  private static extractData(res: Response) {
    if (res.headers.has('content-type') && res.headers.get('content-type') === 'application/octet-stream') {
      return res.blob();
    }
    if (res.status === 200) {
      return res.json();
    }
  }

  private static errorHandler(err: any): Observable<any> {
    if (err instanceof Response && err.status === 401) {
      localStorage.removeItem('currentUser');
      HttpService.router.navigate(['/login'], {queryParams: {returnUrl: HttpService.router.routerState.snapshot.url}});
    }
    if (err instanceof Response && err.status === 404) {
      return Observable.throw('S_001');
    }
    if (err instanceof Response && err.status === 400) {
      return Observable.throw(err.json().code);
    }
    return Observable.throw('S_000');
  }

  constructor(private http: Http, private router: Router, private authGuard: AuthGuard, private route: ActivatedRoute) {
    HttpService.router = router;
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

  doGet(url: string): Observable<any> {
    return this.http.get(Config.API_URL + url, this.options).map(HttpService.extractData).catch(HttpService.errorHandler).first();
  }

  doGetImage(url: string): Observable<any> {
    const extendedOptions = {...this.options};
    extendedOptions.responseType = ResponseContentType.Blob;
    return this.http.get(Config.API_URL + url, extendedOptions).map(HttpService.extractData).catch(HttpService.errorHandler).first();
  }

  doPost(url: string, body: any): Observable<any> {
    return this.http.post(Config.API_URL + url, body, this.options).map(HttpService.extractData).catch(HttpService.errorHandler).first();
  }

  doPut(url: string, body: any): Observable<any> {
    return this.http.put(Config.API_URL + url, body, this.options).map(HttpService.extractData).catch(HttpService.errorHandler).first();
  }

  doDelete(url: string): Observable<any> {
    return this.http.delete(Config.API_URL + url, this.options).map(HttpService.extractData).catch(HttpService.errorHandler).first();
  }

  setResponseType(type: ResponseContentType): void {
    this.options.responseType = type;
  }

  private prepareAuthHeader(apiKey?: string) {
    if (!!apiKey) {
      this.options.headers.set('Authorization', `Token ${apiKey}`);
    } else {
      this.options.headers.set('Authorization', `Bearer ${JSON.parse(localStorage.getItem('currentUser'))['token']}`);
    }
  }

}
