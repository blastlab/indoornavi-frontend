import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {Anchor, Sink} from '../../../device/device.type';

@Pipe({
  name: 'allFieldsFilter',
  pure: true
})
@Injectable()
export class AllFieldsFilter implements PipeTransform {

  transform(data: any[], queryString: string): Anchor[] | Sink[] {
    if (!!data && !!queryString) {
      return data.filter((item: Sink | Anchor): boolean => {
        const query: string = queryString.toLowerCase();
        const shortIdString: string = item.shortId.toString().toLowerCase();
        const longIdString: string = item.longId.toString().toLowerCase();
        const name: string = item.name.toLowerCase();
        return (shortIdString.indexOf(query) !== -1 || longIdString.indexOf(query) !== -1 || name.indexOf(query) !== -1);
      })
    }
    return data;
  }
}


