import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Floor} from '../../floor/floor.type';
import {ImageConfiguration} from './map.configuration.type';
import {HttpService} from '../../shared/services/http/http.service';

@Injectable()
export class MapService {

  constructor(private httpService: HttpService) {
  }

  uploadImage(id: number, formData: FormData): Observable<Floor> {
    return this.httpService.doPost('images/' + id, formData);
  }

  getImageConfiguration(): Observable<ImageConfiguration> {
    return this.httpService.doGet('images/configuration');
  }

  getImage(id: number): Observable<Blob> {
    return this.httpService.doGetFile('images/' + id);
  }
}
