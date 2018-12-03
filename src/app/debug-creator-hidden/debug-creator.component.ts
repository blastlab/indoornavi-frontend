import {Component, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';
import {DebugFileName, DebugReport} from './debug-creator.types';
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

  files: Array<DebugReport>;
  sinks: SelectItem[] = [];
  selectedSink: number;
  coordinatesFileName: string;
  rawDataFileName: string;
  isRecording = false;
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
    this.fetchFiles();
    this.fetchFileList();
  }

  ngOnDestroy() {
    this.subscriptionDestructor.next();
    this.subscriptionDestructor = null;
  }

  remove(fileIndex): void {
    console.log(fileIndex);
  }

  download(fileIndex): void {
    this.debugService.downloadReport(fileIndex).subscribe((file: any): void => {
      const blob: Blob = new Blob([file], { type: 'text/csv' });
      const url: string = window.URL.createObjectURL(blob);
      window.open(url);
    });
  }

  startRecording(): void {
    if (!!this.selectedSink && !this.isRecording && !!this.coordinatesFileName && !!this.rawDataFileName) {
      this.isRecording = true;
      this.debugService.startRecording(this.selectedSink);
    } else {
      this.displayToastOfFailure();
    }
  }

  stopRecording(): void {
    if (this.isRecording) {
      this.isRecording = false;
      const recordFileName: DebugFileName = new DebugFileName(this.rawDataFileName, this.coordinatesFileName);
      console.log(recordFileName);
      this.debugService.stopRecording(recordFileName)
      .subscribe(data => {
        console.log(data);
      });
      this.fetchFileList();
    } else {
      this.displayToastOfFailure();
    }
  }

  private fetchFileList(): void {
    this.debugService.getReports().first().subscribe((fileList: Array<DebugReport>): void => {
      console.log(fileList);
      this.files = (<DebugReport[]>fileList);
    });
  }

  private fetchFiles(): void {
    this.debugService.getSinks().takeUntil(this.subscriptionDestructor).subscribe((devices: Array<UWB>) => {
      devices.forEach((device: UWB): void => {
        this.sinks.push({
          label: device.shortId.toString(),
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
    this.translate.get(msg).first().subscribe((value: string) => {
      this.messageService.failed(value);
    });
  }
}
