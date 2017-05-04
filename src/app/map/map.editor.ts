import {Component, Input, OnInit} from '@angular/core';
import {Floor} from '../floor/floor.type';
import {MapViewerComponent} from './map.viewer';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-map-editor',
  templateUrl: './map.html',
  styleUrls: ['./map.css']
})
export class MapEditorComponent extends MapViewerComponent implements OnInit {
  @Input() floor: Floor;

  constructor(public translate: TranslateService) {
    super();  // call to default constructor added implicitly
  }

  ngOnInit(): void {
    this.drawImageOnCanvas();
    this.translate.setDefaultLang('en');
  }
}
