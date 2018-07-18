import {Component, OnDestroy, OnInit} from '@angular/core';
import {Tool} from '../../tool';
import {ToolName} from '../../tools.enum';
import {Subscription} from 'rxjs/Subscription';
import * as d3 from 'd3';
import {MapLoaderInformerService} from '../../../../../shared/services/map-loader-informer/map-loader-informer.service';
import {Scale, ScaleCalculations, ScaleDto} from '../../scale/scale.type';
import {Geometry} from '../../../../../shared/utils/helper/geometry';
import {Anchor, Sink} from '../../../../../device/device.type';
import {Configuration} from '../../../../action-bar/actionbar.type';
import {Helper} from '../../../../../shared/utils/helper/helper';
import {ActionBarService} from '../../../../action-bar/actionbar.service';
import {ScaleService} from '../../../../../shared/services/scale/scale.service';

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
    private scaleService: ScaleService
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
      const config: Configuration = Helper.deepCopy(configuration);
      this.floorId = config.floorId;
      if (!!config.data.sinks) {
        console.log(config.data.sinks);
        //   const sinks: Sink[] = [];
      //   config.data.sinks.forEach((sink: Sink): void => {
      //     sinks.push(<Sink>this.recalculateDeviceCoordinatesFromCentimetersToPixels(sink))
      //   });
      //   this.drawSinksAndConnectedAnchors(sinks);
      }
      if (!!config.data.anchors) {
        console.log(config.data.anchors);
        // const anchors: Anchor[] = [];
        // config.data.anchors.forEach((anchor: Anchor): void => {
        //   anchors.push(this.recalculateDeviceCoordinatesFromCentimetersToPixels(anchor));
        // });
        // this.drawAnchorsWithoutConnection(anchors);
      }
      // this.configuration = config;
      // this.fetchDevices();
    });
  }
  // private fetchDevices(): void {
  //   this.verifiedDevices = [];
  //   this.deviceService.setUrl('sinks/');
  //   this.deviceService.getAll().subscribe((sinks: Sink[]): void => {
  //     sinks.forEach((sink: Sink): void => {
  //       if (sink.verified) {
  //         if (!sink.floorId || sink.floorId === this.configuration.floorId) {
  //           if (this.getIndexOfSinkInConfiguration(sink) >= 0) {
  //             sink = this.updateSinkFromConfiguration(sink);
  //           } else {
  //             sink = <Sink>DevicesComponent.eraseDevicePublicationData(sink);
  //             this.devicePlacerController.addToRemainingDevicesList(sink);
  //           }
  //         }
  //         this.verifiedDevices.push(sink);
  //       }
  //     });
  //   });
  //   this.deviceService.setUrl('anchors/');
  //   this.deviceService.getAll().subscribe((anchors: Anchor[]): void => {
  //     anchors.forEach((anchor: Anchor): void => {
  //       if (anchor.verified) {
  //         if (!anchor.floorId || anchor.floorId === this.configuration.floorId) {
  //           if (this.getIndexOfAnchorInConfiguration(anchor) >= 0) {
  //             anchor = this.updateAnchorFromConfiguration(anchor);
  //           } else {
  //             anchor = <Sink>DevicesComponent.eraseDevicePublicationData(anchor);
  //             this.devicePlacerController.addToRemainingDevicesList(anchor);
  //           }
  //         }
  //         this.verifiedDevices.push(anchor);
  //       }
  //     });
  //   });
  // }


}
