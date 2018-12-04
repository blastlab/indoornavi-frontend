import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpService} from '../shared/services/http/http.service';
import {DebugFileName, DebugReport} from './debug-creator.types';
import {UWB} from '../device/device.type';

@Injectable()
export class DebuggerService {

  private debugUrl = 'debug/';
  private sinksUrl = 'sinks/';

  constructor(private httpService: HttpService) {
  }

  getRecordingStartedInfo(): Observable<boolean> {
    return this.httpService.doGet(`${this.debugUrl}isStarted`)
  }

  getReports(): Observable<DebugReport[]> {
    return this.httpService.doGet(this.debugUrl);
  }

  sendStartRecording(id: number): Observable<void> {
    return this.httpService.doPost(this.debugUrl + id, null);
  }

  sendStopRecording(fileName: DebugFileName): Observable<any> {
    return this.httpService.doPost(this.debugUrl, fileName);
  }

  downloadReport(id: number): Observable<any> {
    return this.httpService.doGetFile(this.debugUrl + id);
  }

  removeReport(id: number): Observable<any> {
    return this.httpService.doDelete(this.debugUrl + id);
  }

  getSinks(): Observable<Array<UWB>> {
    return this.httpService.doGet(this.sinksUrl);
  }

}
