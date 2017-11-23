import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Floor} from '../floor/floor.type';
import {HttpService} from '../utils/http/http.service';
import {ImageConfiguration} from './map.configuration.type';
import {Transform} from './map.type';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class MapService {
  private map2DTransformation = new Subject<Transform>();
  private scaleDrawingProcess = new Subject<boolean>();

  constructor(private httpService: HttpService) {
  }

  publishMapTransformation(transformation: Transform): void {
    this.map2DTransformation.next(transformation);
  }

  publishDrawingScale(scaleDrawingProcess: boolean): void {
    this.scaleDrawingProcess.next(scaleDrawingProcess);
  }

  scaleIsInDrawingProcess(): Observable<boolean> {
    return this.scaleDrawingProcess.asObservable();
  }

  mapIsTransformed(): Observable<Transform> {
    return this.map2DTransformation.asObservable();
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
}
