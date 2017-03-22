import {Injectable} from '@angular/core';
import {Complex} from "./complex.type";
import {Observable} from "rxjs";
import {AppService} from "../app.service";

@Injectable()
export class ComplexService {

  private complexesUrl = 'complexes/';

  constructor(private appService: AppService) {
  }

  getComplexes(): Observable<Complex[]> {
    return this.appService.doGet(this.complexesUrl);
  }

  addComplex(complex: Complex): Observable<Complex> {
    return this.appService.doPost(this.complexesUrl, complex);
  }

  updateComplex(complex: Complex): Observable<Complex> {
    return this.appService.doPut(this.complexesUrl + complex.id, complex);
  }

  removeComplex(id: number): Observable<any> {
    return this.appService.doDelete(this.complexesUrl + id);
  }

}
