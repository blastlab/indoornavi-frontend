import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions, Response, ResponseContentType} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import 'rxjs/add/observable/throw';
import {Configuration} from '../../../map-editor/action-bar/actionbar.type';
import {ActivatedRoute} from '@angular/router';
import {Config} from '../../../../config';


@Injectable()
export class HttpBasicService {

  protected headers: Headers = new Headers();
  protected options: RequestOptions = new RequestOptions({headers: this.headers});
  protected serverAddress: String;

  protected static extractData(res: Response) {
    if (res.headers.has('content-type') && res.headers.get('content-type') === 'application/octet-stream') {
      return res.blob();
    }
    if (res.status === 200) {
      return JSON.parse(res.text(), HttpBasicService.reviver);
    }
  }

  protected static errorHandler(err: any): Observable<any> {
    if (err instanceof Response && err.status === 401) {
      return Observable.throw('S_001');
    }
    if (err instanceof Response && err.status === 404) {
      return Observable.throw('S_001');
    }
    if (err instanceof Response && err.status === 400) {
      return Observable.throw(err.json().code);
    }
    return Observable.throw('S_000');
  }

  protected static reviver(key, value): any {
    if (!!value && Configuration.getDateFields().includes(key)) {
      return new Date(value);
    }
    return value;
  }

  constructor(protected http: Http, protected route: ActivatedRoute) {
    this.serverAddress = Config.SOLVER_URL;
  }

  doGet(url: string): Observable<any> {
    return this.http.get(this.serverAddress + url, this.options).map(HttpBasicService.extractData).catch(HttpBasicService.errorHandler).first();
  }

  doGetFile(url: string): Observable<any> {
    const extendedOptions = {...this.options};
    extendedOptions.responseType = ResponseContentType.Blob;
    return this.http.get(this.serverAddress + url, extendedOptions).map(HttpBasicService.extractData).catch(HttpBasicService.errorHandler).first();
  }

  doPost(url: string, body: any): Observable<any> {
    return this.http.post(this.serverAddress + url, body, this.options).map(HttpBasicService.extractData).catch(HttpBasicService.errorHandler).first();
  }

  doPut(url: string, body: any): Observable<any> {
    return this.http.put(this.serverAddress + url, body, this.options).map(HttpBasicService.extractData).catch(HttpBasicService.errorHandler).first();
  }

  doDelete(url: string): Observable<any> {
    return this.http.delete(this.serverAddress + url, this.options).map(HttpBasicService.extractData).catch(HttpBasicService.errorHandler).first();
  }

}
