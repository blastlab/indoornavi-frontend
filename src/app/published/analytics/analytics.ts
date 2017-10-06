import {SocketService} from '../../utils/socket/socket.service';
import {ActivatedRoute, Params} from '@angular/router';
import {MeasureSocketData} from '../publication/published.type';
import {PublishedService} from '../publication/published.service';
import {MapViewerService} from '../../map/map.viewer.service';
import {IconService} from 'app/utils/drawing/icon.service';
import {HeatMapBuilder, HeatMapCreated} from './heatmap.service';
import {Point} from '../../map/map.type';
import Dictionary from 'typescript-collections/dist/lib/Dictionary';
import {scaleCoordinates} from '../../map/toolbar/tools/scale/scale.type';
import {PublishedViewerComponent} from '../published-viewer.component';
import {AfterViewInit, Component, NgZone, OnInit} from '@angular/core';

@Component({
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.css']
})
export class AnalyticsComponent extends PublishedViewerComponent implements AfterViewInit {
  private heatMapSet: Dictionary<number, HeatMapCreated> = new Dictionary<number, HeatMapCreated>();

  static logger2 (data) {
    console.log(data);
  }

  constructor(ngZone: NgZone,
              socketService: SocketService,
              route: ActivatedRoute,
              publishedService: PublishedService,
              mapViewerService: MapViewerService,
              iconService: IconService) {
    super(ngZone,
      socketService,
      route,
      publishedService,
      mapViewerService,
      iconService);
  }

  ngAfterViewInit () {
    // this.initializeSocketConnection(() => console.log());
    this.testThisShit(AnalyticsComponent.logger2.bind(this));
  }

  protected isInHeatMapSet(deviceId: number): boolean {
    return this.tagsOnMap.containsKey(deviceId);
  }

  protected printData () {
    console.log('ddd');
  };

  protected heatMapDrawer(data: MeasureSocketData) {
      const coordinates: Point = scaleCoordinates(data.coordinates.point, this.pixelsToCentimeters),
      deviceId: number = data.coordinates.tagShortId;
      console.log(coordinates, deviceId);
    // if (!this.isInHeatMapSet(deviceId)) {
    //   const heatMapBuilder = new HeatMapBuilder({pathLength: 100, heatValue: 20});
    //   const heatMap = heatMapBuilder
    //     .createHeatGroup()
    //     .update(coordinates);
    //   this.heatMapSet.setValue(deviceId, heatMap);
    // } else {
    //   this.heatMapSet.getValue(deviceId).update(coordinates);
    // }
  };

}
