import {Inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {SolverCoordinatesRequest, SolverHeatMapPayload} from '../graphical-report.type';
import {HttpService} from '../../shared/services/http/http.service';
import {HttpSolver} from '../../shared/services/http/http.solver';

@Injectable()
export class ReportService {
  private baseUrl = 'reports/heatmap/';

  constructor(@Inject(HttpSolver) private httpSolverService: HttpService) {
  }

  getCoordinates(request: SolverCoordinatesRequest): Observable<SolverHeatMapPayload> {
    return this.httpSolverService.doPost(`${this.baseUrl}`, request);
  }

}
