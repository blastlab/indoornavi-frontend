import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {Anchor, Sink} from '../../../device/device.type';

@Pipe({
  name: 'allFieldsFilter',
  pure: true
})
@Injectable()
export class AllFieldsFilter implements PipeTransform {

  transform(data: any[], queryString: string, fields: string[]): any[] {
    if (!!data && !!queryString && !!fields && fields.length > 0) {
      const query: string = queryString.toLowerCase();
      return data.filter((item: Sink | Anchor): boolean => {
        let composedToCompare = ' ';
        for (const field of fields) {
          if (typeof item[field] === 'number') {
            composedToCompare += item[field].toString().toLowerCase();
          } else if (typeof item[field] === 'string') {
            composedToCompare += item[field].toLowerCase();
          }
        }
        return composedToCompare.indexOf(query) !== -1;
      });
    }
    return data;
  }
}


