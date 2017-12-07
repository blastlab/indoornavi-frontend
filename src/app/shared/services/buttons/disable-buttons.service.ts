import {Subject} from 'rxjs/Subject';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class DisableButtonsService {
  private mapEventActive = new Subject<boolean>();

  detectMapEvent = this.mapEventActive.asObservable();

  publishMapEventActive (value: boolean): void {
    this.mapEventActive.next(value);
  }

}
