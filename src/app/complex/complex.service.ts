import {Injectable} from '@angular/core';
import {Complex} from './complex.type';
import {Observable} from 'rxjs/Observable';
import {HttpService} from '../utils/http/http.service';

@Injectable()
export class ComplexService {

  private complexesUrl = 'complexes/';

  constructor(private httpService: HttpService) {
  }

  getComplexes(): Observable<Complex[]> {
    return this.httpService.doGet(this.complexesUrl);
  }

  addComplex(complex: Complex): Observable<Complex> {
    return this.httpService.doPost(this.complexesUrl, complex);
  }

  updateComplex(complex: Complex): Observable<Complex> {
    return this.httpService.doPut(this.complexesUrl + complex.id, complex);
  }

  removeComplex(id: number): Observable<any> {
    return this.httpService.doDelete(this.complexesUrl + id);
  }

}
