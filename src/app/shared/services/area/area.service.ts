import {Injectable} from '@angular/core';
import {Area} from './area.type';
import {HttpService} from '../../../utils/http/http.service';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class AreaService {
  private base_url = 'areas';

  constructor(private httpService: HttpService) {
  }

  getAllByFloor(floorId: number): Observable<Area[]> {
    return this.httpService.doGet(`${this.base_url}/${floorId}`);
  }
}
