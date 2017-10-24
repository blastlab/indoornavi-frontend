import {Injectable} from '@angular/core';
import {HttpService} from '../utils/http/http.service';
import {Observable} from 'rxjs/Rx';
import {Device} from './device.type';

@Injectable()
export class DeviceService {

  private url: string;

  static emptyDeviceObjectDependentOnPath(path: string): object {
    return path === 'sinks' ?
      {
        id: null,
        shortId: null,
        longId: null,
        verified: false,
        name: '',
        configured: false
      } :
      {
        id: null,
        shortId: null,
        longId: null,
        verified: false,
        name: ''
      };
  }

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
}
