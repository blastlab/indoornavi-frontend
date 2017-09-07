import {Component, OnInit} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';

@Component({
  templateUrl: './confirm.dialog.html',
  styleUrls: ['./confirm.dialog.css']
})
export class ConfirmDialogComponent implements OnInit {
  header: string;
  body: string;
  confirmButton: string;
  cancelButton: string;

  constructor(private dialogRef: MdDialogRef<ConfirmDialogComponent>,
              private translateService: TranslateService) {
  }

  ngOnInit(): void {
    this.translateService.setDefaultLang('en');
    this.translateService.get('ok').subscribe((value: string) => {
      this.confirmButton = value;
    });
    this.translateService.get('cancel').subscribe((value: string) => {
      this.cancelButton = value;
    });
    const data = this.dialogRef.config.data;
    if ('header' in data) {
      this.header = data['header'];
    }
    if ('body' in data) {
      this.body = data['body'];
    }
    if ('confirmButton' in data) {
      this.confirmButton = data['confirmButton'];
    }
    if ('cancelButton' in data) {
      this.cancelButton = data['cancelButton'];
    }
  }

  confirm(value: boolean) {
    this.dialogRef.close(value);
  }
}
