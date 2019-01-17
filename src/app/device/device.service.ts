import {Injectable} from '@angular/core';
import {HttpAuthService} from '../shared/services/http/http-auth.service';
import {Observable} from 'rxjs/Rx';
import {Device} from './device.type';

@Injectable()
export class DeviceService {

  private url: string;

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

  constructor(protected httpService: HttpAuthService) {
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
