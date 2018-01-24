import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'oneFieldFilter'
})
@Injectable()
export class OneFieldFilter implements PipeTransform {
  transform(data: any[], queryString: string, filteredField: string|number): any {
    if (!queryString) {
      return data;
    }
    return data.filter(value => {
      return value.filteredField.toLowerCase().indexOf(queryString.toString().toLowerCase()) !== -1;
    });
  }
}
