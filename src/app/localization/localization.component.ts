import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Tag} from '../device/device.type';
import {Subject} from 'rxjs/Subject';
import {TranslateService} from '@ngx-translate/core';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';
import {SelectItem} from 'primeng/primeng';
import {SocketService} from '../shared/services/socket/socket.service';
import {Config} from '../../config';
import {MeasureSocketDataTags} from '../map-viewer/publication.type';

@Component({
  selector: 'app-localization',
  templateUrl: './localization.component.html',
  encapsulation: ViewEncapsulation.None
})
export class LocalizationComponent implements OnInit, OnDestroy {

  // TODO treeview add

  filterOptions: SelectItem[] = [
    {label: 'id', value: 'id'},
    {label: 'name', value: 'name'},
    {label: 'complex', value: 'complex'},
    {label: 'building', value: 'building'},
    {label: 'floor', value: 'floor'},
    {label: 'group', value: 'group'}
  ];
  selectedFilterValues: string[] = [];
  tags: TagMocked[];
  view: string = 'list.view';
  private subscriptionDestroyer: Subject<void> = new Subject<void>();

  static mockData(tag: Tag): TagMocked {
    return Object.assign({
      complex: Math.floor(Math.random() * 100).toString(),
      building: Math.floor(Math.random() * 100).toString(),
      floor: Math.floor(Math.random() * 100),
      group: Math.floor(Math.random() * 100).toString()
    }, tag);
  }

  constructor(
    public translate: TranslateService,
    private socketService: SocketService,
    private breadcrumbService: BreadcrumbService
  ) { }

  ngOnInit() {
    this.setTranslations();
    this.initializeSocketConnection();
  }

  ngOnDestroy() {
    this.subscriptionDestroyer.next();
    this.subscriptionDestroyer.unsubscribe();
  }

  toggleView() {
    this.view === 'list.view' ? this.view = 'tree.view' : this.view = 'list.view';
  }

  click(id: number): void {
    console.log(this.tags);
    console.log(id);
  }

  clear() {
    this.selectedFilterValues = [];
  }

  private setTranslations(): void {
    this.translate.setDefaultLang('en');
    this.translate.get( 'tags.localization.header').subscribe((value: string) => {
      this.breadcrumbService.publishIsReady([
        {label: value, disabled: true}
      ]);
    });
    this.filterOptions.forEach((item: SelectItem): void => {
      this.translate.get(item.label).subscribe((value: string) => {
        item.label = value;
      });
    });
  }

  private initializeSocketConnection(): void {
    const stream = this.socketService.connect(`${Config.WEB_SOCKET_URL}measures?client`);
    stream.takeUntil(this.subscriptionDestroyer).subscribe((data: MeasureSocketDataTags): void => {
      this.tags = [];
      data.tags.forEach((tag: Tag) => {
        if (tag.verified) {
          // TODO: delete mock method after backend update
          const tagMocked: TagMocked = LocalizationComponent.mockData(tag);
          this.tags.push(tagMocked);
        }
      });
      console.log(this.tags);
    });
  }


}

export interface TagMocked extends Tag {
  complex: string,
  building: string,
  floor: number,
  group: string
}
