import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Params, Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './map.html',
  styleUrls: ['./map.css']
})
export class MapComponent implements OnInit {
  constructor(private router: Router,
              private route: ActivatedRoute,
              public translate: TranslateService) {
  }

  ngOnInit(): void  {
    this.newMap();
    this.translate.setDefaultLang('en');
  }

  private newMap(): void {
  }
}
