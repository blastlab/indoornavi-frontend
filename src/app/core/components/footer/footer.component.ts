import {Component, OnInit, Input} from '@angular/core';
import {environment} from '../../../../environments/environment.prod';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  appVersion: string;
  year: number;

  @Input() classFooter: string = '';

  constructor() {}

  ngOnInit() {
    this.appVersion = environment.version;
    this.year = new Date().getFullYear();
  }

}
