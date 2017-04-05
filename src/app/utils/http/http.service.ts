import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {Config} from '../../../config';
import 'rxjs/add/observable/throw';

@Injectable()
export class HttpService {

  private static extractData(res: Response) {
    if (res.status === 200) {
      return res.json();
    }
  }

  private static errorHandler(err: any): Observable<any> {
    if (err instanceof Response && err.status === 404) {
      return Observable.throw('S_001');
    }
    if (err  instanceof Response && err.status === 400) {
      return Observable.throw(err.json().code);
    }
    return Observable.throw('S_000');
  }

  constructor(private http: Http) {
  }

  doGet(url: string): Observable<any> {
    return this.http.get(Config.API_URL + url).map(HttpService.extractData).catch(HttpService.errorHandler);
  }

  doPost(url: string, body: any): Observable<any> {
    return this.http.post(Config.API_URL + url, body).map(HttpService.extractData).catch(HttpService.errorHandler);
  }

  doPut(url: string, body: any): Observable<any> {
    return this.http.put(Config.API_URL + url, body).map(HttpService.extractData).catch(HttpService.errorHandler);
  }

  doDelete(url: string): Observable<any> {
    return this.http.delete(Config.API_URL + url).map(HttpService.extractData).catch(HttpService.errorHandler);
  }

}
