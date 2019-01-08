import {Injectable} from '@angular/core';
import {HttpService} from '../../shared/services/http/http.service';
import {Observable} from 'rxjs/Rx';
import {CoordinatesIncident, CoordinatesRequest} from '../overview.type';

@Injectable()
export class ReportService {
  private baseUrl = 'reports/coordinates/';

  constructor(private httpService: HttpService) {
  }

  getCoordinates(request: CoordinatesRequest): Observable<CoordinatesIncident[]> {
    return this.httpService.doPost(`${this.baseUrl}`, request);
  }

}
