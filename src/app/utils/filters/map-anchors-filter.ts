import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {Anchor} from '../../../../../anchor/anchor.type';

@Pipe({
  name: 'remainingDevicesFilter'
})
@Injectable()
export class RemainingDevicesFilter implements PipeTransform {
  transform(anchors: Anchor[], args: any[]): any {
    if (!args) {
      return anchors;
    }
    return anchors.filter(anchor => {
      return anchor.name.toLowerCase().indexOf(args.toString().toLowerCase()) !== -1;
    });
  }
}


