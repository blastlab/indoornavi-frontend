import {Component, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';
import {DebugFileName, DebugReport} from './debug-creator.types';
import {SelectItem} from 'primeng/primeng';
import {UWB} from '../device/device.type';
import {SocketService} from '../shared/services/socket/socket.service';
import {Subject} from 'rxjs/Subject';
import {DebugCreatorService} from './debug-creator.service';
import {MessageServiceWrapper} from '../shared/services/message/message.service';

@Component({
  templateUrl: './debug-creator.html',
  selector: 'app-csv-creator'
})
export class DebugCreatorComponent implements OnInit, OnDestroy {

  files: Array<DebugReport>;
  sinks: SelectItem[] = [];
  selectedSink: number;
  coordinatesFileName: string;
  rawDataFileName: string;
  isRecording = false;
  private subscriptionDestructor: Subject<void> = new Subject<void>();

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
    this.translate.get('debug').first().subscribe((value: string): void => {
      this.breadcrumbService.publishIsReady([
        {label: value, disabled: true}
      ]);
    });
    this.fetchSinks();
    this.fetchFileList();
    this.checkRecordingIsStarted();
  }

  ngOnDestroy() {
    this.subscriptionDestructor.next();
    this.subscriptionDestructor = null;
  }

  remove(fileIndex): void {
    this.debugService.removeReport(fileIndex).first().subscribe((): void => {
      this.fetchFileList();
    });
  }

  download(fileIndex): void {
    this.debugService.downloadReport(fileIndex).first().subscribe((file: any): void => {
      const blob: Blob = new Blob([file], { type: 'text/csv' });
      const url: string = window.URL.createObjectURL(blob);
      window.open(url);
    });
  }

  startRecordingForActiveSink(): void {
    if (!!this.selectedSink && !this.isRecording) {
      this.debugService.startRecording(this.selectedSink).first().subscribe((): void => {
        this.isRecording = true;
      });
    } else {
      this.displayToastOfFailure();
    }
  }

  stopRecordingForActiveSink(): void {
    this.isRecording = false;
    const recordFileName: DebugFileName = new DebugFileName(this.rawDataFileName, this.coordinatesFileName);
    this.debugService.stopRecording(recordFileName).first().subscribe((): void => {
      this.isRecording = false;
      this.fetchFileList();
    });
  }

  private checkRecordingIsStarted(): void {
    this.debugService.getRecordingStartedInfo().takeUntil(this.subscriptionDestructor).subscribe((isRecording: boolean): void => {
      this.isRecording = isRecording
    });
  }

  private fetchFileList(): void {
    this.debugService.getReports().first().subscribe((fileList: Array<DebugReport>): void => {
      this.files = (<DebugReport[]>fileList);
    });
  }

  private fetchSinks(): void {
    this.debugService.getSinks().takeUntil(this.subscriptionDestructor).subscribe((devices: Array<UWB>): void => {
      devices.forEach((device: UWB): void => {
        this.sinks.push({
          label: `${device.shortId.toString()} / ${device.shortId.toString(16)}`,
          value: device.id
        })
      });
    });
  }


  private displayToastOfFailure(): void {
    if (!this.selectedSink) {
      this.displayToastFailureMsg('set.sink');
    }
  }

  private displayToastFailureMsg(msg: string): void {
    this.translate.get(msg).first().subscribe((value: string): void => {
      this.messageService.failed(value);
    });
  }
}
