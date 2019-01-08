import {Injectable} from '@angular/core';
import {HttpService} from '../shared/services/http/http.service';
import {Observable} from 'rxjs/Rx';
import {Device} from './device.type';
import { Subject } from 'rxjs/Subject'

@Injectable()
export class DeviceService {

  private url: string;
  private subject: Subject<Device> = new Subject<Device>();

  static getDevicePermissionPrefix(deviceType: string): string {
    switch (deviceType) {
      case 'tags':
        return 'TAG';
      case 'anchors':
        return 'ANCHOR';
      case 'sinks':
        return 'SINK';
      default:
        return 'TAG';
    }
  }

  constructor(protected httpService: HttpService) {
  }

  setUrl(url: string) {
    this.url = url;
  }

  create(device: Device): Observable<Device> {
    return this.httpService.doPost(this.url, device);
  }

  update(device: Device): Observable<Device> {
    return this.httpService.doPut(this.url + device.id, device);
  }

  remove(id: number): Observable<any> {
    return this.httpService.doDelete(this.url + id);
  }

  getAll(): Observable<Device[]> {
    return this.httpService.doGet(this.url);
  }

  sendDevice(device: Device): void {
    this.subject.next(device);
  }

  getDevice(): Observable<Device> {
    return this.subject.asObservable();
  }
}
