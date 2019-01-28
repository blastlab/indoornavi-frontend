import {Injectable} from '@angular/core';
import {HttpAuthService} from '../../../shared/services/http/http-auth.service';
import {Observable} from 'rxjs/Rx';
import {Line} from '../../../map-editor/map.type';

@Injectable()
export class PathService {
  private baseUrl = 'paths';

  constructor(private httpService: HttpAuthService) {
  }

  getPathByFloorId(floorId: number): Observable<Line[]> {
    return this.httpService.doGet(`${this.baseUrl}/${floorId}`);
  }
}
