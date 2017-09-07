import {Injectable} from '@angular/core';
import {HttpService} from '../utils/http/http.service';
import {Tag} from './tag.type';
import {Observable} from 'rxjs/Rx';

@Injectable()
export class TagService {

  private url: string = 'tags/';

  constructor(private httpService: HttpService) {
  }

  getAll(): Observable<Tag[]> {
    return this.httpService.doGet(this.url);
  }

}
