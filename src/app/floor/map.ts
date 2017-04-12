import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Config} from '../../config';
import {TranslateService} from '@ngx-translate/core';
import {Floor, ImageConfiguration} from './floor.type';
import {FloorService} from './floor.service';
import {ToastService} from '../utils/toast/toast.service';
import {ImageUploadComponent} from 'angular2-image-upload/lib/image-upload/image-upload.component';

@Component({
  selector: 'app-root',
  templateUrl: 'map.html',
  styleUrls: ['floor.css']
})
export class MapComponent implements OnInit {
  imageUploaded: boolean = true;
  floor: Floor;
  private _uploadUrl: string;
  private _buttonCaption: string;
  private _dropBoxMessage: string;
  private _maxFileSize: number;
  private _fileTooLargeMessage: string;
  private allowedTypes: string[];

  @ViewChild('canvas') canvas: ElementRef;

  @ViewChild('imageUpload') imageUpload: ImageUploadComponent;

  constructor(private route: ActivatedRoute,
              private translateService: TranslateService,
              private floorService: FloorService,
              private toastService: ToastService) {
  }

  ngOnInit(): void {
    this.route.params
    // (+) converts string 'id' to a number
      .subscribe((params: Params) => {
        const floorId = parseInt(params['floorId'], 10);
        this.floorService.getFloor(floorId).subscribe((floor: Floor) => {
          this.floor = floor;
          if (floor.imageId) {
            this.drawImageOnCanvas();
          } else {
            this.imageUploaded = false;
          }
        });

        this.floorService.getImageConfiguration().subscribe((config: ImageConfiguration) => {
          this._maxFileSize = config.maxFileSize;
          this.allowedTypes = config.allowedTypes;
        });

        this.translateService.setDefaultLang('en');

        this.translateService.get('map.upload.buttonCaption').subscribe((value: string) => {
          this._buttonCaption = value;
        });
        this.translateService.get('map.upload.dropBoxMessage').subscribe((value: string) => {
          this._dropBoxMessage = value;
        });
        this.translateService.get('map.upload.fileTooLargeMessage', {max_size: this._maxFileSize / 1024}).subscribe((value: string) => {
          this._fileTooLargeMessage = value;
        });
        this._uploadUrl = 'images/{{floorId}}'.replace(/{{floorId}}/, '' + floorId);
      });
  }

  get uploadUrl(): string {
    return Config.API_URL + this._uploadUrl;
  }

  get buttonCaption(): string {
    return this._buttonCaption;
  }

  get dropBoxMessage(): string {
    return this._dropBoxMessage;
  }

  get fileTooLargeMessage(): string {
    return this._fileTooLargeMessage;
  }

  get maxFileSize(): number {
    return this._maxFileSize;
  }

  imageLoaded(evtData): void {
    if (this.allowedTypes.indexOf(evtData.file.type) >= 0) {
      const formData: FormData = new FormData();
      formData.append('image', evtData.file);
      this.floorService.uploadImage(this.floor.id, formData).subscribe((floor: Floor) => {
        this.floor = floor;
        this.imageUploaded = true;
        this.drawImageOnCanvas();
      });
    } else {
      this.imageUpload.deleteFile(evtData.file);
      this.toastService.showFailure('map.upload.notAllowedType', {'file_types': this.allowedTypes.join(', ')});
    }
  }

  private drawImageOnCanvas() {
    const imageUrl = Config.API_URL + 'images/' + this.floor.imageId;
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
    };
    image.src = imageUrl;
  }
}
