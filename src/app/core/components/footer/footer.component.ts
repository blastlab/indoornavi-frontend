import {Component, OnInit, Input, AfterViewChecked} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {Location} from '@angular/common';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, AfterViewChecked {

  appVersion: string;
  year: number;
  centerFooter: string = '';

  @Input() classFooter: string = '';

  constructor(private location: Location) {}

  ngOnInit() {
    this.appVersion = environment.version;
    this.year = new Date().getFullYear();
    this.centerFooterInPage();
  }

  ngAfterViewChecked() {
    this.centerFooterInPage();
  }

  private centerFooterInPage() {
    const pages = ['changePassword'];
    this.centerFooter = pages.includes(this.location.path().slice(1)) ? 'center-footer' : '';
  }

}
