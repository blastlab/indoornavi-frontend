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
  confirmButtonText: string;
  cancelButtonText: string;

  constructor(private dialogRef: MdDialogRef<ConfirmDialogComponent>,
              private translateService: TranslateService) {
  }

  ngOnInit(): void {
    this.translateService.setDefaultLang('en');
    this.translateService.get('ok').subscribe((value: string) => {
      this.confirmButtonText = value;
    });
    this.translateService.get('cancel').subscribe((value: string) => {
      this.cancelButtonText = value;
    });
    const data = this.dialogRef.config.data;
    if ('header' in data) {
      this.header = data['header'];
    }
    if ('body' in data) {
      this.body = data['body'];
    }
    if ('confirmButtonText' in data) {
      this.confirmButtonText = data['confirmButtonText'];
      console.log(this.confirmButtonText);
    }
    if ('cancelButtonText' in data) {
      this.cancelButtonText = data['cancelButtonText'];
      console.log(this.cancelButtonText);
    }
  }

  confirm(value: boolean) {
    this.dialogRef.close(value);
  }
}
