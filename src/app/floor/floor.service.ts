import {Injectable} from '@angular/core';
import {Floor} from './floor.type';
import {Observable} from 'rxjs/Rx';
import {HttpService} from '../utils/http/http.service';
import {Scale} from '../map-editor/tool-bar/tools/scale/scale.type';
import {Building} from '../building/building.type';

@Injectable()
export class FloorService {

  private floorsUrl = 'floors/';

  constructor(private httpService: HttpService) {
  }

  getBuildingWithFloors(buildingId: number): Observable<Building> {
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

  removeFloor(id: number): Observable<any> {
    return this.httpService.doDelete(this.floorsUrl + id);
  }

  setScale(floorId: number, scale: Scale): Observable<Floor> {
    return this.httpService.doPut(this.floorsUrl + floorId + '/scale', scale);
  }
}
