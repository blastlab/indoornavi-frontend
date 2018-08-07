import {Component, OnInit, ViewChild} from '@angular/core';
import {PublishedService} from '../publication.service';
import {Publication} from '../publication.type';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {BreadcrumbService} from '../../shared/services/breadcrumbs/breadcrumb.service';
import {CrudComponentList, CrudHelper} from '../../shared/components/crud/crud.component';
import {ConfirmationService} from 'primeng/primeng';
import {MessageServiceWrapper} from '../../shared/services/message/message.service';
import {PublicationDialogComponent} from '../dialog/publication.dialog';

@Component({
  templateUrl: './publication-list.html'
})
export class PublishedListComponent implements OnInit, CrudComponentList {
  publishedMaps: Publication[];
  dialogTitle: string;
  loading: boolean = true;
  confirmBody: string;

  @ViewChild(PublicationDialogComponent)
  private formDialog: PublicationDialogComponent;

  constructor(private publishedMapService: PublishedService,
              private translateService: TranslateService,
              private messageService: MessageServiceWrapper,
              private router: Router,
              private confirmationService: ConfirmationService,
              private breadcrumbService: BreadcrumbService) {
  }

  ngOnInit() {
    this.publishedMapService.getAll().subscribe((maps: Publication[]) => {
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

  openDialog(map?: Publication) {
    const isNew = !(!!map);
    const subscription = this.formDialog.open(map).subscribe((publishedMap: Publication) => {
      if (!!publishedMap) {
        this.publishedMaps = <Publication[]>CrudHelper.add(publishedMap, this.publishedMaps, isNew);
      }
      subscription.unsubscribe();
    });
  }

  remove(index: number): void {
    this.translateService.get('publishedMap.details.remove').subscribe((value: string) => {
      this.dialogTitle = value;
    });

    this.confirmationService.confirm({
      header: this.dialogTitle,
      message: this.confirmBody,
      accept: () => {
        const map = this.publishedMaps[index];
        this.publishedMapService.remove(map.id).subscribe(() => {
          this.publishedMaps = <Publication[]>CrudHelper.remove(index, this.publishedMaps);
          this.messageService.success('publishedList.remove.success');
        }, (err) => {
          this.messageService.failed(err);
        });
      }
    });
  }

  edit(map: Publication) {
    this.openDialog(map);
  }

}
