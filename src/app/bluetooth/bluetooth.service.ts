import {Injectable} from '@angular/core';
import {HttpService} from '../shared/services/http/http.service';
import {Observable} from 'rxjs/Rx';
import {Bluetooth} from './bluetooth.type';

@Injectable()
export class BluetoothService {

  private url: string;

  constructor(protected httpService: HttpService) {
  }

  setUrl(url: string) {
    this.url = url;
  }

  create(device: Bluetooth): Observable<Bluetooth> {
    return this.httpService.doPost(this.url, device);
  }

  update(device: Bluetooth): Observable<Bluetooth> {
    return this.httpService.doPut(this.url + device.id, device);
  }

  remove(id: number): Observable<any> {
    return this.httpService.doDelete(this.url + id);
  }

  getAll(): Observable<Bluetooth[]> {
    return this.httpService.doGet(this.url);
  }
}
