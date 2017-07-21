import {MdIconRegistry} from '@angular/material/icon/icon';
import {DomSanitizer} from '@angular/platform-browser/src/security/dom_sanitization_service';
import {Injectable} from '@angular/core';
import Dictionary from 'typescript-collections/dist/lib/Dictionary';

/**
 * /assets/material-icons/svg-sprites
 */

@Injectable()
export class IconService {
  materialIcons: Dictionary<string, string> = new Dictionary<string, string>();

  constructor(private mdIconRegistry: MdIconRegistry,
              private _sanitizer: DomSanitizer) {
    this.loadCollections(['action', 'alert', 'av', 'communication', 'content', 'device', 'editor', 'file',
      'hardware', 'image', 'maps', 'navigation', 'notification', 'places', 'social', 'toggle']);
  }

  private loadCollections(collection: string[]) {
    for (let i = 0; i < collection.length; i++) {
      this.mdIconRegistry
        .addSvgIcon(collection[i], this._sanitizer
          .bypassSecurityTrustResourceUrl('/assets/material-icons/svg-sprites/svg-sprite-' + collection[i] + '-symbol.svg'));
      this.mdIconRegistry
        .getNamedSvgIcon(collection[i]).subscribe((svgCollection: SVGElement) => {
        const symbolsList = svgCollection.getElementsByTagName('symbol');
        for (let j = 0; j < symbolsList.length; j++) {
          this.materialIcons.setValue(symbolsList[j].getAttribute('id').slice(3, -5), symbolsList[j].innerHTML);
        }
      });
    }
  }

  public getIcon(iconName: string): string {
    return this.materialIcons.getValue(iconName);
  }
}

export class NaviIcons {
  public static ANCHOR: string = 'toll';
  public static SINK: string = 'fiber_smart_record';
  public static TAG: string = 'settings_remote';
  public static POINTER: string = 'add';
}
