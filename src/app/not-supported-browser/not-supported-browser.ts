import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {BrowserDetector} from '../shared/services/browser-detector/browser.detector';

@Component({
  templateUrl: './not-supported-browser.html',
})
export class NotSupportedBrowserComponent implements OnInit {

  style = {'display': 'block'};
  message = '';

  constructor(private translateService: TranslateService) {
  }

  ngOnInit() {
    this.translateService.setDefaultLang('en');
    this.translateService
      .get('notSupportedBrowser', {'browser': BrowserDetector.getBrowserName()})
      .subscribe((translatedValue) => {
        this.message = translatedValue;
      });
  }

}
