import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({templateUrl: 'unauthorized.html'})
export class UnauthorizedComponent implements OnInit {

  style = {'display': 'block'};

  constructor(private translateService: TranslateService) {
  }

  ngOnInit(): void {
    this.translateService.setDefaultLang('en');
    this.translateService.get('')
  }
}
