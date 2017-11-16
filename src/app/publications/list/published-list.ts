import {Component, OnInit} from '@angular/core';
import {PublishedService} from '../../map-viewer/published.service';
import {PublishedMap} from '../../map-viewer/published.type';
import {TranslateService} from '@ngx-translate/core';
import {MdDialog, MdDialogRef} from '@angular/material';
import {ToastService} from '../../shared/utils/toast/toast.service';
import {PublishedDialogComponent} from '../dialog/published.dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {BreadcrumbService} from '../../shared/services/breadcrumbs/breadcrumb.service';

@Component({
  templateUrl: './published-list.html',
  styleUrls: ['./published-list.css']
})
export class PublishedListComponent implements OnInit {

  rows: PublishedMap[];

  dialogRef: MdDialogRef<PublishedDialogComponent>;

  private routeState: string;

  constructor(private publishedMapService: PublishedService,
              private translateService: TranslateService,
              private dialog: MdDialog,
              private toastService: ToastService,
              private router: Router,
              private route: ActivatedRoute,
              private breadcrumbService: BreadcrumbService
  ) {
  }

  ngOnInit() {
    this.publishedMapService.getAll().subscribe((maps: PublishedMap[]) => {
      this.rows = maps;
    });
    this.routeState = this.route.snapshot.routeConfig.path;
    this.translateService.setDefaultLang('en');
    this.translateService.get(`publishedList.header`).subscribe((value: string) => {
      this.breadcrumbService.publishIsReady([
        {label: value, disabled: true}
      ]);
    });
  }

  public openDialog(map: PublishedMap) {
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

  public edit(map: PublishedMap) {
    this.openDialog(map);
  }

  public remove(map: PublishedMap) {
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

  public goToEditor(map: PublishedMap): void {
    const complexId = map.floor.building.complexId;
    const buildingId = map.floor.building.id;
    const floorId = map.floor.id;
    this.router.navigate(['complexes', complexId, 'buildings', buildingId, 'floors', floorId, 'map']);
  }

  public goToMap(map: PublishedMap) {
    this.router.navigate(['maps', map.id]);
  }

}
