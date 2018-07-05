import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {AcceptButtonsTranslations} from './accept-buttons';

@Injectable()
export class AcceptButtonsService {
  private decision = new Subject<boolean>();
  private visibility = new Subject<boolean>();
  private translations = new Subject<AcceptButtonsTranslations>();

  decisionMade = this.decision.asObservable();
  visibilityChanged = this.visibility.asObservable();
  translationsChanged = this.translations.asObservable();

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
