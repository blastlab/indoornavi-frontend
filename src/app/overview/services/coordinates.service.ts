import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {SolverCoordinatesRequest, SolverHeatMapPayload} from '../overview.type';
import {HttpSolverService} from '../../shared/services/http/httpSolver.service';

@Injectable()
export class ReportService {
  private baseUrl = 'reports/heatmap/';

  constructor(private httpSolverService: HttpSolverService) {
  }

  getCoordinates(request: SolverCoordinatesRequest): Observable<SolverHeatMapPayload> {
    return this.httpSolverService.doPost(`${this.baseUrl}`, request);
  }

}
