import {Injectable, OnInit} from '@angular/core';
import {MessageService} from 'primeng/components/common/messageservice';
import {TranslateService} from '@ngx-translate/core';

// TODO: move to services directory

@Injectable()
export class MessageServiceWrapper implements OnInit {
  private successSummary: string;
  private failedSummary: string;

  constructor(private messageService: MessageService, private translateService: TranslateService) {
  }

  ngOnInit(): void {
    this.translateService.get('growl.success.summary').subscribe((value: string) => {
      this.successSummary = value;
    });
    this.translateService.get('growl.failed.summary').subscribe((value: string) => {
      this.failedSummary = value;
    });
  }

  success(key: string): void {
    this.translateService.get(key).subscribe((value: string) => {
      this.messageService.add({
        severity: 'success',
        summary: this.successSummary,
        detail: value
      });
    });
  }

  failed(key: string, params?: object): void {
    this.translateService.get(key, params).subscribe((value: string) => {
      this.messageService.add({
        severity: 'error',
        summary: this.failedSummary,
        detail: value
      });
    });
  }
}
