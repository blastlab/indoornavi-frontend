import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Floor} from '../floor/floor.type';
import {ToastService} from '../shared/utils/toast/toast.service';
import {TranslateService} from '@ngx-translate/core';
import {ImageUploadComponent} from 'angular2-image-upload/lib/image-upload/image-upload.component';
import {Config} from '../../config';
import {MapService} from './map.service';
import {ImageConfiguration} from './map.configuration.type';

@Component({
  selector: 'app-map-uploader',
  templateUrl: 'map.uploader.html'
})
export class MapUploaderComponent implements OnInit {
  uploadUrl: string;
  buttonCaption: string;
  dropBoxMessage: string;
  maxFileSize: number;
  fileTooLargeMessage: string;
  allowedTypes: string[];

  @Input() floor: Floor;
  @Output() imageUploaded: EventEmitter<Floor> = new EventEmitter<Floor>();
  @ViewChild('imageUpload') imageUpload: ImageUploadComponent;

  constructor(private translateService: TranslateService,
              private mapService: MapService,
              private toastService: ToastService) {
  }

  ngOnInit(): void {
    this.mapService.getImageConfiguration().subscribe((config: ImageConfiguration) => {
      this.maxFileSize = config.maxFileSize;
      this.allowedTypes = config.allowedTypes;
    });

    this.setTranslations();
    this.uploadUrl = Config.API_URL + 'images/{{floorId}}'.replace(/{{floorId}}/, '' + this.floor.id);
  }

  imageLoaded(evtData): void {
    if (this.allowedTypes.indexOf(evtData.file.type) >= 0) {
      const formData: FormData = new FormData();
      formData.append('image', evtData.file);
      this.mapService.uploadImage(this.floor.id, formData).subscribe((floor: Floor) => {
        this.imageUploaded.emit(floor);
      });
    } else {
      this.imageUpload.deleteFile(evtData.file);
      this.toastService.showFailure('map.upload.notAllowedType', {'file_types': this.allowedTypes.join(', ')});
    }
  }

  private setTranslations(): void {
    this.translateService.setDefaultLang('en');

    this.translateService.get('map.upload.buttonCaption').subscribe((value: string) => {
      this.buttonCaption = value;
    });
    this.translateService.get('map.upload.dropBoxMessage').subscribe((value: string) => {
      this.dropBoxMessage = value;
    });
    this.translateService.get('map.upload.fileTooLargeMessage', {max_size: this.maxFileSize / 1024}).subscribe((value: string) => {
      this.fileTooLargeMessage = value;
    });
  }
}
