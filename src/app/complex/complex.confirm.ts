import {Component, OnInit} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-complex-confirm',
  templateUrl: './complex.confirm.html',
  styleUrls: ['./complex.confirm.css']
})
export class ComplexConfirmComponent implements OnInit {
  public name: string = '';

  ngOnInit(): void {
  }

  constructor(private confirmRef: MdDialogRef<ComplexConfirmComponent>, public translate: TranslateService) {
  }

  remove() {
    this.confirmRef.close(true);
  }
  close() {
    this.confirmRef.close(false);
  }

}
