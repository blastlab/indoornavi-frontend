import {Component, OnInit} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-building-confirm',
  templateUrl: './building.confirm.html',
  styleUrls: ['./building.confirm.css']
})
export class BuildingConfirmComponent implements OnInit {
  public name: string = '';

  ngOnInit(): void {
  }

  constructor(private confirmRef: MdDialogRef<BuildingConfirmComponent>, public translate: TranslateService) {
  }

  remove() {
    this.confirmRef.close(true);
  }
  close() {
    this.confirmRef.close(false);
  }

}
