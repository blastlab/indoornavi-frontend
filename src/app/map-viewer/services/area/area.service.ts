import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {Area} from '../../../map-editor/tool-bar/tools/area/area.type';
import {HttpService} from '../../../shared/services/http/http.service';

@Injectable()
export class AreaService {
  private baseUrl = 'areas';

  constructor(private httpService: HttpService) {
  }

  getAllByFloor(floorId: number): Observable<Area[]> {
    return this.httpService.doGet(`${this.baseUrl}/${floorId}`);
  }

  save(area: Area): Observable<Area> {
    return (!!area.id ? this.httpService.doPut(`${this.baseUrl}/${area.id}`, area) : this.httpService.doPost(this.baseUrl, area));
  }
}
