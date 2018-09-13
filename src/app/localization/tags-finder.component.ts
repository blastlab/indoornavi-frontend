import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Tag} from '../device/device.type';
import {Subject} from 'rxjs/Subject';
import {TranslateService} from '@ngx-translate/core';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';
import {ConfirmationService, SelectItem} from 'primeng/primeng';
import {SocketService} from '../shared/services/socket/socket.service';
import {Config} from '../../config';
import {MeasureSocketDataTags} from '../map-viewer/publication.type';

@Component({
  selector: 'app-localization',
  templateUrl: './tags-finder.component.html',
  styleUrls: ['./tags-finder.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TagsFinderComponent implements OnInit, OnDestroy {

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
  message: string;
  confirmationDialogName: string;
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
    private breadcrumbService: BreadcrumbService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.setTranslations();
    this.initializeSocketConnection();
    this.selectedFilterValues.push(this.filterOptions[0].label);
  }

  ngOnDestroy() {
    this.subscriptionDestroyer.next();
    this.subscriptionDestroyer.unsubscribe();
  }

  toggleView(): void {
    this.view === 'list.view' ? this.view = 'tree.view' : this.view = 'list.view';
  }

  click(id: number): void {
    console.log(id);
    this.confirmationService.confirm({
      message: this.message,
      header: this.confirmationDialogName,
      icon: 'fa-exclamation-circle',
      accept: () => {
        console.log('accepted');
      },
      reject: () => {
        console.log('rejected');
      }
    });
  }

  clear(): void {
    this.selectedFilterValues = [];
  }

  logger(value: any): void {
    console.log(value);
  }

  private setTranslations(): void {
    this.translate.setDefaultLang('en');
    this.translate.get( 'tags.finder.header').subscribe((value: string) => {
      this.breadcrumbService.publishIsReady([
        {label: value, disabled: true}
      ]);
    });
    this.filterOptions.forEach((item: SelectItem): void => {
      this.translate.get(item.label).subscribe((value: string) => {
        item.label = value;
      });
    });
    this.translate.get( 'go.to.map.with.tag.question').subscribe((value: string) => {
      this.message = value;
    });
    this.translate.get( 'confirm').subscribe((value: string) => {
      this.confirmationDialogName = value;
    });
  }

  private initializeSocketConnection(): void {
    const stream = this.socketService.connect(`${Config.WEB_SOCKET_URL}measures?client`);
    stream.takeUntil(this.subscriptionDestroyer).subscribe((data: MeasureSocketDataTags): void => {
      this.tags = [];
      data.tags.forEach((tag: Tag) => {
        if (tag.verified) {
          // TODO: delete mock method after backend update
          const tagMocked: TagMocked = TagsFinderComponent.mockData(tag);
          this.tags.push(tagMocked);
        }
      });
    });
  }


}

export interface TagMocked extends Tag {
  complex: string,
  building: string,
  floor: number,
  group: string
}
