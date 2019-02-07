import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {Line} from '../../../map-editor/map.type';
import {HttpService} from '../../../shared/services/http/http.service';

@Injectable()
export class PathService {
  private baseUrl = 'paths';

  constructor(private httpService: HttpService) {
  }

  getPathByFloorId(floorId: number): Observable<Line[]> {
    return this.httpService.doGet(`${this.baseUrl}/${floorId}`);
  }
}
