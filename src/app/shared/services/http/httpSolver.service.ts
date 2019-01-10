import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions, Response} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {Config} from '../../../../config';
import 'rxjs/add/observable/throw';
import {Configuration} from '../../../map-editor/action-bar/actionbar.type';
import {ActivatedRoute} from '@angular/router';


@Injectable()
export class HttpSolverService {

  private headers: Headers = new Headers();
  private options: RequestOptions = new RequestOptions({headers: this.headers});

  private static extractData(res: Response) {
    if (res.headers.has('content-type') && res.headers.get('content-type') === 'application/octet-stream') {
      return res.blob();
    }
    if (res.status === 200) {
      return JSON.parse(res.text(), HttpSolverService.reviver);
    }
  }

  private static errorHandler(err: any): Observable<any> {
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

  private static reviver(key, value): any {
    if (!!value && Configuration.getDateFields().includes(key)) {
      return new Date(value);
    }
    return value;
  }

  constructor(private http: Http, private route: ActivatedRoute) {
  }

  doPost(url: string, body: any): Observable<any> {
    return this.http.post(Config.SOLVER_URL + url, body, this.options).map(HttpSolverService.extractData).catch(HttpSolverService.errorHandler).first();
  }

}
