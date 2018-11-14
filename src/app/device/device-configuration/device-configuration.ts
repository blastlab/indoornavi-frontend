import {Component, OnInit, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import {SelectItem} from 'primeng/primeng';
import {DeviceConfigurationService} from '../../shared/services/device-configuration/device-configuration.service';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'app-device-configuration',
  templateUrl: './device-configuration.html'
})
export class DeviceConfigurationComponent implements OnInit, OnDestroy {

  private subscribtionDestructor: Subject<void> = new Subject<void>();

  @Input() displayDeviceConfig: boolean;
  @Input() deviceType: string;
  @Output() deviceConfigClosed: EventEmitter<boolean> = new EventEmitter<boolean>();
  titleHeader: string;
  rfsetConfigData: {} = {};

  constructor(private deviceConfigurationService: DeviceConfigurationService) {}

  ngOnInit() {
    this.titleHeader = `device.details.${this.deviceType}.config`;
    this.setRtfConfig();
  }

  ngOnDestroy() {
    this.subscribtionDestructor.next();
    this.subscribtionDestructor.unsubscribe();
  }

  closeDeviceConfig(): void {
    this.deviceConfigClosed.emit(false);
  }

  saveDeviceConfig(): void {
    this.closeDeviceConfig();
  }

  private setRtfConfig() {
    this.setRadioChannels();
    this.setRadioBaudRate();
    this.setPreambleLength();
    this.setPulseRepetitionFrequency();
    this.setPreambleAcquisitionChunk();
  }

  private setRadioChannels(): void {
    this.deviceConfigurationService.getradioChannels()
      .takeUntil(this.subscribtionDestructor)
      .subscribe(radioChannels => this.rfsetConfigData['radioChannels'] = radioChannels);
  }

  private setRadioBaudRate(): void {
    this.deviceConfigurationService.getRadioBaudRate()
      .takeUntil(this.subscribtionDestructor)
      .subscribe((radioBaudRate: SelectItem[]) => this.rfsetConfigData['radioBaudRate'] = radioBaudRate);
  }

  private setPreambleLength(): void {
    this.deviceConfigurationService.getPreambleLength()
      .takeUntil(this.subscribtionDestructor)
      .subscribe((preambleLength: SelectItem[]) => this.rfsetConfigData['preambleLength'] = preambleLength);
  }

  private setPulseRepetitionFrequency(): void {
    this.deviceConfigurationService.getPulseRepetitionFrequency()
      .takeUntil(this.subscribtionDestructor)
      .subscribe((pulseRepetitionFrequency: SelectItem[]) => this.rfsetConfigData['pulseRepetitionFrequency'] = pulseRepetitionFrequency);
  }

  private setPreambleAcquisitionChunk(): void {
    this.deviceConfigurationService.getPreambleAcquisitionChunk()
      .takeUntil(this.subscribtionDestructor)
      .subscribe((preambleAcquisitionChunk: SelectItem[]) => this.rfsetConfigData['preambleAcquisitionChunk'] = preambleAcquisitionChunk);
  }
}
