import {Component, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  templateUrl: './csv-creator.html',
  selector: 'app-csv-creator'
})
export class CsvCreatorComponent implements OnInit, OnDestroy {


  constructor(private translate: TranslateService) {
  }

  ngOnInit() {
    this.translate.setDefaultLang('en');
    console.log('on init');
  }

  ngOnDestroy() {
    console.log('on destroy')
  }

}
