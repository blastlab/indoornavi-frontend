import {Component, Input, OnInit} from '@angular/core';
import {Configuration} from './configuration.type';
import {ConfigurationService} from './configuration.service';
import {Floor} from '../floor.type';
import {Timer} from '../../utils/timer/timer';
import {D3, D3Service} from 'd3-ng2-service';
import {MapLoaderInformerService} from '../../utils/map-loader-informer/map-loader-informer.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.html',
  styleUrls: ['./configuration.css']
})
export class ConfigurationComponent implements OnInit {

  private d3: D3;
  @Input() floor: Floor;
  private hashedConfiguration: Int32Array | string;

  constructor(private configurationService: ConfigurationService,
              private d3Service: D3Service,
              private mapLoader: MapLoaderInformerService) {
    this.d3 = d3Service.getD3();
  }

  ngOnInit() {
    this.configurationService.loadConfiguration(this.floor);
    this.configurationService.configurationLoaded().subscribe(() => {
      const timer = new Timer(() => {
        const currentHash = this.configurationService.getHashedConfiguration();
        if (currentHash !== this.hashedConfiguration) {
          this.hashedConfiguration = currentHash;
          this.configurationService.saveDraft().subscribe((configuration: Configuration) => {
            console.log('draft saved');
            console.log(configuration);
          });
        }
      }, 3000);

      this.mapLoader.isLoaded$.subscribe(() => {
        this.d3.select('#map').on('click', () => {
          timer.restart();
        });
      });
    });
  }

  public publish(): void {
    this.configurationService.publish().subscribe((configuration: Configuration) => {
      console.log(configuration);
    });
  }
}
