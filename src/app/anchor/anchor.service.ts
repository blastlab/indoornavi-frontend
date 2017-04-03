import {Injectable} from '@angular/core';
import {HttpService} from '../utils/http/http.service';
import {Anchor} from './anchor.type';
import {Observable} from 'rxjs/Rx';


@Injectable()
export class AnchorService {
  private anchorsUrl = 'anchors/';

  constructor(private httpService: HttpService) {
  }

  createAnchor(anchor: Anchor): Observable<Anchor> {
    return this.httpService.doPost(this.anchorsUrl, anchor);
  }

  updateAnchor(anchor: Anchor): Observable<Anchor> {
    return this.httpService.doPut(this.anchorsUrl + anchor.id, anchor);
  }

  removeAnchor(id: number): Observable<any> {
    return this.httpService.doDelete(this.anchorsUrl + id);
  }
}
