import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {SolverCoordinatesRequest, SolverHeatMapPayload} from '../graphical-report.type';
import {HttpBasicService} from '../../shared/services/http/http-basic.service';

@Injectable()
export class ReportService {
  private baseUrl = 'reports/heatmap/';

  constructor(private httpSolverService: HttpBasicService) {
  }

  getCoordinates(request: SolverCoordinatesRequest): Observable<SolverHeatMapPayload> {
    return this.httpSolverService.doPost(`${this.baseUrl}`, request);
  }

}
