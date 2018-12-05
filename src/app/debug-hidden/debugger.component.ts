import {Component, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';
import {DebugFileName, DebugReport} from './debug.types';
import {SelectItem} from 'primeng/primeng';
import {UWB} from '../device/device.type';
import {SocketService} from '../shared/services/socket/socket.service';
import {Subject} from 'rxjs/Subject';
import {DebuggerService} from './debugger.service';
import {MessageServiceWrapper} from '../shared/services/message/message.service';

@Component({
  templateUrl: './debugger.html',
  selector: 'app-debugger'
})
export class DebuggerComponent implements OnInit, OnDestroy {

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
    private debugService: DebuggerService,
    private messageService: MessageServiceWrapper
  ) {
  }

  ngOnInit() {
    this.translate.setDefaultLang('en');
    this.translate.get('debug').subscribe((value: string): void => {
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

  remove(fileId): void {
    this.debugService.removeReport(fileId).first().subscribe((): void => {
      const index: number =  this.files.findIndex((file: DebugReport): boolean => {
        return fileId === file.id;
      });
      this.files.splice(index, 1);
      this.files = Object.assign([], this.files);
    });
  }

  download(fileId): void {
    this.debugService.downloadReport(fileId).first().subscribe((file: Blob): void => {
      const fileLink = document.createElement('a');
      fileLink.setAttribute('id', 'temporaryLinkForFileDownload');
      document.body.appendChild(fileLink);
      const json: string = JSON.stringify(file);
      const blob: Blob = new Blob([json], {type: 'octet/stream'});
      const url: string = window.URL.createObjectURL(blob);
      const index: number =  this.files.findIndex((f: DebugReport): boolean => {
        return fileId === f.id;
      });
      const fileName = this.files[index].name;
      fileLink.href = url;
      fileLink.download = fileName;
      fileLink.click();
      window.URL.revokeObjectURL(url);
      document.getElementById('temporaryLinkForFileDownload').remove();
    });
  }

  startRecording(): void {
    if (!!this.selectedSink && !this.isRecording) {
      this.debugService.sendStartRecording(this.selectedSink).first().subscribe((): void => {
        this.isRecording = true;
      });
    } else {
      this.displayToastSinkNotSet();
    }
  }

  stopRecording(): void {
    this.isRecording = false;
    const recordFileName: DebugFileName = new DebugFileName(this.rawDataFileName, this.coordinatesFileName);
    this.debugService.sendStopRecording(recordFileName).first().subscribe((): void => {
      this.isRecording = false;
      this.fetchFileList();
    });
  }

  private checkRecordingIsStarted(): void {
    this.debugService.getRecordingStartedInfo().takeUntil(this.subscriptionDestructor).subscribe((isRecording: boolean): void => {
      this.isRecording = isRecording;
    });
  }

  private fetchFileList(): void {
    this.debugService.getReports().first().subscribe((fileList: Array<DebugReport>): void => {
      this.files = (fileList);
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

  private displayToastSinkNotSet(): void {
    if (!this.selectedSink) {
      this.translate.get('set.sink').first().subscribe((value: string): void => {
        this.messageService.failed(value);
      });
    }
  }
}
