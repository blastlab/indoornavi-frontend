import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {Bluetooth} from '../device/device.type';
import {HttpService} from '../shared/services/http/http.service';

@Injectable()
export class BluetoothService {

  private url: string;

  constructor(protected httpService: HttpService) {
  }

  setUrl(url: string) {
    this.url = url;
  }

  create(bluetooth: Bluetooth): Observable<Bluetooth> {
    return this.httpService.doPost(this.url, bluetooth);
  }

  update(bluetooth: Bluetooth): Observable<Bluetooth> {
    return this.httpService.doPut(this.url + bluetooth.id, bluetooth);
  }

  remove(id: number): Observable<any> {
    return this.httpService.doDelete(this.url + id);
  }

  getAll(): Observable<Bluetooth[]> {
    return this.httpService.doGet(this.url);
  }
}
