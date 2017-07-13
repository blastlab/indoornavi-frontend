import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Floor} from '../floor/floor.type';
import {HttpService} from '../utils/http/http.service';
import {ImageConfiguration} from './map.configuration.type';
import {ResponseContentType} from '@angular/http';

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
    this.httpService.setResponseType(ResponseContentType.Blob);
    const x =  this.httpService.doGet('images/' + id);
    this.httpService.setResponseType(null);
    return x;
  }
}
