import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {DeviceDetectorService} from 'ngx-device-detector';

@Component({
  templateUrl: './not-supported-browser.html',
})
export class NotSupportedBrowserComponent implements OnInit {

  style = {'display': 'block'};
  message = '';

  constructor(private translateService: TranslateService, private deviceDetector: DeviceDetectorService) {
  }

  ngOnInit() {
    this.translateService.setDefaultLang('en');
    this.translateService
      .get('notSupportedBrowser', {'browser': this.deviceDetector.getDeviceInfo().browser})
      .subscribe((translatedValue) => {
        this.message = translatedValue;
      });
  }

}
