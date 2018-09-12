import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Pipe({
  name: 'parseArrayToStringCommaSeparatedTranslated',
  pure: true
})
@Injectable()
export class ParseArrayToStringCommaSeparatedTranslated extends TranslateService implements PipeTransform {

  transform(data: string[]): string {
    this.setDefaultLang('en');
    const translations = data.map((textValue: string): string => {
      return this.instant(textValue)
    });
    return translations.join(', ');
  }
}
