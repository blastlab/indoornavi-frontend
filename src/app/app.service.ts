import {Injectable} from '@angular/core';
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs";
import {Config} from "../config";

@Injectable()
export class AppService {

  constructor(private http: Http) {
  }

  doGet(url: string): Observable<any> {
    return this.http.get(Config.API_URL + url).map(AppService.extractData);
  }

  doPost(url: string, body: any): Observable<any> {
    return this.http.post(Config.API_URL + url, body).map(AppService.extractData);
  }

  doPut(url: string, body: any): Observable<any> {
    return this.http.put(Config.API_URL + url, body).map(AppService.extractData);
  }

  doDelete(url: string): Observable<any> {
    return this.http.delete(Config.API_URL + url).map(AppService.extractData);
  }

  private static extractData(res: Response) {
    return res.statusText !== '204' ? res.json() : {};
  }
}
