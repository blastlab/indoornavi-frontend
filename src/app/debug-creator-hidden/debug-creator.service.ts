import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpService} from '../shared/services/http/http.service';
import {DebugFileName, DebugReport} from './debug-creator.types';

@Injectable()
export class DebugCreatorService {

  private complexesUrl = 'debug/';

  constructor(private httpService: HttpService) {
  }

  getReports(): Observable<DebugReport[]> {
    return this.httpService.doGet(this.complexesUrl);
  }

  startRecording(id: number): void {
    this.httpService.doPost(this.complexesUrl + id, null);
  }

  stopRecording(fileName: DebugFileName): Observable<void> {
    return this.httpService.doPost(this.complexesUrl, fileName);
  }

  downloadReport(id: number): Observable<File> {
    return this.httpService.doGet(this.complexesUrl + id);
  }

  removeReport(id: number): Observable<any> {
    return this.httpService.doDelete(this.complexesUrl + id);
  }

}
