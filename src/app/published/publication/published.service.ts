import {Injectable} from '@angular/core';
import {HttpService} from '../../utils/http/http.service';
import {PublishedMap} from './published.type';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class PublishedService {
  private url = 'maps/';

  constructor(private httpService: HttpService) {
  }

  getAll(): Observable<PublishedMap[]> {
    return this.httpService.doGet(this.url);
  }

  save(map: PublishedMap): Observable<PublishedMap> {
    return map.id ? this.httpService.doPut(this.url + map.id, map) : this.httpService.doPost(this.url, map);
  }

  remove(id: number): Observable<void> {
    return this.httpService.doDelete(this.url + id);
  }

  get(id: number): Observable<PublishedMap> {
    return this.httpService.doGet(this.url + id);
  }

  checkOrigin(apiKey: string, origin: string) {
    return this.httpService.doPost(`${this.url}checkOrigin`, {apiKey: apiKey, origin: origin});
  }
}
