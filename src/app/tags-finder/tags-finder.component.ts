import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Tag} from '../device/device.type';
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
  tags: TagListBag[] = [];
  listHeight: string;
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
    this.initializeSocketConnection();
    this.getPublications();
    this.initializeTimeIntervalForClearingTagsFromList();
    this.selectedFilterValue = this.filterOptions[0].value;
  }

  ngOnDestroy() {
    this.subscriptionDestroyer.next();
    this.subscriptionDestroyer.unsubscribe();
  }

  click(tag: TagListBag): void {
    this.confirmationService.confirm({
      message: this.message,
      header: this.confirmationDialogName,
      icon: 'fa-exclamation-circle',
      accept: () => {
        // if (!!tag.complex && !!tag.building && !!tag.floor) {
        //   const publicationId: number = this.getPublicationId(tag.complex, tag.building, tag.floor);
        //   !!publicationId ? this.router.navigate([`publications/${publicationId}`]) : this.messageService.failed('access.denied');
        // }
      },
      reject: () => {
        this.messageService.failed('action.rejected');
      }
    });
  }

  private initializeTimeIntervalForClearingTagsFromList(): void {
    console.log('interval initialized, looping over this.tags and chacking if lastUpdateTime is range');
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
      let tagInTags = false;
      const tagListBag: TagListBag = Object.assign({lastUpdateTime: Date.now()}, tagData);
      this.tags.forEach((tagBag: TagListBag) => {
        if (tagBag.tag.id === tagData.tag.id) {
          tagBag = tagListBag;
          tagInTags = true;
        }
      });
      if (!tagInTags) {
        this.tags.push(tagListBag);
      }
      this.tags.length > 20 ? this.listHeight = '1000px' : this.listHeight = '600px';
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

// TODO after mock deleted Tag will contain all information from below interface, refactor this according to provided changes

export interface TagListBag extends MeasureSocketDataTag {
  lastUpdateTime: number
}
