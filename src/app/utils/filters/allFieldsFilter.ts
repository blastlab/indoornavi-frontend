import {Injectable, Pipe, PipeTransform} from '@angular/core';

/**
 * Filtering array without passing array of field names:
 *  - filters all string|number data fields,
 *  - concatenates those fields into one string and searches,
 *    for occurrence of the specified in queryString value
 *
 * Usage example:
 * <tr *ngFor="let anchor of getRemainingAnchors() | allFieldsFilter:queryString:['name','shortId']; let i = index">
 *     <td>{{anchor.shortId}}</td>
 *     <td>{{anchor.longId}}</td>
 *     <td>{{anchor.name}}</td>
 * </tr>
 *  - does not use other fields except `name` and `shortId`,
 *  - if there is no field in data.records like passed within fields[] throws Err.
 */


@Pipe({
  name: 'allFieldsFilter'
})
@Injectable()
export class AllFieldsFilter implements PipeTransform {

  transform(data: any[], queryString: string, fields: string[] = []): any {
    if (!queryString) {
      return data;
    }
    if (fields.length) {
      return this.filterByFields(data, queryString, fields);
    } else {
      return this.filterAll(data, queryString);
    }

  }

  private filterByFields(data: any[], queryString: string, fields: string[]): any[] {
    return data.filter((value, index, array) => {
      for (const row in array) {
        if (array.hasOwnProperty(index)) {
          let fieldsString = '';
          for (const property in fields) {
            if (array[index].hasOwnProperty(fields[property])) {
              const fieldsProperty = fields[property];
              const dataPropertyValue = array[index][fieldsProperty];
              if (typeof dataPropertyValue === 'string' || typeof dataPropertyValue === 'number') {
                fieldsString = fieldsString + ' ' + dataPropertyValue;
              }
            } else {
              throw new Error('AllFieldsFilter -> Filter parameter not found in object.');
            }
          }
          return fieldsString.toLowerCase().indexOf(queryString.toString().toLowerCase()) !== -1;
        }
      }
    });
  }


  private filterAll(data: any[], queryString: string): any[] {
    return data.filter((value, index, array) => {
      for (const row in array) {
        if (array.hasOwnProperty(index)) {
          let fullString = '';
          for (let field in array[index]) {
            if (array[index].hasOwnProperty(field)) {
              const propValue = array[index][field];
              if (typeof propValue === 'string' || typeof propValue === 'number') {
                fullString = fullString + ' ' + propValue;
              }
              field = field + 1;
            }
          }
          return fullString.toLowerCase().indexOf(queryString.toString().toLowerCase()) !== -1;
        }
      }
    });
  }
}


