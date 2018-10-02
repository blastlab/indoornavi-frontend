import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({templateUrl: 'unauthorized.html'})
export class UnauthorizedComponent {

  style = {'display': 'block'};

  constructor(private translateService: TranslateService) {
    translateService.setDefaultLang('en');
  }
}
