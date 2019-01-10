import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {SolverCoordinatesRequest} from '../overview.type';
import {HttpSolverService} from '../../shared/services/http/httpSolver.service';

@Injectable()
export class ReportService {
  private baseUrl = 'reports/coordinates/';

  constructor(private httpSolverService: HttpSolverService) {
  }

  getCoordinates(request: SolverCoordinatesRequest): Observable<number[][]> {
    return this.httpSolverService.doPost(`${this.baseUrl}`, request);
  }

}
