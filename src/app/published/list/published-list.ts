import {Component, OnInit} from '@angular/core';
import {PublishedService} from '../published.service';
import {PublishedMap} from '../published.type';
import {TranslateService} from '@ngx-translate/core';
import {MdDialog, MdDialogRef} from '@angular/material';
import {ToastService} from '../../utils/toast/toast.service';
import {PublishedDialogComponent} from '../dialog/published.dialog';

@Component({
  templateUrl: './published-list.html',
  styleUrls: ['./published-list.css']
})
export class PublishedListComponent implements OnInit {

  rows: PublishedMap[];

  dialogRef: MdDialogRef<PublishedDialogComponent>;

  constructor(private publishedMapService: PublishedService,
              private translateService: TranslateService,
              private dialog: MdDialog,
              private toastService: ToastService) {
  }

  ngOnInit() {
    this.translateService.setDefaultLang('en');

    this.publishedMapService.getAll().subscribe((maps: PublishedMap[]) => {
      this.rows = maps;
    });
  }

  openDialog(map: PublishedMap) {
    this.dialogRef = this.dialog.open(PublishedDialogComponent, {width: '500px', height: '600px'});
    this.dialogRef.componentInstance.setMap(map);
    this.dialogRef.afterClosed().subscribe((savedMap: PublishedMap) => {
      if (!!savedMap) {
        const index = this.rows.findIndex((row: PublishedMap) => {
          return row.id === savedMap.id;
        });
        if (index === -1) { // it's newly created map, so add it to rows
          this.rows.push(savedMap);
        } else {
          this.rows[index] = savedMap;
          this.rows = [...this.rows]; // https://swimlane.gitbooks.io/ngx-datatable/introduction/cd.html
        }
        this.dialogRef = null;
      }
    });
  }

  edit(map: PublishedMap) {
    this.openDialog(map);
  }

  remove(map: PublishedMap) {
    this.publishedMapService.remove(map.id).subscribe(() => {
      const index = this.rows.findIndex((row: PublishedMap) => {
        return row.id === map.id;
      });
      this.rows.splice(index, 1);
      this.toastService.showSuccess('publishedList.remove.success');
    }, (err) => {
      this.toastService.showFailure(err);
    });
  }

}
