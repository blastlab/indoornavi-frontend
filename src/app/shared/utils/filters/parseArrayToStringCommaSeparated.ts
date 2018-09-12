import {Injectable, Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'parseArrayToStringCommaSeparated',
  pure: true
})
@Injectable()
export class ParseArrayToStringCommaSeparated implements PipeTransform {

  transform(data: string[]): string {
    return data.join(',');
  }
}
