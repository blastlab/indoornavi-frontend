import {Injectable} from '@angular/core';
import {HttpService} from '../../shared/services/http/http.service';
import {Observable} from 'rxjs/Rx';
import {Point, Point3d} from '../../map-editor/map.type';

@Injectable()
export class ReportService {
  private baseUrl = 'reports/coordinates/';

  constructor(private httpService: HttpService) {
  }

  getCoordinates(request: CoordinatesRequest): Observable<CoordinatesIncident[]> {
    return this.httpService.doPost(`${this.baseUrl}`, request);
  }
}


export interface CoordinatesRequest {
  from: string;
  to: string;
  floorId: number;
}

export interface CoordinatesIncident {
  anchorShortId: number;
  date: number;
  floorId: number;
  point: Point3d;
  tagShortId: number;
}
