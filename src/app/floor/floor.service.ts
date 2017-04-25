import {Injectable} from '@angular/core';
import {Floor} from './floor.type';
import {Observable} from 'rxjs/Rx';
import {HttpService} from '../utils/http/http.service';

@Injectable()
export class FloorService {

  private floorsUrl = 'floors/';

  constructor(private httpService: HttpService) {
  }

  getFloors(buildingId: number): Observable<Floor[]> {
    return this.httpService.doGet('buildings/' + buildingId + '/' + this.floorsUrl);
  }

  getFloor(floorId: number): Observable<Floor> {
    return this.httpService.doGet(this.floorsUrl + floorId);
  }

  addFloor(floor: Floor): Observable<Floor> {
    return this.httpService.doPost(this.floorsUrl, floor);
  }

  updateFloor(floor: Floor): Observable<Floor> {
    return this.httpService.doPut(this.floorsUrl + floor.id, floor);
  }

  updateFloors(floors: Floor[]): Observable<Floor[]> {
    return this.httpService.doPut(this.floorsUrl, floors);
  }

  removeFloor(id: number, buildingId: number): Observable<any> {
    return this.httpService.doDelete(this.floorsUrl + id);
  }
}
