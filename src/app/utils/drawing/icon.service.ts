import {MdIconRegistry} from '@angular/material/icon/icon';
import {DomSanitizer} from '@angular/platform-browser/src/security/dom_sanitization_service';
import {Injectable} from '@angular/core';
import Dictionary from 'typescript-collections/dist/lib/Dictionary';

@Injectable()
export class IconService {
  materialIcons: Dictionary<string, string> = new Dictionary<string, string>();
  constructor(private mdIconRegistry: MdIconRegistry,
              private _sanitizer: DomSanitizer) {

    // makes a dictionary with icon name and path(string) from Material Icons 'Action' category only (now) - add other categories
    mdIconRegistry
      .addSvgIcon('action',
        _sanitizer.bypassSecurityTrustResourceUrl('/assets/material-icons/svg-sprites/svg-sprite-action-symbol.svg'));
    this.mdIconRegistry.getNamedSvgIcon('action').subscribe((svgCollection: SVGElement) => {
      const symbolsList = svgCollection.getElementsByTagName('symbol');
      for (let i = 0; i < symbolsList.length; i++) {
        this.materialIcons.setValue(symbolsList[i].getAttribute('id').slice(3, -5), symbolsList[i].getElementsByTagName('path')[0].getAttribute('d'));
      }
    });
  }

  public getIcon(iconName: string): string {
    return this.materialIcons.getValue(iconName);
  }

}

export class NaviIcons {
  public static ANCHOR: string = 'toll';
  public static TAG: string = 'settings_remote';
}
