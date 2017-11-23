import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Floor} from '../floor/floor.type';
import {HttpService} from '../utils/http/http.service';
import {ImageConfiguration} from './map.configuration.type';
import {Transform} from './map.type';
import * as d3 from 'd3';

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
    return this.httpService.doGetImage('images/' + id);
  }

  getMapTransformation() : Observable<Transform> {
    return d3.zoomTransform(document.getElementById('map-upper-layer'))
  }
}
