import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {TranslateService} from '@ngx-translate/core';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';
import {SelectItem} from 'primeng/primeng';
import {SocketService} from '../shared/services/socket/socket.service';
import {Config} from '../../config';
import {Publication} from '../map-viewer/publication.type';
import {Router} from '@angular/router';
import {MessageServiceWrapper} from '../shared/services/message/message.service';
import {Floor} from '../floor/floor.type';
import {TagListElement, TagTracerData} from './tags-finder.type';
import {HttpService} from '../shared/services/http/http.service';

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
    // PrimeNg takes values for filter as string with no spaces
    {label: 'all', value: 'id,name,complex,building,floor'}
  ];
  selectedFilterValue: string;
  loading: boolean = true;
  searchValue: string = '';
  filteredTags: TagListElement[] = [];
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
    private router: Router,
    private messageService: MessageServiceWrapper,
    protected httpService: HttpService,
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

  applyFilter(): void {
    const filterByFields: string[] = this.selectedFilterValue.split(',');
    const tags: TagListElement[] = [];
    this.tags.forEach((tag: TagListElement): void => {
      let valueMatching = false;
      filterByFields.forEach((field: string): void => {
        let value: string;
        value = typeof tag[field] === 'string' ? tag[field] : tag[field].toString();
        if (value.includes(this.searchValue) || this.searchValue.length === 0) {
          valueMatching = true;
        }
      });
      if (valueMatching) {
        tags.push(tag);
      }
    });
    // DataTable [value] reference variable needs to be overwritten not updated to trigger data table view reload,
    // this bug or lack of feature in DataTable has solution used below, by creating new data assignment instead of passing reference.
    this.filteredTags = Object.assign([], tags);
  }

  click(tag: TagListElement): void {
    if (this.isAccessAllowed(tag.floorId)) {
      this.messageService.success('map.switch.view');
      this.router.navigate(['tagsfinder/follower/', tag.id]);
    } else {
      this.messageService.failed('access.denied');
    }
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
    this.translate.get( 'tags.finder').subscribe((value: string) => {
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
    stream.takeUntil(this.subscriptionDestroyer).subscribe((tagData: TagTracerData): void => {
      this.loading = false;
      let tagInTags = false;
      const { tag, floor } = tagData;
      const name: string = floor.name.length > 0 ? floor.name :  floor.id.toString();
      const tagListBag: TagListElement = {
        lastUpdateTime: new Date().getTime(),
        id: tag.shortId,
        name: tag.name,
        complex: floor.building.complex.name,
        building: floor.building.name,
        floor: name,
        floorId: floor.id
      };
      this.tags.forEach((tagListElement: TagListElement): void => {
        if (tagListElement.id === tagData.tag.shortId) {
          tagListElement = tagListBag;
          tagInTags = true;
        }
      });
      if (!tagInTags) {
        this.tags.push(tagListBag);
      }
      this.applyFilter();
    });
  }

  private getPublications(): void {
    this.httpService.doGet('publications').takeUntil(this.subscriptionDestroyer).subscribe((publications: Publication[]) => {
      this.publications = publications;
    });
  }

  private isAccessAllowed(floorId: number): boolean {
    return this.publications.some((publication: Publication): boolean  => {
        return !!publication.floors.find((floor: Floor): boolean => floor.id === floorId);
      });
    }
}
