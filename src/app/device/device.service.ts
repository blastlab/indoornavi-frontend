import {Injectable} from '@angular/core';
import {HttpService} from '../utils/http/http.service';
import {Observable} from 'rxjs/Rx';
import {Device} from './device.type';

@Injectable()
export class DeviceService {

  private url: string;

  setUrl(url: string) {
    this.url = url;
  }

  constructor(protected httpService: HttpService) {
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
}
