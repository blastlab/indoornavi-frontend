import {Injectable} from '@angular/core';
import {HttpService} from '../../../shared/services/http/http.service';
import {Observable} from 'rxjs/Rx';
import {Line} from '../../../map-editor/map.type';

@Injectable()
export class PathService {
  private baseUrl = 'paths';

  constructor(private httpService: HttpService) {
  }

  getPathByFloorId(floorId: number): Observable<Line[]> {
    return this.httpService.doGet(`${this.baseUrl}/${floorId}`);
  }
}
