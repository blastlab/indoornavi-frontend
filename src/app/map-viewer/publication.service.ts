import {Injectable} from '@angular/core';
import {HttpAuthService} from '../shared/services/http/http-auth.service';
import {Publication} from './publication.type';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class PublishedService {
  private url = 'publications/';

  constructor(private httpService: HttpAuthService) {
  }

  getAll(): Observable<Publication[]> {
    return this.httpService.doGet(this.url);
  }

  save(map: Publication): Observable<Publication> {
    return map.id ? this.httpService.doPut(this.url + map.id, map) : this.httpService.doPost(this.url, map);
  }

  remove(id: number): Observable<void> {
    return this.httpService.doDelete(this.url + id);
  }

  get(floorId: number): Observable<Publication> {
    return this.httpService.doGet(this.url + floorId);
  }

  checkOrigin(apiKey: string, origin: string) {
    return this.httpService.doPost(`${this.url}checkOrigin`, {apiKey: apiKey, origin: origin});
  }

  getTagsAvailableForUser(floorId: number) {
    return this.httpService.doGet(`${this.url}${floorId}/tags`);
  }
}
