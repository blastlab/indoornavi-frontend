import {Component, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';
import {DebugFileName, DebugReport, DebugReportType} from './debug-creator.types';
import {SelectItem} from 'primeng/primeng';
import {UWB} from '../device/device.type';
import {Config} from '../../config';
import {SocketService} from '../shared/services/socket/socket.service';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {DebugCreatorService} from './debug-creator.service';
import {MessageServiceWrapper} from '../shared/services/message/message.service';

@Component({
  templateUrl: './debug-creator.html',
  selector: 'app-csv-creator'
})
export class DebugCreatorComponent implements OnInit, OnDestroy {

  files: Array<DebugReport> = [
    {id: 231231, name: 'file 001', reportType: DebugReportType.COORDINATES},
    {id: 23112231, name: 'file 002', reportType: DebugReportType.RAW_DATA},
    {id: 2312445531, name: 'file 003', reportType: DebugReportType.RAW_DATA},
    {id: 23123455641, name: 'file 004', reportType: DebugReportType.COORDINATES},
  ];
  sinks: SelectItem[] = [];
  selectedSink: SelectItem;
  coordinatesFileName: string;
  rawDataFileName: string;
  isRecording = false;
  private activeRecordingId: number;
  private subscriptionDestructor: Subject<void> = new Subject<void>();
  private socketSubscription: Subscription;

  constructor(
    private translate: TranslateService,
    private breadcrumbService: BreadcrumbService,
    private socketService: SocketService,
    private debugService: DebugCreatorService,
    private messageService: MessageServiceWrapper
  ) {
  }

  ngOnInit() {
    this.translate.setDefaultLang('en');
    this.breadcrumbService.publishIsReady([
      {label: 'hidden', disabled: true}
    ]);
    this.connectToRegistrationSocket();
  }

  ngOnDestroy() {
    this.subscriptionDestructor.next();
    this.subscriptionDestructor = null;
  }

  remove(fileIndex): void {
    console.log(fileIndex);
  }

  download(fileIndex): void {
    console.log(fileIndex);
  }

  startRecording(): void {
    if (!!this.selectedSink && !this.isRecording && !!this.coordinatesFileName && !!this.rawDataFileName) {
      this.isRecording = true;
      this.activeRecordingId = parseInt(`${new Date().getTime()}`.toString() + `${this.selectedSink}`.toString(), 10);
      this.debugService.startRecording(this.activeRecordingId);
    } else {
      this.displayToastOfFailure();
    }
  }

  stopRecording(): void {
    if (this.isRecording) {
      this.isRecording = false;
      const recordFileName: DebugFileName = new DebugFileName(this.rawDataFileName, this.coordinatesFileName);
      this.debugService.stopRecording(recordFileName);
    } else {
      this.displayToastOfFailure();
    }
  }

  private connectToRegistrationSocket() {
    const stream = this.socketService.connect(Config.WEB_SOCKET_URL + `devices/registration?sinks`);
    this.socketSubscription = stream.takeUntil(this.subscriptionDestructor).subscribe((devices: Array<UWB>): void => {
      console.log(devices);
      devices.forEach((device: UWB): void => {
        this.sinks.push({
          label: device.shortId.toString(),
          value: device.shortId
        })
      });
    });
  }

  private displayToastOfFailure(): void {
    if (!this.coordinatesFileName) {
      this.displayToastFailureMsg('set.name.coordinates');
    }
    if (!this.rawDataFileName) {
      this.displayToastFailureMsg('set.name.raw');
    }
    if (!this.selectedSink) {
      this.displayToastFailureMsg('set.sink');
    }
  }

  private displayToastFailureMsg(msg: string): void {
    this.translate.get(msg).first().subscribe((value: string) => {
      this.messageService.failed(value);
    });
  }


}
