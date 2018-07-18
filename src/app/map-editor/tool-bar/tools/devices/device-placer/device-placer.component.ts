import {Component, OnDestroy, OnInit} from '@angular/core';
import {Tool} from '../../tool';
import {ToolName} from '../../tools.enum';
import {Subscription} from 'rxjs/Subscription';
import * as d3 from 'd3';
import {MapLoaderInformerService} from '../../../../../shared/services/map-loader-informer/map-loader-informer.service';
import {Scale, ScaleCalculations, ScaleDto} from '../../scale/scale.type';
import {Geometry} from '../../../../../shared/utils/helper/geometry';
import {Configuration} from '../../../../action-bar/actionbar.type';
import {ActionBarService} from '../../../../action-bar/actionbar.service';
import {ScaleService} from '../../../../../shared/services/scale/scale.service';
import {ZoomService} from '../../../../../shared/services/zoom/zoom.service';
import {SinkInEditor} from '../../../../../map/models/sink';
import {AnchorInEditor} from '../../../../../map/models/anchor';
import {Sink} from '../../../../../device/device.type';
import {DeviceInEditorConfiguration} from '../../../../../map/models/device';
import {Point} from '../../../../map.type';

@Component({
  selector: 'app-device-placer',
  templateUrl: './device-placer.html'
})
export class DevicePlacerComponent implements Tool, OnInit, OnDestroy {
  active: boolean = false;
  disabled: boolean = false;

  private mapLoadedSubscription: Subscription;
  private scaleChanged: Subscription;
  private map: d3.selection;
  private scale: Scale;
  private floorId: number;
  private scaleCalculations: ScaleCalculations;

  constructor(
    private mapLoaderInformer: MapLoaderInformerService,
    private configurationService: ActionBarService,
    private scaleService: ScaleService,
    private zoomService: ZoomService,
  ) { }

  ngOnInit() {
    this.bindMapSelection();
    this.captureScaleChanges();
    this.fetchConfiguredDevices();
  }

  ngOnDestroy() {
    this.mapLoadedSubscription.unsubscribe();
    this.scaleChanged.unsubscribe();
  }

  getHintMessage(): string{
    return '';
  }

  getToolName(): ToolName {
    return ToolName.DEVICES;
  }

  setDisabled(value: boolean): void {
    this.disabled = value;
  }
  setActive(): void {
    console.log(this.scale);
  }
  setInactive(): void {

  }

  private bindMapSelection(): void {
    this.mapLoadedSubscription = this.mapLoaderInformer.loadCompleted().subscribe((mapLoaded): void => {
      this.map = mapLoaded.container;
    });
  }

  private captureScaleChanges(): void {
    this.scaleChanged = this.scaleService.scaleChanged.subscribe((scale: ScaleDto): void => {
      this.scale = new Scale(scale);
      if (this.scale.isReady()) {
        this.scaleCalculations = {
          scaleLengthInPixels: Geometry.getDistanceBetweenTwoPoints(this.scale.start, this.scale.stop),
          scaleInCentimeters: this.scale.getRealDistanceInCentimeters()
        };
      }
    });
  }

  private fetchConfiguredDevices(): void {
    this.configurationService.configurationLoaded().first().subscribe((configuration: Configuration): void => {
      this.floorId = configuration.floorId;
      if (!!configuration.data.sinks) {
        configuration.data.sinks.forEach((sink: Sink) => {
          const onMapCoordinates: Point = Geometry.calculatePointPositionInPixels(
            this.scaleCalculations.scaleLengthInPixels,
            this.scaleCalculations.scaleInCentimeters,
            {x: sink.x, y: sink.y});
          const drawConfiguration: DeviceInEditorConfiguration = {
            id: 'aaa',
            clazz: 'aa',
            heightInMeters: Geometry.calculateDistanceInPixels(this.scaleCalculations.scaleLengthInPixels, this.scaleCalculations.scaleInCentimeters, sink.z)
          };
          const sinkOnMap: SinkInEditor = new SinkInEditor(onMapCoordinates , this.map, drawConfiguration);

        });
      }
    });
  }


}
