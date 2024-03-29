import {Injectable} from '@angular/core';
import {Building} from './building.type';
import {Observable} from 'rxjs/Rx';
import {Complex} from '../complex/complex.type';
import {HttpService} from '../shared/services/http/http.service';

@Injectable()
export class BuildingService {

  private buildingsUrl = 'buildings/';

  constructor(private httpService: HttpService) {
  }

  getComplexWithBuildings(complexId: number): Observable<Complex> {
    return this.httpService.doGet('complexes/' + complexId + '/' + this.buildingsUrl);
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
