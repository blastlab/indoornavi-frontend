import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {AcceptButtonsTranslations} from './accept-buttons';

@Injectable()
export class AcceptButtonsService {
  private decision = new Subject<boolean>();
  private visibility = new Subject<boolean>();
  private translations = new Subject<AcceptButtonsTranslations>();

  decisionMade: Observable<boolean> = this.decision.asObservable();
  visibilityChanged: Observable<boolean> = this.visibility.asObservable();
  translationsChanged: Observable<AcceptButtonsTranslations> = this.translations.asObservable();

  publishDecision(val: boolean): void {
    this.decision.next(val);
  }

  publishVisibility(val: boolean) {
    this.visibility.next(val);
  }

  changeTranslations(translations: AcceptButtonsTranslations) {
    this.translations.next(translations);
  }
}
