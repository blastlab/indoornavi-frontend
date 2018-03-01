import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Floor} from '../../floor/floor.type';
import {TranslateService} from '@ngx-translate/core';
import {Config} from '../../../config';
import {MapService} from './map.uploader.service';
import {ImageConfiguration} from './map.configuration.type';
import {MessageServiceWrapper} from '../../shared/services/message/message.service';
import {FileUpload} from 'primeng/primeng';

@Component({
  selector: 'app-map-uploader',
  templateUrl: 'map.uploader.html'
})
export class MapUploaderComponent implements OnInit {
  uploadUrl: string;
  maxFileSize: number;
  invalidFileSizeMessageSummary: string;
  invalidFileSizeMessageDetail: string;
  allowedTypes: string[];

  @Input() floor: Floor;
  @Output() imageUploaded: EventEmitter<Floor> = new EventEmitter<Floor>();
  @ViewChild('imageUpload') imageUpload: FileUpload;

  constructor(private translateService: TranslateService,
              private mapService: MapService,
              private messageService: MessageServiceWrapper) {
  }

  ngOnInit(): void {
    this.mapService.getImageConfiguration().subscribe((config: ImageConfiguration) => {
      this.maxFileSize = config.maxFileSize;
      this.allowedTypes = config.allowedTypes;
    });

    this.setTranslations();
    this.uploadUrl = `${Config.API_URL}images/${this.floor.id}`;
  }

  imageLoaded(eventData: any): void {
    const file = eventData.files[0];
    if (this.allowedTypes.indexOf(file.type) >= 0) {
      const formData: FormData = new FormData();
      formData.append('image', file);
      this.mapService.uploadImage(this.floor.id, formData).subscribe((floor: Floor) => {
        this.imageUploaded.emit(floor);
      });
    } else {
      this.imageUpload.clear();
      this.messageService.failed('map.upload.notAllowedType', {'file_types': this.allowedTypes.join(', ')});
    }
  }

  private setTranslations(): void {
    this.translateService.setDefaultLang('en');

    this.translateService.get('map.upload.invalidFileSizeMessageSummary').subscribe((value: string) => {
      this.invalidFileSizeMessageSummary = value;
    });

    this.translateService.get('map.upload.invalidFileSizeMessageDetail').subscribe((value: string) => {
      this.invalidFileSizeMessageDetail = value;
    });
  }
}
