import {Component, DoCheck, OnChanges, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {TranslateService} from '@ngx-translate/core';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';
import {ConfirmationService, SelectItem} from 'primeng/primeng';
import {SocketService} from '../shared/services/socket/socket.service';
import {Config} from '../../config';
import {MeasureSocketDataTag, Publication} from '../map-viewer/publication.type';
import {Router} from '@angular/router';
import {MessageServiceWrapper} from '../shared/services/message/message.service';
import {HttpService} from '../shared/services/http/http.service';
import {Floor} from '../floor/floor.type';

@Component({
  selector: 'app-localization',
  templateUrl: './tags-finder.component.html',
  styleUrls: ['./tags-finder.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TagsFinderComponent implements OnInit, OnDestroy {

  filterOptions: SelectItem[] = [
    {label: 'id', value: 'id'},
    {label: 'name', value: 'name'},
    {label: 'complex', value: 'complex'},
    {label: 'building', value: 'building'},
    {label: 'floor', value: 'floor'},
    {label: 'group', value: 'group'},
    {label: 'all', value: 'id,name,complex,building,floor,group'}
  ];
  selectedFilterValue: string;
  loading: boolean = true;
  tags: TagListElement[] = [];
  private readonly timeInterval = 10000;
  private message: string;
  private confirmationDialogName: string;
  private subscriptionDestroyer: Subject<void> = new Subject<void>();
  private publications: Publication[];

  constructor(
    public translate: TranslateService,
    private socketService: SocketService,
    private breadcrumbService: BreadcrumbService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private messageService: MessageServiceWrapper,
    protected httpService: HttpService
  ) { }

  ngOnInit() {
    this.setTranslations();
    this.getPublications();
    this.initializeTimeInterval();
    this.initializeSocketConnection();
    this.selectedFilterValue = this.filterOptions[0].value;
  }

  ngOnDestroy() {
    this.subscriptionDestroyer.next();
    this.subscriptionDestroyer.unsubscribe();
  }

  click(tag: TagListElement): void {
    this.confirmationService.confirm({
      message: this.message,
      header: this.confirmationDialogName,
      icon: 'fa-exclamation-circle',
      accept: () => {
        this.messageService.success('map.switch');
        console.log(tag);
      },
      reject: () => {
        this.messageService.failed('action.rejected');
      }
    });
  }

  private initializeTimeInterval(): void {
    const looper = () => setTimeout(() => {
      const timeNow = new Date().getTime();
      const activeTags: TagListElement[] = this.tags.filter((tag: TagListElement): boolean => {
        return tag.lastUpdateTime > timeNow - this.timeInterval;
      });
      this.tags = Object.assign([], activeTags);
      looper();
    }, this.timeInterval);
    looper();
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
    const stream = this.socketService.connect(`${Config.WEB_SOCKET_URL}tagTracer?client`);
    stream.takeUntil(this.subscriptionDestroyer).subscribe((tagData: MeasureSocketDataTag): void => {
      this.loading = false;
      let tagInTags = false;
      const tagListBag: TagListElement = {
        lastUpdateTime: new Date().getTime(),
        id: tagData.tag.shortId,
        name: tagData.tag.name,
        complex: tagData.floor.building.complex.name,
        building: tagData.floor.building.name,
        floor: tagData.floor.name,
        floorId: tagData.floor.id
      };
      this.tags.forEach((tagListElement: TagListElement) => {
        if (tagListElement.id === tagData.tag.shortId) {
          tagListElement = tagListBag;
          tagInTags = true;
        }
      });
      if (!tagInTags) {
        this.tags.push(tagListBag);
      }
      // DataTable [value] reference variable needs to be overwritten not updated to update data view
      // this bug or lack of feature in DataTable has solution used below,
      this.tags = Object.assign([], this.tags);
    });
  }

  private getPublications(): void {
    this.httpService.doGet('publications').takeUntil(this.subscriptionDestroyer).subscribe((publications: Publication[]) => {
      this.publications = publications;
      console.log(publications);
    });
  }

  private getPublicationId(complexId: number, buildingId: number, floorId: number): number {
    let publicationNumber: number = null;
    if (!!this.publications) {
      this.publications.forEach((publication: Publication): void => {
        publication.floors.forEach((floor: Floor): void => {
          if (floor.id === floorId && floor.building.id === buildingId && floor.building.complex.id === complexId) {
            publicationNumber = floor.id;
          }
        });
      });
    }
    return publicationNumber;
  }
}

export interface TagListElement {
  lastUpdateTime: number;
  id: number;
  name: string;
  complex: string;
  building: string;
  floor: string;
  floorId: number;
}
