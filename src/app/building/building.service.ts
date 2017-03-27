import {Injectable} from '@angular/core';
import {Building} from "./building.type";
import {Observable} from "rxjs";
import {HttpService} from "../utils/http/http.service";

@Injectable()
export class BuildingService {

  private buildingsUrl = 'buildings/';

  constructor(private httpService: HttpService) {
  }

  getBuildings(complexId:number): Observable<Building[]> {
    return this.httpService.doGet(this.buildingsUrl + complexId);
  }

  addBuilding(building: Building): Observable<Building> {
    return this.httpService.doPost(this.buildingsUrl, building);
  }

  updateBuilding(building: Building): Observable<Building> {
    return this.httpService.doPut(this.buildingsUrl + building.id, building);
  }

  removeBuilding(id: number): Observable<any> {
    return this.httpService.doDelete(this.buildingsUrl + id);
  }

}
