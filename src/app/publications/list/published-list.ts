import {Component, OnInit, ViewChild} from '@angular/core';
import {PublishedService} from '../../map-viewer/published.service';
import {PublishedMap} from '../../map-viewer/published.type';
import {TranslateService} from '@ngx-translate/core';
import {PublishedDialogComponent} from '../dialog/published.dialog';
import {Router} from '@angular/router';
import {CrudComponentList, CrudHelper} from '../../utils/crud/crud.component';
import {ConfirmationService} from 'primeng/primeng';
import {BreadcrumbService} from '../../utils/breadcrumbs/breadcrumb.service';
import {MessageServiceWrapper} from '../../utils/message.service';

@Component({
  templateUrl: './published-list.html',
  styleUrls: ['./published-list.css']
})
export class PublishedListComponent implements OnInit, CrudComponentList {
  publishedMaps: PublishedMap[];
  loading: boolean = true;
  confirmBody: string;

  @ViewChild(PublishedDialogComponent)
  private formDialog: PublishedDialogComponent;

  private routeState: string;

  constructor(private publishedMapService: PublishedService,
              private translateService: TranslateService,
              private messageService: MessageServiceWrapper,
              private router: Router,
              private confirmationService: ConfirmationService,
              private breadcrumbService: BreadcrumbService) {
  }

  ngOnInit() {
    this.publishedMapService.getAll().subscribe((maps: PublishedMap[]) => {
      this.publishedMaps = maps;
      this.loading = false;
    });
    this.translateService.setDefaultLang('en');
    this.translateService.get(`publishedList.header`).subscribe((value: string) => {
      this.breadcrumbService.publishIsReady([
        {label: value, disabled: true}
      ]);
    });
    this.translateService.get('confirm.body').subscribe((value: string) => {
      this.confirmBody = value;
    });
  }

  openDialog(map?: PublishedMap) {
    const isNew = !(!!map);
    const subscription = this.formDialog.open(map).subscribe((publishedMap: PublishedMap) => {
      this.publishedMaps = <PublishedMap[]>CrudHelper.add(publishedMap, this.publishedMaps, isNew);
      subscription.unsubscribe();
    });
  }

  remove(index: number): void {
    this.confirmationService.confirm({
      message: this.confirmBody,
      accept: () => {
        const map = this.publishedMaps[index];
        this.publishedMapService.remove(map.id).subscribe(() => {
          this.publishedMaps = <PublishedMap[]>CrudHelper.remove(index, this.publishedMaps);
          this.messageService.success('publishedList.remove.success');
        }, (err) => {
          this.messageService.failed(err);
        });
      }
    });
  }

  goTo(map: PublishedMap): void {
    this.router.navigate(['maps', map.id]);
  }

  goToEditor(map: PublishedMap): void {
    const complexId = map.floor.building.complex.id;
    const buildingId = map.floor.building.id;
    const floorId = map.floor.id;
    this.router.navigate(['complexes', complexId, 'buildings', buildingId, 'floors', floorId, 'map']);
  }

  edit(map: PublishedMap) {
    this.openDialog(map);
  }

}